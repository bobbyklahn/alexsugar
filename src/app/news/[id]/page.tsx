'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import { NewsArticle } from '@/types';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Fetch article from the news API
        const response = await fetch('/api/news');
        const data = await response.json();

        if (data.success) {
          const found = data.data.articles.find(
            (a: NewsArticle) => a.id === Number(params.id)
          );
          if (found) {
            setArticle(found);
            setTranslatedContent(found.translatedContent);
            setShowTranslation(found.isTranslated || found.originalLanguage === 'zh');
          }
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  const handleTranslate = async () => {
    if (!article) return;

    if (translatedContent || article.originalLanguage === 'zh') {
      setShowTranslation(!showTranslation);
      return;
    }

    setTranslating(true);
    try {
      const response = await fetch('/api/news/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id }),
      });

      const data = await response.json();
      if (data.success) {
        setTranslatedContent(data.data.translatedContent);
        setShowTranslation(true);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      en: '英语',
      es: '西班牙语',
      zh: '中文',
      pt: '葡萄牙语',
    };
    return labels[lang] || lang.toUpperCase();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner" />
        </div>
        <BottomNav />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--text-secondary)] mb-4"
          >
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
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            返回
          </button>
          <div className="card p-8 text-center">
            <p className="text-[var(--text-secondary)]">文章未找到</p>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  const displayContent = showTranslation && translatedContent
    ? translatedContent
    : article.content;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--card-bg)] border-b border-[var(--card-border)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--secondary-dark)] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold truncate">新闻详情</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Article Image */}
        {article.imageUrl && (
          <div className="w-full h-48 rounded-xl overflow-hidden bg-[var(--secondary-dark)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight mb-3">
            {showTranslation && translatedContent && article.originalLanguage !== 'zh'
              ? translatedContent.split('\n')[0]
              : article.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="font-medium">{article.source}</span>
            <span>·</span>
            <span>
              {format(new Date(article.publishedAt), 'yyyy年M月d日 HH:mm', {
                locale: zhCN,
              })}
            </span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(article.publishedAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>

          {/* Language & Translation */}
          <div className="flex items-center gap-3 mt-3">
            {article.originalLanguage !== 'zh' && (
              <span className="px-2 py-1 rounded-lg bg-[var(--secondary-dark)] text-xs text-[var(--text-secondary)]">
                原文: {getLanguageLabel(article.originalLanguage)}
              </span>
            )}

            {article.originalLanguage !== 'zh' && (
              <button
                onClick={handleTranslate}
                disabled={translating}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  showTranslation
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary-dark)] text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:text-white'
                }`}
              >
                {translating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    翻译中...
                  </span>
                ) : showTranslation ? (
                  '查看原文'
                ) : (
                  '翻译为中文'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="card p-4">
          <div className="prose prose-sm max-w-none text-[var(--text-primary)] leading-relaxed">
            {displayContent ? (
              displayContent.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-[var(--text-secondary)] italic">
                暂无文章内容
              </p>
            )}
          </div>
        </div>

        {/* Source Link */}
        {article.sourceUrl && (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--secondary-dark)] transition-colors"
          >
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
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            查看原文链接
          </a>
        )}

        {/* Related Actions */}
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
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <div className="text-sm text-[var(--text-secondary)]">
              <p>新闻来源: {article.source}</p>
              {article.originalLanguage !== 'zh' && (
                <p className="mt-1">
                  翻译由 DeepSeek AI 提供，仅供参考。
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
