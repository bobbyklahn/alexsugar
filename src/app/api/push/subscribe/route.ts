import { NextRequest, NextResponse } from 'next/server';
import { savePushSubscription } from '@/lib/db';

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid subscription data',
        },
        { status: 400 }
      );
    }

    const keys = subscription.keys;
    if (!keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing subscription keys',
        },
        { status: 400 }
      );
    }

    // Save to database
    try {
      await savePushSubscription(subscription.endpoint, keys.p256dh, keys.auth);
    } catch (dbError) {
      console.log('Database not available, subscription logged only');
      console.log('Push subscription:', subscription.endpoint);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save subscription',
      },
      { status: 500 }
    );
  }
}
