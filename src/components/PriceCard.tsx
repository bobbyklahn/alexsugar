'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PriceData } from '@/types';

export default function PriceCard() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const response = await fetch('/api/prices/current');
      const data = await response.json();

      if (data.success) {
        setPriceData(data.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(data.error || '获取价格失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Error fetching price:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const handleRefresh = () => {
    setLoading(true);
    fetchPrice();
  };

  if (loading && !priceData) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error && !priceData) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <p className="text-[var(--danger)] mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            重试
          </button>
        </div>
      </div>
    );
  }

  const isPositive = priceData && priceData.changePercent24h >= 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-secondary)]">
          当前糖价
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`p-2 rounded-lg hover:bg-[var(--secondary-dark)] transition-colors ${
            loading ? 'opacity-50' : ''
          }`}
          aria-label="刷新"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      {priceData && (
        <>
          {/* Main price display */}
          <div className="mb-4">
            <div className="price-display text-4xl font-bold text-[var(--text-primary)] mb-1">
              {priceData.price.toFixed(2)}
              <span className="text-lg font-normal text-[var(--text-secondary)] ml-1">
                美分/磅
              </span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                isPositive ? 'price-up' : 'price-down'
              }`}
            >
              <span className="text-xl font-semibold">
                {isPositive ? '↑' : '↓'}{' '}
                {isPositive ? '+' : ''}
                {priceData.changePercent24h.toFixed(2)}%
              </span>
              <span className="text-sm">
                ({isPositive ? '+' : ''}{priceData.change24h.toFixed(3)})
              </span>
            </div>
          </div>

          {/* 24h stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-[var(--card-border)]">
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                24小时最高
              </div>
              <div className="price-display font-semibold text-[var(--success)]">
                {priceData.high24h.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                24小时最低
              </div>
              <div className="price-display font-semibold text-[var(--danger)]">
                {priceData.low24h.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Update time */}
          <div className="text-xs text-[var(--text-secondary)] text-center">
            {lastUpdate && (
              <>
                更新于:{' '}
                {formatDistanceToNow(lastUpdate, {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </>
            )}
            {priceData.source === 'mock' && (
              <span className="ml-2 text-[var(--accent)]">(模拟数据)</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
