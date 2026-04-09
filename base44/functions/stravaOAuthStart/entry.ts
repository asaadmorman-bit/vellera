import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// HMAC-signed state — prevents CSRF / state forgery
async function createSignedState(email) {
  const payload = JSON.stringify({ email, ts: Date.now() });
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(Deno.env.get('BASE44_APP_ID') || 'vellera'),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return encodeURIComponent(btoa(JSON.stringify({ p: payload, s: sigHex })));
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const state = await createSignedState(user.email);
  const clientId = Deno.env.get('STRAVA_CLIENT_ID');
  const redirectUri = 'https://api.base44.com/api/apps/69c722c665db36b41f55ba9c/functions/stravaOAuthCallback';

  const url = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read,activity:read_all,profile:read_all&state=${state}`;
  return Response.json({ url });
});