export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const targetUrl = `https://cloudflare-wishes-api.mihirkulkarni3-dev1165.workers.dev${url.pathname}${url.search}`;
  return fetch(targetUrl, context.request);
}
