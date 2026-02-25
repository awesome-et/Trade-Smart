import { NextRequest, NextResponse } from 'next/server';
import { getAccountSummary, getZerodhaPositions, getZerodhaHoldings } from '@/lib/services/trades-manager';

export async function GET(request: NextRequest) {
  try {
    const [account, positions, holdings] = await Promise.all([
      getAccountSummary(),
      getZerodhaPositions(),
      getZerodhaHoldings(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        account,
        positions,
        holdings,
      },
    });
  } catch (error) {
    console.error('Error fetching account info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch account information' },
      { status: 500 }
    );
  }
}
