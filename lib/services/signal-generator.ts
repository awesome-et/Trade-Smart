"use server";

import { createServerSideClient } from '@/lib/auth-server';
import { Signal, StrategyEvaluationResult } from '@/lib/types';

export async function generateSignals(
  strategyId: string,
  marketScanId: string,
  evaluationResults: StrategyEvaluationResult[]
): Promise<Signal[]> {
  const supabase = await createServerSideClient();

  try {
    const signals: Omit<Signal, 'id' | 'created_at'>[] = evaluationResults
      .filter((result) => result.signal_type !== null)
      .map((result) => ({
        strategy_id: strategyId,
        market_scan_id: marketScanId,
        symbol: result.symbol,
        signal_type: result.signal_type!,
        price: 0,
        signal_strength: result.signal_strength,
        timestamp: result.timestamp,
        indicators: result.indicators,
        status: 'active' as const,
      }));

    if (!signals.length) return [];

    const { data, error } = await supabase
      .from('signals')
      .insert(signals)
      .select();

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.error('Error generating signals:', error);
    throw error;
  }
}

export async function getActiveSignals(
  strategyId?: string
): Promise<Signal[]> {
  const supabase = await createServerSideClient();

  try {
    let query = supabase
      .from('signals')
      .select('*')
      .eq('status', 'active')
      .order('timestamp', { ascending: false });

    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.error('Error fetching active signals:', error);
    return [];
  }
}

export async function getSignalsBySymbol(
  symbol: string
): Promise<Signal[]> {
  const supabase = await createServerSideClient();

  try {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('symbol', symbol)
      .eq('status', 'active')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.error('Error fetching signals for symbol:', error);
    return [];
  }
}

export async function updateSignalStatus(
  signalId: string,
  status: 'active' | 'expired' | 'executed'
): Promise<boolean> {
  const supabase = await createServerSideClient();

  try {
    const { error } = await supabase
      .from('signals')
      .update({ status })
      .eq('id', signalId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating signal status:', error);
    return false;
  }
}

export async function expireOldSignals(
  hours: number = 24
): Promise<number> {
  const supabase = await createServerSideClient();

  try {
    const cutoffTime = new Date(
      Date.now() - hours * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from('signals')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('timestamp', cutoffTime)
      .select('id');

    if (error) throw error;

    return data?.length ?? 0;
  } catch (error) {
    console.error('Error expiring old signals:', error);
    return 0;
  }
}
