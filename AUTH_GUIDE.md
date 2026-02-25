# Trading Strategy Engine - Authentication & Security Guide

## Overview

The Trading Strategy Engine now includes enterprise-grade authentication and security features to protect your trading strategies and market data.

---

## Authentication System

### Supabase Auth

The platform uses **Supabase Authentication** (built on PostgreSQL) to manage user access:

- **Email/Password**: Secure login system
- **Session Management**: Automatic session handling with HTTP-only cookies
- **Protected Routes**: All API endpoints and pages require authentication
- **Auto-Logout**: Sessions expire for security

---

## Getting Started

### First-Time Admin Account Setup

1. Navigate to `/signup` (or click "Create Account" from login page)
2. Enter your admin email (e.g., `admin@mytrading.com`)
3. Enter the **Admin Code** (provided by system administrator)
4. Create a strong password (minimum 6 characters, recommended 12+)
5. Confirm password and click "Create Admin Account"
6. Confirm your email if required
7. Return to `/login` and sign in

#### Demo Credentials (for Testing)
```
Email: demo@trading.com
Password: demo123456
```

### Logging In

1. Go to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### Logging Out

1. Click your profile icon (top-right sidebar - coming soon)
2. Select "Sign Out"
3. You'll be redirected to the login page

---

## Admin Code Configuration

### Setting the Admin Code

The admin code prevents unauthorized account creation. Set it in your environment variables:

```bash
NEXT_PUBLIC_ADMIN_CODE=your-secret-admin-code
```

**Important**: 
- Change this code regularly
- Use a strong, unique code
- Don't share it publicly
- Never commit it to version control

### Creating Additional Admins

1. Share the admin code with trusted team members
2. They visit `/signup` and enter:
   - Their email
   - The admin code
   - Their password

---

## Protected Routes

### Frontend Routes (Require Login)
- `/` - Dashboard
- `/strategies` - Strategy management
- `/strategies/new` - Create new strategy
- `/strategies/[id]` - Strategy details
- `/signals` - Signal monitoring
- `/backtest` - Backtesting engine
- `/portfolio` - Portfolio tracking
- `/settings` - Configuration

### Public Routes (No Login Required)
- `/login` - Login page
- `/signup` - Admin account creation

### API Routes (Require Authentication Header)
All API endpoints require valid Supabase authentication:

```bash
# GET /api/strategies - Fetch all strategies
# POST /api/strategies - Create new strategy
# GET /api/strategies/[id] - Get strategy details
# PUT /api/strategies/[id] - Update strategy
# DELETE /api/strategies/[id] - Delete strategy
# And all other market data, signals, trades, and backtest endpoints
```

#### Making Authenticated API Requests

The frontend automatically includes authentication. For external API calls:

```javascript
const { data: { session } } = await supabase.auth.getSession()

fetch('/api/strategies', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
})
```

---

## Security Best Practices

### Password Policy

- Minimum 6 characters (12+ recommended)
- Use mix of uppercase, lowercase, numbers, symbols
- Never reuse passwords
- Change password regularly

### API Key Security

- Zerodha credentials are encrypted and stored server-side
- Never share API keys in logs or frontend code
- Rotate API keys periodically
- Use API key restrictions if available

### Session Management

- Sessions expire automatically
- HTTP-only cookies prevent XSS attacks
- CSRF protection enabled
- Secure cookie transmission over HTTPS

### Data Protection

- All communication is encrypted (HTTPS)
- Database uses Supabase's built-in encryption
- Row-level security policies protect data
- Audit logs track all changes

---

## Troubleshooting

### "Invalid Admin Code"

**Problem**: Admin code rejected during signup

**Solution**:
1. Verify the admin code is correct
2. Check for typos or extra spaces
3. Confirm the code hasn't been changed
4. Ask the system administrator for the current code

### "Email Already in Use"

**Problem**: Email address is already registered

**Solution**:
1. Use a different email address
2. Or recover your password if you forgot it (feature coming soon)
3. Contact admin to reset your account

### "Session Expired"

**Problem**: Logged out suddenly while working

**Solution**:
1. Refresh the page
2. Log in again
3. Check your internet connection
4. Clear browser cookies and try again

### "Unauthorized - 401 Error"

**Problem**: API request failing with 401 status

**Solution**:
1. Ensure you're logged in
2. Clear browser cache and cookies
3. Log out and log back in
4. Check browser console for auth errors

### "Protected Route Redirect"

**Problem**: Redirected to login when accessing protected page

**Solution**:
1. You're not authenticated - log in first
2. Check if your session expired
3. Clear browser cookies
4. Try logging in again

---

## Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin Code (for account creation)
NEXT_PUBLIC_ADMIN_CODE=your-secret-code
```

---

## Advanced Topics

### Session Persistence

Sessions are automatically persisted in browser storage. To clear session:

```javascript
import { createClient } from '@/lib/auth'

const supabase = createClient()
await supabase.auth.signOut()
```

### Custom Auth Flows

The auth utilities are in `/lib/auth.ts` and `/lib/auth-server.ts`:

```javascript
import { signIn, signUp, signOut, getCurrentUser } from '@/lib/auth'

// Sign in
const { data, error } = await signIn(email, password)

// Get current user
const { data, error } = await getCurrentUser()
```

### Middleware & Route Protection

Middleware is configured in `/middleware.ts`:

- Intercepts all requests
- Checks user authentication
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages

---

## Support

For authentication issues:

1. Check this guide's Troubleshooting section
2. Review browser console for error messages
3. Check Supabase dashboard for account status
4. Contact system administrator

---

## Changelog

### v2.0.0 - Authentication Added
- Added Supabase email/password authentication
- Implemented route protection and middleware
- Created login and signup pages
- Protected all API endpoints
- Added admin code system
- Session management with cookies
- HTTPS-only secure sessions

