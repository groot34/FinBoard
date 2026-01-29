import { NextResponse } from 'next/server';
import { fetchExternalApi, isValidExternalUrl } from '@/lib/server-utils';

export async function POST(request: Request) {
  try {
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

    // Fetch from external API
    const result = await fetchExternalApi(url, customHeaders);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
