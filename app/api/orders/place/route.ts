import { NextRequest, NextResponse } from 'next/server';
import { placeOrder } from '@/lib/services/trades-manager';
import { createTrade } from '@/lib/services/trades-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symbol,
      quantity,
      price,
      orderType,
      transactionType,
      triggerPrice,
      signalId,
      strategyId,
    } = body;

    if (!symbol || !quantity || !orderType || !transactionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Place the actual order through Zerodha
    const result = await placeOrder(
      symbol,
      quantity,
      price,
      orderType,
      transactionType,
      triggerPrice
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Create trade record in database if signal was from app
    if (signalId && strategyId) {
      await createTrade(
        signalId,
        strategyId,
        symbol,
        price || 0,
        quantity,
        `Placed ${orderType} order via app`
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      message: `${transactionType} order placed successfully for ${quantity} shares of ${symbol}`,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
