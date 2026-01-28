import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalWithFallback } from '@/lib/twelve-data';
import { TimeRange } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '2y') as TimeRange;

    // Validate range parameter
    const validRanges: TimeRange[] = ['1d', '1w', '1m', '3m', '1y', '2y', '5y'];
    if (!validRanges.includes(range)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid range parameter. Valid values: 1d, 1w, 1m, 3m, 1y, 2y, 5y',
        },
        { status: 400 }
      );
    }

    const historyData = await getHistoricalWithFallback(range);

    return NextResponse.json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price history',
      },
      { status: 500 }
    );
  }
}
