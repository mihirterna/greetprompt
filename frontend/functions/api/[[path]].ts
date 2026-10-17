const DEFAULT_API_ORIGIN = 'https://cloudflare-wishes-api.mihirkulkarni3-dev1165.workers.dev';

// Proxies /api/* to the Cloudflare Worker API.
// Override the upstream with the API_WORKER_URL variable in the Pages project.
export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!url.pathname.startsWith('/api/')) {
    return new Response('Not Found', { status: 404 });
  }

  const apiOrigin = String(env?.API_WORKER_URL || DEFAULT_API_ORIGIN).replace(/\/+$/, '');
  const targetUrl = `${apiOrigin}${url.pathname}${url.search}`;
  return fetch(targetUrl, request);
}
