import { NextRequest, NextResponse } from 'next/server';
import { createAlert, getAllAlerts, updateAlert, deleteAlert } from '@/lib/db';
import { CreateAlertRequest, AlertType } from '@/types';

// GET - List all alerts
export async function GET() {
  try {
    const result = await getAllAlerts();

    const alerts = result.rows.map((row) => ({
      id: row.id,
      alertType: row.alert_type as AlertType,
      threshold: parseFloat(row.threshold),
      isActive: row.is_active,
      lastTriggered: row.last_triggered,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);

    // Return empty array if database is not configured yet
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

// POST - Create new alert
export async function POST(request: NextRequest) {
  try {
    const body: CreateAlertRequest = await request.json();

    // Validate alert type
    const validTypes: AlertType[] = [
      'above',
      'below',
      'change_above',
      'change_below',
      'ma_cross_above',
      'ma_cross_below',
    ];

    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid alert type',
        },
        { status: 400 }
      );
    }

    if (typeof body.threshold !== 'number' || body.threshold <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid threshold value',
        },
        { status: 400 }
      );
    }

    const result = await createAlert(body.type, body.threshold);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create alert',
      },
      { status: 500 }
    );
  }
}

// PUT - Update alert
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid alert ID',
        },
        { status: 400 }
      );
    }

    const result = await updateAlert(id, { isActive });

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update alert',
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid alert ID',
        },
        { status: 400 }
      );
    }

    const result = await deleteAlert(id);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete alert',
      },
      { status: 500 }
    );
  }
}
