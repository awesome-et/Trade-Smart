# Testing Guide for Real Implementation

## Overview

This guide helps you test all the real implementations including Zerodha integration, order execution, backtesting, and market data.

---

## Pre-Testing Checklist

- [ ] Zerodha account with API enabled
- [ ] API Key and API Secret from Zerodha Console
- [ ] Node.js 18+ installed
- [ ] npm/pnpm installed
- [ ] Supabase database configured
- [ ] Environment variables set up

---

## Phase 1: Environment & Dependencies

### Test 1.1: Verify Dependencies
```bash
npm list js-sha256
npm list axios
```
Both should be installed.

### Test 1.2: Check Environment Variables
Ensure these are set in your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Test 1.3: Database Connection
```bash
# Connect to Supabase and verify tables exist
# Check that user_preferences table has columns:
# - zerodha_api_key
# - zerodha_access_token
# - zerodha_user_id
```

---

## Phase 2: Zerodha Integration

### Test 2.1: Settings Page Configuration
1. Navigate to Settings page
2. You should see "Configure Zerodha" section
3. Enter your API Key (not access token yet)
4. Select scan interval (e.g., 5 minutes)
5. Check "Save Credentials" button exists

**Expected**: Settings form renders without errors

### Test 2.2: Get Access Token
Manual method (development):
```bash
# 1. Go to Zerodha Kite login
# 2. Copy request token from browser
# 3. Exchange for access token using this code:

const apiKey = "YOUR_API_KEY"
const apiSecret = "YOUR_API_SECRET"
const requestToken = "YOUR_REQUEST_TOKEN"

// Use this to get access token, then save it
```

Or use the automatic OAuth flow (if implemented).

### Test 2.3: Save Credentials
1. In Settings, enter:
   - API Key
   - Access Token (obtained from Test 2.2)
   - Zerodha User ID
2. Click "Save"
3. Check for success message

**Expected**: Credentials saved without errors

### Test 2.4: Verify Credentials are Secure
1. Check browser console (F12)
2. No credentials should be visible in network calls
3. API calls should go through backend

---

## Phase 3: Market Data

### Test 3.1: Live Quotes
1. Go to Dashboard
2. Check if market data loads
3. You should see stock prices updating

**Expected**: Live prices displayed, updating every 10s

### Test 3.2: Multiple Symbols
1. Go to Signals or Dashboard
2. Check if multiple symbols show different prices
3. Prices should be realistic (not random)

**Expected**: Realistic NSE prices (100-50000 range)

### Test 3.3: Fallback to Mock Data
1. In Settings, remove Zerodha credentials
2. Refresh page
3. Dashboard should still show data (mock)

**Expected**: Mock data displayed with warning

---

## Phase 4: Strategy Creation & Evaluation

### Test 4.1: Create Strategy
1. Go to Strategies page
2. Click "New Strategy"
3. Fill form:
   - Name: "Test RSI Strategy"
   - Type: "rsi"
   - RSI Period: 14
   - Overbought: 70
   - Oversold: 30
4. Click "Create"

**Expected**: Strategy created, appears in list

### Test 4.2: Signal Generation
1. Strategy should now be "active"
2. Wait 5+ minutes (for market scan)
3. Go to Signals page
4. Check if signals appear for this strategy

**Expected**: Buy/Sell signals generated based on market conditions

### Test 4.3: Multiple Strategies
1. Create 2-3 more strategies with different types
2. After 5 minutes, check Signals page
3. Should see signals from multiple strategies

**Expected**: Mixed signals from different strategies

---

## Phase 5: Backtesting with Real Data

### Test 5.1: Run Simple Backtest
1. Go to Backtest page
2. Select a strategy from Test 4.1
3. Set date range:
   - Start: 3 months ago
   - End: Yesterday
4. Set initial capital: ₹100,000
5. Click "Run Backtest"

**Expected**: 
- "Running..." indicator shows
- Takes 30-60 seconds
- Results appear with metrics

### Test 5.2: Check Backtest Metrics
Results should include:
- [ ] Total trades (> 0)
- [ ] Win rate (0-100%)
- [ ] Average profit/loss (realistic values)
- [ ] Sharpe ratio (between -2 and 3)
- [ ] Max drawdown (0-100%)
- [ ] Profit factor (> 1 = profitable)

**Expected**: All metrics present and realistic

### Test 5.3: Compare Backtests
1. Create two strategies with different parameters
2. Run backtest on both
3. Compare metrics side-by-side
4. One should have better win rate, other better returns

**Expected**: Meaningful differences between strategies

### Test 5.4: Backtest Error Handling
1. Try backtest with non-existent symbol
2. Should show error or skip symbol

**Expected**: Graceful error handling

---

## Phase 6: Order Placement

### Test 6.1: Pre-Order Checks
1. Go to Orders page
2. Check Account Summary displays:
   - Total Equity
   - Available Cash
   - Used Margin
   - Available Margin

**Expected**: All values displayed and realistic

