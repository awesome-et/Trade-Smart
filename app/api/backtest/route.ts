import { NextRequest, NextResponse } from 'next/server';
import { runBacktest, getBacktestResults, deleteBacktestResult } from '@/lib/services/backtest-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategy_id, start_date, end_date, initial_capital } = body;

    if (!strategy_id || !start_date || !end_date || !initial_capital) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await runBacktest({
      strategy_id,
      start_date,
      end_date,
      initial_capital,
    });

    if (!result) {
      throw new Error('Failed to run backtest');
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error running backtest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run backtest' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const strategyId = searchParams.get('strategy_id');

    if (!strategyId) {
      return NextResponse.json(
        { success: false, error: 'Strategy ID is required' },
        { status: 400 }
      );
    }

    const results = await getBacktestResults(strategyId);
    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching backtest results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch backtest results' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resultId = searchParams.get('id');

    if (!resultId) {
      return NextResponse.json(
        { success: false, error: 'Result ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteBacktestResult(resultId);
    if (!success) {
      throw new Error('Failed to delete backtest result');
    }

    return NextResponse.json({
      success: true,
      message: 'Backtest result deleted',
    });
  } catch (error) {
    console.error('Error deleting backtest result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete backtest result' },
      { status: 500 }
    );
  }
}
