import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract metadata using regex patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i) ||
                      html.match(/<meta[^>]+content=["\']([^"']+)["\'][^>]+property=["\']og:title["\'][^>]*>/i)
    
    const descriptionMatch = html.match(/<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i) ||
                            html.match(/<meta[^>]+content=["\']([^"']+)["\'][^>]+property=["\']og:description["\'][^>]*>/i) ||
                            html.match(/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i)
    
    const imageMatch = html.match(/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i) ||
                      html.match(/<meta[^>]+content=["\']([^"']+)["\'][^>]+property=["\']og:image["\'][^>]*>/i)

    const domain = new URL(url).hostname

    const metadata = {
      title: titleMatch ? titleMatch[1].trim() : domain,
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      image: imageMatch ? imageMatch[1] : null,
      domain,
      url
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Error fetching link metadata:', error)
    
    // Return basic metadata if fetch fails
    try {
      const domain = new URL(url).hostname
      return NextResponse.json({
        title: domain,
        description: '',
        image: null,
        domain,
        url
      })
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
  }
}