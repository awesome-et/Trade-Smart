import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '@/lib/auth-server';
import { getActiveSignals, getSignalsBySymbol, updateSignalStatus, expireOldSignals } from '@/lib/services/signal-generator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const strategyId = searchParams.get('strategy_id');

    if (symbol) {
      const signals = await getSignalsBySymbol(symbol);
      return NextResponse.json({
        success: true,
        data: signals,
        count: signals.length,
      });
    }

    const signals = await getActiveSignals(strategyId || undefined);
    return NextResponse.json({
      success: true,
      data: signals,
      count: signals.length,
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSideClient();

  try {
    const body = await request.json();
    const { signal_id, status } = body;

    if (!signal_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const success = await updateSignalStatus(signal_id, status);
    if (!success) {
      throw new Error('Failed to update signal');
    }

    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', signal_id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error updating signal:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to update signal' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'expire-old') {
      const hours = parseInt(searchParams.get('hours') || '24');
      const count = await expireOldSignals(hours);
      return NextResponse.json({
        success: true,
        message: `Expired ${count} old signals`,
        count,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in signals action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
