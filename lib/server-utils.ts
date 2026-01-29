// Server-side API utilities for Next.js API routes
interface ProxyCache {
  data: unknown;
  timestamp: number;
  ttl: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const cache = new Map<string, ProxyCache>();
const rateLimits = new Map<string, RateLimitEntry>();
const CACHE_TTL = 10000;
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX_REQUESTS = 30;

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number} {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now };
}

const ALLOWED_DOMAINS = [
  "alphavantage.co",
  "www.alphavantage.co",
  "finnhub.io",
  "api.finnhub.io",
  "api.coinbase.com",
  "coinbase.com",
  "api.coingecko.com",
  "coingecko.com",
  "api.binance.com",
  "binance.com",
  "query1.finance.yahoo.com",
  "query2.finance.yahoo.com",
  "finance.yahoo.com",
  "api.polygon.io",
  "polygon.io",
  "cloud.iexapis.com",
  "iexcloud.io",
  "indianapi.in",
  "stock.indianapi.in",
  "api.exchangerate-api.com",
  "openexchangerates.org",
  "data.fixer.io",
  "api.fixer.io",
  "min-api.cryptocompare.com",
  "api.messari.io",
  "api.nomics.com",
  "api.kraken.com",
  "api.gemini.com",
  "api.pro.coinbase.com",
  "api.kucoin.com",
  "api.huobi.pro",
  "api.bybit.com",
  "api.bitfinex.com",
  "api.bitstamp.net",
  "rest.coinapi.io",
  "api.exchangeratesapi.io",
  "v6.exchangerate-api.com",
  "api.frankfurter.app",
  "cdn.jsdelivr.net",
];

export function isValidExternalUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    
    if (url.protocol !== "https:") {
      return { valid: false, error: "Only HTTPS protocol is allowed for security" };
    }

    const hostname = url.hostname.toLowerCase();
    
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith("." + domain)
    );

    if (!isAllowed) {
      return {
        valid: false,
        error: `Domain "${hostname}" is not in the allowed list. Supported APIs include: Alpha Vantage, Finnhub, Coinbase, CoinGecko, Binance, Yahoo Finance, Polygon, IEX Cloud, and more.`,
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export function getCachedData(cacheKey: string): unknown | null {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(cacheKey);
  return null;
}

export function setCachedData(cacheKey: string, data: unknown, ttl: number = CACHE_TTL): void {
  cache.set(cacheKey, { data, timestamp: Date.now(), ttl });
}

export async function fetchExternalApi(
  url: string,
  customHeaders?: Array<{ key: string; value: string }>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const parsedUrl = new URL(url);
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": "FinanceDashboard/1.0",
    };

    // Auto-inject API keys from environment variables
    if (parsedUrl.hostname === "stock.indianapi.in" && process.env.INDIAN_STOCK_API_KEY) {
      headers["X-Api-Key"] = process.env.INDIAN_STOCK_API_KEY;
    }

    if ((parsedUrl.hostname === "finnhub.io" || parsedUrl.hostname === "api.finnhub.io") && process.env.FINNHUB_API_KEY) {
      headers["X-Finnhub-Token"] = process.env.FINNHUB_API_KEY;
    }
    
    // Alpha Vantage uses query parameter for API key
    if ((parsedUrl.hostname === "alphavantage.co" || parsedUrl.hostname === "www.alphavantage.co") && process.env.ALPHA_VANTAGE_API_KEY) {
      if (!parsedUrl.searchParams.has("apikey")) {
        // We need to update the URL with the API key
        parsedUrl.searchParams.append("apikey", process.env.ALPHA_VANTAGE_API_KEY);
        url = parsedUrl.toString();
      }
    }

    // Include custom headers
    if (customHeaders) {
      for (const header of customHeaders) {
        if (header.key && header.value) {
          headers[header.key] = header.value;
        }
      }
    }

    // Debug log for Alpha Vantage
    if (parsedUrl.hostname.includes("alphavantage")) {
      console.log("Original URL:", url);
      console.log("Parsed URL Params:", parsedUrl.searchParams.toString());
      console.log("Has API Key in Env:", !!process.env.ALPHA_VANTAGE_API_KEY);
      console.log("Fetching URL:", parsedUrl.toString().replace(process.env.ALPHA_VANTAGE_API_KEY || "HIDDEN", "HIDDEN_KEY"));
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log("API Error Status:", response.status);
      if (response.status === 429) {
        return {
          success: false,
          error: "API rate limit exceeded. Please try again later.",
        };
      }
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        // Check for Alpha Vantage specific error/limit messages
        if (data["Note"] || data["Information"] || data["Error Message"]) {
           console.log("Alpha Vantage Message:", data);
        }
        return { success: true, data };
      } catch {
        return {
          success: false,
          error: "Response is not valid JSON",
        };
      }
    }

    const data = await response.json();
    
    // Check for Alpha Vantage specific error/limit messages
    if (data["Note"] || data["Information"] || data["Error Message"]) {
        console.log("Alpha Vantage Message:", data);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Fetch Error:", error);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { success: false, error: "Request timed out after 15 seconds" };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}
