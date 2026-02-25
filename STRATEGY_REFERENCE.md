# 📊 Strategy Reference Card

Quick lookup guide for all 6 strategy types. Print or bookmark this page!

---

## 1. RSI (Relative Strength Index)

### 📌 Overview
Identifies when stocks are overbought (too high) or oversold (too low).

### 🎯 Best For
- Mean reversion trading
- Identifying price reversals
- Trading in ranging markets

### 📈 How It Works
- **BUY Signal**: RSI < Lower Threshold (stock is oversold)
- **SELL Signal**: RSI > Upper Threshold (stock is overbought)

### ⚙️ Default Parameters
```
RSI Period:          14 (candles for calculation)
Oversold Threshold:  30 (buy when RSI below this)
Overbought Threshold: 70 (sell when RSI above this)
```

### 🔧 Tuning Tips
- Increase period (20+) for fewer, cleaner signals
- Decrease period (10-) for more frequent signals
- Adjust thresholds (25/75) for more aggressive trading
- Use 20/80 for more conservative trading

### 📊 Expected Results
- **Signals per Day**: 2-5
- **Best Market**: Ranging/sideways
- **Win Rate**: 50-60%
- **Drawdown**: Medium (10-20%)

### Example Trade
Stock: INFY | Current RSI: 25 (oversold)
- **Signal**: BUY (RSI < 30)
- **Entry**: When RSI confirms
- **Exit**: When RSI > 70
- **Expected**: 2-4% gain per trade

---

## 2. MACD (Moving Average Convergence Divergence)

### 📌 Overview
Tracks momentum using exponential moving averages. Catches trend changes early.

### 🎯 Best For
- Trend-following strategies
- Capturing momentum shifts
- Identifying market acceleration

### 📈 How It Works
- **MACD** = 12-EMA - 26-EMA
- **Signal** = 9-EMA of MACD
- **BUY Signal**: MACD > Signal line (bullish crossover)
- **SELL Signal**: MACD < Signal line (bearish crossover)

### ⚙️ Default Parameters
```
Fast EMA:    12 (fast-moving average)
Slow EMA:    26 (slow-moving average)
Signal:      9  (signal line)
```

### 🔧 Tuning Tips
- Standard values (12/26/9) work well for most stocks
- Increase for slower signals (15/30/10)
- Decrease for faster signals (10/20/8)
- Adjust signal period for sensitivity

### 📊 Expected Results
- **Signals per Day**: 1-3
- **Best Market**: Trending markets
- **Win Rate**: 55-65%
- **Drawdown**: Medium (8-15%)

### Example Trade
Stock: TCS | MACD crosses above signal line
- **Signal**: BUY (trend confirmed)
- **Entry**: On crossover
- **Exit**: When MACD crosses below
- **Expected**: 3-6% gain per trade

---

## 3. Bollinger Bands

### 📌 Overview
Uses standard deviation to create dynamic support/resistance bands.

### 🎯 Best For
- Mean reversion trading
- Identifying breakouts
- Volatility expansion/contraction

### 📈 How It Works
- **Upper Band** = SMA + (2 × StdDev)
- **Middle Band** = SMA
- **Lower Band** = SMA - (2 × StdDev)
- **BUY**: Price touches lower band
- **SELL**: Price touches upper band

### ⚙️ Default Parameters
```
Period:      20 (candles for SMA)
Std Dev:     2  (standard deviations)
Use SMA:     YES (simple moving average)
```

### 🔧 Tuning Tips
- Lower period (10-15) for faster responses
- Higher period (25-30) for slower, steadier bands
- Increase std dev (2.5-3) for wider bands
- Decrease std dev (1.5) for tighter bands
- Switch to EMA for more responsive bands

### 📊 Expected Results
- **Signals per Day**: 3-7
- **Best Market**: Ranging/volatile
- **Win Rate**: 50-55%
- **Drawdown**: Medium (10-18%)

### Example Trade
Stock: HDFC | Price touches lower band
- **Signal**: BUY (oversold bounce)
- **Entry**: At lower band
- **Exit**: At middle or upper band
- **Expected**: 1-3% quick reversal

---

## 4. Moving Average Crossover

### 📌 Overview
Simple but powerful: compare fast and slow moving averages.

### 🎯 Best For
- Trend-following
- Long-term trading
- Beginner-friendly strategies

### 📈 How It Works
- **Fast MA** = Short-term average (20-day)
- **Slow MA** = Long-term average (50-day)
- **BUY**: Fast > Slow (uptrend)
- **SELL**: Fast < Slow (downtrend)

