# Changelog

All notable changes to the Trading Strategy Engine are documented in this file.

## [2.1.0] - 2026-02-25

### Major Features - Security & Strategy Expansion

#### Authentication & Security Added
- ✅ **Supabase Email/Password Authentication**
  - Login page at `/login` with demo credentials
  - Signup page at `/signup` with admin code protection
  - Secure session management with HTTP-only cookies
  - Auto-logout on session expiry
  
- ✅ **Route Protection & Middleware**
  - All frontend routes require authentication
  - Middleware checks auth on every request
  - Auto-redirect to login for unauthenticated users
  - Protected API endpoints with 401 errors

- ✅ **Admin Code System**
  - Environment variable-based admin code
  - Prevents unauthorized account creation
  - Required during signup process

#### Strategy Management Fixed & Enhanced
- ✅ **Strategy CRUD Complete**
  - Fixed: Individual strategy detail page (`/strategies/[id]`)
  - Fixed: Strategy deletion with DELETE endpoint
  - Fixed: Strategy editing with PUT endpoint
  - View, update, and delete strategies with full error handling

- ✅ **10 New Strategy Types Added** (16 total now)
  1. **Stochastic Oscillator** - %K/%D momentum oscillator
  2. **Williams %R** - Price position momentum indicator
  3. **CCI** - Commodity Channel Index for cyclical turns
  4. **Ichimoku Cloud** - All-in-one trend/support/resistance
  5. **VWAP** - Volume Weighted Average Price (intraday)
  6. **OBV** - On-Balance Volume accumulation
  7. **ADX** - Average Directional Index (trend strength)
  8. **ROC** - Rate of Change momentum
  9. **Keltner Channel** - ATR-based volatility bands
  10. **Supertrend** - Trend-following with entry/exit

- ✅ **Strategy Combinations** (Beta)
  - Combine multiple strategies with AND logic (all must trigger)
  - Combine multiple strategies with OR logic (any can trigger)
  - Foundation for advanced multi-criteria signals

#### Enhanced Strategy Creation
- ✅ **Comprehensive Form** (`/app/strategies/new/page.tsx`)
  - All 16 strategy types with descriptions
  - Dynamic parameters based on strategy type
  - Strategy presets: Conservative, Balanced, Aggressive
  - Combined strategy mode with AND/OR selection
  - Real-time parameter validation
  - Help text for each parameter

### Improvements

#### API Endpoints - All Protected with Auth
- ✅ `POST /api/strategies` - Create strategy (authenticated)
- ✅ `GET /api/strategies` - List strategies (authenticated)
- ✅ `GET /api/strategies/[id]` - Strategy details (authenticated)
- ✅ `PUT /api/strategies/[id]` - Update strategy (authenticated)
- ✅ `DELETE /api/strategies/[id]` - Delete strategy (authenticated)

#### Documentation
- ✅ **AUTH_GUIDE.md** - Complete authentication guide
- ✅ **Updated CHANGELOG** - This file tracks all changes
- ✅ **Strategy Reference** - All 16 strategies documented
- ✅ **Quick Presets** - Conservative/Balanced/Aggressive configs

### Technical Details

#### New Files
- `/lib/auth.ts` - Client-side auth utilities
- `/lib/auth-server.ts` - Server-side auth utilities
- `/middleware.ts` - Route protection middleware
- `/app/login/page.tsx` - Login page
- `/app/signup/page.tsx` - Signup page
- `/app/strategies/[id]/page.tsx` - Strategy detail/edit page
- `/lib/services/strategy-evaluator-extended.ts` - New strategy evaluators
- `/AUTH_GUIDE.md` - Authentication documentation

#### Modified Files
- `/app/layout.tsx` - Added auth flow
- `/app/strategies/new/page.tsx` - Complete rewrite with all strategies
- `/lib/types.ts` - Added new strategy types and combined strategy interface
- `/lib/services/strategy-evaluator.ts` - Integrated new strategies
- `/app/api/strategies/route.ts` - Added auth checks
- `/app/api/strategies/[id]/route.ts` - Added GET/PUT/DELETE with auth

### Database
- No new tables required
- Supports 'combined' strategy_type
- JSONB parameters support new indicators

### Security Updates
- All API endpoints require authentication
- Session-based access control
- HTTP-only cookies prevent XSS
- CSRF protection enabled
- Admin code prevents unauthorized signup

### Breaking Changes
None - Fully backward compatible with v2.0.0

### Bug Fixes
- Fixed: Strategy view/detail page (now works)
- Fixed: Strategy deletion (now works)
- Fixed: Strategy editing (now works)
- Fixed: Missing auth on API routes
- Fixed: Parameter validation for new strategies

