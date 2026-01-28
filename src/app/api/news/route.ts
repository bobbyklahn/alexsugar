import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticles } from '@/lib/db';
import { NewsCategory, NewsArticle } from '@/types';

// Mock news data for development/demo
const mockNews: NewsArticle[] = [
  {
    id: 1,
    title: 'Global Sugar Prices Fall Amid Supply Surplus',
    originalLanguage: 'en',
    content:
      'International sugar prices have declined as major producers report higher than expected yields. Brazil and India, the world\'s largest sugar producers, have both announced increased production estimates for the current season.',
    translatedContent: null,
    source: 'Reuters',
    sourceUrl: 'https://reuters.com',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 2,
    title: 'China Increases Sugar Import Quotas for 2025',
    originalLanguage: 'en',
    content:
      'The Chinese government has announced an increase in sugar import quotas for the upcoming year, signaling potential changes in the global sugar trade landscape.',
    translatedContent: '中国政府宣布增加明年糖进口配额，预示全球糖贸易格局可能发生变化。',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    category: 'policy_trade',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 3,
    title: 'Sugar Futures Outlook: Analysts Predict Recovery',
    originalLanguage: 'en',
    content:
      'Market analysts are predicting a recovery in sugar futures prices by mid-year, citing weather concerns in key producing regions and steady demand growth in Asia.',
    translatedContent: null,
    source: 'Trading Economics',
    sourceUrl: 'https://tradingeconomics.com',
    category: 'price_forecasts',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 4,
    title: 'Brazil Sugar Production Reaches Record High',
    originalLanguage: 'en',
    content:
      'Brazil\'s sugar production has reached a record high this season, with favorable weather conditions contributing to exceptional yields across the country\'s main growing regions.',
    translatedContent: null,
    source: 'Reuters',
    sourceUrl: 'https://reuters.com',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 5,
    title: '印度糖业协会发布年度市场报告',
    originalLanguage: 'zh',
    content:
      '印度糖业协会今日发布了2024-2025榨季市场分析报告，预计本榨季印度糖产量将达到3200万吨，略高于去年水平。报告指出，尽管面临天气挑战，主产区产量仍保持稳定。',
    translatedContent:
      '印度糖业协会今日发布了2024-2025榨季市场分析报告，预计本榨季印度糖产量将达到3200万吨，略高于去年水平。报告指出，尽管面临天气挑战，主产区产量仍保持稳定。',
    source: 'SunSirs',
    sourceUrl: 'https://www.sunsirs.com',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
];

// GET - Fetch news articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'all') as NewsCategory;
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Validate category
    const validCategories: NewsCategory[] = [
      'all',
      'market_analysis',
      'production_supply',
      'policy_trade',
      'price_forecasts',
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category',
        },
        { status: 400 }
      );
    }

    // Try to get from database first
    try {
      const result = await getNewsArticles(category, limit, offset);

      if (result.rows.length > 0) {
        const articles = result.rows.map((row) => ({
          id: row.id,
          title: row.title,
          originalLanguage: row.original_language,
          content: row.content,
          translatedContent: row.translated_content,
          source: row.source,
          sourceUrl: row.source_url,
          category: row.category as NewsCategory,
          publishedAt: row.published_at,
          imageUrl: row.image_url,
          isTranslated: row.is_translated,
        }));

        return NextResponse.json({
          success: true,
          data: {
            articles,
            total: articles.length,
            page,
            limit,
          },
        });
      }
    } catch (dbError) {
      console.log('Database not available, using mock data');
    }

    // Return mock data if database is not configured
    let filteredNews = mockNews;
    if (category !== 'all') {
      filteredNews = mockNews.filter((n) => n.category === category);
    }

    const paginatedNews = filteredNews.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        articles: paginatedNews,
        total: filteredNews.length,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
      },
      { status: 500 }
    );
  }
}
