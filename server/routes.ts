import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";

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

function getClientIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
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

function isValidExternalUrl(urlString: string): { valid: boolean; error?: string } {
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
        error: `Domain "${hostname}" is not in the allowed list. Supported APIs include: Alpha Vantage, Finnhub, Coinbase, CoinGecko, Binance, Yahoo Finance, Polygon, IEX Cloud, and more.` 
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

function getCachedData(url: string): unknown | null {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(url);
  return null;
}

function setCacheData(url: string, data: unknown, ttl: number = CACHE_TTL): void {
  cache.set(url, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

function countFields(obj: unknown): number {
  if (!obj || typeof obj !== "object") return 0;
  if (Array.isArray(obj)) return obj.length > 0 ? 1 : 0;
  return Object.keys(obj).length;
}

async function fetchExternalApi(url: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "FinanceDashboard/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
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
        return { success: true, data };
      } catch {
        return {
          success: false,
          error: "Response is not valid JSON",
        };
      }
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { success: false, error: "Request timed out after 15 seconds" };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIP(req);
  const rateLimit = checkRateLimit(ip);

  res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
  res.setHeader("X-RateLimit-Remaining", rateLimit.remaining.toString());
  res.setHeader("X-RateLimit-Reset", Math.ceil(rateLimit.resetIn / 1000).toString());

  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Please try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
    });
  }

  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/test", rateLimitMiddleware, async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const urlValidation = isValidExternalUrl(url);
    if (!urlValidation.valid) {
      return res.status(400).json({
        success: false,
        error: urlValidation.error,
      });
    }

    const result = await fetchExternalApi(url);

    if (result.success) {
      return res.json({
        success: true,
        data: result.data,
        fieldCount: countFields(result.data),
      });
    }

    return res.json({
      success: false,
      error: result.error,
    });
  });

  app.post("/api/proxy", rateLimitMiddleware, async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const urlValidation = isValidExternalUrl(url);
    if (!urlValidation.valid) {
      return res.status(400).json({
        success: false,
        error: urlValidation.error,
      });
    }

    const cachedData = getCachedData(url);
    if (cachedData !== null) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    const result = await fetchExternalApi(url);

    if (result.success) {
      setCacheData(url, result.data);
      return res.json({
        success: true,
        data: result.data,
        cached: false,
      });
    }

    return res.json({
      success: false,
      error: result.error,
    });
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return httpServer;
}
