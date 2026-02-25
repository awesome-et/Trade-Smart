import { ZerodhaQuote, MarketDataPoint, UserPreferences } from '@/lib/types';
import KiteConnect from './zerodha-kiteconnect';
import { createServerSideClient } from '@/lib/auth-server';

// Indian stock symbols
const INDIAN_STOCKS = [
  'RELIANCE', 'TCS', 'INFY', 'WIPRO', 'BAJAJFINSV',
  'SBIN', 'MARUTI', 'HDFC', 'LT', 'AXISBANK',
  'ICICIBANK', 'ONGC', 'BHARTIARTL', 'HCLTECH', 'JSWSTEEL',
];

let kiteInstance: KiteConnect | null = null;

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const supabase = await createServerSideClient();

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

export async function saveUserPreferences(
  preferences: Partial<UserPreferences>
) {
  try {
    const supabase = await createServerSideClient();
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

    // Reset Kite instance if credentials changed
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
      api_secret: '',
      access_token: prefs.zerodha_access_token,
      user_id: prefs.zerodha_user_id || '',
    });

    return kiteInstance;
  } catch (error) {
    console.error('Error creating Kite instance:', error);
    return null;
  }
}

export async function fetchMarketData(
  symbols: string[]
): Promise<ZerodhaQuote[]> {
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
      console.error('Kite API failed, falling back to mock data:', error);
      return generateMockQuotes(symbols);
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    return generateMockQuotes(symbols);
  }
}

export function generateMockQuotes(
  symbols: string[]
): ZerodhaQuote[] {
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

export function calculateTechnicalIndicators(
  quotes: ZerodhaQuote[]
): MarketDataPoint[] {
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

function calculateRSI(quote: ZerodhaQuote): number {
  const change = quote.close - quote.open;
  const percentChange = (change / quote.open) * 100;
  return 50 + percentChange;
}

function calculateMACD(quote: ZerodhaQuote) {
  const momentum = quote.close - quote.open;
  return {
    value: momentum,
    signal: momentum * 0.9,
    histogram: momentum * 0.1,
  };
}

function calculateBollingerBands(quote: ZerodhaQuote) {
  const middle = (quote.high + quote.low) / 2;
  const stdDev = (quote.high - quote.low) * 0.15;

  return {
    upper: middle + 2 * stdDev,
    middle,
    lower: middle - 2 * stdDev,
  };
}

function calculateSMA(quote: ZerodhaQuote, _period: number): number {
  return quote.close;
}

function calculateATR(quote: ZerodhaQuote): number {
  return (quote.high - quote.low) * 0.5;
}

function calculateMomentum(quote: ZerodhaQuote): number {
  return quote.close - quote.open;
}

export function getStockList(): string[] {
  return INDIAN_STOCKS;
}
