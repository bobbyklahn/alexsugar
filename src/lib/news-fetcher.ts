import { NewsArticle, NewsCategory } from '@/types';

interface FetchedArticle {
  title: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: NewsCategory;
  publishedAt: string;
  originalLanguage: 'en' | 'zh' | 'es' | 'pt';
}

// RSS Parser helper
async function parseRSS(url: string): Promise<Element[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AlexSugarBot/1.0)',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`RSS fetch failed for ${url}: ${response.status}`);
      return [];
    }

    const text = await response.text();
    // Simple XML parsing for RSS items
    const items: Element[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      items.push(match[1] as unknown as Element);
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error);
    return [];
  }
}

// Extract text content from XML tag
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (match) {
    return (match[1] || match[2] || '').trim();
  }
  return '';
}

// Clean HTML tags from content
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch from Sina Finance RSS (Chinese)
async function fetchSinaFinance(): Promise<FetchedArticle[]> {
  const articles: FetchedArticle[] = [];

  try {
    // Sina Finance futures/commodities RSS
    const response = await fetch('https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2516&k=&num=20&page=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AlexSugarBot/1.0)',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result?.data) {
        for (const item of data.result.data.slice(0, 5)) {
          // Filter for sugar-related news
          const title = item.title || '';
          const keywords = ['糖', '白糖', '食糖', '甘蔗', '糖价', '郑糖'];
          if (keywords.some(kw => title.includes(kw))) {
            articles.push({
              title: title,
              content: cleanHtml(item.intro || item.title),
              source: '新浪财经',
              sourceUrl: item.url || 'https://finance.sina.com.cn/',
              category: 'market_analysis',
              publishedAt: new Date(item.ctime * 1000).toISOString(),
              originalLanguage: 'zh',
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Sina Finance:', error);
  }

  return articles;
}

// Fetch from Eastmoney (Chinese)
async function fetchEastmoney(): Promise<FetchedArticle[]> {
  const articles: FetchedArticle[] = [];

  try {
    // Eastmoney futures news API
    const response = await fetch('https://np-listapi.eastmoney.com/comm/web/getFutures?type=1&pageSize=20&pageNo=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AlexSugarBot/1.0)',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data?.list) {
        for (const item of data.data.list.slice(0, 5)) {
          const title = item.title || '';
          const keywords = ['糖', '白糖', '食糖', '甘蔗', '糖价', '郑糖', 'SR'];
          if (keywords.some(kw => title.includes(kw))) {
            articles.push({
              title: title,
              content: cleanHtml(item.digest || item.title),
              source: '东方财富网',
              sourceUrl: item.url || 'https://futures.eastmoney.com/',
              category: 'market_analysis',
              publishedAt: new Date(item.showTime || Date.now()).toISOString(),
              originalLanguage: 'zh',
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Eastmoney:', error);
  }

  return articles;
}

// Fetch from Barchart RSS (English)
async function fetchBarchart(): Promise<FetchedArticle[]> {
  const articles: FetchedArticle[] = [];

  try {
    const items = await parseRSS('https://www.barchart.com/news/rss/sugar');

    for (const itemXml of items.slice(0, 5)) {
      const xml = itemXml as unknown as string;
      const title = extractTag(xml, 'title');
      const description = extractTag(xml, 'description');
      const link = extractTag(xml, 'link');
      const pubDate = extractTag(xml, 'pubDate');

      if (title && title.toLowerCase().includes('sugar')) {
        articles.push({
          title: title,
          content: cleanHtml(description || title),
          source: 'Barchart',
          sourceUrl: link || 'https://www.barchart.com/',
          category: 'market_analysis',
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          originalLanguage: 'en',
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Barchart:', error);
  }

  return articles;
}

// Fetch from Google News RSS for sugar (English)
async function fetchGoogleNews(): Promise<FetchedArticle[]> {
  const articles: FetchedArticle[] = [];

  try {
    const items = await parseRSS('https://news.google.com/rss/search?q=sugar+commodity+price&hl=en-US&gl=US&ceid=US:en');

    for (const itemXml of items.slice(0, 5)) {
      const xml = itemXml as unknown as string;
      const title = extractTag(xml, 'title');
      const description = extractTag(xml, 'description');
      const link = extractTag(xml, 'link');
      const pubDate = extractTag(xml, 'pubDate');
      const source = extractTag(xml, 'source');

      if (title) {
        articles.push({
          title: cleanHtml(title),
          content: cleanHtml(description || title),
          source: source || 'Google News',
          sourceUrl: link || 'https://news.google.com/',
          category: 'market_analysis',
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          originalLanguage: 'en',
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Google News:', error);
  }

  return articles;
}

// Fetch sugar news from SugarOnline
async function fetchSugarOnline(): Promise<FetchedArticle[]> {
  const articles: FetchedArticle[] = [];

  try {
    const items = await parseRSS('https://www.sugaronline.com/feed/');

    for (const itemXml of items.slice(0, 5)) {
      const xml = itemXml as unknown as string;
      const title = extractTag(xml, 'title');
      const description = extractTag(xml, 'description');
      const link = extractTag(xml, 'link');
      const pubDate = extractTag(xml, 'pubDate');

      if (title) {
        // Determine category based on content
        let category: NewsCategory = 'market_analysis';
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('price') || lowerTitle.includes('forecast')) {
          category = 'price_forecasts';
        } else if (lowerTitle.includes('production') || lowerTitle.includes('harvest') || lowerTitle.includes('crop')) {
          category = 'production_supply';
        } else if (lowerTitle.includes('policy') || lowerTitle.includes('trade') || lowerTitle.includes('export') || lowerTitle.includes('import')) {
          category = 'policy_trade';
        }

        articles.push({
          title: cleanHtml(title),
          content: cleanHtml(description || title),
          source: 'SugarOnline',
          sourceUrl: link || 'https://www.sugaronline.com/',
          category,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          originalLanguage: 'en',
        });
      }
    }
  } catch (error) {
    console.error('Error fetching SugarOnline:', error);
  }

  return articles;
}

// Fetch Chinese sugar news from Hexun (和讯期货)
async function fetchHexun(): Promise<FetchedArticle[]> {
  const articles: FetchedArticle[] = [];

  try {
    const response = await fetch('http://api.hexun.com/api/article/list?columnId=8483&pageSize=20', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AlexSugarBot/1.0)',
      },
    });

    if (response.ok) {
      const text = await response.text();
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        if (data.data) {
          for (const item of data.data.slice(0, 5)) {
            const title = item.title || '';
            const keywords = ['糖', '白糖', '食糖', '甘蔗', '糖价'];
            if (keywords.some(kw => title.includes(kw))) {
              articles.push({
                title: title,
                content: cleanHtml(item.summary || item.title),
                source: '和讯期货',
                sourceUrl: item.url || 'https://futures.hexun.com/',
                category: 'market_analysis',
                publishedAt: new Date(item.publishTime || Date.now()).toISOString(),
                originalLanguage: 'zh',
              });
            }
          }
        }
      } catch {
        console.log('Hexun response not JSON');
      }
    }
  } catch (error) {
    console.error('Error fetching Hexun:', error);
  }

  return articles;
}

// Main function to fetch all news
export async function fetchAllNews(): Promise<FetchedArticle[]> {
  console.log('Starting news fetch from all sources...');

  const results = await Promise.allSettled([
    fetchSinaFinance(),
    fetchEastmoney(),
    fetchBarchart(),
    fetchGoogleNews(),
    fetchSugarOnline(),
    fetchHexun(),
  ]);

  const allArticles: FetchedArticle[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  }

  console.log(`Fetched ${allArticles.length} total articles`);

  // Remove duplicates by title similarity
  const uniqueArticles: FetchedArticle[] = [];
  const seenTitles = new Set<string>();

  for (const article of allArticles) {
    const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
    if (!seenTitles.has(normalizedTitle) && article.title.length > 10) {
      seenTitles.add(normalizedTitle);
      uniqueArticles.push(article);
    }
  }

  console.log(`${uniqueArticles.length} unique articles after deduplication`);

  return uniqueArticles;
}

// Convert fetched article to NewsArticle format
export function toNewsArticle(fetched: FetchedArticle, id: number): NewsArticle {
  return {
    id,
    title: fetched.title,
    originalLanguage: fetched.originalLanguage,
    content: fetched.content,
    translatedContent: fetched.originalLanguage === 'zh' ? fetched.content : null,
    source: fetched.source,
    sourceUrl: fetched.sourceUrl,
    category: fetched.category,
    publishedAt: fetched.publishedAt,
    imageUrl: null,
    isTranslated: fetched.originalLanguage === 'zh',
  };
}
