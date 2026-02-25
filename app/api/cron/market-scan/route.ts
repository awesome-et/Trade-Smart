import { NextRequest, NextResponse } from 'next/server';
import { getActiveStrategies } from '@/lib/services/strategy-manager';
import { fetchMarketData, calculateTechnicalIndicators, getStockList } from '@/lib/services/market-data';
import { evaluateStrategy } from '@/lib/services/strategy-evaluator';
import { generateSignals, expireOldSignals } from '@/lib/services/signal-generator';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60; // 60 seconds max for cron

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (optional security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[v0] Starting market scan cron job');
    const startTime = Date.now();

    // Get all active strategies
    const strategies = await getActiveStrategies();
    console.log(`[v0] Found ${strategies.length} active strategies`);

    if (strategies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active strategies to scan',
      });
    }

    // Fetch market data once
    const symbols = getStockList();
    const quotes = await fetchMarketData(symbols);
    const marketData = calculateTechnicalIndicators(quotes);
    console.log(`[v0] Fetched market data for ${symbols.length} symbols`);

    let totalSignalsGenerated = 0;
    const scans = [];

    // Run scan for each strategy
    for (const strategy of strategies) {
      try {
        const scanStartTime = Date.now();

        // Create market scan record
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

        // Evaluate strategy
        const evaluationResults = await evaluateStrategy(strategy, marketData);

        // Generate signals
        const signals = await generateSignals(strategy.id, scanData.id, evaluationResults);
        totalSignalsGenerated += signals.length;

        // Update market scan with results
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

        console.log(`[v0] Strategy ${strategy.name}: ${signals.length} signals generated`);
      } catch (error) {
        console.error(`[v0] Error scanning strategy ${strategy.id}:`, error);
        // Continue with next strategy
      }
    }

    // Expire old signals
    const expiredCount = await expireOldSignals(24);
    console.log(`[v0] Expired ${expiredCount} old signals`);

    const totalTime = Date.now() - startTime;
    console.log(`[v0] Cron job completed in ${totalTime}ms`);

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
    console.error('[v0] Error in market scan cron:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cron job failed',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
