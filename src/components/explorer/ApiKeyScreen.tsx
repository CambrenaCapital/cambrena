import { useState } from 'react';

interface Props {
  onConnect: (apiKey: string) => void;
  error?: string | null;
}

const ApiKeyScreen = ({ onConnect, error }: Props) => {
  const [key, setKey] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) onConnect(key.trim());
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="bg-white/60 rounded-xl border border-border/30 p-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">VC Exits Explorer</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your Anthropic API key to start.{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-60 transition-opacity underline"
            >
              Get one at console.anthropic.com
            </a>
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-3 rounded-lg border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent bg-white/80 placeholder-muted-foreground"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-foreground text-primary-foreground text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Start Exploring
            </button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Your key is stored in memory only. It is never saved to our servers.{' '}
            <button
              type="button"
              onClick={() => setShowSecurity(!showSecurity)}
              className="underline hover:opacity-60 transition-opacity"
            >
              Learn more
            </button>
          </p>
          {showSecurity && (
            <ul className="mt-3 text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Stored in browser memory only — never saved to disk, localStorage, or cookies</li>
              <li>Sent only to the Anthropic API via our CORS proxy, which forwards it without logging or storing</li>
              <li>Cleared immediately when you disconnect or close the tab</li>
              <li>This tool is provided as-is. We make no guarantees regarding the security of your API key. Use at your own risk.</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyScreen;
