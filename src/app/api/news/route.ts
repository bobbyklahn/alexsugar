import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticles } from '@/lib/db';
import { NewsCategory, NewsArticle } from '@/types';

// Comprehensive mock news data from various sugar industry sources
const mockNews: NewsArticle[] = [
  {
    id: 1,
    title: 'Global Sugar Prices Drop 17% in 2025, Downturn Expected to Extend into 2026',
    originalLanguage: 'en',
    content:
      'Global sugar prices have fallen significantly in 2025, with raw sugar futures declining approximately 17% year-to-date. Analysts expect the bearish trend to continue into 2026 due to abundant supplies from major producing nations. The surplus is being driven by favorable weather conditions in Brazil and a recovery in Indian production following last year\'s drought-affected harvest.',
    translatedContent: null,
    source: 'Ecofin Agency',
    sourceUrl: 'https://www.ecofinagency.com/news-agriculture/2801-52324-global-sugar-prices-drop-17-in-2025-downturn-expected-to-extend-into-2026',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 2,
    title: 'ISO Forecasts 1.6 Million MT Sugar Surplus for 2025-26 Season',
    originalLanguage: 'en',
    content:
      'The International Sugar Organization (ISO) has forecast a global sugar surplus of 1.625 million metric tons for the 2025-26 season, following a deficit of 2.916 million MT in 2024-25. The organization projects a 3.2% year-over-year rise in global sugar production to 181.8 million MT, driven by increased output in India, Thailand, and Pakistan.',
    translatedContent: null,
    source: 'ISO',
    sourceUrl: 'https://www.isosugar.org/',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 3,
    title: 'Czarnikow Raises Global Sugar Surplus Estimate to 8.7 MMT',
    originalLanguage: 'en',
    content:
      'Sugar trader Czarnikow has boosted its global 2025/26 sugar surplus estimate to 8.7 million metric tons, up 1.2 MMT from a September estimate of 7.5 MMT. The revision reflects stronger-than-expected harvests in key producing regions. The company notes that current price levels may not be sustainable for some high-cost producers.',
    translatedContent: null,
    source: 'Czarnikow',
    sourceUrl: 'https://www.czarnikow.com/',
    category: 'price_forecasts',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 4,
    title: 'USDA Sugar and Sweeteners Outlook: January 2026',
    originalLanguage: 'en',
    content:
      'The USDA Economic Research Service has released its January 2026 Sugar and Sweeteners Outlook, detailing changes in official 2024/25 and 2025/26 projections for U.S. and Mexico sugar supply and use. The report highlights increased domestic production and stable import levels, with prices expected to remain under pressure due to global oversupply.',
    translatedContent: null,
    source: 'USDA ERS',
    sourceUrl: 'https://www.ers.usda.gov/publications/pub-details?pubid=113694',
    category: 'policy_trade',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 5,
    title: 'Sugar Prices Slide on Abundant Global Supplies',
    originalLanguage: 'en',
    content:
      'Sugar prices have slumped to multi-year lows amid expectations of abundant global supplies in the 2025/26 marketing year. March sugar futures closed at 14.72 cents per pound, near the lowest levels since December 2023. Traders cite strong harvests in Brazil and recovering production in Asia as key factors pressuring prices.',
    translatedContent: null,
    source: 'Nasdaq',
    sourceUrl: 'https://www.nasdaq.com/articles/sugar-prices-slide-abundant-global-supplies',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 6,
    title: 'Brazil Sugar Production in 2026/27 to Fall 3.9% - Safras & Mercado',
    originalLanguage: 'en',
    content:
      'Brazilian consulting firm Safras & Mercado forecasts that Brazil\'s sugar production in 2026/27 will decline by 3.91% to 41.8 million metric tons from 43.5 MMT expected in 2025/26. The firm also projects Brazil\'s sugar exports in 2026/27 to fall by 11% year-over-year to 30 MMT, potentially providing some support to global prices.',
    translatedContent: null,
    source: 'Safras & Mercado',
    sourceUrl: 'https://www.safras.com.br/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 7,
    title: 'Sugar Surplus to Keep Prices Under Pressure Through 2026',
    originalLanguage: 'en',
    content:
      'ING analysts forecast that raw sugar No.11 will average 15.40 cents per pound in 2026, with the third quarter expected to be the weakest due to the peak of the Center-South Brazil harvest. The large surplus suggests that sugar prices will remain under pressure, with limited upside potential in the near term.',
    translatedContent: null,
    source: 'ING Think',
    sourceUrl: 'https://think.ing.com/articles/sugar-surplus-to-keep-prices-under-pressure/',
    category: 'price_forecasts',
    publishedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 8,
    title: 'Rabobank: Global Sugar Market to See 2.6 MMT Surplus',
    originalLanguage: 'en',
    content:
      'Rabobank projects the global sugar market will have a surplus of around 2.6 million metric tons in the 2025/26 marketing year, driven primarily by a recovery in India\'s production. The bank notes that while prices may find some support from currency movements, fundamental oversupply will cap any significant rallies.',
    translatedContent: null,
    source: 'Rabobank',
    sourceUrl: 'https://www.rabobank.com/',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 9,
    title: 'Thailand Sugar Exports Surge 25% as Production Recovers',
    originalLanguage: 'en',
    content:
      'Thailand\'s sugar exports have surged 25% year-over-year as the country\'s production recovers from previous drought conditions. The Thai Sugar Millers Corporation reports that the 2025/26 crushing season is progressing well, with total production expected to reach 10.5 million metric tons, up from 8.4 MMT last season.',
    translatedContent: null,
    source: 'Sugaronline',
    sourceUrl: 'https://www.sugaronline.com/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 10,
    title: 'S&P Global: Sugar Market Faces Structural Oversupply',
    originalLanguage: 'en',
    content:
      'S&P Global Commodity Insights reports that the sugar market faces structural oversupply conditions that could persist through 2027. Production efficiency improvements in major growing regions, combined with expanded acreage, have outpaced demand growth. The agency projects average prices of 14-16 cents per pound for the coming year.',
    translatedContent: null,
    source: 'S&P Global',
    sourceUrl: 'https://www.spglobal.com/commodityinsights/en/ci/products/sugar.html',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 11,
    title: 'India Lifts Sugar Export Ban, Markets React',
    originalLanguage: 'en',
    content:
      'The Indian government has lifted its sugar export ban effective immediately, allowing mills to export up to 2 million metric tons in the current season. The decision follows a strong monsoon that has boosted sugarcane yields. Market analysts expect this move to add further pressure to global sugar prices in the short term.',
    translatedContent: null,
    source: 'Reuters',
    sourceUrl: 'https://www.reuters.com/',
    category: 'policy_trade',
    publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 12,
    title: 'EU Sugar Beet Harvest Exceeds Expectations',
    originalLanguage: 'en',
    content:
      'The European Union\'s sugar beet harvest has exceeded initial expectations, with production estimated at 16.2 million metric tons of sugar equivalent, up 8% from last year. Favorable growing conditions across France, Germany, and Poland have contributed to higher yields, reducing the bloc\'s import requirements.',
    translatedContent: null,
    source: 'Agrimoney',
    sourceUrl: 'https://www.agrimoney.com/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 13,
    title: '中国糖业协会：2025/26榨季国内产量预计达1050万吨',
    originalLanguage: 'zh',
    content:
      '中国糖业协会今日发布最新预测，2025/26榨季国内食糖产量预计达到1050万吨，较上一榨季增长5%。广西、云南等主产区甘蔗种植面积稳中有增，单产水平持续提升。协会指出，尽管国内产量增加，但考虑到消费需求增长，进口需求仍将保持在较高水平。',
    translatedContent:
      '中国糖业协会今日发布最新预测，2025/26榨季国内食糖产量预计达到1050万吨，较上一榨季增长5%。广西、云南等主产区甘蔗种植面积稳中有增，单产水平持续提升。协会指出，尽管国内产量增加，但考虑到消费需求增长，进口需求仍将保持在较高水平。',
    source: 'SunSirs',
    sourceUrl: 'https://www.sunsirs.com/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 14,
    title: 'Will Sugar\'s Bearish Trend End in 2026?',
    originalLanguage: 'en',
    content:
      'March sugar futures closed 2025 at 15.01 cents per pound, marking a year of decline. Sugar futures prices declined throughout 2025 and remain near multi-year lows in early 2026. Technical analysts suggest the market may find support around 14.50 cents, but a sustained recovery would require significant supply disruptions or demand growth acceleration.',
    translatedContent: null,
    source: 'Barchart',
    sourceUrl: 'https://www.barchart.com/story/news/37197252/will-sugars-bearish-trend-end-in-2026',
    category: 'price_forecasts',
    publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 15,
    title: 'Cocoa, Coffee, Sugar: Is the Commodity Crisis Ending?',
    originalLanguage: 'en',
    content:
      'After years of volatile swings in soft commodities, analysts are questioning whether the crisis is finally ending. While cocoa and coffee prices remain elevated, sugar has entered a clear bear market. Key bodies such as the International Sugar Organization (ISO) and the Czarnikow Group predict that the sugar surplus will increase, with production outpacing consumption.',
    translatedContent: null,
    source: 'Food Navigator',
    sourceUrl: 'https://www.foodnavigator.com/Article/2025/12/10/cocoa-coffee-sugar-is-the-commodity-crisis-ending/',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 16,
    title: 'Sugar Prices Climb as Brazilian Real Rallies',
    originalLanguage: 'en',
    content:
      'Sugar prices found temporary support as the Brazilian real strengthened against the US dollar, making exports less attractive for Brazilian producers. The currency-driven rally lifted March futures by 2% in a single session, though analysts warn that fundamental oversupply conditions remain in place.',
    translatedContent: null,
    source: 'Nasdaq',
    sourceUrl: 'https://www.nasdaq.com/articles/sugar-prices-climb-brazilian-real-rallies',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 17,
    title: 'Kenya Takes Chair of ISO Council for 2026',
    originalLanguage: 'en',
    content:
      'Kenya will be occupying the Chair of the International Sugar Organization (ISO) Council for 2026. Mr. Jude K. Chesire, Chief Executive Officer of the Kenya Sugar Board, will preside over council meetings. Chesire brings two decades of legal, policy, and trade leadership experience in shaping Kenya\'s sugar industry.',
    translatedContent: null,
    source: 'ISO',
    sourceUrl: 'https://www.isosugar.org/',
    category: 'policy_trade',
    publishedAt: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 18,
    title: 'USDA Announces Fiscal Year 2026 Sugar Loan Rates',
    originalLanguage: 'en',
    content:
      'The USDA Farm Service Agency has announced fiscal year 2026 sugar loan rates and confirmed no actions under the Feedstock Flexibility Program. Raw cane sugar loan rates will remain at 20.75 cents per pound, while refined beet sugar rates are set at 26.59 cents per pound. The announcement provides stability for domestic producers amid weak global prices.',
    translatedContent: null,
    source: 'USDA FSA',
    sourceUrl: 'https://www.fsa.usda.gov/news-events/news/09-26-2025/usda-announces-fiscal-year-2026-sugar-loan-rates-no-actions-feedstock',
    category: 'policy_trade',
    publishedAt: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
  },
  {
    id: 19,
    title: '国际糖价持续走弱 国内市场承压',
    originalLanguage: 'zh',
    content:
      '受全球糖市供应过剩预期影响，国际原糖期货价格持续走弱，ICE原糖主力合约跌至14.72美分/磅附近。国内糖价也随之承压，郑糖主力合约回落至5800元/吨一线。分析人士指出，短期内糖价仍面临下行压力，但需关注巴西产区天气变化及印度出口政策调整带来的潜在风险。',
    translatedContent:
      '受全球糖市供应过剩预期影响，国际原糖期货价格持续走弱，ICE原糖主力合约跌至14.72美分/磅附近。国内糖价也随之承压，郑糖主力合约回落至5800元/吨一线。分析人士指出，短期内糖价仍面临下行压力，但需关注巴西产区天气变化及印度出口政策调整带来的潜在风险。',
    source: '中国商品网',
    sourceUrl: 'https://www.sunsirs.com/',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 20,
    title: 'Australian Sugar Exports Hit Record High',
    originalLanguage: 'en',
    content:
      'Australian sugar exports have reached a record high in the 2025 calendar year, with total shipments exceeding 4.2 million metric tons. Strong demand from Asian markets, particularly Indonesia and South Korea, has driven the increase. Queensland Sugar Limited reports that premiums for Australian raw sugar remain attractive despite weak benchmark prices.',
    translatedContent: null,
    source: 'Sugar Industry',
    sourceUrl: 'https://sugarindustry.info/news/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 64 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: false,
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
