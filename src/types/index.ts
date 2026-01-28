// Price data types
export interface PriceData {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: string;
  source: string;
}

export interface HistoricalPrice {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PriceHistoryResponse {
  data: HistoricalPrice[];
  range: TimeRange;
  interval: string;
}

export type TimeRange = '1d' | '1w' | '1m' | '3m' | '1y' | '2y' | '5y';

// Alert types
export type AlertType =
  | 'above'
  | 'below'
  | 'change_above'
  | 'change_below'
  | 'ma_cross_above'
  | 'ma_cross_below';

export interface PriceAlert {
  id: number;
  alertType: AlertType;
  threshold: number;
  isActive: boolean;
  lastTriggered: string | null;
  createdAt: string;
}

export interface CreateAlertRequest {
  type: AlertType;
  threshold: number;
}

// News types
export type NewsCategory =
  | 'all'
  | 'market_analysis'
  | 'production_supply'
  | 'policy_trade'
  | 'price_forecasts';

export interface NewsArticle {
  id: number;
  title: string;
  originalLanguage: string;
  content: string | null;
  translatedContent: string | null;
  source: string;
  sourceUrl: string;
  category: NewsCategory;
  publishedAt: string;
  imageUrl: string | null;
  isTranslated: boolean;
}

export interface NewsResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}

// Push subscription types
export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Twelve Data API response types
export interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
  volume?: string;
}

export interface TwelveDataTimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    type: string;
  };
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
  status: string;
}
