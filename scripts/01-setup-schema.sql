-- Trading Strategy Engine Database Schema
-- Supabase PostgreSQL initialization

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STRATEGIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  strategy_type VARCHAR(50) NOT NULL CHECK (strategy_type IN ('price_action', 'support_resistance', 'momentum', 'mean_reversion', 'bollinger_bands', 'rsi')),
  parameters JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_strategies_active ON strategies(is_active);
CREATE INDEX idx_strategies_type ON strategies(strategy_type);

-- ============================================
-- MARKET_SCANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS market_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  open DECIMAL(10, 4),
  high DECIMAL(10, 4),
  low DECIMAL(10, 4),
  close DECIMAL(10, 4),
  volume BIGINT,
  rsi DECIMAL(5, 2),
  bollinger_upper DECIMAL(10, 4),
  bollinger_lower DECIMAL(10, 4),
  bollinger_middle DECIMAL(10, 4),
  macd DECIMAL(10, 4),
  macd_signal DECIMAL(10, 4),
  macd_histogram DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_scans_symbol_timestamp ON market_scans(symbol, timestamp DESC);
CREATE INDEX idx_market_scans_timestamp ON market_scans(timestamp DESC);

-- ============================================
-- SIGNALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('buy', 'sell')),
  price DECIMAL(10, 4),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_signals_strategy_timestamp ON signals(strategy_id, timestamp DESC);
CREATE INDEX idx_signals_symbol ON signals(symbol);
CREATE INDEX idx_signals_active ON signals(is_active);

-- ============================================
-- TRADES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  symbol VARCHAR(50) NOT NULL,
  entry_price DECIMAL(10, 4),
  entry_time TIMESTAMP,
  exit_price DECIMAL(10, 4),
  exit_time TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  profit_loss DECIMAL(12, 2),
  pnl_percent DECIMAL(8, 4),
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trades_signal ON trades(signal_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_symbol ON trades(symbol);

-- ============================================
-- STRATEGY_STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS strategy_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL UNIQUE REFERENCES strategies(id) ON DELETE CASCADE,
  total_signals INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  win_rate DECIMAL(5, 2),
  avg_profit DECIMAL(12, 2),
  avg_loss DECIMAL(12, 2),
  total_pnl DECIMAL(12, 2),
  max_drawdown DECIMAL(8, 4),
  profit_factor DECIMAL(8, 2),
  sharpe_ratio DECIMAL(8, 2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_strategy_statistics_strategy_id ON strategy_statistics(strategy_id);

-- ============================================
-- USER_PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_interval_minutes INT DEFAULT 5,
  alert_threshold DECIMAL(5, 2) DEFAULT 0.7,
  portfolio_symbols TEXT[] DEFAULT ARRAY[]::text[],
  theme VARCHAR(20) DEFAULT 'light',
  zerodha_api_key VARCHAR(255),
  zerodha_access_token VARCHAR(255),
  zerodha_session_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BACKTEST_RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS backtest_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  symbol VARCHAR(50),
  start_date DATE,
  end_date DATE,
  total_trades INT,
  winning_trades INT,
  losing_trades INT,
  win_rate DECIMAL(5, 2),
  total_return DECIMAL(8, 4),
  max_drawdown DECIMAL(8, 4),
  sharpe_ratio DECIMAL(8, 2),
  profit_factor DECIMAL(8, 2),
  results_json JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_backtest_results_strategy ON backtest_results(strategy_id);

-- ============================================
-- Create function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_strategies_updated_at
BEFORE UPDATE ON strategies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON trades
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_statistics_updated_at
BEFORE UPDATE ON strategy_statistics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
