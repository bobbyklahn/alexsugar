'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PriceCard from '@/components/PriceCard';
import PriceChart from '@/components/PriceChart';
import NewsCard from '@/components/NewsCard';
import { NewsArticle } from '@/types';
import Link from 'next/link';

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news?limit=3');
        const data = await response.json();
        if (data.success) {
          setNews(data.data.articles);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="px-4 py-4 space-y-4">
        {/* Price Card */}
        <PriceCard />

        {/* Price Chart */}
        <PriceChart />

        {/* Latest News Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
              最新新闻
            </h2>
            <Link
              href="/news"
              className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)]"
            >
              查看更多
            </Link>
          </div>

          {loadingNews ? (
            <div className="flex justify-center py-8">
              <div className="spinner" />
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-3">
              {news.map((article) => (
                <NewsCard key={article.id} article={article} compact />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-[var(--text-secondary)]">
              暂无新闻
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
