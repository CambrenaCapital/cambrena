import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface SeriesConfig {
  key: string;
  name: string;
  type?: string;
  color?: string;
}

interface ChartConfig {
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'scatter';
  xKey: string;
  series?: SeriesConfig[];
  xLabel?: string;
  yLabel?: string;
  yUnit?: string;
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
}

interface Props {
  data: any[];
  config: ChartConfig;
}

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#ec4899', '#64748b'];

function formatValue(value: number, unit?: string): string {
  if (unit === '$B') return `$${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
  if (unit === '$M') return `$${Math.round(value).toLocaleString()}M`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === '\u00d7') return `${value.toFixed(2)}\u00d7`;
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}

function formatTick(value: number, unit?: string): string {
  const n = (typeof value === 'number' && !isNaN(value))
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : String(value);
  if (unit === '$B') return `$${n}B`;
  if (unit === '$M') return `$${n}M`;
  if (unit === '%') return `${value}%`;
  if (unit === '\u00d7') return `${value}\u00d7`;
  return n;
}

const ChartRenderer = ({ data, config }: Props) => {
  const { chartType, xKey, series = [], yLabel, yUnit, layout, stacked } = config;
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 280 : 400;
  // Line and area charts should always be horizontal (time on x-axis)
  const isVertical = layout === 'vertical' && chartType === 'bar';

  const tooltipFormatter = (value: number) => formatValue(value, yUnit);
  const yTickFormatter = (value: number) => formatTick(value, yUnit);

  const isPercent = yUnit === '%';
  const yDomain = isPercent ? [0, 100] as [number, number] : undefined;
  const yTicks = isPercent ? [0, 25, 50, 75, 100] : undefined;

  // More left margin when we have a Y axis label to avoid overlap
  const leftMargin = yLabel ? 40 : 20;
  // More bottom margin when there's a legend + x label
  const hasLegend = series.length > 1;
  const bottomMargin = hasLegend ? 50 : 30;

  if (chartType === 'pie') {
    const nameKey = xKey;
    const valueKey = series[0]?.key || 'value';
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 90 : 150}
            label={isMobile ? false : ({ name, value }) => `${name}: ${formatValue(value, yUnit)}`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'scatter') {
    const xField = xKey;
    const yField = series[0]?.key || 'value';
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ScatterChart margin={{ top: 10, right: 30, bottom: bottomMargin, left: leftMargin }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xField} name={yLabel || xField} type="number" />
          <YAxis
            dataKey={yField}
            name={yLabel || yField}
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={yTickFormatter}
          />
          <Tooltip formatter={tooltipFormatter} />
          <Scatter data={data} fill={series[0]?.color || COLORS[0]} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <ChartComponent
        data={data}
        layout={isVertical ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 30, bottom: bottomMargin, left: leftMargin }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        {isVertical ? (
          <>
            <YAxis dataKey={xKey} type="category" width={isMobile ? 78 : 120} tick={{ fontSize: 12 }} />
            <XAxis type="number" tickFormatter={yTickFormatter} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={yTickFormatter}
              tick={{ fontSize: 12 }}
              width={yUnit ? 60 : 50}
            />
          </>
        )}
        <Tooltip formatter={tooltipFormatter} />
        {hasLegend && <Legend wrapperStyle={{ paddingTop: 16 }} />}
        {series.map((s, i) => {
          const color = s.color || COLORS[i % COLORS.length];
          const seriesType = s.type || chartType;
          if (seriesType === 'line') {
            return <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={color} strokeWidth={2} dot={{ r: 3 }} />;
          }
          if (seriesType === 'area') {
            return <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} fill={color} stroke={color} fillOpacity={0.3} stackId={stacked ? 'stack' : undefined} />;
          }
          return <Bar key={s.key} dataKey={s.key} name={s.name} fill={color} stackId={stacked ? 'stack' : undefined} />;
        })}
      </ChartComponent>
    </ResponsiveContainer>
  );
};

export default ChartRenderer;
