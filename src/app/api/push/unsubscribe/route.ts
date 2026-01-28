import { NextRequest, NextResponse } from 'next/server';
import { deletePushSubscription } from '@/lib/db';

// POST - Unsubscribe from push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing endpoint',
        },
        { status: 400 }
      );
    }

    // Delete from database
    try {
      await deletePushSubscription(endpoint);
    } catch (dbError) {
      console.log('Database not available');
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully',
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unsubscribe',
      },
      { status: 500 }
    );
  }
}
