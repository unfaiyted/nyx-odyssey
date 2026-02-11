/**
 * SearXNG-based image search for destinations and highlights.
 * Uses the self-hosted SearXNG instance at search.faiyts.casa.
 */

const SEARXNG_URL = 'https://search.faiyts.casa';

interface ImageResult {
  title: string;
  url: string;
  img_src: string;
  thumbnail_src?: string;
  source?: string;
  resolution?: string;
}

interface WebResult {
  title: string;
  url: string;
  content: string;
}

/**
 * Search for images via SearXNG
 */
export async function searchImages(query: string, count = 5): Promise<ImageResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      categories: 'images',
    });
    const res = await fetch(`${SEARXNG_URL}/search?${params}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results: ImageResult[] = (data.results || [])
      .filter((r: any) => r.img_src && !r.img_src.includes('stock.adobe') && !r.img_src.includes('depositphotos') && !r.img_src.includes('shutterstock') && !r.img_src.includes('gettyimages') && !r.img_src.includes('istockphoto') && !r.img_src.includes('dreamstime') && !r.img_src.includes('alamy'))
      .slice(0, count)
      .map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        img_src: r.img_src,
        thumbnail_src: r.thumbnail_src || '',
        source: r.source || '',
        resolution: r.resolution || '',
      }));
    return results;
  } catch (e) {
    console.error('SearXNG image search failed:', e);
    return [];
  }
}

/**
 * Search for a website URL via SearXNG general search
 */
export async function searchWebsite(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      categories: 'general',
    });
    const res = await fetch(`${SEARXNG_URL}/search?${params}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results: WebResult[] = data.results || [];

    // Filter out aggregator sites, prefer official/direct results
    const skipDomains = ['tripadvisor', 'yelp', 'wikipedia', 'facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'reddit', 'pinterest'];
    const official = results.find((r: WebResult) => {
      const domain = new URL(r.url).hostname.toLowerCase();
      return !skipDomains.some(s => domain.includes(s));
    });

    return official?.url || results[0]?.url || null;
  } catch (e) {
    console.error('SearXNG web search failed:', e);
    return null;
  }
}

/**
 * Get a good photo URL for a destination city/location
 */
export async function getDestinationPhoto(name: string, country?: string): Promise<string | null> {
  const query = country ? `${name} ${country} city landscape photo` : `${name} city landscape photo`;
  const images = await searchImages(query, 3);
  // Prefer high-res images from reputable travel sites
  const good = images.find(img =>
    img.img_src.startsWith('https://') &&
    !img.img_src.includes('thumbnail') &&
    !img.img_src.includes('favicon')
  );
  return good?.img_src || images[0]?.img_src || null;
}

/**
 * Get a photo and website for a highlight (restaurant, attraction, etc.)
 */
export async function getHighlightMedia(title: string, cityName: string): Promise<{ imageUrl: string | null; websiteUrl: string | null }> {
  const [images, websiteUrl] = await Promise.all([
    searchImages(`${title} ${cityName} photo`, 3),
    searchWebsite(`${title} ${cityName} official website`),
  ]);

  const imageUrl = images.find(img =>
    img.img_src.startsWith('https://') &&
    !img.img_src.includes('thumbnail') &&
    !img.img_src.includes('favicon')
  )?.img_src || images[0]?.img_src || null;

  return { imageUrl, websiteUrl };
}
