import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews, toNewsArticle } from '@/lib/news-fetcher';
import { saveNewsArticleBatch, checkArticleExists } from '@/lib/db';

// Simple admin key verification
function verifyAdminKey(request: NextRequest): boolean {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const adminKey = process.env.ADMIN_KEY || 'alex-sugar-admin';

  return key === adminKey;
}

export async function GET(request: NextRequest) {
  // Verify admin key
  if (!verifyAdminKey(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Add ?key=YOUR_ADMIN_KEY to the URL' },
      { status: 401 }
    );
  }

  try {
    console.log('Manual news fetch triggered...');
    const startTime = Date.now();

    // Fetch news from all sources
    const fetchedArticles = await fetchAllNews();

    if (fetchedArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new articles found from sources',
        articlesProcessed: 0,
        duration: Date.now() - startTime,
      });
    }

    // Check database availability
    let dbAvailable = true;
    try {
      await checkArticleExists('test-connection');
    } catch {
      dbAvailable = false;
    }

    if (!dbAvailable) {
      // Return fetched articles without saving (DB not available)
      return NextResponse.json({
        success: true,
        message: 'Database not available. Returning fetched articles preview.',
        articlesProcessed: fetchedArticles.length,
        preview: fetchedArticles.slice(0, 10).map(a => ({
          title: a.title,
          source: a.source,
          language: a.originalLanguage,
          publishedAt: a.publishedAt,
        })),
        duration: Date.now() - startTime,
      });
    }

    // Save articles to database
    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const savedArticles: string[] = [];

    for (const fetched of fetchedArticles) {
      try {
        // Check if article already exists
        const exists = await checkArticleExists(fetched.title);

        if (exists.rows.length > 0) {
          skippedCount++;
          continue;
        }

        // Save new article
        const article = toNewsArticle(fetched, 0);
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
        savedArticles.push(article.title);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to save "${fetched.title.substring(0, 50)}...": ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'News fetch completed',
      articlesProcessed: fetchedArticles.length,
      articlesSaved: savedCount,
      articlesSkipped: skippedCount,
      savedArticles: savedArticles.slice(0, 10),
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      duration,
    });
  } catch (error) {
    console.error('Manual news fetch failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news',
      },
      { status: 500 }
    );
  }
}
