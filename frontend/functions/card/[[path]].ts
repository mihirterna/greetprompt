const DEFAULT_API_ORIGIN = 'https://cloudflare-wishes-api.mihirkulkarni3-dev1165.workers.dev';

// Proxies /card/:id to the Cloudflare Worker's share-page route.
// The worker renders the personalized card HTML (inline SVG + OG unfurl
// tags + "Make your own" CTA). Keep this shape in sync with
// functions/api/[[path]].ts.
export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!url.pathname.startsWith('/card/')) {
    return new Response('Not Found', { status: 404 });
  }

  const apiOrigin = String(env?.API_WORKER_URL || DEFAULT_API_ORIGIN).replace(/\/+$/, '');
  const targetUrl = `${apiOrigin}${url.pathname}`;
  return fetch(targetUrl, request);
}
