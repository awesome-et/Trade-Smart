import { supabase } from '@/lib/supabase';
import { Trade } from '@/lib/types';
import KiteConnect from './zerodha-kiteconnect';
import { getUserPreferences } from './market-data';

export async function createTrade(
  signalId: string,
  strategyId: string,
  symbol: string,
  entryPrice: number,
  quantity: number,
  notes?: string
): Promise<Trade | null> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .insert([
        {
          signal_id: signalId,
          strategy_id: strategyId,
          symbol,
          entry_price: entryPrice,
          quantity,
          entry_timestamp: new Date().toISOString(),
          status: 'open',
          notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating trade:', error);
    return null;
  }
}

/**
 * Place an actual order through Zerodha KiteConnect
 */
export async function placeOrder(
  symbol: string,
  quantity: number,
  price: number | undefined,
  orderType: 'MARKET' | 'LIMIT' | 'STOPMARKET' | 'STOPLIMIT',
  transactionType: 'BUY' | 'SELL',
  triggerPrice?: number
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const prefs = await getUserPreferences();

    if (!prefs?.zerodha_api_key || !prefs?.zerodha_access_token) {
      return {
        success: false,
        error: 'Zerodha credentials not configured. Please configure in settings.',
      };
    }

    const kite = new KiteConnect({
      api_key: prefs.zerodha_api_key,
      api_secret: '',
      access_token: prefs.zerodha_access_token,
      user_id: prefs.zerodha_user_id || '',
    });

    const order = await kite.placeOrder({
      tradingsymbol: symbol,
      exchange: 'NSE',
      transaction_type: transactionType,
      order_type: orderType,
      quantity,
      price: orderType === 'LIMIT' ? price : undefined,
      trigger_price: orderType === 'STOPLIMIT' || orderType === 'STOPMARKET' ? triggerPrice : undefined,
      product: 'MIS',
      variety: 'regular',
      validity: 'DAY',
    });

    return {
      success: true,
      orderId: order.order_id,
    };
  } catch (error) {
    console.error('Error placing order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place order',
    };
  }
}

/**
 * Get current Zerodha positions
 */
export async function getZerodhaPositions(): Promise<any[]> {
  try {
    const prefs = await getUserPreferences();

    if (!prefs?.zerodha_api_key || !prefs?.zerodha_access_token) {
      return [];
    }

    const kite = new KiteConnect({
      api_key: prefs.zerodha_api_key,
      api_secret: '',
      access_token: prefs.zerodha_access_token,
      user_id: prefs.zerodha_user_id || '',
    });

    return await kite.getPositions();
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
}

/**
 * Get Zerodha holdings
 */
export async function getZerodhaHoldings(): Promise<any[]> {
  try {
    const prefs = await getUserPreferences();

    if (!prefs?.zerodha_api_key || !prefs?.zerodha_access_token) {
      return [];
    }

    const kite = new KiteConnect({
      api_key: prefs.zerodha_api_key,
      api_secret: '',
      access_token: prefs.zerodha_access_token,
      user_id: prefs.zerodha_user_id || '',
    });

    return await kite.getHoldings();
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }
}

/**
 * Get account summary with margins
 */
export async function getAccountSummary(): Promise<any> {
  try {
    const prefs = await getUserPreferences();

    if (!prefs?.zerodha_api_key || !prefs?.zerodha_access_token) {
      return null;
    }

    const kite = new KiteConnect({
      api_key: prefs.zerodha_api_key,
      api_secret: '',
      access_token: prefs.zerodha_access_token,
      user_id: prefs.zerodha_user_id || '',
    });

    return await kite.getAccountSummary();
  } catch (error) {
    console.error('Error fetching account summary:', error);
    return null;
  }
}

export async function closeTrade(
  tradeId: string,
  exitPrice: number
): Promise<Trade | null> {
  try {
    // Fetch the trade to calculate P&L
    const { data: tradeData, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (fetchError) throw fetchError;
    if (!tradeData) throw new Error('Trade not found');

    const trade = tradeData as Trade;
    const profitLoss = (exitPrice - trade.entry_price) * trade.quantity;
    const profitLossPercentage = ((exitPrice - trade.entry_price) / trade.entry_price) * 100;

    const { data, error } = await supabase
      .from('trades')
      .update({
        exit_price: exitPrice,
        exit_timestamp: new Date().toISOString(),
        status: 'closed',
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage,
      })
      .eq('id', tradeId)
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error closing trade:', error);
    return null;
  }
}

export async function getTrade(tradeId: string): Promise<Trade | null> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching trade:', error);
    return null;
  }
}

export async function getOpenTrades(strategyId?: string): Promise<Trade[]> {
  try {
    let query = supabase
      .from('trades')
      .select('*')
      .eq('status', 'open')
      .order('entry_timestamp', { ascending: false });

    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching open trades:', error);
    return [];
  }
}

export async function getClosedTrades(strategyId?: string): Promise<Trade[]> {
  try {
    let query = supabase
      .from('trades')
      .select('*')
      .eq('status', 'closed')
      .order('exit_timestamp', { ascending: false });

    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching closed trades:', error);
    return [];
  }
}

export async function getAllTrades(strategyId?: string): Promise<Trade[]> {
  try {
    let query = supabase
      .from('trades')
      .select('*')
      .order('entry_timestamp', { ascending: false });

    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
}

export async function getTradesBySymbol(symbol: string): Promise<Trade[]> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('symbol', symbol)
      .order('entry_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trades by symbol:', error);
    return [];
  }
}

export async function calculatePortfolioStats(strategyId?: string) {
  try {
    const closedTrades = await getClosedTrades(strategyId);

    if (closedTrades.length === 0) {
      return {
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        win_rate: 0,
        total_profit_loss: 0,
        average_profit: 0,
        average_loss: 0,
      };
    }

    const winningTrades = closedTrades.filter(t => (t.profit_loss || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.profit_loss || 0) < 0);
    const totalPL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const avgProfit = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0) / winningTrades.length
      : 0;
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0)) / losingTrades.length
      : 0;

    return {
      total_trades: closedTrades.length,
      winning_trades: winningTrades.length,
      losing_trades: losingTrades.length,
      win_rate: (winningTrades.length / closedTrades.length) * 100,
      total_profit_loss: totalPL,
      average_profit: avgProfit,
      average_loss: avgLoss,
    };
  } catch (error) {
    console.error('Error calculating portfolio stats:', error);
    return null;
  }
}