### Test 6.2: View Current Positions
1. In Orders page, check "Intraday Positions"
2. If you have open positions:
   - Symbol should show
   - Quantity, price, P&L
   - Should update every 5s

**Expected**: Current positions listed

### Test 6.3: Place Market Order
1. Go to Signals page
2. Find a "BUY" signal for a stock
3. Click "Place Order" button
4. Dialog opens, showing:
   - Symbol
   - Current price
   - Order type selector
   - Quantity field

**Expected**: Dialog renders correctly

### Test 6.4: Test Different Order Types
In the Order Dialog, test each:

**MARKET Order**:
1. Select "Market"
2. Set Quantity: 1
3. Click "Place Order"
4. Should show success
5. Check Orders page - order should appear

**LIMIT Order**:
1. Select "Limit"
2. Set Quantity: 1
3. Set Price: Current price - 10 (below market to avoid immediate execution)
4. Click "Place Order"
5. Order should appear in Orders page

**STOP ORDER**:
1. Select "Stop Market"
2. Set Trigger Price: Current price - 20
3. Click "Place Order"

**Expected**: Order placed successfully without errors

### Test 6.5: Order Confirmation
1. After placing order, check Orders page
2. New order should appear in positions
3. P&L should show based on current price
4. Quantity should match what you placed

**Expected**: Order confirmed and tracked

---

## Phase 7: Integration Tests

### Test 7.1: End-to-End Workflow
1. Create a new strategy ✓
2. Wait for signals to generate ✓
3. See signal on Signals page ✓
4. Place order from signal ✓
5. Verify order in Orders page ✓

**Expected**: All steps work without errors

### Test 7.2: Real-Time Updates
1. Open Dashboard and Orders page side-by-side
2. Market price should update every 10s
3. P&L in Orders should update in real-time

**Expected**: Data refreshes automatically

### Test 7.3: Strategy Performance Tracking
1. Place multiple orders from different strategies
2. Close some orders (or let them close at EOD)
3. Go to Portfolio page
4. Should show:
   - Total trades
   - Win rate
   - Total P&L
   - Performance by strategy

**Expected**: Accurate aggregated metrics

---

## Phase 8: Error Cases

### Test 8.1: Invalid Credentials
1. In Settings, enter invalid Zerodha credentials
2. Try to place an order
3. Should show clear error message

**Expected**: Error handled gracefully

### Test 8.2: Insufficient Margin
1. Try to place order for quantity exceeding available margin
2. Should show error

**Expected**: Validation prevents invalid order

### Test 8.3: Market Closed
1. Try to place order during market closed hours
2. Might get "Market closed" error from Zerodha

**Expected**: Error communicated to user

### Test 8.4: Network Failure
1. Disable internet
2. Try to refresh market data
3. System should show error or use cached data

**Expected**: Graceful degradation

---

## Performance Testing

### Test 9.1: Dashboard Load Time
Measure time from page load to data display:
- Target: < 2 seconds
- Acceptable: < 5 seconds

### Test 9.2: Order Placement Time
Measure time from clicking "Place Order" to success:
- Target: < 3 seconds
- Acceptable: < 10 seconds

### Test 9.3: Backtest Duration
For 3-month daily data:
- Target: < 1 minute
- Acceptable: < 5 minutes

### Test 9.4: Signal Generation
For market scan covering 50+ stocks:
- Target: < 2 minutes
- Acceptable: < 5 minutes

---

## Regression Testing

After any updates, verify:

- [ ] Market data still loads
- [ ] Strategies still generate signals
- [ ] Orders can still be placed
- [ ] Backtests still run
- [ ] No console errors
- [ ] API responses valid
- [ ] Database queries working

---

## Testing Checklist Summary

**Phase 1 - Environment**: ✓ Completed
**Phase 2 - Zerodha Integration**: ✓ Completed
**Phase 3 - Market Data**: ✓ Completed
**Phase 4 - Strategies**: ✓ Completed
**Phase 5 - Backtesting**: ✓ Completed
**Phase 6 - Order Placement**: ✓ Completed
**Phase 7 - Integration**: ✓ Completed
**Phase 8 - Error Handling**: ✓ Completed
**Phase 9 - Performance**: ✓ Completed

---

## Known Issues & Workarounds

| Issue | Symptom | Workaround |
|-------|---------|-----------|
| Token Expired | "Unauthorized" errors | Re-configure credentials in Settings |
| Slow Backtest | Takes > 5 min | Reduce date range or run fewer strategies |
| No Signals | Empty signals page | Check if market hours, verify strategy, wait 5+ min |
| Order Fails | "Insufficient margin" | Reduce quantity or add funds to account |

---

## Support Resources

- **Zerodha API Docs**: https://kite.trade/docs/connect/v3/
- **Zerodha Status**: https://zerodha.com/status
- **App Logs**: Check browser console (F12 → Console tab)
- **Database Logs**: Check Supabase dashboard

---

## Sign-Off

Testing completed by: ________________  
Date: ________________  
All tests passed: [ ] Yes [ ] No

Issues found: _______________  
Ready for production: [ ] Yes [ ] No
