const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'https://cambrena-proxy.cambrena.workers.dev';
const MCP_ENDPOINT = `${PROXY_URL}/mcp`;

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

function parseSseData(text: string): any {
  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) {
      return JSON.parse(line.slice(6));
    }
  }
  // Try parsing as plain JSON
  return JSON.parse(text);
}

export function mcpToAnthropicTools(mcpTools: McpTool[]): AnthropicTool[] {
  return mcpTools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }));
}

export class McpClient {
  private sessionId: string | null = null;
  private tools: McpTool[] = [];

  get isConnected(): boolean {
    return this.sessionId !== null;
  }

  async connect(): Promise<McpTool[]> {
    // 1. Initialize
    const initRes = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'cambrena-explorer', version: '1.0' },
        },
      }),
    });

    const sessionId = initRes.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('MCP server did not return a session ID');
    }
    this.sessionId = sessionId;

    // 2. Send initialized notification
    await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'Mcp-Session-Id': this.sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      }),
    });

    // 3. List tools
    const toolsRes = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'Mcp-Session-Id': this.sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }),
    });

    const toolsText = await toolsRes.text();
    const toolsData = parseSseData(toolsText);
    this.tools = toolsData.result?.tools || [];

    return this.tools;
  }

  async callTool(name: string, args: Record<string, any>): Promise<string> {
    if (!this.sessionId) {
      throw new Error('MCP client not connected');
    }

    const res = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'Mcp-Session-Id': this.sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name, arguments: args },
      }),
    });

    const text = await res.text();
    const data = parseSseData(text);

    if (data.error) {
      throw new Error(data.error.message || 'MCP tool call failed');
    }

    const content = data.result?.content;
    if (Array.isArray(content) && content.length > 0) {
      return content.map((c: any) => c.text || '').join('\n');
    }

    return JSON.stringify(data.result);
  }

  async disconnect(): Promise<void> {
    if (this.sessionId) {
      try {
        await fetch(MCP_ENDPOINT, {
          method: 'DELETE',
          headers: { 'Mcp-Session-Id': this.sessionId },
        });
      } catch {
        // Ignore errors on disconnect
      }
      this.sessionId = null;
      this.tools = [];
    }
  }
}
