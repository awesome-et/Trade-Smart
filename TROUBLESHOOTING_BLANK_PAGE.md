# Blank Page Troubleshooting Guide

If you're seeing a blank page when loading the Trading Strategy Engine, follow these steps to diagnose and fix the issue.

## Quick Fixes

### 1. Clear Browser Cache and Hard Refresh
```
Press: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
Or: Open DevTools (F12) → Right-click refresh → Select "Empty cache and hard refresh"
```

### 2. Check Browser Console for Errors
```
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for any error messages in red
4. Take note of the error and refer to the sections below
```

### 3. Verify Authentication
The app redirects unauthenticated users to /login:
- If you see a blank page instead of login, there's a server issue
- Try accessing: `http://localhost:3000/login` directly

### 4. Check Server Health
```
Open: http://localhost:3000/api/health
You should see: { "status": "ok", "timestamp": "..." }
If you see an error, the server isn't running properly
```

## Common Issues & Solutions

### Issue: "Cannot find module 'zerodha-kiteconnect'"
**Solution:**
- The file exists but may have import errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Restart dev server: `pnpm dev`

### Issue: "hydration mismatch" in console
**Solution:**
- We've added `suppressHydrationWarning` to the HTML tag
- Clear cache and hard refresh
- If persists, run: `pnpm dev --turbo` (with Turbopack)

### Issue: "Sidebar component errors"
**Solution:**
- The sidebar is now in a separate layout for authenticated routes
- All dashboard pages are now in /app/(app)/ directory
- This prevents sidebar from rendering on login page

### Issue: "API returns 401 Unauthorized"
**Solution:**
- You must be logged in first
- Navigate to login page: `/login`
- Demo credentials: `demo@trading.com` / `demo123456`
- After login, you'll have access to all APIs

### Issue: "Cannot read property of undefined" errors
**Solution:**
- One or more components are trying to fetch data before authentication
- We've added error boundaries to catch these errors
- Check the Component Error section below

## Component-Specific Issues

### DashboardStats Component
- **Issue:** "Cannot read property 'count' of undefined"
- **Fix:** Component now has proper loading states and null checks

### SignalsList Component
- **Issue:** Empty list showing instead of signals
- **Fix:** No signals yet - try creating a strategy and running a market scan first

### Sidebar Navigation
- **Issue:** Links not working or navigation failing
- **Fix:** All pages now in (app) route group, sidebar in separate layout

## Browser Console Debug Steps

1. **Check if user is authenticated:**
```javascript
// Run in console:
fetch('/api/health').then(r => r.json()).then(console.log)
// Should show: {status: 'ok', timestamp: '...'}
```

2. **Check if strategies are loading:**
```javascript
// Run in console:
fetch('/api/strategies').then(r => r.json()).then(console.log)
// Should show array of strategies or 401 if not authenticated
```

3. **Check auth status:**
```javascript
// Open in new tab:
http://localhost:3000/api/auth/session
// Should show user session info or redirect to login
```

## Network Tab Debug

1. Open DevTools → Network tab
2. Reload the page
3. Look for failed requests (red X):
   - Check `/api/strategies` response
   - Check `/api/signals` response
   - Check any CSS/JS with 404 errors
4. Click on failed request to see error details

## If None of These Work

### Reset Everything
```bash
# 1. Stop the dev server (Ctrl+C)
# 2. Clear all caches
rm -rf .next node_modules pnpm-lock.yaml

# 3. Reinstall and restart
pnpm install
pnpm dev
```

### Check Server Logs
Look for these in the terminal output:
```
- Database connection errors
- Missing environment variables
- Import/syntax errors
```

### Verify Environment Setup
```bash
# Check these environment variables exist:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# If empty, they need to be set up
```

## Zerodha Integration Issues

If blank page appears only after configuring Zerodha credentials:

1. **KiteConnect import failing:**
   - Ensure `js-sha256` is installed: `pnpm install js-sha256`
   - Restart dev server

2. **API call timeout:**
   - Check internet connection
   - Zerodha API might be down
   - Try with mock data disabled in settings

3. **Access token invalid:**
   - Re-authenticate in settings: `/settings`
   - Generate fresh credentials from Zerodha

## Still Having Issues?

Check the browser console output and share these details:
1. Full error message from console
2. Network tab response (for failed API calls)
3. Is authentication working? (Can you access /login?)
4. Are other pages accessible? (Try /api/health)

The error will most likely be in the browser console - that's the best place to look for what's actually going wrong!
