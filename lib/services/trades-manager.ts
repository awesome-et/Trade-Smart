"use server";

import { createServerSideClient } from '@/lib/auth-server';
import { Trade } from '@/lib/types';
import KiteConnect from './zerodha-kiteconnect';
import { getUserPreferences } from './market-data';

/* =========================
   CREATE TRADE
========================= */
export async function createTrade(
  signalId: string,
  strategyId: string,
  symbol: string,
  entryPrice: number,
  quantity: number,
  notes?: string
): Promise<Trade | null> {
  const supabase = await createServerSideClient();

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

    return data ?? null;
  } catch (error) {
    console.error('Error creating trade:', error);
    return null;
  }
}

/* =========================
   PLACE ORDER (ZERODHA)
========================= */
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
        error: 'Zerodha credentials not configured.',
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
      trigger_price:
        orderType === 'STOPLIMIT' || orderType === 'STOPMARKET'
          ? triggerPrice
          : undefined,
      product: 'MIS',
      variety: 'regular',
      validity: 'DAY',
    });

    return { success: true, orderId: order.order_id };
  } catch (error) {
    console.error('Error placing order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Order failed',
    };
  }
}

/* =========================
   ZERODHA DATA
========================= */
async function getKiteInstance() {
  const prefs = await getUserPreferences();

  if (!prefs?.zerodha_api_key || !prefs?.zerodha_access_token) {
    return null;
  }

  return new KiteConnect({
    api_key: prefs.zerodha_api_key,
    api_secret: '',
    access_token: prefs.zerodha_access_token,
    user_id: prefs.zerodha_user_id || '',
  });
}

export async function getZerodhaPositions() {
  try {
    const kite = await getKiteInstance();
    if (!kite) return [];
    return await kite.getPositions();
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
}

export async function getZerodhaHoldings() {
  try {
    const kite = await getKiteInstance();
    if (!kite) return [];
    return await kite.getHoldings();
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }
}

export async function getAccountSummary() {
  try {
    const kite = await getKiteInstance();
    if (!kite) return null;
    return await kite.getAccountSummary();
  } catch (error) {
    console.error('Error fetching account summary:', error);
    return null;
  }
}

/* =========================
   CLOSE TRADE
========================= */
export async function closeTrade(
  tradeId: string,
  exitPrice: number
): Promise<Trade | null> {
  const supabase = await createServerSideClient();

  try {
    const { data: tradeData, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (fetchError) throw fetchError;
    if (!tradeData) throw new Error('Trade not found');

    const profitLoss =
      (exitPrice - tradeData.entry_price) * tradeData.quantity;

    const profitLossPercentage =
      ((exitPrice - tradeData.entry_price) /
        tradeData.entry_price) *
      100;

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

    return data ?? null;
  } catch (error) {
    console.error('Error closing trade:', error);
    return null;
  }
}

/* =========================
   FETCH TRADES
========================= */
export async function getTrade(tradeId: string) {
  const supabase = await createServerSideClient();

  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data ?? null;
  } catch (error) {
    console.error('Error fetching trade:', error);
    return null;
  }
}

async function fetchTrades(
  status?: 'open' | 'closed',
  strategyId?: string
) {
  const supabase = await createServerSideClient();

  let query = supabase
    .from('trades')
    .select('*')
    .order('entry_timestamp', { ascending: false });

  if (status) query = query.eq('status', status);
  if (strategyId) query = query.eq('strategy_id', strategyId);

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}

export async function getOpenTrades(strategyId?: string) {
  try {
    return await fetchTrades('open', strategyId);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getClosedTrades(strategyId?: string) {
  try {
    return await fetchTrades('closed', strategyId);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAllTrades(strategyId?: string) {
  try {
    return await fetchTrades(undefined, strategyId);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTradesBySymbol(symbol: string) {
  const supabase = await createServerSideClient();

  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('symbol', symbol)
      .order('entry_timestamp', { ascending: false });

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

/* =========================
   PORTFOLIO STATS
========================= */
export async function calculatePortfolioStats(strategyId?: string) {
  try {
    const closedTrades = await getClosedTrades(strategyId);

    if (!closedTrades.length) {
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

    const winning = closedTrades.filter(t => (t.profit_loss || 0) > 0);
    const losing = closedTrades.filter(t => (t.profit_loss || 0) < 0);

    const totalPL = closedTrades.reduce(
      (sum, t) => sum + (t.profit_loss || 0),
      0
    );

    return {
      total_trades: closedTrades.length,
      winning_trades: winning.length,
      losing_trades: losing.length,
      win_rate: (winning.length / closedTrades.length) * 100,
      total_profit_loss: totalPL,
      average_profit:
        winning.length > 0
          ? winning.reduce((s, t) => s + (t.profit_loss || 0), 0) /
          winning.length
          : 0,
      average_loss:
        losing.length > 0
          ? Math.abs(
            losing.reduce((s, t) => s + (t.profit_loss || 0), 0)
          ) / losing.length
          : 0,
    };
  } catch (error) {
    console.error('Error calculating portfolio stats:', error);
    return null;
  }
}
