import { useState, useRef, useEffect, useCallback } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ChatPanel, { ChatMessage } from '@/components/explorer/ChatPanel';
import OutputPanel from '@/components/explorer/OutputPanel';
import { loadDataset, DataRow, loadTokenDataset, TokenRow } from '@/lib/parseDataset';
import { sendMessage, sendMessageWithTools, ApiError } from '@/lib/anthropicApi';
import { SYSTEM_PROMPT, TOKEN_SYSTEM_PROMPT, LIVE_DATA_ADDENDUM } from '@/lib/systemPrompt';
import { McpClient, mcpToAnthropicTools } from '@/lib/mcpClient';
import type { AnthropicTool } from '@/lib/mcpClient';
import type { DatasetType } from '@/lib/types';

let msgId = 0;
const nextId = () => String(++msgId);

const VCExitsExplorer = () => {
  const [model, setModel] = useState('claude-sonnet-4-6');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [datasetLoading, setDatasetLoading] = useState(true);
  const [datasetType, setDatasetType] = useState<DatasetType>('equity');
  const [liveData, setLiveData] = useState(false);
  const [liveDataConnecting, setLiveDataConnecting] = useState(false);
  // Mobile-only: which pane is visible (desktop shows both side by side).
  const [mobileTab, setMobileTab] = useState<'chat' | 'results'>('chat');

  const equityDataRef = useRef<DataRow[]>([]);
  const tokenDataRef = useRef<TokenRow[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const conversationRef = useRef<Array<{ role: string; content: any }>>([]);
  const mcpClientRef = useRef<McpClient | null>(null);
  const mcpToolsRef = useRef<AnthropicTool[]>([]);

  useEffect(() => {
    Promise.all([loadDataset(), loadTokenDataset()])
      .then(([equityRows, tokenRows]) => {
        equityDataRef.current = equityRows;
        tokenDataRef.current = tokenRows;
        setDatasetLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dataset:', err);
        setDatasetLoading(false);
      });
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/analysis-worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;
    return () => {
      worker.terminate();
      mcpClientRef.current?.disconnect();
    };
  }, []);

  // On mobile, surface the answer as soon as it arrives.
  useEffect(() => {
    if (currentResult) setMobileTab('results');
  }, [currentResult]);

  const executeCode = useCallback((code: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) return reject(new Error('Worker not available'));

      const handler = (e: MessageEvent) => {
        worker.removeEventListener('message', handler);
        if (e.data.success) resolve(e.data.result);
        else reject(new Error(e.data.error));
      };

      worker.addEventListener('message', handler);
      const activeData = datasetType === 'equity' ? equityDataRef.current : tokenDataRef.current;
      worker.postMessage({ code, data: activeData });
    });
  }, [datasetType]);

  const handleSend = useCallback(async (text: string) => {
    if (isLoading) return;

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    conversationRef.current.push({ role: 'user', content: text });

    try {
      const basePrompt = datasetType === 'equity' ? SYSTEM_PROMPT : TOKEN_SYSTEM_PROMPT;
      const activePrompt = liveData ? basePrompt + LIVE_DATA_ADDENDUM : basePrompt;

      let rawResponse: string;
      if (liveData && mcpClientRef.current?.isConnected && mcpToolsRef.current.length > 0) {
        const mcpClient = mcpClientRef.current;
        rawResponse = await sendMessageWithTools(
          conversationRef.current,
          activePrompt,
          model,
          mcpToolsRef.current,
          async (name, input) => mcpClient.callTool(name, input),
        );
      } else {
        rawResponse = await sendMessage(conversationRef.current, activePrompt, model);
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawResponse);
      } catch {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { parsed = JSON.parse(jsonMatch[0]); } catch { /* fall through */ }
        }
        if (!parsed) {
          const textMsg: ChatMessage = {
            id: nextId(),
            role: 'assistant',
            content: rawResponse,
            title: 'Response',
            explanation: rawResponse,
          };
          setMessages((prev) => [...prev, textMsg]);
          conversationRef.current.push({ role: 'assistant', content: rawResponse });
          setCurrentResult({ type: 'text', title: 'Response', textContent: rawResponse });
          setIsLoading(false);
          return;
        }
      }

      const { type, title, explanation, analysisCode, chartConfig } = parsed;
      conversationRef.current.push({ role: 'assistant', content: rawResponse });

      if (analysisCode) {
        try {
          const workerResult = await executeCode(analysisCode);
          let result: any = { type, title, explanation };

          if (type === 'chart') {
            result.chartData = workerResult;
            result.chartConfig = chartConfig;
          } else if (type === 'table') {
            result.tableData = workerResult;
          } else {
            result.textContent = typeof workerResult === 'string' ? workerResult : JSON.stringify(workerResult);
          }

          setCurrentResult(result);
          setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: rawResponse, title, explanation }]);
        } catch (execErr: any) {
          const errorMsg = `Code execution error: ${execErr.message}`;
          setCurrentResult({ type: 'error', title: 'Execution Error', error: errorMsg });
          setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: errorMsg, title: 'Error', explanation: errorMsg, isError: true }]);
          conversationRef.current.push({ role: 'user', content: `The code you provided threw an error when executed: ${execErr.message}. Please fix the code and try again.` });
        }
      } else {
        setCurrentResult({ type: 'text', title, explanation, textContent: explanation });
        setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: rawResponse, title, explanation }]);
      }
    } catch (err: any) {
      const apiErr = err as ApiError;
      const errorText = apiErr.message || 'An unexpected error occurred';
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: errorText, title: 'Error', explanation: errorText, isError: true }]);
      setCurrentResult({ type: 'error', title: 'API Error', error: errorText });
    } finally {
      setIsLoading(false);
    }
  }, [model, isLoading, executeCode, datasetType, liveData]);

  const handleClear = () => {
    setMessages([]);
    setCurrentResult(null);
    conversationRef.current = [];
  };

  const handleDisconnect = () => {
    setMessages([]);
    setCurrentResult(null);
    conversationRef.current = [];
    mcpClientRef.current?.disconnect();
    mcpClientRef.current = null;
    mcpToolsRef.current = [];
    setLiveData(false);
  };

  const handleLiveDataChange = useCallback(async (enabled: boolean) => {
    if (enabled) {
      setLiveDataConnecting(true);
      try {
        const client = new McpClient();
        const tools = await client.connect();
        mcpClientRef.current = client;
        mcpToolsRef.current = mcpToAnthropicTools(tools);
        setLiveData(true);
      } catch (err: any) {
        console.error('Failed to connect to CoinGecko MCP:', err);
        setMessages((prev) => [...prev, {
          id: nextId(),
          role: 'assistant',
          content: `Failed to connect to live data: ${err.message}`,
          title: 'Connection Error',
          explanation: `Failed to connect to live data: ${err.message}`,
          isError: true,
        }]);
      } finally {
        setLiveDataConnecting(false);
      }
    } else {
      mcpClientRef.current?.disconnect();
      mcpClientRef.current = null;
      mcpToolsRef.current = [];
      setLiveData(false);
    }
  }, []);

  const handleDatasetTypeChange = (dt: DatasetType) => {
    if (dt === datasetType) return;
    setDatasetType(dt);
    setMessages([]);
    setCurrentResult(null);
    conversationRef.current = [];
    if (dt === 'equity' && liveData) {
      mcpClientRef.current?.disconnect();
      mcpClientRef.current = null;
      mcpToolsRef.current = [];
      setLiveData(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden relative bg-background">
      <SiteHeader logoClassName="h-12 sm:h-14 md:h-16" />

      {/* Main content area */}
      <main className="absolute inset-0 top-20 bottom-10 sm:top-24 sm:bottom-12 md:top-32 md:bottom-14 mx-4 sm:mx-8 md:mx-16 z-10">
        {datasetLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading dataset...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-3 md:gap-4">
            {/* Mobile pane toggle */}
            <div className="md:hidden flex-shrink-0 grid grid-cols-2 gap-1 p-1 rounded-xl border border-border/30 bg-white/30">
              <button
                onClick={() => setMobileTab('chat')}
                className={`h-11 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  mobileTab === 'chat' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMobileTab('results')}
                className={`h-11 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  mobileTab === 'results' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Results
              </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 md:gap-4">
              <div className={`${mobileTab === 'chat' ? 'block' : 'hidden'} md:block w-full md:w-[40%] flex-1 md:flex-none min-h-0 md:h-full flex-shrink-0 border border-border/30 rounded-xl bg-white/30 overflow-hidden`}>
                <ChatPanel
                  messages={messages}
                  onSend={handleSend}
                  isLoading={isLoading}
                  model={model}
                  onModelChange={setModel}
                  onClear={handleClear}
                  onDisconnect={handleDisconnect}
                  datasetType={datasetType}
                  onDatasetTypeChange={handleDatasetTypeChange}
                  liveData={liveData}
                  onLiveDataChange={handleLiveDataChange}
                  liveDataConnecting={liveDataConnecting}
                />
              </div>
              <div className={`${mobileTab === 'results' ? 'block' : 'hidden'} md:block flex-1 min-h-0 md:h-full overflow-hidden border border-border/30 rounded-xl bg-white/30`}>
                <OutputPanel
                  result={currentResult}
                  isLoading={isLoading}
                  onSuggestedQuestion={handleSend}
                  datasetType={datasetType}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full px-4 z-20" />
    </div>
  );
};

export default VCExitsExplorer;
