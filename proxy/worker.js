// Cloudflare Worker — CORS proxy for Anthropic API + CoinGecko MCP
// Deploy separately: npx wrangler deploy
// Does NOT log, store, or inspect API keys or request content.

const ALLOWED_ORIGINS = [
  'https://cambrena.net',
  'https://www.cambrena.net',
  'https://cambrenacapital.github.io',
  'http://localhost:8080',
  'http://localhost:5173',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, Accept, Mcp-Session-Id',
    'Access-Control-Expose-Headers': 'Mcp-Session-Id',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Route: /mcp → CoinGecko MCP proxy
    if (url.pathname === '/mcp') {
      return handleMcp(request, origin);
    }

    // Route: / → Anthropic API proxy (existing behavior)
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    const apiKey = request.headers.get('X-Api-Key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const body = await request.text();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body,
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    });
  },
};

async function handleMcp(request, origin) {
  const MCP_ENDPOINT = 'https://mcp.api.coingecko.com/mcp';

  if (request.method !== 'POST' && request.method !== 'DELETE') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders(origin),
    });
  }

  // Build headers to forward to MCP
  const forwardHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  };

  const sessionId = request.headers.get('Mcp-Session-Id');
  if (sessionId) {
    forwardHeaders['Mcp-Session-Id'] = sessionId;
  }

  const fetchOptions = { method: request.method, headers: forwardHeaders };

  if (request.method === 'POST') {
    fetchOptions.body = await request.text();
  }

  const response = await fetch(MCP_ENDPOINT, fetchOptions);
  const data = await response.text();

  // Build response headers, forwarding Mcp-Session-Id if present
  const responseHeaders = {
    'Content-Type': response.headers.get('Content-Type') || 'text/event-stream',
    ...corsHeaders(origin),
  };

  const mcpSessionId = response.headers.get('Mcp-Session-Id');
  if (mcpSessionId) {
    responseHeaders['Mcp-Session-Id'] = mcpSessionId;
  }

  return new Response(data, {
    status: response.status,
    headers: responseHeaders,
  });
}
