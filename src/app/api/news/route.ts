import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticles, getArticleById } from '@/lib/db';
import { NewsCategory } from '@/types';

// GET - Fetch news articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    // Handle single article fetch by ID
    if (idParam) {
      const id = parseInt(idParam);
      if (isNaN(id)) {
        return NextResponse.json({ success: false, error: 'Invalid article ID' }, { status: 400 });
      }

      const result = await getArticleById(id);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const article = {
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
        };
        return NextResponse.json({ success: true, data: { article } });
      }
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const category = (searchParams.get('category') || 'all') as NewsCategory;
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    const validCategories: NewsCategory[] = [
      'all',
      'market_analysis',
      'production_supply',
      'policy_trade',
      'price_forecasts',
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    const result = await getNewsArticles(category, limit, offset);

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
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
