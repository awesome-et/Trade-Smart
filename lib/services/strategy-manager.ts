import { supabase } from '@/lib/supabase';
import { Strategy, StrategyStatistics } from '@/lib/types';

export async function getAllStrategies(): Promise<Strategy[]> {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return [];
  }
}

export async function getActiveStrategies(): Promise<Strategy[]> {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active strategies:', error);
    return [];
  }
}

export async function getStrategy(id: string): Promise<Strategy | null> {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return null;
  }
}

export async function createStrategy(
  name: string,
  description: string,
  strategyType: string,
  parameters: Record<string, unknown>
): Promise<Strategy | null> {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .insert([
        {
          name,
          description,
          strategy_type: strategyType,
          status: 'active',
          parameters,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating strategy:', error);
    return null;
  }
}

export async function updateStrategy(
  id: string,
  updates: Partial<Strategy>
): Promise<Strategy | null> {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating strategy:', error);
    return null;
  }
}

export async function deleteStrategy(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return false;
  }
}

export async function getStrategyStatistics(
  strategyId: string
): Promise<StrategyStatistics | null> {
  try {
    const { data, error } = await supabase
      .from('strategy_statistics')
      .select('*')
      .eq('strategy_id', strategyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching strategy statistics:', error);
    return null;
  }
}

export async function updateStrategyStatistics(
  strategyId: string,
  stats: Partial<StrategyStatistics>
): Promise<boolean> {
  try {
    const existing = await getStrategyStatistics(strategyId);

    if (existing) {
      const { error } = await supabase
        .from('strategy_statistics')
        .update(stats)
        .eq('strategy_id', strategyId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('strategy_statistics')
        .insert([{ ...stats, strategy_id: strategyId }]);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating strategy statistics:', error);
    return false;
  }
}
