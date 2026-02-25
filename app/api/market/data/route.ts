import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketData, calculateTechnicalIndicators, getStockList } from '@/lib/services/market-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbols = searchParams.get('symbols')?.split(',') || getStockList();

    const quotes = await fetchMarketData(symbols);
    const marketData = calculateTechnicalIndicators(quotes);

    return NextResponse.json({
      success: true,
      data: marketData,
      count: marketData.length,
    });
  } catch (error) {
    console.error('Error in market data API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
