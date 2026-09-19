import { Env } from '../types';

// In-memory LRU cache for local dev / non-R2 fallback
const memoryCache = new Map<string, { content: string; contentType: string; createdAt: number }>();

export async function saveCardImage(
  id: string,
  svgContent: string,
  env: Env
): Promise<string> {
  const key = `${id}.svg`;

  // 1. If R2 bucket is bound, save to Cloudflare R2
  if (env.WISHES_BUCKET && typeof env.WISHES_BUCKET.put === 'function') {
    try {
      await env.WISHES_BUCKET.put(key, svgContent, {
        httpMetadata: {
          contentType: 'image/svg+xml; charset=utf-8',
          cacheControl: 'public, max-age=31536000, immutable',
        },
        customMetadata: {
          id,
          createdAt: new Date().toISOString(),
        },
      });
      return `/api/images/${key}`;
    } catch (err) {
      console.warn('R2 upload failed, falling back to memory cache:', err);
    }
  }

  // 2. Fallback to memory/Edge cache
  memoryCache.set(key, {
    content: svgContent,
    contentType: 'image/svg+xml; charset=utf-8',
    createdAt: Date.now(),
  });

  // Limit memory cache size to 100 recent cards
  if (memoryCache.size > 100) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }

  return `/api/images/${key}`;
}

export async function getCardImage(
  key: string,
  env: Env
): Promise<{ content: string; contentType: string } | null> {
  // Check R2 first if bound
  if (env.WISHES_BUCKET && typeof env.WISHES_BUCKET.get === 'function') {
    try {
      const obj = await env.WISHES_BUCKET.get(key);
      if (obj) {
        const text = await obj.text();
        return {
          content: text,
          contentType: obj.httpMetadata?.contentType || 'image/svg+xml',
        };
      }
    } catch (err) {
      console.warn('R2 get error:', err);
    }
  }

  // Check memory cache
  const cached = memoryCache.get(key);
  if (cached) {
    return {
      content: cached.content,
      contentType: cached.contentType,
    };
  }

  return null;
}
