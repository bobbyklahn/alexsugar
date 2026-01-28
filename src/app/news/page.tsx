'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import NewsCard from '@/components/NewsCard';
import { NewsArticle, NewsCategory } from '@/types';

const categories: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'market_analysis', label: '市场分析' },
  { value: 'production_supply', label: '生产与供应' },
  { value: 'policy_trade', label: '政策与贸易' },
  { value: 'price_forecasts', label: '价格预测' },
];

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNews = async (category: NewsCategory, pageNum: number, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(
        `/api/news?category=${category}&page=${pageNum}&limit=10`
      );
      const data = await response.json();

      if (data.success) {
        const newArticles = data.data.articles;
        if (append) {
          setArticles((prev) => [...prev, ...newArticles]);
        } else {
          setArticles(newArticles);
        }
        setHasMore(newArticles.length === 10);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchNews(selectedCategory, 1);
  }, [selectedCategory]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(selectedCategory, nextPage, true);
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="px-4 py-4 space-y-4">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          新闻资讯
        </h1>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`time-range-btn whitespace-nowrap ${
                selectedCategory === cat.value ? 'active' : ''
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="space-y-3">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-3 rounded-xl border border-[var(--card-border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--secondary-dark)] transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    加载中...
                  </span>
                ) : (
                  '加载更多'
                )}
              </button>
            )}
          </>
        ) : (
          <div className="card p-12 text-center text-[var(--text-secondary)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 mx-auto mb-4 opacity-50"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
              />
            </svg>
            <p>暂无新闻</p>
          </div>
        )}

        {/* Translation Info */}
        <div className="card p-4 bg-[var(--secondary)]">
          <div className="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 flex-shrink-0 text-[var(--primary)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
              />
            </svg>
            <div className="text-sm text-[var(--text-secondary)]">
              <p>点击「翻译」按钮可将英文新闻翻译为中文。</p>
              <p className="mt-1">翻译内容将被缓存，下次访问无需重新翻译。</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
