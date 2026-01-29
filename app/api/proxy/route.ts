import { NextResponse } from 'next/server';
import {
  fetchExternalApi,
  isValidExternalUrl,
  getClientIP,
  checkRateLimit,
  getCachedData,
  setCachedData,
} from '@/lib/server-utils';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Please try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { url, customHeaders } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate URL
    const validation = isValidExternalUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${url}::${JSON.stringify(customHeaders || [])}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(
        { success: true, data: cachedData, cached: true },
        {
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    // Fetch from external API
    const result = await fetchExternalApi(url, customHeaders);

    // Cache successful responses
    if (result.success && result.data) {
      setCachedData(cacheKey, result.data);
    }

    return NextResponse.json(
      { ...result, cached: false },
      {
        status: result.success ? 200 : 400,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
        },
      }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
