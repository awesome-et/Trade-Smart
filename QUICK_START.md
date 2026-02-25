# 🚀 Quick Start Guide

Get your trading strategy engine up and running in **5 minutes**.

---

## Step 1: Configure Zerodha API (2 min)

1. Open **Settings** in the sidebar
2. Click **"Add Zerodha Credentials"**
3. Paste your Zerodha API key and access token
4. Click **Save**

> No Zerodha account? Use mock mode (will generate demo signals)

---

## Step 2: Create Your First Strategy (2 min)

1. Go to **Strategies** page
2. Click **"Create Strategy"**
3. Fill in:
   - **Name**: "My First Strategy" (or any name)
   - **Type**: Select "RSI" (great for beginners)
   - **Parameters**: Use defaults (RSI Period: 14, Oversold: 30, Overbought: 70)
4. Click **"Create Strategy"**

✅ **You're done!** Your strategy is now active.

---

## Step 3: Check Your Dashboard (1 min)

1. Go to **Dashboard** (home page)
2. You'll see:
   - Strategy count
   - Active signals
   - Recent signals table
   - Your strategy listed

> Signals appear after the next 5-minute scan (usually within 5 minutes)

---

## What Happens Next?

### Automated Scanning
- System scans every 5 minutes
- Generates BUY/SELL signals based on your strategy
- Signals appear on Dashboard and Signals page

### View Your Signals
1. Go to **Signals** page
2. See all generated signals with:
   - Symbol and signal type
   - Price and timestamp
   - Signal strength
   - Status (Active, Traded, Expired)

### Create Trades from Signals
1. Click on any signal
2. Click **"Create Trade"**
3. Enter quantity and notes
4. The trade is tracked in your portfolio

### Check Performance
1. Go to **Portfolio** page
2. See:
   - Open positions
   - Closed trades with P&L
   - Total portfolio return
   - Win rate

---

## Example: RSI Strategy

**Goal**: Buy oversold stocks, sell when they recover

**Configuration**:
- Strategy Type: RSI
- Parameters: 14, 30, 70 (defaults)

**What it does**:
- BUY when RSI < 30 (stock is oversold)
- SELL when RSI > 70 (stock is overbought)

**Expected Behavior**:
- Generates 1-5 signals daily (depending on market)
- Works best in ranging markets
- May lag in trending markets

---

## Example: Moving Average Strategy

**Goal**: Follow market trends

**Configuration**:
- Strategy Type: Moving Average
- Parameters: fast=20, slow=50, type=SMA

**What it does**:
- BUY when 20-day MA > 50-day MA (uptrend)
- SELL when 20-day MA < 50-day MA (downtrend)

**Expected Behavior**:
- Fewer signals but higher quality
- Better for trending markets
- May miss quick reversals

---

## Backtesting Your Strategy

1. Go to **Backtest** page
2. Select your strategy from dropdown
3. Choose date range (e.g., last 6 months)
4. Click **"Run Backtest"**
5. See results:
   - Win rate
   - Total P&L
   - Max drawdown
   - Other metrics

> Use backtest results to refine your strategy parameters

---

## Common Mistakes to Avoid

❌ **Too many active strategies** - Start with 1-2, add more after testing

❌ **Not backtesting** - Always test before going live

❌ **Unrealistic parameters** - Use industry-standard values as starting points

❌ **Ignoring signal strength** - Strong signals (>0.8) are more reliable

❌ **Not monitoring** - Check dashboard daily for signal quality

---

## Tips for Success

✅ Start simple - Use 1 strategy first

✅ Backtest before activating - Run 6+ months of history

✅ Document your trades - Add notes explaining entries

✅ Review monthly - Analyze results and adjust

✅ Keep a journal - Track what works and what doesn't

---

## Troubleshooting

### No signals appearing?

- Check Zerodha credentials are saved (Settings)
- Verify strategy status is "Active"
- Market hours? Signals only generate during market hours
- Wait for next 5-minute scan

### Strategy creation failing?

- All fields filled? (Name, Type, Parameters)
- Valid parameters? (Numbers within range)
- Try refreshing page and trying again

### Backtest showing no results?

- Valid date range? (Start before End)
- Historical data available? (Use recent dates first)
- Check browser console (F12) for errors

---

## Next Steps

After you're comfortable:

1. **Create more strategies** - Try MACD, Bollinger Bands
2. **Optimize parameters** - Use backtest to refine
3. **Combine strategies** - Use multiple together
4. **Set notifications** - Get alerts for new signals
5. **Track performance** - Monitor win rate and P&L

---

## Learning Path

1. **Beginner**: Create RSI strategy → Watch signals → Small backtest
2. **Intermediate**: Test 3-4 strategies → Compare results → Optimize parameters
3. **Advanced**: Combine strategies → Build watchlist → Live trading with position limits

---

## Resources

- 📖 Full guide: [README.md](README.md)
- 📋 Strategy details: See README.md > Available Strategies
- 🔄 Recent changes: [CHANGELOG.md](CHANGELOG.md)
- ❓ Having issues? Check README.md > Troubleshooting

---

## Need Help?

1. Check README.md for detailed documentation
2. Review CHANGELOG.md for recent updates
3. Check browser console (F12) for error messages
4. Try the example strategies above

---

**Happy trading! 📈**

*Last Updated: 2026-02-25*
