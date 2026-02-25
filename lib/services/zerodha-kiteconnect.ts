import axios from 'axios';
import sha256 from 'js-sha256';

export interface KiteConnectConfig {
  api_key: string;
  api_secret: string;
  access_token: string;
  user_id: string;
}

export interface MarketQuote {
  symbol: string;
  lastPrice: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderRequest {
  tradingsymbol: string;
  exchange: string;
  transaction_type: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT' | 'STOPMARKET' | 'STOPLIMIT';
  quantity: number;
  price?: number;
  trigger_price?: number;
  product: 'MIS' | 'CNC' | 'NRML';
  validity?: string;
  variety?: string;
}

export interface Order {
  order_id: string;
  tradingsymbol: string;
  exchange: string;
  transaction_type: string;
  order_type: string;
  quantity: number;
  filled_quantity: number;
  price: number;
  average_price: number;
  status: string;
  timestamp: string;
}

export interface Position {
  tradingsymbol: string;
  exchange: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  pnl_percentage: number;
}

export interface Holding {
  tradingsymbol: string;
  exchange: string;
  quantity: number;
  price: number;
  last_price: number;
  pnl: number;
  pnl_percentage: number;
}

const KITE_API_BASE = 'https://api.kite.trade';

export class KiteConnect {
  private config: KiteConnectConfig;
  private axiosInstance = axios.create();

  constructor(config: KiteConnectConfig) {
    this.config = config;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use((config) => {
      config.headers['Authorization'] = `token ${this.config.api_key}:${this.config.access_token}`;
      config.headers['X-Kite-Version'] = '3';
      return config;
    });
  }

  /**
   * Generate login URL for OAuth flow
   */
  static getLoginUrl(apiKey: string, redirectUrl: string): string {
    const params = new URLSearchParams({
      api_key: apiKey,
      redirect_url: redirectUrl,
    });
    return `${KITE_API_BASE}/connect/login?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(
    apiKey: string,
    apiSecret: string,
    authCode: string
  ): Promise<string> {
    try {
      const checksum = sha256(apiKey + authCode + apiSecret);

      const response = await axios.post(`${KITE_API_BASE}/session/token`, {
        api_key: apiKey,
        request_token: authCode,
        checksum: checksum,
      });

      return response.data.data.access_token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Failed to authenticate with Zerodha');
    }
  }

  /**
   * Get current market quote for a symbol
   */
  async getQuote(symbol: string): Promise<MarketQuote> {
    try {
      const response = await this.axiosInstance.get(
        `${KITE_API_BASE}/quote?i=NSE:${symbol}`
      );

      const quote = response.data.data[`NSE:${symbol}`];

      return {
        symbol,
        lastPrice: quote.last_price,
        high: quote.ohlc.high,
        low: quote.ohlc.low,
        open: quote.ohlc.open,
        close: quote.ohlc.close,
        volume: quote.volume,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to get quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get quotes for multiple symbols
   */
  async getQuotes(symbols: string[]): Promise<Record<string, MarketQuote>> {
    try {
      const instrumentList = symbols.map((s) => `NSE:${s}`).join(',');
      const response = await this.axiosInstance.get(
        `${KITE_API_BASE}/quote?i=${instrumentList}`
      );

      const result: Record<string, MarketQuote> = {};

      for (const symbol of symbols) {
        const quote = response.data.data[`NSE:${symbol}`];
        result[symbol] = {
          symbol,
          lastPrice: quote.last_price,
          high: quote.ohlc.high,
          low: quote.ohlc.low,
          open: quote.ohlc.open,
          close: quote.ohlc.close,
          volume: quote.volume,
          timestamp: new Date().toISOString(),
        };
      }

      return result;
    } catch (error) {
      console.error('Failed to get quotes:', error);
      throw error;
    }
  }

  /**
   * Get historical OHLCV data for backtesting
   */
  async getHistoricalData(
    symbol: string,
    interval: string = 'day',
    fromDate: Date,
    toDate: Date
  ): Promise<HistoricalData[]> {
    try {
      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];

      const response = await this.axiosInstance.get(
        `${KITE_API_BASE}/instruments/historical/${symbol}/${interval}`,
        {
          params: {
            from,
            to,
          },
        }
      );

      return response.data.data.candles.map((candle: number[]) => ({
        date: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }));
    } catch (error) {
      console.error(`Failed to get historical data for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Place an order
   */
  async placeOrder(order: OrderRequest): Promise<Order> {
    try {
      const response = await this.axiosInstance.post(
        `${KITE_API_BASE}/orders/regular`,
        {
          ...order,
          variety: order.variety || 'regular',
          validity: order.validity || 'DAY',
          product: order.product || 'MIS',
        }
      );

      if (response.data.status === 'success') {
        return {
          order_id: response.data.data.order_id,
          tradingsymbol: order.tradingsymbol,
          exchange: order.exchange,
          transaction_type: order.transaction_type,
          order_type: order.order_type,
          quantity: order.quantity,
          filled_quantity: 0,
          price: order.price || 0,
          average_price: 0,
          status: 'PENDING',
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      throw error;
    }
  }

  /**
   * Get all orders
   */
  async getOrders(): Promise<Order[]> {
    try {
      const response = await this.axiosInstance.get(`${KITE_API_BASE}/orders`);

      return response.data.data.map((order: any) => ({
        order_id: order.order_id,
        tradingsymbol: order.tradingsymbol,
        exchange: order.exchange,
        transaction_type: order.transaction_type,
        order_type: order.order_type,
        quantity: order.quantity,
        filled_quantity: order.filled_quantity,
        price: order.price,
        average_price: order.average_price,
        status: order.status,
        timestamp: order.order_timestamp,
      }));
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.delete(
        `${KITE_API_BASE}/orders/${orderId}`
      );

      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  /**
   * Get current positions (intraday)
   */
  async getPositions(): Promise<Position[]> {
    try {
      const response = await this.axiosInstance.get(
        `${KITE_API_BASE}/portfolio/positions`
      );

      return response.data.data.net.map((position: any) => ({
        tradingsymbol: position.tradingsymbol,
        exchange: position.exchange,
        quantity: position.quantity,
        average_price: position.average_price,
        last_price: position.last_price,
        pnl: position.pnl,
        pnl_percentage: position.pnl_percentage,
      }));
    } catch (error) {
      console.error('Failed to get positions:', error);
      throw error;
    }
  }

  /**
   * Get holdings (overnight positions)
   */
  async getHoldings(): Promise<Holding[]> {
    try {
      const response = await this.axiosInstance.get(
        `${KITE_API_BASE}/portfolio/holdings`
      );

      return response.data.data.map((holding: any) => ({
        tradingsymbol: holding.tradingsymbol,
        exchange: holding.exchange,
        quantity: holding.quantity,
        price: holding.price,
        last_price: holding.last_price,
        pnl: holding.pnl,
        pnl_percentage: holding.pnl_percentage,
      }));
    } catch (error) {
      console.error('Failed to get holdings:', error);
      throw error;
    }
  }

  /**
   * Get account summary
   */
  async getAccountSummary(): Promise<{
    equity: number;
    cash: number;
    used_margin: number;
    available_margin: number;
  }> {
    try {
      const response = await this.axiosInstance.get(
        `${KITE_API_BASE}/user/margins`
      );

      const margin = response.data.data.equity;

      return {
        equity: margin.net,
        cash: margin.cash,
        used_margin: margin.used,
        available_margin: margin.available,
      };
    } catch (error) {
      console.error('Failed to get account summary:', error);
      throw error;
    }
  }
}

export default KiteConnect;
