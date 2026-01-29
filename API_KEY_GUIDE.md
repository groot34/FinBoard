# API Key Handling Guide - Finance Dashboard

## Overview

The Finance Dashboard supports **three flexible methods** for handling API keys, allowing users to connect to **any financial API** without requiring pre-configuration. This approach solves the "unpredictable API" problem elegantly.

## 🎯 The Three Methods

### Method 1: Custom Headers (Most Flexible) ⭐ **RECOMMENDED**

#### How It Works
Users can add custom HTTP headers when creating a widget. This is the **most flexible** approach because:
- ✅ Works with **any API** (no pre-configuration needed)
- ✅ Each widget can have different authentication
- ✅ Supports any header format (API keys, Bearer tokens, etc.)
- ✅ Secure (headers stored with widget config, values are password-masked in UI)

#### User Experience
1. Click "+ Add Widget"
2. Enter API URL
3. Click "Custom Headers (API Keys, Auth)"
4. Add header(s):
   - **Header Name**: `X-API-Key`, `Authorization`, `X-Finnhub-Token`, etc.
   - **Value**: The actual API key (password field)
5. Click "Test API" to verify
6. Select fields and add widget

#### Code Implementation

**File**: `client/src/components/dashboard/AddWidgetModal.tsx`

```typescript
// State for custom headers (line 36)
const [customHeaders, setCustomHeaders] = useState<CustomHeader[]>([]);

// Adding headers to the widget config (lines 123-132)
const validHeaders = customHeaders.filter(h => h.key && h.value);

const widget: InsertWidget = {
  name,
  apiUrl,
  customHeaders: validHeaders.length > 0 ? validHeaders : undefined,
  refreshInterval,
  displayMode,
  selectedFields,
};
```

**File**: `server/routes.ts` (lines 156-163)

```typescript
// Server automatically includes custom headers in API requests
if (customHeaders) {
  for (const header of customHeaders) {
    if (header.key && header.value) {
      headers[header.key] = header.value;
    }
  }
}
```

#### Examples

**Alpha Vantage**:
- Header: `X-API-Key`
- Value: `YOUR_ALPHA_VANTAGE_KEY`

**Finnhub**:
- Header: `X-Finnhub-Token`
- Value: `YOUR_FINNHUB_KEY`

**Generic Bearer Token**:
- Header: `Authorization`
- Value: `Bearer YOUR_TOKEN_HERE`

---

### Method 2: Environment Variable Auto-Injection (Convenience)

#### How It Works
For **commonly used APIs**, if the user adds the API key to the `.env` file, the server **automatically injects** it when making requests.

#### Currently Supported
- **IndianAPI**: `INDIAN_STOCK_API_KEY` → Auto-adds `X-Api-Key` header
- **Finnhub**: `FINNHUB_API_KEY` → Auto-adds `X-Finnhub-Token` header

#### User Experience
1. Add API key to `.env` file:
   ```env
   FINNHUB_API_KEY=your_actual_key_here
   ```
2. Restart server: `npm run dev`
3. When creating widgets with Finnhub URLs, the key is **automatically included**
4. User doesn't need to add custom headers manually

#### Code Implementation

**File**: `server/routes.ts` (lines 149-155)

```typescript
// Auto-inject API keys from environment variables
if (parsedUrl.hostname === "stock.indianapi.in" && process.env.INDIAN_STOCK_API_KEY) {
  headers["X-Api-Key"] = process.env.INDIAN_STOCK_API_KEY;
}

if ((parsedUrl.hostname === "finnhub.io" || parsedUrl.hostname === "api.finnhub.io") 
    && process.env.FINNHUB_API_KEY) {
  headers["X-Finnhub-Token"] = process.env.FINNHUB_API_KEY;
}
```

#### How to Add More APIs

To support auto-injection for additional APIs, edit `server/routes.ts`:

```typescript
// Add this around line 155
if (parsedUrl.hostname === "www.alphavantage.co" && process.env.ALPHA_VANTAGE_API_KEY) {
  headers["X-API-Key"] = process.env.ALPHA_VANTAGE_API_KEY;
}
```

Then update `.env.example`:
```env
# Alpha Vantage API
ALPHA_VANTAGE_API_KEY=your_key_here
```

---

### Method 3: URL Query Parameters (Simplest)

#### How It Works
Many APIs accept the API key directly in the URL as a query parameter.

#### User Experience
1. Include the API key in the URL when creating the widget
2. No custom headers needed
3. No environment variables needed

#### Examples

**Alpha Vantage**:
```
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=YOUR_KEY_HERE
```

**Polygon.io**:
```
https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-01-09?apiKey=YOUR_KEY
```

**IEX Cloud**:
```
https://cloud.iexapis.com/stable/stock/aapl/quote?token=YOUR_TOKEN
```

#### ⚠️ Security Consideration
This method is:
- ✅ Simple and requires no extra configuration
- ⚠️ Less secure (API key visible in widget config)
- ✅ Fine for demo/testing or personal dashboards
- ❌ Not recommended for production with sensitive keys

---

## 📊 Comparison Table

| Method | Flexibility | Security | Setup Complexity | Use Case |
|--------|------------|----------|------------------|----------|
| **Custom Headers** | ⭐⭐⭐⭐⭐ Any API | ⭐⭐⭐⭐ High | ⭐⭐⭐ Medium | Production, any API |
| **Env Variables** | ⭐⭐ Pre-configured only | ⭐⭐⭐⭐⭐ Highest | ⭐⭐ Easy | Common APIs, convenience |
| **URL Parameters** | ⭐⭐⭐⭐ Most APIs | ⭐⭐ Low | ⭐⭐⭐⭐⭐ Easiest | Testing, personal use |

