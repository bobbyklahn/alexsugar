import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews, toNewsArticle } from '@/lib/news-fetcher';
import { saveNewsArticleBatch, checkArticleExists } from '@/lib/db';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is set, allow in development
  if (!cronSecret) {
    console.log('Warning: CRON_SECRET not set');
    return process.env.NODE_ENV === 'development';
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Starting scheduled news fetch...');
    const startTime = Date.now();

    // Fetch news from all sources
    const fetchedArticles = await fetchAllNews();

    if (fetchedArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new articles found',
        articlesProcessed: 0,
        duration: Date.now() - startTime,
      });
    }

    // Save articles to database
    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const fetched of fetchedArticles) {
      try {
        // Check if article already exists
        const exists = await checkArticleExists(fetched.title);

        if (exists.rows.length > 0) {
          skippedCount++;
          continue;
        }

        // Save new article
        const article = toNewsArticle(fetched, 0); // ID will be auto-generated
        await saveNewsArticleBatch({
          title: article.title,
          originalLanguage: article.originalLanguage,
          content: article.content || undefined,
          translatedContent: article.translatedContent || undefined,
          source: article.source,
          sourceUrl: article.sourceUrl || '',
          category: article.category,
          publishedAt: article.publishedAt,
          imageUrl: article.imageUrl || undefined,
          isTranslated: article.isTranslated,
        });

        savedCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to save "${fetched.title}": ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`News fetch completed: ${savedCount} saved, ${skippedCount} skipped, ${errors.length} errors, ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'News fetch completed',
      articlesProcessed: fetchedArticles.length,
      articlesSaved: savedCount,
      articlesSkipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
      duration,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
