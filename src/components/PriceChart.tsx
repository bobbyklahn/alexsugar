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
} from 'recharts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TimeRange, HistoricalPrice } from '@/types';

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '1d', label: '1日' },
  { value: '1w', label: '1周' },
  { value: '1m', label: '1月' },
  { value: '3m', label: '3月' },
  { value: '1y', label: '1年' },
  { value: '2y', label: '2年' },
];

interface ChartData {
  timestamp: string;
  close: number;
  formattedDate: string;
}

export default function PriceChart() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1m');
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleExportCSV = () => {
    if (data.length === 0) return;

    const csvContent = [
      ['日期', '收盘价(美分/磅)'].join(','),
      ...data.map((item) => [item.formattedDate, item.close.toFixed(2)].join(',')),
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
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg">
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="text-lg font-semibold price-display">
            {payload[0].value.toFixed(2)} 美分/磅
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-secondary)]">
          价格走势
        </h2>
      </div>

      {/* Time range selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
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

      {/* Chart */}
      <div className="h-64 w-full">
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
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--card-border)"
              />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--card-border)' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--card-border)' }}
                tickFormatter={(value) => `${value.toFixed(1)}¢`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="close"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'var(--primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--card-border)]">
        <button
          onClick={handleExportCSV}
          disabled={data.length === 0}
          className="flex-1 py-2 px-4 rounded-lg border border-[var(--card-border)] text-sm font-medium hover:bg-[var(--secondary-dark)] transition-colors disabled:opacity-50"
        >
          导出CSV
        </button>
        <button
          onClick={() => fetchHistory(selectedRange)}
          disabled={loading}
          className="flex-1 py-2 px-4 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
        >
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>
    </div>
  );
}