### ⚙️ Default Parameters
```
Fast Period:  20 (short-term)
Slow Period:  50 (long-term)
MA Type:      SMA (simple moving average)
```

### 🔧 Tuning Tips
- Classic setup: 20/50/200
- Aggressive: 10/20/50
- Conservative: 50/100/200
- Use EMA for faster responses
- Use SMA for smoother trends

### 📊 Expected Results
- **Signals per Day**: 0-2
- **Best Market**: Trending markets
- **Win Rate**: 55-70%
- **Drawdown**: Low (5-10%)

### Example Trade
Stock: NIFTY | 20-day MA crosses above 50-day MA
- **Signal**: BUY (golden cross)
- **Entry**: On crossover
- **Exit**: When 20-day crosses below 50-day
- **Expected**: 4-10% trend trade

---

## 5. Momentum

### 📌 Overview
Measures price rate of change. Captures strong directional moves.

### 🎯 Best For
- Capturing strong momentum
- Identifying acceleration
- Trading intraday swings

### 📈 How It Works
- **Momentum** = Price(today) - Price(10 periods ago)
- **BUY**: Momentum > Buy Threshold (strong up move)
- **SELL**: Momentum < Sell Threshold (strong down move)

### ⚙️ Default Parameters
```
Period:         10 (lookback period)
Buy Threshold:  5  (positive momentum to buy)
Sell Threshold: -5 (negative momentum to sell)
```

### 🔧 Tuning Tips
- Shorter period (5-8) for frequent signals
- Longer period (15-20) for stronger signals
- Higher thresholds (8-10) for fewer false signals
- Lower thresholds (2-3) for more aggressive trading
- Scale thresholds to typical daily moves (±2-5% is common)

### 📊 Expected Results
- **Signals per Day**: 2-6
- **Best Market**: Volatile/active
- **Win Rate**: 45-50%
- **Drawdown**: High (15-25%)

### Example Trade
Stock: RELIANCE | Momentum jumps from 2 to 8
- **Signal**: BUY (strong upward momentum)
- **Entry**: When momentum > 5
- **Exit**: When momentum turns negative
- **Expected**: Quick 1-3% scalp

---

## 6. ATR (Average True Range)

### 📌 Overview
Measures volatility using true range. Trade larger moves in volatile markets.

### 🎯 Best For
- Volatility-based trading
- Stop-loss placement
- Position sizing
- Range-bound trading

### 📈 How It Works
- **True Range** = Largest of: (H-L), (H-PC), (L-PC)
- **ATR** = Average of true range over period
- **BUY**: ATR expanding above threshold
- **SELL**: ATR contracting below threshold

### ⚙️ Default Parameters
```
Period:             14 (candles for ATR)
Volatility Factor:  1.5 (expansion multiplier)
```

### 🔧 Tuning Tips
- Standard period is 14 (use 10-20)
- Higher factor (2.0) for volatility expansion only
- Lower factor (1.0-1.2) for slight moves
- Combine with other indicators
- Use for position sizing, not standalone signals

### 📊 Expected Results
- **Signals per Day**: 1-4
- **Best Market**: Volatile stocks
- **Win Rate**: 50-60%
- **Drawdown**: Variable (depends on market)

### Example Trade
Stock: BAJAJFINSV | ATR jumps from 50 to 80
- **Signal**: BUY (volatility expansion)
- **Entry**: When ATR exceeds threshold
- **Exit**: When volatility normalizes
- **Expected**: 2-4% trade during volatile move

---

## Quick Comparison Table

| Strategy | Signals/Day | Market Type | Win Rate | Difficulty | Period Param |
|----------|-------------|------------|----------|------------|-------------|
| RSI | 2-5 | Ranging | 50-60% | Easy | 14 |
| MACD | 1-3 | Trending | 55-65% | Medium | 12/26 |
| Bollinger | 3-7 | Volatile | 50-55% | Easy | 20 |
| MA Cross | 0-2 | Trending | 55-70% | Easy | 20/50 |
| Momentum | 2-6 | Active | 45-50% | Hard | 10 |
| ATR | 1-4 | Variable | 50-60% | Hard | 14 |

---

## Parameter Tuning Guide

### If Getting Too Many Signals
- Increase periods (20→30)
- Increase thresholds (stricter conditions)
- Use longer moving averages
- Reduce sensitivity

### If Getting Too Few Signals
- Decrease periods (20→10)
- Decrease thresholds (looser conditions)
- Use shorter moving averages
- Increase sensitivity

