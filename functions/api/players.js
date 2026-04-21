const TARGET = 'https://api.earthmc.net/v4/players';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SKIP = new Set(['host','connection','keep-alive','transfer-encoding','te','trailer','upgrade']);

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS });
  }

  const fwd = new Headers();
  for (const [k, v] of request.headers.entries()) {
    if (!SKIP.has(k.toLowerCase())) fwd.set(k, v);
  }
  fwd.set('Host', 'api.earthmc.net');

  const init = { method: request.method, headers: fwd };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.text();
    if (body) init.body = body;
  }

  const res = await fetch(TARGET, init);
  const out = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS)) out.set(k, v);

  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
}
