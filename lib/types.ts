export type StrategyType = 
  | 'rsi' 
  | 'macd' 
  | 'bollinger_bands' 
  | 'moving_average' 
  | 'momentum' 
  | 'atr'
  | 'stochastic'
  | 'williams_r'
  | 'cci'
  | 'ichimoku'
  | 'vwap'
  | 'obv'
  | 'adx'
  | 'roc'
  | 'keltner_channel'
  | 'supertrend'
  | 'combined';
export type SignalType = 'buy' | 'sell';
export type TradeStatus = 'open' | 'closed' | 'cancelled';
export type SignalStatus = 'active' | 'traded' | 'expired' | 'closed';
export type ScanStatus = 'completed' | 'failed' | 'running';
export type StrategyStatus = 'active' | 'inactive' | 'testing';

export interface Strategy {
  id: string;
  name: string;
  description: string | null;
  strategy_type: StrategyType;
  status: StrategyStatus;
  parameters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CombinedStrategy {
  id: string;
  name: string;
  description: string | null;
  strategy_type: 'combined';
  status: StrategyStatus;
  // Array of strategy IDs that must ALL trigger for a signal
  sub_strategies: string[];
  // Logic: 'AND' means all must trigger, 'OR' means any can trigger
  combination_logic: 'AND' | 'OR';
  parameters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MarketScan {
  id: string;
  strategy_id: string;
  scan_timestamp: string;
  stocks_scanned: number;
  signals_generated: number;
  execution_time_ms: number | null;
  status: ScanStatus;
  error_message: string | null;
  created_at: string;
}

export interface Signal {
  id: string;
  strategy_id: string;
  market_scan_id: string | null;
  symbol: string;
  signal_type: SignalType;
  price: number;
  signal_strength: number | null;
  timestamp: string;
  indicators: Record<string, unknown> | null;
  status: SignalStatus;
  created_at: string;
}

export interface Trade {
  id: string;
  signal_id: string;
  strategy_id: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_timestamp: string;
  exit_timestamp: string | null;
  status: TradeStatus;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StrategyStatistics {
  id: string;
  strategy_id: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number | null;
  average_profit: number | null;
  average_loss: number | null;
  max_drawdown: number | null;
  profit_factor: number | null;
  total_return: number | null;
  sharpe_ratio: number | null;
  last_updated: string;
}

export interface UserPreferences {
  id: string;
  zerodha_api_key: string | null;
  zerodha_access_token: string | null;
  zerodha_user_id: string | null;
  scan_interval_minutes: number;
  notification_enabled: boolean;
  notification_method: string | null;
  notification_endpoint: string | null;
  created_at: string;
  updated_at: string;
}

export interface BacktestResult {
  id: string;
  strategy_id: string;
  start_date: string;
  end_date: string;
  total_trades: number | null;
  winning_trades: number | null;
  losing_trades: number | null;
  win_rate: number | null;
  average_profit: number | null;
  average_loss: number | null;
  max_drawdown: number | null;
  profit_factor: number | null;
  total_return: number | null;
  sharpe_ratio: number | null;
  results_data: Record<string, unknown> | null;
  created_at: string;
}

// Zerodha API Types
export interface ZerodhaQuote {
  symbol: string;
  last_price: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  oi?: number;
}

export interface MarketDataPoint {
  symbol: string;
  price: number;
  rsi?: number;
  macd?: { value: number; signal: number; histogram: number };
  bollinger_bands?: { upper: number; middle: number; lower: number };
  sma_20?: number;
  sma_50?: number;
  sma_200?: number;
  atr?: number;
  momentum?: number;
  timestamp: string;
}

export interface StrategyEvaluationResult {
  symbol: string;
  signal_type: SignalType | null;
  signal_strength: number;
  indicators: Record<string, unknown>;
  timestamp: string;
}
