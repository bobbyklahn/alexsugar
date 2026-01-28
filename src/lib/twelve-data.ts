import { TwelveDataQuote, TwelveDataTimeSeries, TimeRange } from '@/types';

const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Sugar futures symbol - using SUGAR commodity
const SUGAR_SYMBOL = 'SUGAR';

interface IntervalConfig {
  interval: string;
  outputSize: number;
}

// Map time range to API interval and output size
function getIntervalConfig(range: TimeRange): IntervalConfig {
  switch (range) {
    case '1d':
      return { interval: '15min', outputSize: 96 }; // 24 hours of 15-min data
    case '1w':
      return { interval: '1h', outputSize: 168 }; // 7 days of hourly data
    case '1m':
      return { interval: '1day', outputSize: 30 };
    case '3m':
      return { interval: '1day', outputSize: 90 };
    case '1y':
      return { interval: '1day', outputSize: 365 };
    case '2y':
      return { interval: '1week', outputSize: 104 };
    case '5y':
      return { interval: '1week', outputSize: 260 };
    default:
      return { interval: '1day', outputSize: 365 };
  }
}

// Fetch current sugar price quote
export async function getCurrentPrice(): Promise<TwelveDataQuote | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${SUGAR_SYMBOL}&apikey=${API_KEY}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      console.error('Twelve Data API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.code) {
      // API error response
      console.error('Twelve Data API error:', data.message);
      return null;
    }

    return data as TwelveDataQuote;
  } catch (error) {
    console.error('Error fetching current price:', error);
    return null;
  }
}

// Fetch historical price data
export async function getHistoricalPrices(
  range: TimeRange
): Promise<TwelveDataTimeSeries | null> {
  try {
    const { interval, outputSize } = getIntervalConfig(range);

    const response = await fetch(
      `${BASE_URL}/time_series?symbol=${SUGAR_SYMBOL}&interval=${interval}&outputsize=${outputSize}&apikey=${API_KEY}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      console.error('Twelve Data API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.code) {
      // API error response
      console.error('Twelve Data API error:', data.message);
      return null;
    }

    return data as TwelveDataTimeSeries;
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return null;
  }
}

// Get real-time price with fallback to mock data for development
export async function getPriceWithFallback() {
  const realPrice = await getCurrentPrice();

  if (realPrice) {
    return {
      price: parseFloat(realPrice.close),
      change24h: parseFloat(realPrice.change),
      changePercent24h: parseFloat(realPrice.percent_change),
      high24h: parseFloat(realPrice.high),
      low24h: parseFloat(realPrice.low),
      timestamp: realPrice.datetime,
      source: 'twelve_data',
    };
  }

  // Fallback mock data for development/demo
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
  const realData = await getHistoricalPrices(range);

  if (realData && realData.values) {
    return {
      data: realData.values.map((v) => ({
        timestamp: v.datetime,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: v.volume ? parseInt(v.volume) : undefined,
      })),
      range,
      interval: realData.meta.interval,
    };
  }

  // Generate mock historical data
  const { outputSize } = getIntervalConfig(range);
  const mockData = [];
  let basePrice = 0.1485;
  const now = new Date();

  for (let i = outputSize - 1; i >= 0; i--) {
    const date = new Date(now);

    // Adjust date based on range
    if (range === '1d') {
      date.setMinutes(date.getMinutes() - i * 15);
    } else if (range === '1w') {
      date.setHours(date.getHours() - i);
    } else if (['1m', '3m', '1y'].includes(range)) {
      date.setDate(date.getDate() - i);
    } else {
      date.setDate(date.getDate() - i * 7);
    }

    // Random walk for price
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
    interval: getIntervalConfig(range).interval,
  };
}
