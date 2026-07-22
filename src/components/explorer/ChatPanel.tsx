import { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, Trash2, LogOut, Database } from 'lucide-react';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import type { DatasetType } from '@/lib/types';
import coingeckoIcon from '@/assets/coingecko-icon.svg';

export const MODELS = [
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8' },
] as const;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  title?: string;
  explanation?: string;
  isError?: boolean;
}

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isLoading: boolean;
  model: string;
  onModelChange: (model: string) => void;
  onClear: () => void;
  onDisconnect: () => void;
  datasetType: DatasetType;
  onDatasetTypeChange: (dt: DatasetType) => void;
  liveData: boolean;
  onLiveDataChange: (enabled: boolean) => void;
  liveDataConnecting: boolean;
}

const ChatPanel = ({ messages, onSend, isLoading, model, onModelChange, onClear, onDisconnect, datasetType, onDatasetTypeChange, liveData, onLiveDataChange, liveDataConnecting }: Props) => {
  const [input, setInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const currentModel = MODELS.find(m => m.id === model) || MODELS[1];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col border-b border-border/20">
        {/* Dataset toggle row */}
        <div className="flex items-center justify-center px-4 py-2 gap-1 border-b border-border/10">
          <button
            onClick={() => onDatasetTypeChange('equity')}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wide rounded-full transition-all ${
              datasetType === 'equity'
                ? 'bg-foreground text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            Equity Exits
          </button>
          <button
            onClick={() => onDatasetTypeChange('token')}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wide rounded-full transition-all ${
              datasetType === 'token'
                ? 'bg-foreground text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            Token Listings
          </button>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center justify-end px-4 py-1.5 gap-x-2 gap-y-1">
          {datasetType === 'token' && (
            <button
              onClick={() => !liveDataConnecting && onLiveDataChange(!liveData)}
              disabled={liveDataConnecting}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
                liveDataConnecting
                  ? 'text-muted-foreground cursor-wait'
                  : liveData
                    ? 'text-green-600 font-medium hover:bg-green-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`}
              title={liveData ? 'Live data connected (CoinGecko)' : 'Enable live market data via CoinGecko'}
            >
              {liveDataConnecting ? (
                <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
              ) : liveData ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <img src={coingeckoIcon} alt="" className="w-3.5 h-3.5" />
                </>
              ) : (
                <img src={coingeckoIcon} alt="" className="w-3.5 h-3.5 grayscale brightness-0 opacity-60" />
              )}
              {liveData ? 'CoinGecko' : 'Access CoinGecko'}
            </button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-foreground/5"
                title="Explore dataset"
              >
                <Database size={13} />
                Dataset
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              {datasetType === 'equity' ? (
                <>
                  <DialogHeader>
                    <DialogTitle>VC-Backed Exits Dataset</DialogTitle>
                    <DialogDescription>
                      All venture capital-backed exits with a post-money valuation above $100M.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      <div className="text-muted-foreground">Source</div>
                      <div className="font-medium">PitchBook</div>
                      <div className="text-muted-foreground">Period</div>
                      <div className="font-medium">1980 &ndash; 2026</div>
                      <div className="text-muted-foreground">Total exits</div>
                      <div className="font-medium">7,907</div>
                      <div className="text-muted-foreground">Minimum valuation</div>
                      <div className="font-medium">$100M</div>
                      <div className="text-muted-foreground">Total exit value</div>
                      <div className="font-medium">~$8.9 trillion</div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Fields</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                        <Field name="Companies" desc="Company name" />
                        <Field name="Verticals" desc="Industry verticals (e.g. SaaS, AI & ML)" />
                        <Field name="Country" desc="Company country/territory" />
                        <Field name="HQ Global Region" desc="Americas, Asia, Europe, etc." />
                        <Field name="HQ Location" desc="City, State/Country" />
                        <Field name="Industry Sector" desc="Broadest category (7 sectors)" />
                        <Field name="Industry Group" desc="Mid-level (e.g. Software)" />
                        <Field name="Industry Code" desc="Most specific industry" />
                        <Field name="Deal Date" desc="Date of exit" />
                        <Field name="Deal Type" desc="IPO, M&A, Buyout/LBO, etc." />
                        <Field name="Post Valuation" desc="Exit valuation in $M" />
                        <Field name="Raised to Date" desc="Total VC raised in $M" />
                        <Field name="Time to Exit" desc="Years from founding to exit" />
                        <Field name="Year Founded" desc="Company founding year" />
                        <Field name="Investors" desc="Key investors / acquirer" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Key Statistics</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                        <Stat label="Median valuation" value="$320M" />
                        <Stat label="Mean valuation" value="$1,123M" />
                        <Stat label="Median raised" value="$77M" />
                        <Stat label="Median efficiency" value="4.50x" />
                        <Stat label="Median time to exit" value="8 years" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Breakdown</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        <Stat label="IPO" value="47%" />
                        <Stat label="M&A" value="44%" />
                        <Stat label="Buyout/LBO" value="6%" />
                        <Stat label="Top country: US" value="4,528 exits" />
                        <Stat label="China" value="1,477 exits" />
                        <Stat label="UK" value="307 exits" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Token Listings Dataset</DialogTitle>
                    <DialogDescription>
                      Token listings with market cap above $100M at listing or within 12 months after listing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      <div className="text-muted-foreground">Sources</div>
                      <div className="font-medium">Token Terminal + CoinGecko</div>
                      <div className="text-muted-foreground">Period</div>
                      <div className="font-medium">2013 &ndash; 2026</div>
                      <div className="text-muted-foreground">Total listings</div>
                      <div className="font-medium">237</div>
                      <div className="text-muted-foreground">Minimum market cap</div>
                      <div className="font-medium">$100M (at listing or 12M after)</div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Fields</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                        <Field name="Project Name" desc="Token project name" />
                        <Field name="Token Ticker" desc="Ticker symbol (e.g. ETH)" />
                        <Field name="Listing Date" desc="First Token Terminal data" />
                        <Field name="Sector / Vertical" desc="e.g. Layer 1, Infrastructure" />
                        <Field name="MC at Listing" desc="Market cap at listing" />
                        <Field name="MC 6/12/24M After" desc="Market cap over time" />
                        <Field name="FDV at Listing" desc="Fully diluted valuation" />
                        <Field name="FDV 6/12/24M After" desc="FDV over time" />
                        <Field name="MC/FDV Ratio" desc="Float ratio at listing & 12M" />
                        <Field name="Token Price" desc="Price at listing & 6/12/24M" />
                        <Field name="12M Price Change" desc="Percentage price change" />
                        <Field name="Qualifies Because" desc="MC at listing or 12M > $100M" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Key Statistics</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                        <Stat label="Median MC at listing" value="$181M" />
                        <Stat label="Mean MC at listing" value="$522M" />
                        <Stat label="Median FDV" value="$1.07B" />
                        <Stat label="Median MC/FDV" value="18.3%" />
                        <Stat label="Median 12M price change" value="0%" />
                        <Stat label="Positive 12M return" value="50%" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Top Sectors</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        <Stat label="Layer 1" value="66 listings" />
                        <Stat label="Infrastructure" value="30 listings" />
                        <Stat label="Layer 2" value="30 listings" />
                        <Stat label="Exchange (CEX/DEX)" value="22 listings" />
                        <Stat label="Liquid Staking" value="12 listings" />
                        <Stat label="Derivatives" value="11 listings" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-foreground/5"
            title="Clear conversation"
          >
            <Trash2 size={13} />
            Clear
          </button>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-foreground/5"
            title="Disconnect API key"
          >
            <LogOut size={13} />
            Disconnect
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground text-sm mt-8">
            <p className="mb-2">
              {datasetType === 'equity'
                ? 'Ask a question about 7,907 VC-backed exits'
                : 'Ask a question about 237 token listings'}
            </p>
            <p className="text-xs">
              {datasetType === 'equity'
                ? 'Try: "What is the median exit valuation?"'
                : 'Try: "What is the median market cap at listing?"'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-foreground text-primary-foreground'
                  : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-white/60 border border-border/30'
              }`}
            >
              {msg.role === 'assistant' && msg.title && (
                <p className="font-semibold mb-1">{msg.title}</p>
              )}
              <p>{msg.role === 'assistant' ? (msg.explanation || msg.content) : msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/60 border border-border/30 px-4 py-2.5 rounded-xl text-sm text-muted-foreground">
              <span className="animate-pulse">Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Model dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-2.5 h-11 rounded-lg border border-border/50 text-xs hover:opacity-70 transition-opacity whitespace-nowrap bg-white/60"
            >
              {currentModel.label}
              <ChevronDown size={12} className={`opacity-50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute bottom-full left-0 mb-1 bg-white rounded-lg border border-border/50 shadow-lg py-1 min-w-[140px] z-10">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { onModelChange(m.id); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      model === m.id
                        ? 'bg-foreground/5 font-medium'
                        : 'hover:bg-foreground/5'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={datasetType === 'equity' ? 'Ask about the VC exits dataset...' : 'Ask about the token listings dataset...'}
            disabled={isLoading}
            className="flex-1 min-w-0 px-4 h-11 rounded-lg border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent bg-white/80 placeholder-muted-foreground disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send"
            className="flex items-center justify-center h-11 w-11 flex-shrink-0 rounded-lg bg-foreground text-primary-foreground hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ name, desc }: { name: string; desc: string }) => (
  <div className="flex items-baseline gap-1.5">
    <span className="font-medium">{name}</span>
    <span className="text-muted-foreground text-xs">{desc}</span>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-muted-foreground">{label}: </span>
    <span className="font-medium">{value}</span>
  </div>
);

export default ChatPanel;
