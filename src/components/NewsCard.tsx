'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { NewsArticle } from '@/types';

interface NewsCardProps {
  article: NewsArticle;
  compact?: boolean;
}

export default function NewsCard({ article, compact = false }: NewsCardProps) {
  const router = useRouter();
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(
    article.translatedContent
  );
  const [showTranslation, setShowTranslation] = useState(
    article.isTranslated || article.originalLanguage === 'zh'
  );

  const handleCardClick = () => {
    router.push(`/news/${article.id}`);
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation

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

  const getLanguageBadge = (lang: string) => {
    const labels: Record<string, string> = {
      en: 'EN',
      es: 'ES',
      zh: '中',
      pt: 'PT',
    };
    return labels[lang] || lang.toUpperCase();
  };

  const displayContent = showTranslation && translatedContent
    ? translatedContent
    : article.content;

  return (
    <div
      className="card p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
      onClick={handleCardClick}
    >
      <div className="flex gap-3">
        {/* Thumbnail placeholder */}
        {article.imageUrl && !compact && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-[var(--secondary-dark)] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-2">
            {showTranslation && translatedContent && article.originalLanguage !== 'zh'
              ? translatedContent.split('\n')[0]
              : article.title}
          </h3>

          {/* Content preview (if not compact) */}
          {!compact && displayContent && (
            <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">
              {displayContent}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>{article.source}</span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(article.publishedAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>

            {/* Language badge */}
            {article.originalLanguage !== 'zh' && (
              <span className="px-1.5 py-0.5 rounded bg-[var(--secondary-dark)] text-[var(--text-secondary)]">
                {getLanguageBadge(article.originalLanguage)}
              </span>
            )}

            {/* Translate button */}
            {article.originalLanguage !== 'zh' && (
              <button
                onClick={handleTranslate}
                disabled={translating}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  showTranslation
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary-dark)] text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:text-white'
                }`}
              >
                {translating ? (
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    翻译中
                  </span>
                ) : showTranslation ? (
                  '原文'
                ) : (
                  '翻译'
                )}
              </button>
            )}

            {/* Arrow indicator */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 ml-auto text-[var(--text-secondary)] opacity-50"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
