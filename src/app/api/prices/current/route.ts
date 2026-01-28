import { NextResponse } from 'next/server';
import { getPriceWithFallback } from '@/lib/twelve-data';

export async function GET() {
  try {
    const priceData = await getPriceWithFallback();

    return NextResponse.json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    console.error('Error fetching current price:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch current price',
      },
      { status: 500 }
    );
  }
}