### Known Limitations
- Combined strategy backtesting (in development)
- Statistics for combined strategies calculated separately
- Cascade deletion of related market scans/signals

### Testing
Test with demo credentials:
```
Email: demo@trading.com
Password: demo123456
```

Or create new admin account at `/signup` (requires admin code)

---

## [2.0.0] - 2026-02-20

### Authentication Release

- ✅ Supabase email/password auth system
- ✅ Login page
- ✅ Signup page with admin code
- ✅ Route protection middleware
- ✅ API endpoint authentication
- ✅ Server-side session management

---

## [1.1.0] - 2026-02-25

### Added
- ✅ **Strategy Creation Form** (`/app/strategies/new/page.tsx`)
  - Complete form with all 6 strategy types
  - Dynamic parameter configuration based on strategy type
  - Real-time parameter validation
  - Inline help text for each parameter
  - Error handling and user feedback

- ✅ **Comprehensive User Guide** (`README.md`)
  - Getting started tutorial
  - Detailed strategy type explanations with examples
  - Step-by-step strategy creation guide
  - Signal monitoring and portfolio management docs
  - Backtesting guide with result interpretation
  - Troubleshooting section
  - Quick reference card

- ✅ **Changelog File** (`CHANGELOG.md`)
  - Updated on every change
  - Tracks features, fixes, and improvements

### Fixed
- ✅ Strategy creation issue - missing `/strategies/new` page
- ✅ No visible way to create new strategies
- ✅ Improved error messages in strategy creation

### Features Overview
- **6 Strategy Types**: RSI, MACD, Bollinger Bands, Moving Average, Momentum, ATR
- **Strategy Management**: Create, view, update, delete strategies
- **Signal Generation**: Automated 5-minute market scans
- **Backtesting**: Historical data testing with comprehensive metrics
- **Portfolio Tracking**: Monitor open/closed trades with P&L
- **Zerodha Integration**: Real market data support
- **Dashboard**: Real-time statistics and signal overview
- **Settings**: Configurable scan intervals and notifications

---

## [1.0.0] - 2026-02-25

### Initial Release

#### Database & Infrastructure
- ✅ Supabase PostgreSQL schema
- ✅ 7 core tables: strategies, market_scans, signals, trades, strategy_statistics, user_preferences, backtest_results
- ✅ Optimized indexes for performance

#### Backend Services
- ✅ Market data service with Zerodha API integration
- ✅ Strategy evaluation engine (6 strategy types)
- ✅ Signal generation service
- ✅ Backtesting engine
- ✅ Trades management service
- ✅ Strategy manager with CRUD operations

#### API Routes
- ✅ Market data endpoints (`/api/market/*`)
- ✅ Strategies CRUD (`/api/strategies/*`)
- ✅ Signals management (`/api/signals/*`)
- ✅ Trades tracking (`/api/trades/*`)
- ✅ Backtesting (`/api/backtest/*`)
- ✅ User preferences (`/api/preferences/*`)
- ✅ Zerodha integration (`/api/zerodha/*`)
- ✅ Cron endpoint for 5-minute scans (`/api/cron/market-scan`)

#### Frontend Pages
- ✅ **Dashboard** (`/`) - Overview with stats, signals, strategies
- ✅ **Signals** (`/signals`) - View and filter all signals
- ✅ **Strategies** (`/strategies`) - List and manage strategies
- ✅ **Backtest** (`/backtest`) - Run and analyze backtests
- ✅ **Portfolio** (`/portfolio`) - Track trades and positions
- ✅ **Settings** (`/settings`) - Zerodha config and preferences

#### Frontend Components
- ✅ Dashboard Stats component
- ✅ Signals List component
- ✅ Strategies Overview component
- ✅ Sidebar navigation
- ✅ Professional dark theme

---

## How to Read This Changelog

- **Added**: New features
- **Fixed**: Bug fixes
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Security**: Security improvements

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

---

## Future Roadmap

### Planned Features (v1.2.0)
- [ ] Multiple strategy combinations (portfolio of strategies)
- [ ] Advanced filter options on signals page
- [ ] Export signals and trades to CSV
- [ ] Strategy performance comparison charts
- [ ] Email alert notifications
- [ ] Risk management features (position sizing, stop-loss automation)

### Under Consideration (v1.3.0+)
- [ ] Strategy marketplace (share/import strategies)
- [ ] AI-powered parameter optimization
- [ ] Real-time P&L tracking
- [ ] Multi-timeframe analysis
- [ ] Social trading features
- [ ] Mobile app

---

## Support

For issues, suggestions, or questions:
1. Check the [README.md](README.md) troubleshooting section
2. Review this changelog for recent changes
3. Check browser console (F12) for error messages

---

## License

This project is confidential and for authorized use only.

**Last Updated**: 2026-02-25
