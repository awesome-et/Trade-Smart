import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchMarketData, calculateTechnicalIndicators, getStockList } from '@/lib/services/market-data';
import { evaluateStrategy } from '@/lib/services/strategy-evaluator';
import { generateSignals } from '@/lib/services/signal-generator';
import { getStrategy } from '@/lib/services/strategy-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategy_id } = body;

    if (!strategy_id) {
      return NextResponse.json(
        { success: false, error: 'Strategy ID is required' },
        { status: 400 }
      );
    }

    const strategy = await getStrategy(strategy_id);
    if (!strategy) {
      return NextResponse.json(
        { success: false, error: 'Strategy not found' },
        { status: 404 }
      );
    }

    const startTime = Date.now();

    // Fetch market data
    const symbols = getStockList();
    const quotes = await fetchMarketData(symbols);
    const marketData = calculateTechnicalIndicators(quotes);

    // Create market scan record
    const { data: scanData, error: scanError } = await supabase
      .from('market_scans')
      .insert([
        {
          strategy_id,
          scan_timestamp: new Date().toISOString(),
          stocks_scanned: symbols.length,
          status: 'running',
        },
      ])
      .select()
      .single();

    if (scanError) throw scanError;

    try {
      // Evaluate strategy
      const evaluationResults = await evaluateStrategy(strategy, marketData);

      // Generate signals
      const signals = await generateSignals(strategy_id, scanData.id, evaluationResults);

      // Update market scan with results
      const executionTime = Date.now() - startTime;
      const { error: updateError } = await supabase
        .from('market_scans')
        .update({
          status: 'completed',
          signals_generated: signals.length,
          execution_time_ms: executionTime,
        })
        .eq('id', scanData.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: {
          scan_id: scanData.id,
          signals_count: signals.length,
          execution_time_ms: executionTime,
          signals,
        },
      });
    } catch (error) {
      // Update market scan as failed
      await supabase
        .from('market_scans')
        .update({
          status: 'failed',
          error_message: String(error),
        })
        .eq('id', scanData.id);

      throw error;
    }
  } catch (error) {
    console.error('Error in market scan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute market scan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const strategyId = searchParams.get('strategy_id');

    let query = supabase
      .from('market_scans')
      .select('*')
      .order('scan_timestamp', { ascending: false })
      .limit(10);

    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching market scans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market scans' },
      { status: 500 }
    );
  }
}
