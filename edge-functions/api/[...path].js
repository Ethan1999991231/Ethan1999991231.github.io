const TARGET_BASE = 'https://api.earthmc.net/v4';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const HOP_BY_HOP = ['host', 'connection', 'keep-alive', 'transfer-encoding', 'te', 'trailer', 'upgrade'];

export async function onRequest(context) {
  const { request, params } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  const pathSegments = params.path || [];
  const targetPath = '/' + pathSegments.join('/');
  const targetURL = TARGET_BASE + targetPath;

  const fwdHeaders = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (!HOP_BY_HOP.includes(key.toLowerCase())) {
      fwdHeaders.set(key, value);
    }
  }
  fwdHeaders.set('Host', new URL(TARGET_BASE).host);

  const init = {
    method: request.method,
    headers: fwdHeaders,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.text();
    if (body) init.body = body;
  }

  const response = await fetch(targetURL, init);

  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
