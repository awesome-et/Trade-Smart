# Trading Strategy Engine - Quick Reference Card

## Login & Access

### Demo Account
```
Email: demo@trading.com
Password: demo123456
URL: /login
```

### Create Admin Account
```
URL: /signup
Need: Admin Code (from system administrator)
```

### Session
- Auto-logout after inactivity
- Clear cookies to force logout
- Passwords: minimum 6 characters

---

## Creating Strategies

### Step 1: Go to Create Page
```
/strategies/new
```

### Step 2: Choose Strategy Type
| Basic (6) | Advanced (10) |
|-----------|---------------|
| RSI | Stochastic |
| MACD | Williams %R |
| Bollinger Bands | CCI |
| Moving Average | Ichimoku |
| Momentum | VWAP |
| ATR | OBV |
| | ADX |
| | ROC |
| | Keltner |
| | Supertrend |

### Step 3: Configure Parameters
- Each strategy has specific parameters
- Use Quick Presets: Conservative/Balanced/Aggressive
- See help text for parameter guidance

### Step 4: Create & View
- Strategy appears on `/strategies` page
- Click "View" to see details
- Click "Edit" to modify
- Click "Delete" to remove

---

## 16 Strategies - Quick Guide

### Momentum Strategies (5)
- **RSI** - Overbought/oversold levels
- **MACD** - Momentum crossovers
- **Stochastic** - %K/%D oscillation
- **Williams %R** - Price position
- **ROC** - Rate of change

### Trend Strategies (4)
- **Moving Average** - 3-line crossover
- **Ichimoku** - All-in-one trend system
- **ADX** - Trend strength
- **Supertrend** - Trend direction shifts

### Volatility Strategies (3)
- **Bollinger Bands** - Band breakouts
- **ATR** - Volatility levels
- **Keltner Channel** - Dynamic bands

### Volume Strategies (2)
- **OBV** - Volume accumulation
- **VWAP** - Volume-weighted price

### Price Strategies (1)
- **CCI** - Cyclical extremes

### Advanced (1)
- **Combined** - Multi-strategy AND/OR

---

## Strategy Parameters - Typical Ranges

### RSI
| Preset | Period | Oversold | Overbought |
|--------|--------|----------|-----------|
| Conservative | 14 | 25 | 75 |
| Balanced | 14 | 30 | 70 |
| Aggressive | 14 | 35 | 65 |

### MACD
| Preset | Fast | Slow | Signal |
|--------|------|------|--------|
| Default | 12 | 26 | 9 |

### Bollinger Bands
| Preset | Period | Std Dev |
|--------|--------|---------|
| Sensitive | 15 | 1.5 |
| Standard | 20 | 2.0 |
| Loose | 25 | 2.5 |

---

## Navigation

### Sidebar Menu
```
Dashboard    /
Signals      /signals
Strategies   /strategies
Backtest     /backtest
Portfolio    /portfolio
Settings     /settings
```

### Create New
- Strategy: /strategies/new
- Account: /signup
- Login: /login

---

## Strategy Workflow

### 1. Create
```
/strategies/new → Select type → Set parameters → Save
```

### 2. Monitor
```
/signals → View signals → Check status → Manage trades
```

### 3. Backtest
```
/backtest → Select strategy → Set date range → Run test
```

### 4. Track
```
/portfolio → View trades → Monitor P&L → Close positions
```

### 5. Optimize
```
/strategies/[id] → Edit parameters → Save → Retest
```

---

## Common Tasks

### View a Strategy
1. Go to `/strategies`
2. Find strategy in list
3. Click "View" button
4. See details and parameters

### Edit a Strategy
1. Go to `/strategies`
2. Click "View" on strategy
3. Click "Edit" button
4. Modify name/description/status
5. Click "Save Changes"

### Delete a Strategy
1. Go to `/strategies`
2. Click "Delete" button (on card)
   OR click "View" → "Delete"
3. Confirm deletion
4. Strategy removed

### Create Combined Strategy
1. Go to `/strategies/new`
2. Select "Combined Strategy"
3. Choose AND (all) or OR (any)
4. Select 2+ strategies to combine
5. Name and create

---

## API Quick Reference

### Authentication Required
All API calls must be authenticated (automatic in frontend)

### Key Endpoints
```
GET    /api/strategies         - List strategies
POST   /api/strategies         - Create strategy
GET    /api/strategies/[id]    - Get strategy details
PUT    /api/strategies/[id]    - Update strategy
DELETE /api/strategies/[id]    - Delete strategy
```

### Returns
- Success: `{ success: true, data: {...} }`
- Error: `{ success: false, error: "message" }`

---

## Troubleshooting Quick Tips

### "Unauthorized" / "Not logged in"
- Go to `/login`
- Enter credentials
- Check admin code if creating account

### Strategy not saving
- Check all required fields filled
- Verify parameters are in valid ranges
- Check browser console for errors

### Can't create strategy
- Need to be logged in
- Check form validation errors
- Verify strategy name isn't empty

### Strategies not showing
- Refresh page
- Check if any filters applied
- Try logging out and back in

### Authentication errors
- Clear browser cookies
- Logout from `/login` page
- Try again

---

## Keyboard Shortcuts (Coming Soon)
- `Ctrl+N` - New strategy
- `Ctrl+S` - Save strategy
- `Ctrl+D` - View dashboard
- `Ctrl+,` - Settings

---

## Performance Tips

### For Best Results:
1. **Use Conservative Preset** first
2. **Backtest** before going live
3. **Monitor Signals** page frequently
4. **Update Settings** for scan intervals
5. **Review Portfolio** daily

### Strategy Tuning:
- Conservative = Fewer, higher-quality signals
- Balanced = Mix of signals
- Aggressive = More signals, more false positives

---

## Support Resources

| Need Help With | Resource |
|---------------|----------|
| Authentication | AUTH_GUIDE.md |
| Strategies | STRATEGY_REFERENCE.md |
| Getting Started | README.md |
| Changes | CHANGELOG.md |
| Full Details | IMPLEMENTATION_SUMMARY.md |
| This Card | QUICK_REFERENCE.md |

---

## Environment Setup

### Required Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ADMIN_CODE=...
```

### Set in Vercel:
1. Project Settings
2. Environment Variables
3. Add above variables
4. Redeploy

---

## Dates & Times

- **Last Updated**: 2026-02-25
- **Version**: 2.1.0
- **Next Release**: TBD

---

## Key Contacts

- System Admin: [Your Team]
- Technical Support: [Support Channel]
- Bug Reports: [Issue Tracker]

---

**Print this card or bookmark for quick reference!**

