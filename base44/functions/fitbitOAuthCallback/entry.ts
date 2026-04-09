import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Escape HTML to prevent reflected XSS in error responses
const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

// Verify HMAC-signed state token — rejects forged/replayed states
async function verifySignedState(rawState) {
  try {
    const { p: payload, s: sig } = JSON.parse(atob(decodeURIComponent(rawState)));
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(Deno.env.get('BASE44_APP_ID') || 'vellera'),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = new Uint8Array(sig.match(/.{2}/g).map(b => parseInt(b, 16)));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
    if (!valid) return null;
    const data = JSON.parse(payload);
    if (Date.now() - data.ts > STATE_TTL_MS) return null;
    return data;
  } catch (_) {
    return null;
  }
}

function errorPage(msg) {
  return new Response(
    `<html><head><title>Error</title></head><body><script>window.close();</script><p>Connection failed: ${escapeHtml(msg)}</p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code) return errorPage(error || 'no code');
  if (!state) return new Response('Missing state', { status: 400 });

  // Verify HMAC-signed state — rejects CSRF and forged states
  const stateData = await verifySignedState(state);
  if (!stateData?.email) {
    console.error('[fitbitOAuthCallback] Invalid or expired state token');
    return new Response('<html><body><p>Invalid or expired state</p></body></html>', { headers: { 'Content-Type': 'text/html' }, status: 401 });
  }
  const userEmail = stateData.email;

  const clientId = Deno.env.get('FITBIT_CLIENT_ID');
  const clientSecret = Deno.env.get('FITBIT_CLIENT_SECRET');
  const redirectUri = 'https://api.base44.com/api/apps/69c722c665db36b41f55ba9c/functions/fitbitOAuthCallback';

  const tokenRes = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error('[fitbitOAuthCallback] Token exchange failed:', tokenData);
    return new Response('<html><body><p>Token exchange failed</p></body></html>', { headers: { 'Content-Type': 'text/html' }, status: 500 });
  }

  const existing = await base44.asServiceRole.entities.WearableToken.filter({ provider: 'fitbit', user_email: userEmail });
  const payload = {
    provider: 'fitbit',
    user_email: userEmail,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in || 28800) * 1000,
    provider_user_id: tokenData.user_id || '',
    last_synced: new Date().toISOString(),
  };

  if (existing[0]) {
    await base44.asServiceRole.entities.WearableToken.update(existing[0].id, payload);
  } else {
    await base44.asServiceRole.entities.WearableToken.create(payload);
  }

  console.log(`[fitbitOAuthCallback] Connected Fitbit for ${userEmail}`);

  return new Response('<html><head><title>Connected</title></head><body><script>if(window.opener){window.opener.postMessage("fitbit_connected","*");window.close();}else{window.location.href="/";}</script><p>Fitbit connected! You can close this window.</p></body></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});