'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { TimeRange, HistoricalPrice } from '@/types';

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '1d', label: '1日' },
  { value: '1w', label: '1周' },
  { value: '1m', label: '1月' },
  { value: '3m', label: '3月' },
  { value: '1y', label: '1年' },
  { value: '2y', label: '2年' },
  { value: '5y', label: '5年' },
];

interface ChartData {
  timestamp: string;
  close: number;
  high: number;
  low: number;
  formattedDate: string;
}

export default function ChartsPage() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1m');
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMA20, setShowMA20] = useState(false);
  const [showMA50, setShowMA50] = useState(false);

  const fetchHistory = useCallback(async (range: TimeRange) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prices/history?range=${range}`);
      const result = await response.json();

      if (result.success && result.data) {
        const chartData = result.data.data.map((item: HistoricalPrice) => ({
          timestamp: item.timestamp,
          close: item.close,
          high: item.high,
          low: item.low,
          formattedDate: formatDate(item.timestamp, range),
        }));
        setData(chartData);
      } else {
        setError(result.error || '获取历史数据失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(selectedRange);
  }, [selectedRange, fetchHistory]);

  const formatDate = (dateStr: string, range: TimeRange) => {
    const date = new Date(dateStr);
    if (range === '1d') {
      return format(date, 'HH:mm', { locale: zhCN });
    } else if (range === '1w') {
      return format(date, 'M/d HH:mm', { locale: zhCN });
    } else if (['1m', '3m'].includes(range)) {
      return format(date, 'M/d', { locale: zhCN });
    } else {
      return format(date, 'yyyy/M', { locale: zhCN });
    }
  };

  // Calculate moving averages
  const calculateMA = (period: number) => {
    if (data.length < period) return [];
    return data.map((_, index) => {
      if (index < period - 1) return null;
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, item) => acc + item.close, 0);
      return sum / period;
    });
  };

  const ma20 = showMA20 ? calculateMA(20) : [];
  const ma50 = showMA50 ? calculateMA(50) : [];

  const dataWithMA = data.map((item, index) => ({
    ...item,
    ma20: ma20[index],
    ma50: ma50[index],
  }));

  const handleExportCSV = () => {
    if (data.length === 0) return;

    const csvContent = [
      ['日期', '收盘价', '最高价', '最低价'].join(','),
      ...data.map((item) =>
        [
          item.formattedDate,
          item.close.toFixed(4),
          item.high.toFixed(4),
          item.low.toFixed(4),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sugar_price_${selectedRange}_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg">
          <p className="text-sm text-[var(--text-secondary)] mb-2">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm" style={{ color: p.color }}>
              {p.dataKey === 'close' && '收盘价: '}
              {p.dataKey === 'ma20' && 'MA20: '}
              {p.dataKey === 'ma50' && 'MA50: '}
              ${p.value?.toFixed(4) || '-'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate stats
  const stats = data.length > 0 ? {
    current: data[data.length - 1]?.close || 0,
    high: Math.max(...data.map(d => d.high)),
    low: Math.min(...data.map(d => d.low)),
    average: data.reduce((acc, d) => acc + d.close, 0) / data.length,
  } : null;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="px-4 py-4 space-y-4">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          价格图表
        </h1>

        {/* Time Range Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`time-range-btn whitespace-nowrap ${
                selectedRange === range.value ? 'active' : ''
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Chart Card */}
        <div className="card p-4">
          {/* Chart */}
          <div className="h-80 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="spinner" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[var(--danger)]">{error}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataWithMA}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--card-border)"
                  />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--card-border)' }}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--card-border)' }}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {stats && (
                    <ReferenceLine
                      y={stats.average}
                      stroke="var(--text-secondary)"
                      strokeDasharray="5 5"
                      opacity={0.5}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: 'var(--primary)' }}
                  />
                  {showMA20 && (
                    <Line
                      type="monotone"
                      dataKey="ma20"
                      stroke="var(--success)"
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                    />
                  )}
                  {showMA50 && (
                    <Line
                      type="monotone"
                      dataKey="ma50"
                      stroke="var(--danger)"
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Technical Indicators Toggle */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--card-border)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMA20}
                onChange={(e) => setShowMA20(e.target.checked)}
                className="w-4 h-4 accent-[var(--success)]"
              />
              <span className="text-sm text-[var(--success)]">MA20</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMA50}
                onChange={(e) => setShowMA50(e.target.checked)}
                className="w-4 h-4 accent-[var(--danger)]"
              />
              <span className="text-sm text-[var(--danger)]">MA50</span>
            </label>
          </div>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
              区间统计 ({timeRanges.find(r => r.value === selectedRange)?.label})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[var(--text-secondary)]">最高价</div>
                <div className="price-display font-semibold text-[var(--success)]">
                  ${stats.high.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">最低价</div>
                <div className="price-display font-semibold text-[var(--danger)]">
                  ${stats.low.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">平均价</div>
                <div className="price-display font-semibold">
                  ${stats.average.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">波动幅度</div>
                <div className="price-display font-semibold">
                  ${(stats.high - stats.low).toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          disabled={data.length === 0}
          className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
        >
          导出CSV数据
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
