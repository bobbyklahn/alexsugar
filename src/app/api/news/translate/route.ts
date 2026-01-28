import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticleTranslation } from '@/lib/db';
import { translateToChicese } from '@/lib/deepseek';

// Mock articles for development
const mockArticles: { [key: number]: { content: string; translatedContent?: string } } = {
  1: {
    content:
      'International sugar prices have declined as major producers report higher than expected yields. Brazil and India, the world\'s largest sugar producers, have both announced increased production estimates for the current season.',
  },
  3: {
    content:
      'Market analysts are predicting a recovery in sugar futures prices by mid-year, citing weather concerns in key producing regions and steady demand growth in Asia.',
  },
  4: {
    content:
      'Brazil\'s sugar production has reached a record high this season, with favorable weather conditions contributing to exceptional yields across the country\'s main growing regions.',
  },
};

// POST - Translate article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId || typeof articleId !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid article ID',
        },
        { status: 400 }
      );
    }

    // Try to get article from database
    try {
      const result = await getArticleById(articleId);

      if (result.rows.length > 0) {
        const article = result.rows[0];

        // Check if already translated
        if (article.is_translated && article.translated_content) {
          return NextResponse.json({
            success: true,
            data: {
              translatedContent: article.translated_content,
              cached: true,
            },
          });
        }

        // Translate the content
        const translatedContent = await translateToChicese(article.content);

        if (!translatedContent) {
          return NextResponse.json(
            {
              success: false,
              error: 'Translation failed',
            },
            { status: 500 }
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
      }
    } catch (dbError) {
      console.log('Database not available, using mock data');
    }

    // Mock translation for development
    const mockArticle = mockArticles[articleId];
    if (!mockArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }

    // Try real translation with DeepSeek
    const translatedContent = await translateToChicese(mockArticle.content);

    if (translatedContent) {
      return NextResponse.json({
        success: true,
        data: {
          translatedContent,
          cached: false,
        },
      });
    }

    // Fallback mock translation
    const mockTranslations: { [key: number]: string } = {
      1: '由于主要生产国报告产量高于预期，国际糖价出现下跌。巴西和印度这两个世界最大的糖生产国都宣布上调本季产量预估。',
      3: '市场分析师预测糖期货价格将在年中回升，主要原因是主要生产区的天气问题以及亚洲稳定增长的需求。',
      4: '本季巴西糖产量创历史新高，有利的天气条件为该国主要种植区带来了出色的产量。',
    };

    return NextResponse.json({
      success: true,
      data: {
        translatedContent: mockTranslations[articleId] || '翻译暂时不可用',
        cached: false,
      },
    });
  } catch (error) {
    console.error('Error translating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to translate article',
      },
      { status: 500 }
    );
  }
}
