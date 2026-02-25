# Zerodha KiteConnect Integration Guide

## Overview

This guide explains how the Trading Strategy Engine integrates with Zerodha's KiteConnect API for real-time market data, historical backtesting data, and order execution.

---

## What is Zerodha Access Token?

The **Zerodha Access Token** is different from your API Key and Secret:

- **API Key**: Your application identifier (obtained from Zerodha Console)
- **API Secret**: Your application secret key (obtained from Zerodha Console)
- **Access Token**: A session-specific token obtained after OAuth login that proves you have permission to access the API

### Obtaining Your Access Token

There are two ways to get an access token:

#### Method 1: OAuth Flow (Recommended for Users)
1. User logs into Zerodha (Kite)
2. Gets redirected to authentication page
3. Authorizes the app
4. Receives an access token valid for the session

#### Method 2: Manual Token Generation (Development)
1. Go to [Zerodha Console](https://console.kite.trade/)
2. Get your API Key and API Secret
3. Use the generated request token from your browser's login flow
4. Exchange it for an access token using our API endpoint

---

## Setup Instructions

### Step 1: Get Zerodha API Credentials

1. Visit [Zerodha Console](https://console.kite.trade/)
2. Log in with your Zerodha account
3. Create a new app or use existing one
4. Copy your **API Key** and **API Secret**

### Step 2: Generate Access Token

Your access token can be obtained through:

**Option A: Using the Settings Page**
1. Go to **Settings** in the app
2. Click "Configure Zerodha"
3. Enter your API Key
4. You'll be redirected to Zerodha login
5. After login, your access token will be automatically saved

**Option B: Using OAuth Callback**
The system supports OAuth callback at `/api/zerodha/callback`

### Step 3: Verify Connection

Once configured:
1. Go to **Orders** page
2. You should see your account balance, positions, and holdings
3. If you see data, the connection is working!

---

## API Endpoints

### Market Data
- **Get Live Quotes**: Fetches current market prices for symbols
- **Get Historical Data**: Fetches OHLCV data for backtesting

### Order Management
- **Place Order**: `POST /api/orders/place`
  - Parameters: symbol, quantity, price, orderType, transactionType
  - Order Types: MARKET, LIMIT, STOPMARKET, STOPLIMIT
  - Transaction Types: BUY, SELL

### Account Info
- **Get Account Summary**: `GET /api/account/info`
  - Returns: Equity, cash, margins, positions, holdings

---

## Real Implementation Details

### Market Data Integration (`lib/services/market-data.ts`)

The system now uses real KiteConnect API for:
- **Live quotes** for signal generation
- **Technical indicators** calculated from live data
- **Fallback to mock data** if Zerodha is not configured

### Backtesting Engine (`lib/services/backtest-engine.ts`)

The real backtesting engine:
1. Fetches historical OHLCV data from Zerodha
2. Simulates strategy execution on historical data
3. Models realistic trading conditions:
   - 1% slippage on entry/exit
   - Accurate P&L calculations
   - Multiple symbol backtesting

4. Calculates real metrics:
   - Win rate
   - Profit factor
   - Sharpe ratio
   - Max drawdown
   - Return on investment

### Order Execution (`lib/services/trades-manager.ts`)

Order placement now includes:
- Real Zerodha order execution
- Multiple order types (market, limit, stop orders)
- Real-time order status tracking
- Position and holdings management

---

## Data Flow

```
User Creates Strategy
       ↓
Cron Job (Every 5 min)
       ↓
Fetch Live Market Data (KiteConnect API)
       ↓
Evaluate Strategy
       ↓
Generate Signals (if criteria met)
       ↓
User Views Signals
       ↓
User Places Order from Signal
       ↓
Order Execution (KiteConnect API)
       ↓
Order Tracking & P&L Calculation
```

---

## Error Handling

The system handles several error scenarios:

1. **Invalid/Expired Token**: Falls back to mock data with warning
2. **API Rate Limits**: Queues requests and retries
3. **Network Issues**: Uses cached data when available
4. **Invalid Symbols**: Skips and logs error

---

## Security

- API credentials are stored in Supabase (encrypted at rest)
- Tokens are never exposed in frontend code
- All API calls go through backend routes
- Session tokens are short-lived (24 hours)

---

## Testing the Integration

### Test 1: Verify Credentials
```bash
curl -X GET /api/account/info
# Should return your account info
```

### Test 2: Check Positions
```
Visit Orders page → Check if positions load
```

### Test 3: Place Test Order
```
Go to Signals → Click "Place Order" → Select a signal
Review order → Submit
```

---

## Troubleshooting

### "Zerodha credentials not configured"
- Go to Settings
- Enter your API key and access token
- Save and refresh

### "Failed to fetch market data"
- Check your internet connection
- Verify API credentials are correct
- Check if trading hours (9:15 AM - 3:30 PM IST weekdays)
- Zerodha API might be down - check their status

### "Order failed to place"
- Check available margin in Orders page
- Verify symbol exists (NSE:RELIANCE format)
- Check quantity is valid (at least 1 share)
- Verify market is open

### Access token expired
- Go to Settings and re-configure
- The system will prompt for new token automatically

---

## API Rate Limits

Zerodha KiteConnect has rate limits:
- 3 requests per second for most endpoints
- 10 requests per second for quote updates
- The system automatically handles throttling

---

## Supported Order Types

| Order Type | Description | Use Case |
|-----------|-------------|----------|
| MARKET | Immediate execution at market price | Quick entry/exit |
| LIMIT | Execute only at specified price | Precise entry/exit |
| STOPMARKET | Execute at market price once price falls below trigger | Stop loss |
| STOPLIMIT | Execute at limit price once price falls below trigger | Precise stop loss |

---

## Advanced: OAuth Implementation

The OAuth flow is handled automatically:

1. Frontend detects missing token
2. Redirects to Zerodha login: `https://api.kite.trade/connect/login?api_key=YOUR_KEY&redirect_url=YOUR_CALLBACK`
3. User logs in and authorizes
4. System exchanges code for access token
5. Token stored securely in database

---

## Next Steps

1. Configure your Zerodha credentials in Settings
2. Create your first strategy in Strategies page
3. Wait for signal generation (5-minute intervals)
4. When signals appear, use "Place Order" to execute trades
5. Monitor positions in Orders page
6. Review performance in Portfolio page

---

## Support

For issues with:
- **Zerodha API**: Check [Zerodha Developer Docs](https://kite.trade/docs/connect/v3/)
- **App Integration**: Check the troubleshooting section above
- **Order Execution**: Review order status in Orders page

