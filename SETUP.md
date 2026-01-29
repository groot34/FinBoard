# Finance Dashboard - Detailed Setup Guide

This guide provides step-by-step instructions for setting up the Finance Dashboard on your local Windows machine.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Initial Setup](#initial-setup)
3. [Getting API Keys](#getting-api-keys)
4. [Testing the Application](#testing-the-application)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Advanced Configuration](#advanced-configuration)

## 🖥️ System Requirements

### Required Software

- **Node.js** 20.x or higher
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
  
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

- **Git** (if cloning from repository)
  - Download from: https://git-scm.com/

### Recommended

- **Visual Studio Code** or any code editor
- **Modern web browser** (Chrome, Firefox, Edge)

## 🚀 Initial Setup

### Step 1: Navigate to Project Directory

Open Command Prompt or PowerShell and navigate to your project:

```bash
cd d:\Assignemt\Finance-Dashboard-Custom
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install all dependencies including:
- React 18.3.1
- TypeScript 5.6.3
- Vite 7.3.0
- Tailwind CSS 3.4.17
- Zustand (state management)
- Recharts (charting library)
- And many more...

**Expected Duration**: 2-5 minutes depending on your internet connection

### Step 3: Create Environment File

The easiest way:

```bash
npm run setup:env
```

Or manually:

```bash
copy .env.example .env
```

### Step 4: Configure Environment Variables (Optional)

Open `.env` in your text editor:

```env
PORT=5000
NODE_ENV=development

# Optional API Keys
INDIAN_STOCK_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
```

**Note**: API keys are optional! You can:
1. Add them to the `.env` file for automatic injection, OR
2. Add them manually when creating widgets using the Custom Headers feature

### Step 5: Start the Development Server

```bash
npm run dev
```

You should see output like:

```
 ▲ Next.js 14.2.35
 - Local:        http://localhost:5000
 - Environments: .env
 ✓ Starting...
 ✓ Ready in 2.5s
```

### Step 6: Open in Browser

Navigate to: **http://localhost:5000**

You should see the Finance Dashboard with an empty state inviting you to add your first widget!

## 🔑 Getting API Keys

### Alpha Vantage (Recommended - Free Tier Available)

**Best for**: Stock quotes, forex, cryptocurrencies

1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter your email address
3. Click "GET FREE API KEY"
4. Check your email for the API key
5. **Free tier**: 25 requests per day, 5 requests per minute

**Example API URL**:
```
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=YOUR_API_KEY
```

**How to use**:
- Option 1: Add to `.env` as `ALPHA_VANTAGE_API_KEY=your_key`
- Option 2: Include in the URL as shown above
- Option 3: Add as custom header when creating widget

### Finnhub (Free Tier Available)

**Best for**: Real-time stock data, news, financial statements

1. Visit: https://finnhub.io/register
2. Sign up with email or Google
3. Verify your email
4. Find your API key in the dashboard
5. **Free tier**: 60 API calls per minute

**Example API URL**:
```
https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY
```

**How to use**:
- Option 1: Add to `.env` as `FINNHUB_API_KEY=your_key`
- Option 2: Include in the URL as shown above
- Option 3: Add as custom header `X-Finnhub-Token: your_key`

### IndianAPI (For Indian Stock Market)

**Best for**: NSE and BSE stock data

1. Visit: https://indianapi.in/
2. Sign up for an account
3. Navigate to the API section
4. Generate an API key
5. **Pricing**: Check current pricing on their website

**Example API URL**:
```
https://stock.indianapi.in/nse_stocks
```

**How to use**:
- Option 1: Add to `.env` as `INDIAN_STOCK_API_KEY=your_key`
- Option 2: Add as custom header `X-Api-Key: your_key` when creating widget

### CoinGecko (No API Key Required for Basic Use!)

**Best for**: Cryptocurrency prices and market data

**No registration required** for basic endpoints!

**Example API URLs**:

Bitcoin price in USD:
```
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true
```

Multiple cryptocurrencies:
```
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true
```

**Rate limits**: 10-50 calls/minute depending on endpoint

### Yahoo Finance (No API Key Required!)

**Best for**: Stock quotes, historical data

**No registration required!**

**Example API URLs**:

Stock chart data:
```
https://query1.finance.yahoo.com/v8/finance/chart/AAPL
```

**Note**: Yahoo Finance doesn't have official API documentation, but these endpoints are widely used.

## 🧪 Testing the Application

### Test 1: Add a CoinGecko Widget (No API Key Required)

1. Click **"+ Add Widget"**
2. Fill in:
   - **Name**: Bitcoin Price
   - **API URL**: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`
3. Click **"Test Connection"**
4. You should see the JSON response
5. Select fields like `bitcoin.usd` and `bitcoin.usd_24h_change`
6. Set **Display Mode**: Card
7. Set **Refresh Interval**: 30 seconds
8. Click **"Add Widget"**

✅ **Expected Result**: A card displaying Bitcoin's current USD price and 24h change%

### Test 2: Add an Alpha Vantage Widget (Requires Free API Key)

1. Get your free Alpha Vantage API key (see above)
2. Click **"+ Add Widget"**
3. Fill in:
   - **Name**: Tesla Stock Quote
   - **API URL**: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSLA&apikey=YOUR_API_KEY`
4. Click **"Test Connection"**
5. Select fields from `Global Quote` like:
   - `Global Quote.05. price`
   - `Global Quote.09. change`
   - `Global Quote.10. change percent`
6. Set **Display Mode**: Card
7. Click **"Add Widget"**

✅ **Expected Result**: A card showing Tesla's current stock price and change

### Test 3: Test Drag and Drop

1. Add 2-3 widgets
2. Click and hold on a widget's header
3. Drag it to a new position
4. Release to drop

✅ **Expected Result**: Widgets rearrange smoothly

### Test 4: Test Persistence

1. Create a custom dashboard with multiple widgets
2. Close the browser tab
3. Reopen http://localhost:5000

✅ **Expected Result**: Your dashboard is exactly as you left it

## 🔧 Common Issues & Solutions

### Issue 1: `npm install` fails

**Error**: Package installation errors

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Issue 2: Port 5000 already in use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution 1** - Use a different port:
Edit `.env`:
```env
PORT=3000
```

**Solution 2** - Kill the process using port 5000:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 3: TypeScript errors in IDE

**Error**: Red squiggly lines everywhere showing "Cannot find module..."

**Solution**: These errors are normal before installation. Run:
```bash
npm install
```

The errors should disappear after all dependencies are installed.

### Issue 4: API returns CORS error

**Error**: "CORS policy blocked..."

**Solution**: The Finance Dashboard includes a built-in proxy server that handles CORS automatically. Make sure you're:
1. Using the "Test Connection" feature first
2. The API domain is in the allowed list
3. If needed, the domain can be added to `server/routes.ts` in the `ALLOWED_DOMAINS` array

### Issue 5: API rate limit exceeded

**Error**: "Rate limit exceeded. Please try again in X seconds"

**Solution**:
1. Wait for the rate limit to reset
2. Increase your widget refresh intervals
3. Get an API key for higher limits
4. Use caching (automatically enabled - 10s cache TTL)

### Issue 6: Widget shows "No data available"

**Possible Causes & Solutions**:

1. **Invalid API URL**
   - Test the URL in the "Test Connection" feature
   - Verify the URL in a browser or Postman

2. **API requires authentication**
   - Add your API key to the URL or custom headers
   - Check the API provider's documentation

3. **No fields selected**
   - Open widget settings
   - Select at least one field from the field explorer

4. **API is down or slow**
   - Check the API provider's status page
   - Try again later

## ⚙️ Advanced Configuration

### Changing the Server Port

Edit `.env`:
```env
PORT=8080
```

Restart the server:
```bash
npm run dev
```

### Adding Custom Allowed Domains

If you want to use an API that's not in the whitelist:

1. Open `lib/server-utils.ts`
2. Find the `ALLOWED_DOMAINS` array (around line 46)
3. Add your domain:
```typescript
const ALLOWED_DOMAINS = [
  "alphavantage.co",
  // ... existing domains ...
  "your-new-api.com",  // Add this
];
```
4. Restart the server

### Adjusting Cache TTL

To change how long API responses are cached:

1. Open `lib/server-utils.ts`
2. Find `const CACHE_TTL = 10000;` (line 17)
3. Change the value (in milliseconds):
```typescript
const CACHE_TTL = 30000; // 30 seconds cache
```

### Modifying Rate Limits

To adjust rate limiting:

1. Open `lib/server-utils.ts`
2. Modify these constants:
```typescript
const RATE_LIMIT_WINDOW = 60000; // Time window in ms (60 seconds)
const RATE_LIMIT_MAX_REQUESTS = 30; // Max requests per window
```

## 📊 Project Checklist

Use this checklist to verify your setup:

- [ ] Node.js 20.x+ installed
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Browser loads http://localhost:5000
- [ ] Can add a widget with CoinGecko (no API key)
- [ ] Can add a widget with Alpha Vantage (with API key)
- [ ] Widgets display data correctly
- [ ] Can drag and drop widgets
- [ ] Dashboard persists after browser refresh
- [ ] No console errors in browser developer tools

## 🎓 Next Steps

Once everything is working:

1. **Explore Different APIs**: Try various financial APIs
2. **Customize Your Dashboard**: Create widgets that matter to you
3. **Experiment with Display Modes**: Try Card, Table, and Chart modes
4. **Export Your Configuration**: Save your dashboard as JSON
5. **Deploy to Production**: Use Vercel, Netlify, or another hosting service

## 📚 Additional Resources

- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)

---

**Need Help?** Check the [Troubleshooting](#common-issues--solutions) section or review the main [README.md](README.md)
