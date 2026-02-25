import { NextRequest, NextResponse } from 'next/server';
import {
  createTrade,
  closeTrade,
  getTrade,
  getOpenTrades,
  getClosedTrades,
  getAllTrades,
  getTradesBySymbol,
  calculatePortfolioStats,
} from '@/lib/services/trades-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tradeId = searchParams.get('id');
    const symbol = searchParams.get('symbol');
    const strategyId = searchParams.get('strategy_id');
    const status = searchParams.get('status');
    const stats = searchParams.get('stats') === 'true';

    if (tradeId) {
      const trade = await getTrade(tradeId);
      if (!trade) {
        return NextResponse.json(
          { success: false, error: 'Trade not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: trade });
    }

    if (stats) {
      const portfolioStats = await calculatePortfolioStats(strategyId || undefined);
      return NextResponse.json({ success: true, data: portfolioStats });
    }

    let trades;
    if (symbol) {
      trades = await getTradesBySymbol(symbol);
    } else if (status === 'open') {
      trades = await getOpenTrades(strategyId || undefined);
    } else if (status === 'closed') {
      trades = await getClosedTrades(strategyId || undefined);
    } else {
      trades = await getAllTrades(strategyId || undefined);
    }

    return NextResponse.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signal_id, strategy_id, symbol, entry_price, quantity, notes } = body;

    if (!signal_id || !strategy_id || !symbol || !entry_price || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const trade = await createTrade(signal_id, strategy_id, symbol, entry_price, quantity, notes);

    if (!trade) {
      throw new Error('Failed to create trade');
    }

    return NextResponse.json(
      { success: true, data: trade },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { trade_id, exit_price } = body;

    if (!trade_id || exit_price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const trade = await closeTrade(trade_id, exit_price);

    if (!trade) {
      throw new Error('Failed to close trade');
    }

    return NextResponse.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error('Error closing trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to close trade' },
      { status: 500 }
    );
  }
}
