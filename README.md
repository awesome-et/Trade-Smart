# Trading Strategy Engine - User Guide

Welcome to your comprehensive trading strategy management platform! This guide will walk you through setting up, creating, and managing trading strategies with real-time signal generation and backtesting.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Initial Setup](#initial-setup)
3. [Available Strategies](#available-strategies)
4. [Creating Your First Strategy](#creating-your-first-strategy)
5. [Dashboard Overview](#dashboard-overview)
6. [Strategy Examples](#strategy-examples)
7. [Monitoring Signals](#monitoring-signals)
8. [Backtesting](#backtesting)
9. [Portfolio Management](#portfolio-management)
10. [Settings & Configuration](#settings--configuration)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

The Trading Strategy Engine is a single-user platform designed to help you create, test, and manage automated trading strategies. The system:

- **Generates signals** based on your custom strategies every 5 minutes
- **Evaluates market data** using technical indicators (RSI, MACD, Bollinger Bands, Moving Averages, etc.)
- **Backtests** strategies on historical data
- **Tracks trades** from signals to execution
- **Provides analytics** on strategy performance

---

## Initial Setup

### Step 1: Configure Zerodha API Credentials

1. Navigate to **Settings** page (bottom-left sidebar)
2. Click **"Add Zerodha Credentials"**
3. Enter your Zerodha API key and access token
4. Set your preferred scan interval (default: 5 minutes)
5. Click **"Save Credentials"**

> **Note**: Your credentials are securely stored in Supabase and never exposed to the frontend.

### Step 2: Enable Notifications (Optional)

1. In Settings, toggle **"Enable Notifications"**
2. Choose notification method:
   - Email alerts
   - Webhook (for custom integrations)
3. Save your preferences

---

## Available Strategies

The platform supports 6 built-in strategy types:

### 1. **RSI (Relative Strength Index)**
- **Best For**: Identifying overbought/oversold conditions
- **How It Works**: 
  - BUY signal when RSI < 30 (oversold)
  - SELL signal when RSI > 70 (overbought)
- **Parameters**:
  - `rsi_period`: Number of candles (default: 14)
  - `oversold_threshold`: Lower limit (default: 30)
  - `overbought_threshold`: Upper limit (default: 70)

### 2. **MACD (Moving Average Convergence Divergence)**
- **Best For**: Momentum and trend-following
- **How It Works**:
  - BUY when MACD > Signal line
  - SELL when MACD < Signal line
- **Parameters**:
  - `fast_ema`: Fast EMA period (default: 12)
  - `slow_ema`: Slow EMA period (default: 26)
  - `signal_period`: Signal line period (default: 9)

### 3. **Bollinger Bands**
- **Best For**: Mean reversion and volatility trading
- **How It Works**:
  - BUY when price < Lower Band
  - SELL when price > Upper Band
- **Parameters**:
  - `period`: Number of candles (default: 20)
  - `std_dev`: Standard deviations (default: 2)
  - `use_sma`: Use SMA instead of EMA (default: true)

### 4. **Moving Average**
- **Best For**: Trend-following strategies
- **How It Works**:
  - BUY when fast MA > slow MA
  - SELL when fast MA < slow MA
- **Parameters**:
  - `fast_period`: Fast MA period (default: 20)
  - `slow_period`: Slow MA period (default: 50)
  - `ma_type`: "SMA" or "EMA" (default: "SMA")

### 5. **Momentum**
- **Best For**: Capturing strong directional moves
- **How It Works**:
  - BUY when momentum > threshold
  - SELL when momentum < negative threshold
- **Parameters**:
  - `period`: Momentum period (default: 10)
  - `buy_threshold`: Positive momentum threshold (default: 5)
  - `sell_threshold`: Negative momentum threshold (default: -5)

### 6. **ATR (Average True Range)**
- **Best For**: Volatility-based stop losses and entries
- **How It Works**:
  - BUY when price volatility expands
  - SELL when price volatility contracts
- **Parameters**:
  - `period`: ATR period (default: 14)
  - `volatility_factor`: Expansion factor (default: 1.5)

---

## Creating Your First Strategy

### Step 1: Navigate to Strategies

1. Click **"Strategies"** in the sidebar
2. Click **"Create Strategy"** button

### Step 2: Fill Strategy Details

**Basic Information:**
- **Strategy Name**: Give your strategy a unique name (e.g., "RSI Oversold Reversal")
- **Description**: Explain what the strategy does
- **Strategy Type**: Select from 6 available types

### Step 3: Configure Parameters

Each strategy type has specific parameters. Here's a quick reference:

**RSI Strategy Example:**
- RSI Period: `14` (number of candles for RSI calculation)
- Oversold Threshold: `30` (buy when RSI < 30)
- Overbought Threshold: `70` (sell when RSI > 70)

**Moving Average Example:**
- Fast Period: `20` (short-term MA)
- Slow Period: `50` (long-term MA)
- MA Type: `SMA` (Simple Moving Average)

### Step 4: Save & Activate

1. Click **"Create Strategy"**
2. Your strategy is now **active** and will:
   - Generate signals during the next market scan
   - Appear in your dashboard
   - Be included in automated scanning (every 5 minutes)

---

## Dashboard Overview

The **Dashboard** is your command center showing:

### Active Signals Section
- Real-time BUY/SELL signals from all active strategies
- Signal timestamp and strength
- Associated stock symbol
- Signal status (Active, Traded, Expired, Closed)

### Performance Stats
- **Total Strategies**: Active strategy count
- **Open Signals**: Current active signals
- **Win Rate**: Percentage of winning trades
- **Total P&L**: Cumulative profit/loss

### Recent Strategies
- Overview of your 3 most recent strategies
- Quick links to view details

---

## Strategy Examples

### Example 1: RSI Oversold Reversal Strategy

**Scenario**: You want to buy stocks when they're oversold and sell when overbought.

**Configuration:**
- **Name**: "RSI Oversold Reversal"
- **Type**: RSI
- **Parameters**:
  ```
  rsi_period: 14
  oversold_threshold: 30
  overbought_threshold: 70
  ```

**How It Works**:
- The system scans all configured stocks every 5 minutes
- When RSI < 30: Generates a BUY signal (stock is oversold)
- When RSI > 70: Generates a SELL signal (stock is overbought)
- Signals appear on your dashboard immediately

### Example 2: Golden Cross Moving Average Strategy

**Scenario**: You want to follow the trend using moving average crossovers.

**Configuration:**
- **Name**: "Golden Cross Strategy"
- **Type**: Moving Average
- **Parameters**:
  ```
  fast_period: 20
  slow_period: 50
  ma_type: "SMA"
  ```

**How It Works**:
- Fast MA (20-day) vs Slow MA (50-day)
- When 20-day MA crosses above 50-day: BUY signal (bullish)
- When 20-day MA crosses below 50-day: SELL signal (bearish)

### Example 3: Bollinger Band Breakout Strategy

**Scenario**: You want to trade mean reversion using bands.

**Configuration:**
- **Name**: "Bollinger Band Mean Reversion"
- **Type**: Bollinger Bands
- **Parameters**:
  ```
  period: 20
  std_dev: 2
  use_sma: true
  ```

**How It Works**:
- Upper Band = SMA(20) + 2*StdDev
- Lower Band = SMA(20) - 2*StdDev
- BUY when price touches lower band (oversold)
- SELL when price touches upper band (overbought)

### Example 4: MACD Momentum Strategy

**Scenario**: You want to capture momentum changes.

**Configuration:**
- **Name**: "MACD Momentum"
- **Type**: MACD
- **Parameters**:
  ```
  fast_ema: 12
  slow_ema: 26
  signal_period: 9
  ```

**How It Works**:
- MACD = 12-EMA - 26-EMA
- Signal = 9-EMA of MACD
- BUY when MACD crosses above signal line
- SELL when MACD crosses below signal line

---

## Monitoring Signals

### Signals Page

Navigate to **Signals** to see all generated signals:

**Features:**
- **Filter by Type**: View only BUY or SELL signals
- **Filter by Status**: Active, Traded, Expired, Closed
- **Symbol Search**: Find signals for specific stocks
- **Timestamp**: See when the signal was generated
- **Strength**: Signal confidence (0-1 scale)

### Signal Lifecycle

1. **Active**: New signal generated, waiting for action
2. **Traded**: You've created a trade from this signal
3. **Expired**: Signal is older than 24 hours
4. **Closed**: Associated trade has been closed

### Acting on Signals

1. Find a signal on the Signals page or Dashboard
2. Click **"Create Trade"**
3. Enter:
   - **Quantity**: Number of shares
   - **Notes**: Why you're taking this trade
4. Click **"Execute"**
5. Track the trade in **Portfolio**

---

## Backtesting

### Run a Backtest

1. Go to **Backtest** page
2. Select a strategy from the dropdown
3. Set date range:
   - Start Date: Beginning of test period
   - End Date: End of test period
4. Click **"Run Backtest"**

### Backtest Results

The system shows:
- **Total Trades**: Number of trades in the period
- **Win Rate**: Percentage of profitable trades
- **Average Profit**: Mean profit per winning trade
- **Average Loss**: Mean loss per losing trade
- **Max Drawdown**: Largest peak-to-trough decline
- **Profit Factor**: Gross profit / Gross loss
- **Total Return**: Net profit percentage
- **Sharpe Ratio**: Risk-adjusted returns

### Interpreting Results

- **Win Rate > 55%**: Generally profitable strategy
- **Profit Factor > 1.5**: Good strategy (3:2 wins:losses)
- **Max Drawdown < 20%**: Acceptable risk level
- **Sharpe Ratio > 1**: Good risk-adjusted returns

---

## Portfolio Management

### Portfolio Overview

The **Portfolio** page shows:

**Summary Stats:**
- Total portfolio value
- Open positions count
- Realized P&L (closed trades)
- Unrealized P&L (open trades)
- Overall return percentage

**Active Positions:**
- Stock symbol
- Entry price and date
- Current price (if configured)
- Quantity
- Unrealized P&L
- Signal type that created the position

**Trading History:**
- All closed trades
- Entry and exit prices
- Profit/loss
- Trade duration
- Strategy used

### Managing Positions

1. Click on a position to view details
2. **Close Trade**: Set exit price and close position
3. **Add Note**: Document your reasoning
4. View associated signal details

---

## Settings & Configuration

### Zerodha Integration

**Configure API Access:**
1. Get your credentials from Zerodha
2. Navigate to Settings
3. Enter API key and access token
4. Select scan interval (default: 5 minutes)
5. Save credentials

**Verify Connection:**
- Green indicator shows successful connection
- Red indicator means credentials need review

### Notification Settings

**Choose Alert Method:**
- **Email**: Receive signals via email
- **Webhook**: Send signals to your server (URL required)
- **Disabled**: No notifications

**Configure Notifications:**
1. Toggle notifications ON/OFF
2. Select method
3. Enter email or webhook URL
4. Save

### Scan Interval

Change how often the system scans for new signals:
- Options: 5, 15, 30 minutes
- Default: 5 minutes
- More frequent = more API calls but faster signal detection

---

## Troubleshooting

### "Unable to Create Strategy"

**Issue:** Strategy creation form won't submit.

**Solutions:**
1. Check all required fields are filled:
   - Strategy Name
   - Strategy Type
   - Parameters (all fields)
2. Verify parameter values are valid numbers (for numeric fields)
3. Check browser console for error messages (F12)
4. Try refreshing the page and creating again

### "No Signals Being Generated"

**Issue:** Dashboard shows no signals after creating strategy.

**Solutions:**
1. Check if Zerodha credentials are configured (Settings)
2. Verify strategy status is "Active" (not "Inactive" or "Testing")
3. Wait for the next 5-minute scan (check timestamp)
4. Check that market hours are active (India market: 9:15 AM - 3:30 PM)
5. Verify symbols are correctly configured in your watchlist

### "Backtest Results Seem Wrong"

**Issue:** Backtesting shows unexpected results.

**Solutions:**
1. Verify the date range is correct
2. Check that historical data is available for the period
3. Ensure strategy parameters make sense
4. Compare with actual market conditions during that period
5. Try a different date range to validate

### "Zerodha Connection Failed"

**Issue:** API credentials not working.

**Solutions:**
1. Verify API key and access token from Zerodha
2. Ensure credentials are not expired
3. Check that API access is enabled in Zerodha settings
4. Verify network connectivity
5. Try saving credentials again

### "Strategy Deleted by Mistake"

**Issue:** You deleted a strategy you need.

**Solutions:**
1. Recreate the strategy with same parameters
2. Keep a backup of important strategy configurations
3. Note down strategy parameters before deleting

---

## Performance Tips

1. **Limit Active Strategies**: Keep only essential strategies active to reduce API calls
2. **Use Realistic Parameters**: Test parameters on historical data first
3. **Monitor Regularly**: Check dashboard daily to see signal quality
4. **Backtest First**: Always backtest before activating a new strategy
5. **Document Everything**: Add notes to trades explaining your decisions
6. **Review Monthly**: Analyze strategy performance and adjust parameters as needed

---

## Support & Updates

This guide is updated whenever significant features are added or changed. Check back regularly for:
- New strategy types
- Enhanced backtesting features
- Improved UI/UX
- Performance optimizations
- Bug fixes

**Last Updated**: 2026-02-25

---

## Quick Reference Card

| Strategy | Best For | Key Parameters |
|----------|----------|-----------------|
| **RSI** | Overbought/Oversold | period, threshold_low, threshold_high |
| **MACD** | Momentum & Trends | fast_ema, slow_ema, signal_period |
| **Bollinger** | Mean Reversion | period, std_dev |
| **MA Cross** | Trend Following | fast_period, slow_period |
| **Momentum** | Strong Moves | period, buy_threshold, sell_threshold |
| **ATR** | Volatility | period, volatility_factor |

---

Enjoy using the Trading Strategy Engine! Happy trading! 📈
