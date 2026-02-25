import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticleTranslation } from '@/lib/db';
import { translateToChicese } from '@/lib/deepseek';

// POST - Translate article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId || typeof articleId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    const result = await getArticleById(articleId);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    const article = result.rows[0];

    // Return cached translation if already done
    if (article.is_translated && article.translated_content) {
      return NextResponse.json({
        success: true,
        data: {
          translatedContent: article.translated_content,
          cached: true,
        },
      });
    }

    // Translate with DeepSeek
    const translatedContent = await translateToChicese(article.content);

    if (!translatedContent) {
      return NextResponse.json(
        { success: false, error: 'Translation service unavailable. Please check DEEPSEEK_API_KEY.' },
        { status: 503 }
      );
    }

    // Save translation to database
    await updateArticleTranslation(articleId, translatedContent);

    return NextResponse.json({
      success: true,
      data: {
        translatedContent,
        cached: false,
      },
    });
  } catch (error) {
    console.error('Error translating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to translate article' },
      { status: 500 }
    );
  }
}
