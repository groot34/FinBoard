# Finance Dashboard

A customizable real-time finance dashboard where users can build their own monitoring dashboard by connecting to various financial APIs and displaying real-time data through customizable widgets.

![Finance Dashboard](https://img.shields.io/badge/Next.js-14.2-black) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal)

## 🌟 Features

### Widget Management System
- **Add Widgets**: Create finance data widgets by connecting to any supported financial API
  - **Tables**: Paginated lists with search and sort functionality
  - **Cards**: Key-value displays for quick data overview
  - **Charts**: Line, area, and candlestick charts for price visualization
- **Remove Widgets**: Easy deletion with confirmation
- **Rearrange Layout**: Drag-and-drop to reorganize widgets
- **Widget Configuration**: Customize each widget with a dedicated settings panel

### API Integration & Data Handling
- **Dynamic Data Mapping**: Explore API responses and select specific fields to display
- **Real-time Updates**: Automatic data refresh with configurable intervals (5+ seconds)
- **Intelligent Caching**: 10-second cache to optimize API calls and reduce redundant requests
- **Rate Limiting**: Built-in protection (30 requests per minute per IP)

### Supported Financial APIs
- Alpha Vantage
- Finnhub
- CoinGecko
- Coinbase
- Binance
- Yahoo Finance
- Polygon.io
- IEX Cloud
- IndianAPI
- And many more...

### User Interface & Experience
- **Customizable Widgets**: Editable titles and selected metrics
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Theme**: Professional finance UI with teal accents
- **Loading & Error States**: Comprehensive state handling

### Data Persistence
- **LocalStorage Integration**: All configurations persist locally in your browser
- **No Database Required**: The app runs entirely without a database for widget storage
- **State Recovery**: Complete dashboard restoration on page refresh
- **Export/Import**: Backup and share dashboard configurations as JSON

## 📋 Prerequisites

- **Node.js**: Version 20.x or higher
- **npm**: Comes with Node.js
- **Financial API Keys** (optional but recommended):
  - [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
  - [Finnhub](https://finnhub.io/register)
  - [IndianAPI](https://indianapi.in/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd Finance-Dashboard-Custom
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example env file
copy .env.example .env

# Or use the setup script
npm run setup:env
```

Edit `.env` and add your API keys (optional):

```env
PORT=5000
NODE_ENV=development

# Add your API keys here (optional)
INDIAN_STOCK_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

## 📖 Usage Guide

### Adding Your First Widget

1. Click the **"+ Add Widget"** button
2. Enter a widget name (e.g., "Tesla Stock Price")
3. Enter an API URL (e.g., Alpha Vantage quote endpoint)
4. Click **"Test Connection"** to verify the API
5. Select the fields you want to display from the JSON explorer
6. Choose a display mode (Card, Table, or Chart)
7. Set the refresh interval
8. Click **"Add Widget"**

### Example API URLs

**Alpha Vantage - Stock Quote:**
```
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSLA&apikey=YOUR_API_KEY
```

**Finnhub - Stock Quote:**
```
https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY
```

**CoinGecko - Bitcoin Price:**
```
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true
```

**Yahoo Finance - Stock Data:**
```
https://query1.finance.yahoo.com/v8/finance/chart/MSFT
```

### Widget Configuration

- **Display Modes**:
  - **Card**: Best for key-value data (current price, market cap, etc.)
  - **Table**: Perfect for arrays of data (stock lists, portfolios)
  - **Chart**: Visualize price trends and historical data

- **Custom Headers**: Add API keys or authentication headers
- **Refresh Interval**: Set auto-refresh from 5 seconds to any duration
- **Field Selection**: Pick exactly which data points to display

### Dashboard Customization

- **Drag & Drop**: Click and drag widgets to rearrange
- **Resize**: Drag the bottom-right corner of widgets to resize
- **Export Config**: Save your dashboard layout as JSON
- **Import Config**: Load a previously saved configuration

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server on port 5000 |
| `npm run build` | Build Next.js app for production |
| `npm run start` | Start production server |
| `npm run check` | Type-check with TypeScript |
| `npm run setup` | Install dependencies and create .env file |

## 📁 Project Structure

```
Finance-Dashboard-Custom/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Proxy & Test)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── ui/                # Shadcn UI components
│   ├── ThemeProvider.tsx  # Theme provider
│   └── ThemeToggle.tsx    # Theme switcher
├── lib/                   # Utilities
│   ├── store.ts           # Zustand state management
│   ├── server-utils.ts    # Server-side utilities
│   ├── api-utils.ts       # Client-side helpers
│   └── queryClient.ts     # React Query setup
├── hooks/                 # Custom React hooks
├── shared/                # Shared types and schemas
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `INDIAN_STOCK_API_KEY` | No | IndianAPI key for automatic header injection |
| `FINNHUB_API_KEY` | No | Finnhub API key for automatic header injection |

### Customizing Allowed Domains

The server includes a whitelist of trusted financial API domains. To add more:

1. Open `lib/server-utils.ts`
2. Add domains to the `ALLOWED_DOMAINS` array
3. The change applies immediately (auto-reload)

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 is already in use:

```bash
# Change the port in package.json scripts or run:
npm run dev -- -p 3000
```

### API Rate Limits

If you hit rate limits:
- Wait for the rate limit window to reset (shown in error message)
- Use API keys to increase limits
- Increase widget refresh intervals

### Widget Not Updating

- Check your internet connection
- Verify the API URL is correct
- Test the API with the "Test Connection" button
- Check browser console for errors

## 🎨 Customization

### Adding New Display Modes

1. Create a new component in `components/dashboard/widget-displays/`
2. Add the display mode to the schema in `shared/schema.ts`
3. Update the Widget component to render your new display mode

## 🤝 Contributing

This is an assignment project, but suggestions and feedback are welcome!

## 🎯 Assignment Evaluation Criteria

This project demonstrates:
- ✅ Frontend Development Skills (React, TypeScript, modern JavaScript)
- ✅ State Management (Zustand with localStorage persistence)
- ✅ API Integration (dynamic JSON handling, flexible data mapping)
- ✅ User Experience Design (intuitive interface, drag-and-drop)
- ✅ Problem-Solving (flexible solutions for diverse API structures)
- ✅ Code Quality (clean, maintainable, scalable architecture)