---

## 🎯 Recommended Approach for Users

### For Most Users (Recommended Flow)

1. **Try without a key first** (e.g., CoinGecko, Yahoo Finance)
   ```
   https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
   ```

2. **If API requires authentication**, use Custom Headers:
   - Click "Custom Headers (API Keys, Auth)"
   - Add the appropriate header
   - Test connection
   - Add widget

3. **For frequently used APIs**, optionally add to `.env`:
   ```env
   FINNHUB_API_KEY=your_key_here
   ```

### For Different API Types

#### REST APIs with Header Authentication
→ **Use Custom Headers**
```
URL: https://api.example.com/data
Header: Authorization → Bearer YOUR_TOKEN
```

#### REST APIs with Query Parameter Auth
→ **Use URL Parameters**
```
URL: https://api.example.com/data?apikey=YOUR_KEY
```

#### APIs You Use Frequently
→ **Use Environment Variables** (if supported) or Custom Headers

---

## 🔐 Security Best Practices

### ✅ Do:
- Use **Custom Headers** for sensitive production APIs
- Store API keys in `.env` for frequently used APIs
- Use environment variables for team/shared deployments
- Password-mask header values in UI (already implemented)

### ❌ Don't:
- Hard-code API keys in the source code
- Share `.env` files in version control (already in `.gitignore`)
- Use URL parameters for highly sensitive keys in production

---

## 💡 Why This Approach Solves "Unpredictable API" Problem

### The Challenge
> "We cannot predict which API will the user insert"

### The Solution
By implementing **all three methods** simultaneously:

1. **Custom Headers** solve the fundamental problem:
   - Users can add ANY header for ANY API
   - No pre-configuration required
   - Works with APIs we've never heard of

2. **Environment Variables** provide convenience:
   - For popular APIs, one-time setup
   - Shared across all widgets using that API
   - Easy to add more as needed

3. **URL Parameters** offer simplicity:
   - Zero configuration for testing
   - Works immediately for supported APIs
   - Good for demos and personal use

### Real-World Example

**User wants to use "NewFinanceAPI.com" (not pre-configured)**:

1. Read API docs and see it needs `X-NewFinance-Key` header
2. Open Add Widget modal
3. Click "Custom Headers"
4. Add header: `X-NewFinance-Key` → `their_api_key`
5. Test connection → Success!
6. Widget works perfectly

**No code changes needed. No redeployment. Just works.**

---

## 🚀 Implementation Details

### How Custom Headers Flow Through the System

```
User Input (AddWidgetModal)
    ↓
Widget Config (Zustand Store)
    ↓
LocalStorage Persistence
    ↓
useWidgetData Hook
    ↓
POST /api/proxy (with customHeaders)
    ↓
Server Routes (fetchExternalApi)
    ↓
External API Request (headers included)
    ↓
Response back to Widget
```

### Data Schema

**File**: `shared/schema.ts`

```typescript
export const customHeaderSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const widgetConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiUrl: z.string().url(),
  customHeaders: z.array(customHeaderSchema).optional(), // ← Key feature
  refreshInterval: z.number().min(5).default(30),
  displayMode: displayModeSchema.default("card"),
  selectedFields: z.array(fieldSchema).default([]),
  // ... more fields
});
```

---

## 📚 User Documentation

### What to Tell Users

**In README.md** (already added):
> ### Widget Configuration
> - **Custom Headers**: Add API keys or authentication headers
> - **Refresh Interval**: Set auto-refresh from 5 seconds to any duration
> - **Field Selection**: Pick exactly which data points to display

**In SETUP.md** (already added):
> **How to use**:
> - Option 1: Add to `.env` as `INDIAN_STOCK_API_KEY=your_key`
> - Option 2: Include in the URL as shown above
> - Option 3: Add as custom header when creating widget

---

## 🎓 Teaching Example

Here's what you can add to your documentation:

### Example: Adding a Widget with API Key

**Scenario**: User wants to add Finnhub stock data

**Method 1 - Custom Headers** (Flexible):
```
1. URL: https://finnhub.io/api/v1/quote?symbol=AAPL
2. Click "Custom Headers (API Keys, Auth)"
3. Add Header:
   - Name: X-Finnhub-Token
   - Value: your_finnhub_api_key
4. Test Connection ✓
5. Select fields and add widget
```

**Method 2 - Environment Variable** (Convenient):
```
1. Add to .env: FINNHUB_API_KEY=your_finnhub_api_key
2. Restart server
3. URL: https://finnhub.io/api/v1/quote?symbol=AAPL
4. Test Connection ✓ (key auto-injected!)
5. Select fields and add widget
```

**Method 3 - URL Parameter** (Quick):
```
1. URL: https://finnhub.io/api/v1/quote?symbol=AAPL&token=your_key
2. Test Connection ✓
3. Select fields and add widget
```

All three methods work! Choose based on your needs.

---

## ✅ Conclusion

The **Custom Headers** feature already solves your concern about unpredictable APIs:

1. ✅ No need to predict which API users will use
2. ✅ Users can add authentication for ANY API
3. ✅ Works with any header format
4. ✅ Already fully implemented
5. ✅ Simple UI for non-technical users
6. ✅ Secure (password-masked, stored locally)

The system is **already designed** to handle any API the user wants to use. You don't need to modify anything - just document these three approaches clearly for users!
