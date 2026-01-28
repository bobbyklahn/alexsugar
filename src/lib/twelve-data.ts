import { TimeRange } from '@/types';

// Yahoo Finance Sugar Futures symbol
const SUGAR_SYMBOL = 'SB=F';
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

interface IntervalConfig {
  interval: string;
  range: string;
}

// Map time range to Yahoo Finance parameters
function getYahooConfig(range: TimeRange): IntervalConfig {
  switch (range) {
    case '1d':
      return { interval: '15m', range: '1d' };
    case '1w':
      return { interval: '1h', range: '5d' };
    case '1m':
      return { interval: '1d', range: '1mo' };
    case '3m':
      return { interval: '1d', range: '3mo' };
    case '1y':
      return { interval: '1d', range: '1y' };
    case '2y':
      return { interval: '1wk', range: '2y' };
    case '5y':
      return { interval: '1wk', range: '5y' };
    default:
      return { interval: '1d', range: '1y' };
  }
}

interface YahooQuote {
  high: number[];
  low: number[];
  open: number[];
  close: number[];
  volume: number[];
}

interface YahooMeta {
  regularMarketPrice: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketTime: number;
}

interface YahooResponse {
  chart: {
    result: Array<{
      meta: YahooMeta;
      timestamp: number[];
      indicators: {
        quote: YahooQuote[];
      };
    }>;
    error: null | { code: string; description: string };
  };
}

// Fetch current sugar price from Yahoo Finance
async function fetchYahooPrice(): Promise<{
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  timestamp: string;
} | null> {
  try {
    const response = await fetch(
      `${YAHOO_BASE_URL}/${SUGAR_SYMBOL}?interval=1d&range=2d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      console.error('Yahoo Finance API error:', response.status);
      return null;
    }

    const data: YahooResponse = await response.json();

    if (data.chart.error || !data.chart.result?.[0]) {
      console.error('Yahoo Finance API error:', data.chart.error);
      return null;
    }

    const result = data.chart.result[0];
    const meta = result.meta;

    // Price is in cents, convert to dollars per pound
    const currentPrice = meta.regularMarketPrice / 100;
    const previousClose = (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice) / 100;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      high: meta.regularMarketDayHigh / 100,
      low: meta.regularMarketDayLow / 100,
      timestamp: new Date(meta.regularMarketTime * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Yahoo Finance price:', error);
    return null;
  }
}

// Fetch historical prices from Yahoo Finance
async function fetchYahooHistory(range: TimeRange): Promise<Array<{
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}> | null> {
  try {
    const config = getYahooConfig(range);
    const response = await fetch(
      `${YAHOO_BASE_URL}/${SUGAR_SYMBOL}?interval=${config.interval}&range=${config.range}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error('Yahoo Finance API error:', response.status);
      return null;
    }

    const data: YahooResponse = await response.json();

    if (data.chart.error || !data.chart.result?.[0]) {
      console.error('Yahoo Finance API error:', data.chart.error);
      return null;
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];

    if (!timestamps || !quote) {
      return null;
    }

    // Convert to our format, prices are in cents so divide by 100
    return timestamps.map((ts, i) => ({
      timestamp: new Date(ts * 1000).toISOString(),
      open: (quote.open[i] || 0) / 100,
      high: (quote.high[i] || 0) / 100,
      low: (quote.low[i] || 0) / 100,
      close: (quote.close[i] || 0) / 100,
      volume: quote.volume[i],
    })).filter(d => d.close > 0); // Filter out invalid data points
  } catch (error) {
    console.error('Error fetching Yahoo Finance history:', error);
    return null;
  }
}

// Get real-time price with fallback to mock data
export async function getPriceWithFallback() {
  const realPrice = await fetchYahooPrice();

  if (realPrice) {
    return {
      price: parseFloat(realPrice.price.toFixed(4)),
      change24h: parseFloat(realPrice.change.toFixed(4)),
      changePercent24h: parseFloat(realPrice.changePercent.toFixed(2)),
      high24h: parseFloat(realPrice.high.toFixed(4)),
      low24h: parseFloat(realPrice.low.toFixed(4)),
      timestamp: realPrice.timestamp,
      source: 'yahoo_finance',
    };
  }

  // Fallback mock data if API fails
  const mockPrice = 0.1485 + (Math.random() - 0.5) * 0.01;
  const mockChange = (Math.random() - 0.5) * 0.005;
  const mockChangePercent = (mockChange / mockPrice) * 100;

  return {
    price: parseFloat(mockPrice.toFixed(4)),
    change24h: parseFloat(mockChange.toFixed(4)),
    changePercent24h: parseFloat(mockChangePercent.toFixed(2)),
    high24h: parseFloat((mockPrice + 0.003).toFixed(4)),
    low24h: parseFloat((mockPrice - 0.003).toFixed(4)),
    timestamp: new Date().toISOString(),
    source: 'mock',
  };
}

// Get historical data with fallback to mock data
export async function getHistoricalWithFallback(range: TimeRange) {
  const realData = await fetchYahooHistory(range);

  if (realData && realData.length > 0) {
    return {
      data: realData,
      range,
      interval: getYahooConfig(range).interval,
    };
  }

  // Generate mock historical data as fallback
  const config = getYahooConfig(range);
  const outputSize = range === '1d' ? 96 : range === '1w' ? 120 : range === '1m' ? 30 : range === '3m' ? 90 : range === '1y' ? 252 : range === '2y' ? 104 : 260;

  const mockData = [];
  let basePrice = 0.1485;
  const now = new Date();

  for (let i = outputSize - 1; i >= 0; i--) {
    const date = new Date(now);

    if (range === '1d') {
      date.setMinutes(date.getMinutes() - i * 15);
    } else if (range === '1w') {
      date.setHours(date.getHours() - i);
    } else if (['1m', '3m', '1y'].includes(range)) {
      date.setDate(date.getDate() - i);
    } else {
      date.setDate(date.getDate() - i * 7);
    }

    const change = (Math.random() - 0.5) * 0.005;
    basePrice = Math.max(0.10, Math.min(0.20, basePrice + change));

    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 0.003;
    const high = Math.max(open, close) + Math.random() * 0.002;
    const low = Math.min(open, close) - Math.random() * 0.002;

    mockData.push({
      timestamp: date.toISOString(),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
    });
  }

  return {
    data: mockData,
    range,
    interval: config.interval,
  };
}
