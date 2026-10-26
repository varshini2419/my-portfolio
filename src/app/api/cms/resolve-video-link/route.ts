import { NextRequest, NextResponse } from 'next/server';
import { parseVideoUrl } from '@/lib/services/portfolioService';

export const dynamic = 'force-dynamic';

/**
 * Resolves shortened URLs (e.g. lnkd.in, bit.ly, etc.) and returns
 * structured video metadata for YouTube, LinkedIn, Instagram, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url')?.trim();

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: 'URL parameter is required' }, { status: 400 });
    }

    let finalUrl = targetUrl;

    // If it is a shortened redirecting domain (e.g. lnkd.in, bit.ly, t.co)
    if (
      targetUrl.includes('lnkd.in') ||
      targetUrl.includes('bit.ly') ||
      targetUrl.includes('t.co') ||
      targetUrl.includes('tinyurl.com')
    ) {
      try {
        const response = await fetch(targetUrl, {
          method: 'HEAD',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        const location = response.headers.get('location');
        if (location) {
          finalUrl = new URL(location, targetUrl).href;
        }
      } catch (err) {
        console.warn('Failed to resolve redirect for URL:', targetUrl, err);
      }
    }

    const videoInfo = parseVideoUrl(finalUrl);

    return NextResponse.json({
      success: true,
      originalUrl: targetUrl,
      resolvedUrl: finalUrl,
      videoInfo,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to resolve link' },
      { status: 500 }
    );
  }
}