### If Win Rate Is Too Low
- Use defaults first (already optimized)
- Backtest on different time periods
- Try different strategy type
- Combine with other indicators
- Increase period for stability

### If Trades Are Exiting Too Quickly
- Increase moving average periods
- Increase ATR period
- Use slower EMA instead of SMA
- Set tighter stop-losses

### If Trades Are Exiting Too Late
- Decrease moving average periods
- Decrease ATR period
- Use faster SMA instead of EMA
- Set wider stop-losses

---

## Strategy Selection Guide

### Choose RSI if:
- You want to trade reversals
- Market is ranging (not trending)
- You want easy to understand signals
- You like mean reversion approach

### Choose MACD if:
- You want momentum-based signals
- Market is trending
- You want early trend confirmation
- You like professional-grade indicator

### Choose Bollinger Bands if:
- You want volatility trading
- You want clear support/resistance
- You like visual representation
- You want mean reversion signals

### Choose Moving Average if:
- You want simple trend-following
- You want highest win rates
- You're a beginner
- You prefer low false signals

### Choose Momentum if:
- You want aggressive trading
- You want to catch acceleration
- You accept higher risk
- You're an experienced trader

### Choose ATR if:
- You want volatility-based trading
- You need position sizing help
- You want to follow the VIX
- You're using it as secondary signal

---

## Testing Your Strategy

### Backtest Checklist
- [ ] Test on 6+ months of data
- [ ] Check win rate (aim for >55%)
- [ ] Check profit factor (aim for >1.5)
- [ ] Check max drawdown (aim for <20%)
- [ ] Compare to buy-and-hold
- [ ] Test on different time periods
- [ ] Test on different stock sectors

### Start Small
- Test with smallest position first
- Start with 1-2 shares/units
- Scale up only after consistent wins
- Use alerts before placing real trades
- Paper trade first

### Monitor Results
- Track win/loss ratio
- Note which markets work best
- Document parameter changes
- Review monthly performance
- Adjust based on results

---

## Common Parameter Sets

### Aggressive (More Signals)
```
RSI:        12/20/80
MACD:       10/20/8
Bollinger:  15/1.5
MA Cross:   10/20
Momentum:   5/8/-8
ATR:        10/1.2
```

### Conservative (Fewer Signals)
```
RSI:        20/25/75
MACD:       14/28/10
Bollinger:  25/2.5
MA Cross:   30/100
Momentum:   15/10/-10
ATR:        20/2.0
```

### Balanced (Default)
```
RSI:        14/30/70
MACD:       12/26/9
Bollinger:  20/2.0
MA Cross:   20/50
Momentum:   10/5/-5
ATR:        14/1.5
```

---

## Pro Tips

1. **Start with defaults** - They're optimized for most scenarios

2. **Backtest before trading** - Never use a strategy without testing

3. **One parameter at a time** - Change one thing, measure impact

4. **Test multiple periods** - Different markets need different settings

5. **Document everything** - Write why you chose each parameter

6. **Monitor in live trading** - Paper trade first, then go live slowly

7. **Combine strategies** - One signal might miss what another catches

8. **Keep it simple** - Simpler strategies are easier to understand and maintain

---

## Troubleshooting

### "No signals are generating"
- Check strategy is Active (not Inactive)
- Check parameters are within valid ranges
- Try lowering thresholds/periods
- Check market is in active hours
- Try a different stock symbol

### "Too many false signals"
- Increase periods
- Increase thresholds
- Try different strategy type
- Add confirmation from second strategy
- Tighten stop-losses

### "Backtests show different results"
- Use same date range each time
- Check data quality
- Account for slippage
- Test on multiple symbols
- Compare to industry benchmarks

### "Strategy works in backtest but not live"
- Market conditions change
- Slippage and fees affect results
- Start with paper trading
- Use smaller position sizes
- Review trade execution

---

## Version History

- **v1.1.0** (2026-02-25) - All 6 strategies available, full documentation
- **v1.0.0** (2026-02-25) - Initial release with 6 strategy types

---

## Keep This Handy!

Print this card and keep it near your desk. Reference it when:
- Creating new strategies
- Tuning parameters
- Comparing strategies
- Explaining to others
- Troubleshooting issues

**Updated: 2026-02-25**

---

📍 **Quick Links:**
- [QUICK_START.md](QUICK_START.md) - Get started fast
- [README.md](README.md) - Full documentation
- [CHANGELOG.md](CHANGELOG.md) - What's new
- Dashboard - See your signals
