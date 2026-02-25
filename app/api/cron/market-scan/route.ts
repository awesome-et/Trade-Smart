import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '@/lib/auth-server';
import { getActiveStrategies } from '@/lib/services/strategy-manager';
import { fetchMarketData, calculateTechnicalIndicators, getStockList } from '@/lib/services/market-data';
import { evaluateStrategy } from '@/lib/services/strategy-evaluator';
import { generateSignals, expireOldSignals } from '@/lib/services/signal-generator';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const supabase = await createServerSideClient();

  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[v0] Starting market scan cron job');
    const startTime = Date.now();

    const strategies = await getActiveStrategies();

    if (strategies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active strategies to scan',
      });
    }

    const symbols = getStockList();
    const quotes = await fetchMarketData(symbols);
    const marketData = calculateTechnicalIndicators(quotes);

    let totalSignalsGenerated = 0;
    const scans = [];

    for (const strategy of strategies) {
      try {
        const scanStartTime = Date.now();

        const { data: scanData, error: scanError } = await supabase
          .from('market_scans')
          .insert([
            {
              strategy_id: strategy.id,
              scan_timestamp: new Date().toISOString(),
              stocks_scanned: symbols.length,
              status: 'running',
            },
          ])
          .select()
          .single();

        if (scanError) throw scanError;

        const evaluationResults = await evaluateStrategy(strategy, marketData);
        const signals = await generateSignals(strategy.id, scanData.id, evaluationResults);

        totalSignalsGenerated += signals.length;

        const executionTime = Date.now() - scanStartTime;

        await supabase
          .from('market_scans')
          .update({
            status: 'completed',
            signals_generated: signals.length,
            execution_time_ms: executionTime,
          })
          .eq('id', scanData.id);

        scans.push({
          strategy_id: strategy.id,
          signals: signals.length,
          execution_time_ms: executionTime,
        });

      } catch (error) {
        console.error(`Error scanning strategy ${strategy.id}:`, error);
      }
    }

    const expiredCount = await expireOldSignals(24);
    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        strategies_scanned: strategies.length,
        scans,
        total_signals_generated: totalSignalsGenerated,
        signals_expired: expiredCount,
        execution_time_ms: totalTime,
      },
    });

  } catch (error) {
    console.error('Error in market scan cron:', error);

    return NextResponse.json(
      { success: false, error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}
