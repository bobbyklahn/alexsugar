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
  // Chinese news sources
  {
    id: 21,
    title: '广西糖网：南宁白糖现货报价5247元/吨',
    originalLanguage: 'zh',
    content:
      '据广西糖网最新报价，今日南宁白糖现货报价5247元/吨，较昨日持平。柳州报价5253元/吨，昆明报价5360元/吨。市场人士表示，目前新榨季正在推进中，广西已有多家糖厂开榨，预计本月底前全区糖厂将全面开榨。现货市场交投清淡，下游企业多以按需采购为主。',
    translatedContent:
      '据广西糖网最新报价，今日南宁白糖现货报价5247元/吨，较昨日持平。柳州报价5253元/吨，昆明报价5360元/吨。市场人士表示，目前新榨季正在推进中，广西已有多家糖厂开榨，预计本月底前全区糖厂将全面开榨。现货市场交投清淡，下游企业多以按需采购为主。',
    source: '广西糖网',
    sourceUrl: 'http://www.msweet.com.cn/',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 22,
    title: '云南糖网：2025/26榨季云南甘蔗收购价格政策出台',
    originalLanguage: 'zh',
    content:
      '云南糖网消息，2025/26榨季云南省甘蔗收购价格政策已正式出台。普通甘蔗收购价格为520元/吨，优良品种甘蔗收购价格为540元/吨。与上榨季相比，收购价格保持稳定。云南省糖业协会表示，稳定的收购价格有利于保护蔗农利益，促进糖业可持续发展。目前全省各糖厂正在积极做好开榨前准备工作。',
    translatedContent:
      '云南糖网消息，2025/26榨季云南省甘蔗收购价格政策已正式出台。普通甘蔗收购价格为520元/吨，优良品种甘蔗收购价格为540元/吨。与上榨季相比，收购价格保持稳定。云南省糖业协会表示，稳定的收购价格有利于保护蔗农利益，促进糖业可持续发展。目前全省各糖厂正在积极做好开榨前准备工作。',
    source: '云南糖网',
    sourceUrl: 'http://www.yntw.com/',
    category: 'policy_trade',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 23,
    title: '卓创资讯：郑糖期货震荡下行 短期承压明显',
    originalLanguage: 'zh',
    content:
      '卓创资讯分析指出，郑州商品交易所白糖期货主力合约今日震荡下行，收盘报5172元/吨，跌幅0.46%。技术面上，郑糖期货价格跌破5200元/吨关键支撑位，短期内或将继续承压。基本面方面，国际糖价持续走弱对国内市场形成压制，同时新榨季国内产量预期增加，供应压力逐渐显现。建议投资者保持观望，关注5100元/吨一线支撑情况。',
    translatedContent:
      '卓创资讯分析指出，郑州商品交易所白糖期货主力合约今日震荡下行，收盘报5172元/吨，跌幅0.46%。技术面上，郑糖期货价格跌破5200元/吨关键支撑位，短期内或将继续承压。基本面方面，国际糖价持续走弱对国内市场形成压制，同时新榨季国内产量预期增加，供应压力逐渐显现。建议投资者保持观望，关注5100元/吨一线支撑情况。',
    source: '卓创资讯',
    sourceUrl: 'https://www.sci99.com/',
    category: 'price_forecasts',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 24,
    title: '泛糖科技：全国食糖产销数据月报（2026年1月）',
    originalLanguage: 'zh',
    content:
      '泛糖科技发布2026年1月全国食糖产销数据月报。截至1月中旬，本榨季全国累计产糖425万吨，同比增加12%。其中广西产糖310万吨，云南产糖85万吨，广东产糖18万吨，海南产糖12万吨。销糖方面，累计销糖180万吨，产销率42.4%，同比下降5个百分点。库存压力有所增加，预计后期现货价格仍面临下行压力。',
    translatedContent:
      '泛糖科技发布2026年1月全国食糖产销数据月报。截至1月中旬，本榨季全国累计产糖425万吨，同比增加12%。其中广西产糖310万吨，云南产糖85万吨，广东产糖18万吨，海南产糖12万吨。销糖方面，累计销糖180万吨，产销率42.4%，同比下降5个百分点。库存压力有所增加，预计后期现货价格仍面临下行压力。',
    source: '泛糖科技',
    sourceUrl: 'https://www.hisugar.com/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 25,
    title: '新浪财经：2026年白糖期货投资策略展望',
    originalLanguage: 'zh',
    content:
      '新浪财经期货频道报道，多家期货公司发布2026年白糖期货投资策略。整体来看，机构对2026年糖价走势持谨慎态度。从供需格局看，全球糖市供应充裕，预计2025/26榨季全球糖市过剩超过800万吨。国内方面，新榨季产量预计达到1050万吨左右，进口糖到港成本优势明显，将对国内糖价形成持续压制。机构建议关注逢高做空机会，目标位看至5000元/吨一线。',
    translatedContent:
      '新浪财经期货频道报道，多家期货公司发布2026年白糖期货投资策略。整体来看，机构对2026年糖价走势持谨慎态度。从供需格局看，全球糖市供应充裕，预计2025/26榨季全球糖市过剩超过800万吨。国内方面，新榨季产量预计达到1050万吨左右，进口糖到港成本优势明显，将对国内糖价形成持续压制。机构建议关注逢高做空机会，目标位看至5000元/吨一线。',
    source: '新浪财经',
    sourceUrl: 'https://finance.sina.com.cn/futures/',
    category: 'price_forecasts',
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 26,
    title: '东方财富网：白糖期货主力合约持仓分析',
    originalLanguage: 'zh',
    content:
      '东方财富期货数据显示，郑糖主力合约SR2503今日持仓量为62.8万手，较上一交易日减少1.2万手。前20名多头持仓合计28.5万手，空头持仓合计31.2万手，净空持仓2.7万手。从持仓变化来看，主力空头增仓明显，显示机构对后市看法偏空。技术分析人士指出，郑糖期货价格若有效跌破5100元/吨，或将进一步下探5000元/吨整数关口。',
    translatedContent:
      '东方财富期货数据显示，郑糖主力合约SR2503今日持仓量为62.8万手，较上一交易日减少1.2万手。前20名多头持仓合计28.5万手，空头持仓合计31.2万手，净空持仓2.7万手。从持仓变化来看，主力空头增仓明显，显示机构对后市看法偏空。技术分析人士指出，郑糖期货价格若有效跌破5100元/吨，或将进一步下探5000元/吨整数关口。',
    source: '东方财富网',
    sourceUrl: 'https://futures.eastmoney.com/',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 27,
    title: '糖网：广西2025/26榨季开榨进度追踪',
    originalLanguage: 'zh',
    content:
      '糖网报道，截至1月28日，广西全区已有89家糖厂开榨，较去年同期增加3家。入榨甘蔗量累计达到4200万吨，产糖量累计约480万吨。各糖厂生产运行平稳，甘蔗糖分普遍在12%-13%之间，略高于往年同期水平。预计2月上旬广西将迎来压榨高峰期，届时日均产糖量有望突破15万吨。',
    translatedContent:
      '糖网报道，截至1月28日，广西全区已有89家糖厂开榨，较去年同期增加3家。入榨甘蔗量累计达到4200万吨，产糖量累计约480万吨。各糖厂生产运行平稳，甘蔗糖分普遍在12%-13%之间，略高于往年同期水平。预计2月上旬广西将迎来压榨高峰期，届时日均产糖量有望突破15万吨。',
    source: '糖网',
    sourceUrl: 'http://www.yntw.com/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 28,
    title: '中国食品土畜进出口商会：2025年食糖进口分析',
    originalLanguage: 'zh',
    content:
      '中国食品土畜进出口商会发布2025年食糖进口数据分析报告。2025年全年，中国累计进口食糖约580万吨，同比增长15%。进口来源国中，巴西占比最高达68%，其次是泰国18%、古巴8%、澳大利亚6%。从月度数据看，下半年进口量明显增加，主要原因是国际糖价持续下跌，进口利润窗口打开。商会预计2026年食糖进口量将维持在较高水平。',
    translatedContent:
      '中国食品土畜进出口商会发布2025年食糖进口数据分析报告。2025年全年，中国累计进口食糖约580万吨，同比增长15%。进口来源国中，巴西占比最高达68%，其次是泰国18%、古巴8%、澳大利亚6%。从月度数据看，下半年进口量明显增加，主要原因是国际糖价持续下跌，进口利润窗口打开。商会预计2026年食糖进口量将维持在较高水平。',
    source: '中国食品土畜进出口商会',
    sourceUrl: 'http://www.cccfna.org.cn/',
    category: 'policy_trade',
    publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 29,
    title: '广西糖网：崇左蔗区甘蔗收购工作有序推进',
    originalLanguage: 'zh',
    content:
      '广西糖网崇左讯，崇左市作为广西最大的甘蔗主产区，2025/26榨季甘蔗收购工作正在有序推进。全市预计甘蔗种植面积430万亩，总产量约2200万吨，占全广西甘蔗产量的三分之一。目前蔗农砍收积极性较高，各糖厂采取多种措施保障甘蔗及时入榨，减少糖分损失。预计本榨季崇左市产糖量将达到230万吨以上。',
    translatedContent:
      '广西糖网崇左讯，崇左市作为广西最大的甘蔗主产区，2025/26榨季甘蔗收购工作正在有序推进。全市预计甘蔗种植面积430万亩，总产量约2200万吨，占全广西甘蔗产量的三分之一。目前蔗农砍收积极性较高，各糖厂采取多种措施保障甘蔗及时入榨，减少糖分损失。预计本榨季崇左市产糖量将达到230万吨以上。',
    source: '广西糖网',
    sourceUrl: 'http://www.msweet.com.cn/',
    category: 'production_supply',
    publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    imageUrl: null,
    isTranslated: true,
  },
  {
    id: 30,
    title: '卓创资讯：国内外糖价价差分析与套利机会',
    originalLanguage: 'zh',
    content:
      '卓创资讯分析报告指出，当前国内外糖价价差处于历史较高水平。以配额外进口糖完税成本计算，巴西原糖到港成本约4800元/吨，而国内现货价格在5200元/吨以上，存在约400元/吨的利润空间。但考虑到配额限制和关税政策，实际套利操作空间有限。分析师建议关注内外盘价差变化，把握跨市场套利机会。同时提醒投资者注意汇率波动风险。',
    translatedContent:
      '卓创资讯分析报告指出，当前国内外糖价价差处于历史较高水平。以配额外进口糖完税成本计算，巴西原糖到港成本约4800元/吨，而国内现货价格在5200元/吨以上，存在约400元/吨的利润空间。但考虑到配额限制和关税政策，实际套利操作空间有限。分析师建议关注内外盘价差变化，把握跨市场套利机会。同时提醒投资者注意汇率波动风险。',
    source: '卓创资讯',
    sourceUrl: 'https://www.sci99.com/',
    category: 'market_analysis',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
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
