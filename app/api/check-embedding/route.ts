import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Make a HEAD request to check headers without downloading the full content
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    // Check for X-Frame-Options header
    const xFrameOptions = response.headers.get('x-frame-options')
    const csp = response.headers.get('content-security-policy')
    
    let canEmbed = true
    
    // Check X-Frame-Options
    if (xFrameOptions) {
      const xFrameValue = xFrameOptions.toLowerCase()
      if (xFrameValue === 'deny' || xFrameValue === 'sameorigin') {
        canEmbed = false
      }
    }
    
    // Check Content-Security-Policy for frame-ancestors
    if (csp && csp.includes('frame-ancestors')) {
      // If CSP contains frame-ancestors 'none' or doesn't include our domain
      if (csp.includes("frame-ancestors 'none'") || 
          csp.includes("frame-ancestors 'self'")) {
        canEmbed = false
      }
    }

    return NextResponse.json({ 
      canEmbed,
      xFrameOptions,
      csp: csp ? csp.substring(0, 100) + '...' : null
    })
  } catch (error) {
    console.error('Error checking embedding capability:', error)
    
    // If we can't check, assume it can't embed (safer default)
    return NextResponse.json({ 
      canEmbed: false,
      error: 'Failed to check headers'
    })
  }
}