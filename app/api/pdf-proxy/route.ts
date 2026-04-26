import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxies an external PDF so pdfjs-dist can fetch it without CORS errors.
 * Usage: /api/pdf-proxy?url=https://example.com/catalogue.pdf
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  // Only allow HTTPS URLs to prevent SSRF to internal network
  if (!url.startsWith('https://')) {
    return new NextResponse('Only HTTPS URLs allowed', { status: 400 })
  }

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AP-Sanitations/1.0)' },
    })

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, { status: 502 })
    }

    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  } catch (err) {
    return new NextResponse('Failed to fetch PDF', { status: 502 })
  }
}
