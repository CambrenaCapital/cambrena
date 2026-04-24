import ChartRenderer from './ChartRenderer';
import TableRenderer from './TableRenderer';
import type { DatasetType } from '@/lib/types';

interface Props {
  result: any | null;
  isLoading: boolean;
  onSuggestedQuestion?: (q: string) => void;
  datasetType: DatasetType;
}

const EQUITY_SUGGESTED = [
  'Exit count by year as a line chart',
  'Sector value share over decades as area chart in %',
  'Time to exit distribution',
  'Exit value share by region over time (%) as area chart',
  'Top 25 verticals comparison by exit number, median valuation, amount raised and exit volume',
];

const TOKEN_SUGGESTED = [
  'Number of token listings by year as a bar chart',
  'Market cap at listing vs 12 months after by sector as a grouped bar chart',
  'Median MC/FDV ratio at listing by year as a line chart',
  'Top 10 tokens by market cap at listing as a horizontal bar chart',
  'Sector distribution of token listings as a pie chart',
];

const OutputPanel = ({ result, isLoading, onSuggestedQuestion, datasetType }: Props) => {
  const SUGGESTED = datasetType === 'equity' ? EQUITY_SUGGESTED : TOKEN_SUGGESTED;
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground animate-pulse">Analyzing...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <p className="text-muted-foreground text-sm mb-4">Ask a question to get started</p>
          <div className="space-y-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => onSuggestedQuestion?.(q)}
                className="block w-full text-left px-3 py-2 rounded-lg text-xs bg-white/60 border border-border/30 hover:border-foreground/30 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="bg-white/60 rounded-xl border border-border/30 p-6">
        {result.title && (
          <h3 className="text-lg font-bold mb-1">{result.title}</h3>
        )}
        {result.explanation && (
          <p className="text-sm text-muted-foreground mb-4">{result.explanation}</p>
        )}

        {result.type === 'chart' && result.chartData && result.chartConfig && (
          <ChartRenderer data={result.chartData} config={result.chartConfig} />
        )}

        {result.type === 'table' && result.tableData && (
          <TableRenderer headers={result.tableData.headers} rows={result.tableData.rows} />
        )}

        {result.type === 'text' && result.textContent && (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {result.textContent}
          </div>
        )}

        {result.type === 'error' && (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg p-4">
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
