import { InsertWidget } from "@shared/schema";

export interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  icon: "bitcoin" | "ethereum" | "globe";
  config: InsertWidget;
}

export const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: "btc-price-coinbase",
    name: "Bitcoin Price",
    description: "BTC exchange rates via Coinbase",
    icon: "bitcoin",
    config: {
      name: "Bitcoin Price",
      apiUrl: "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
      displayMode: "card",
      refreshInterval: 30,
      selectedFields: [
         { path: "data~>rates~>USD", label: "BTC / USD", type: "number", format: "number" },
         { path: "data~>rates~>EUR", label: "BTC / EUR", type: "number", format: "number" },
         { path: "data~>rates~>INR", label: "BTC / INR", type: "number", format: "number" },
         { path: "data~>rates~>GBP", label: "BTC / GBP", type: "number", format: "number" },
         { path: "data~>rates~>JPY", label: "BTC / JPY", type: "number", format: "number" }
      ],
      templateId: "btc-price-coinbase"
    }
  },
  {
    id: "eth-price-coinbase",
    name: "Ethereum Price",
    description: "ETH exchange rates via Coinbase",
    icon: "ethereum",
    config: {
      name: "Ethereum Price",
      apiUrl: "https://api.coinbase.com/v2/exchange-rates?currency=ETH",
      displayMode: "card",
      refreshInterval: 30,
      selectedFields: [
         { path: "data~>rates~>USD", label: "ETH / USD", type: "number", format: "number" },
         { path: "data~>rates~>EUR", label: "ETH / EUR", type: "number", format: "number" },
         { path: "data~>rates~>INR", label: "ETH / INR", type: "number", format: "number" },
         { path: "data~>rates~>GBP", label: "ETH / GBP", type: "number", format: "number" },
         { path: "data~>rates~>JPY", label: "ETH / JPY", type: "number", format: "number" }
      ],
      templateId: "eth-price-coinbase"
    }
  },
  {
    id: "global-forex",
    name: "Global Exchange Rates",
    description: "USD forex rates (Top currencies)",
    icon: "globe",
    config: {
      name: "Global Exchange Rates",
      apiUrl: "https://api.exchangerate-api.com/v4/latest/USD",
      displayMode: "table",
      refreshInterval: 60,
      selectedFields: [
        { path: "rates~>INR", label: "USD → INR (India)", type: "number", format: "number" },
        { path: "rates~>EUR", label: "USD → EUR (EU)", type: "number", format: "number" },
        { path: "rates~>GBP", label: "USD → GBP (UK)", type: "number", format: "number" },
        { path: "rates~>JPY", label: "USD → JPY (Japan)", type: "number", format: "number" },
        { path: "rates~>CAD", label: "USD → CAD (Canada)", type: "number", format: "number" },
        { path: "rates~>AUD", label: "USD → AUD (Australia)", type: "number", format: "number" },
        { path: "rates~>CHF", label: "USD → CHF (Switzerland)", type: "number", format: "number" },
        { path: "rates~>CNY", label: "USD → CNY (China)", type: "number", format: "number" },
        { path: "rates~>SGD", label: "USD → SGD (Singapore)", type: "number", format: "number" },
        { path: "rates~>ZAR", label: "USD → ZAR (South Africa)", type: "number", format: "number" }
      ],
      templateId: "global-forex"
    }
  }
];
