import { supabase } from '@/lib/supabase';
import { ZerodhaQuote, MarketDataPoint, UserPreferences } from '@/lib/types';
import KiteConnect from './zerodha-kiteconnect';

// Indian stock symbols
const INDIAN_STOCKS = [
  'RELIANCE', 'TCS', 'INFY', 'WIPRO', 'BAJAJFINSV',
  'SBIN', 'MARUTI', 'HDFC', 'LT', 'AXISBANK',
  'ICICIBANK', 'ONGC', 'BHARTIARTL', 'HCLTECH', 'JSWSTEEL',
];

let kiteInstance: KiteConnect | null = null;

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

export async function saveUserPreferences(preferences: Partial<UserPreferences>) {
  try {
    const existing = await getUserPreferences();
    
    if (existing) {
      const { error } = await supabase
        .from('user_preferences')
        .update(preferences)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_preferences')
        .insert([preferences]);
      if (error) throw error;
    }
    // Reset kite instance if credentials changed
    kiteInstance = null;
    return { success: true };
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return { success: false, error };
  }
}

async function getKiteInstance(): Promise<KiteConnect | null> {
  try {
    if (kiteInstance) return kiteInstance;

    const prefs = await getUserPreferences();
    if (!prefs?.zerodha_api_key || !prefs?.zerodha_access_token) {
      return null;
    }

    kiteInstance = new KiteConnect({
      api_key: prefs.zerodha_api_key,
      api_secret: '', // Not needed for API calls, only for OAuth
      access_token: prefs.zerodha_access_token,
      user_id: prefs.zerodha_user_id || '',
    });

    return kiteInstance;
  } catch (error) {
    console.error('Error creating Kite instance:', error);
    return null;
  }
}

export async function fetchMarketData(symbols: string[]): Promise<ZerodhaQuote[]> {
  try {
    const kite = await getKiteInstance();
    
    if (!kite) {
      console.warn('Zerodha not configured, using mock data');
      return generateMockQuotes(symbols);
    }

    try {
      const quotes = await kite.getQuotes(symbols);
      return symbols.map(symbol => {
        const quote = quotes[symbol];
        return {
          symbol,
          last_price: quote.lastPrice,
          high: quote.high,
          low: quote.low,
          open: quote.open,
          close: quote.close,
          volume: quote.volume,
        };
      });
    } catch (error) {
      console.error('KiteConnect API error, falling back to mock data:', error);
      return generateMockQuotes(symbols);
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    return generateMockQuotes(symbols);
  }
}

export function generateMockQuotes(symbols: string[]): ZerodhaQuote[] {
  return symbols.map(symbol => ({
    symbol,
    last_price: Math.random() * 10000 + 100,
    high: Math.random() * 10000 + 100,
    low: Math.random() * 10000 + 100,
    open: Math.random() * 10000 + 100,
    close: Math.random() * 10000 + 100,
    volume: Math.floor(Math.random() * 100000000),
  }));
}

export function calculateTechnicalIndicators(quotes: ZerodhaQuote[]): MarketDataPoint[] {
  return quotes.map(quote => ({
    symbol: quote.symbol,
    price: quote.last_price,
    rsi: calculateRSI(quote),
    macd: calculateMACD(quote),
    bollinger_bands: calculateBollingerBands(quote),
    sma_20: calculateSMA(quote, 20),
    sma_50: calculateSMA(quote, 50),
    sma_200: calculateSMA(quote, 200),
    atr: calculateATR(quote),
    momentum: calculateMomentum(quote),
    timestamp: new Date().toISOString(),
  }));
}

function calculateRSI(quote: ZerodhaQuote, period = 14): number {
  // Simplified RSI calculation - in production, use full historical data
  const change = quote.close - quote.open;
  const percentChange = (change / quote.open) * 100;
  return 50 + percentChange;
}

function calculateMACD(quote: ZerodhaQuote): { value: number; signal: number; histogram: number } {
  // Simplified MACD - in production, use full historical data with EMA
  const momentum = quote.close - quote.open;
  return {
    value: momentum,
    signal: momentum * 0.9,
    histogram: momentum * 0.1,
  };
}

function calculateBollingerBands(quote: ZerodhaQuote): { upper: number; middle: number; lower: number } {
  const middle = (quote.high + quote.low) / 2;
  const stdDev = (quote.high - quote.low) * 0.15;
  return {
    upper: middle + 2 * stdDev,
    middle,
    lower: middle - 2 * stdDev,
  };
}

function calculateSMA(quote: ZerodhaQuote, period: number): number {
  // Simplified SMA - in production, use historical data
  return quote.close;
}

function calculateATR(quote: ZerodhaQuote): number {
  // Simplified ATR - in production, calculate from true range
  return (quote.high - quote.low) * 0.5;
}

function calculateMomentum(quote: ZerodhaQuote): number {
  // Simplified momentum - in production, compare to previous candles
  return quote.close - quote.open;
}

export function getStockList(): string[] {
  return INDIAN_STOCKS;
}
