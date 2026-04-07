import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return new Response(`<html><body><script>window.close();</script><p>Connection failed: ${error || 'no code'}</p></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  let userEmail = null;
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(state)));
    userEmail = decoded.email;
  } catch (_) {
    return new Response('<html><body><p>Invalid state</p></body></html>', { headers: { 'Content-Type': 'text/html' }, status: 401 });
  }

  if (!userEmail) {
    return new Response('<html><body><p>Could not determine user</p></body></html>', { headers: { 'Content-Type': 'text/html' }, status: 401 });
  }

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
    console.error('Fitbit token exchange failed:', tokenData);
    return new Response(`<html><body><p>Token exchange failed</p></body></html>`, { headers: { 'Content-Type': 'text/html' }, status: 500 });
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

  return new Response('<html><body><script>if(window.opener){window.opener.postMessage("fitbit_connected","*");window.close();}else{window.location.href="/";}</script><p>Fitbit connected! You can close this window.</p></body></html>', {
    headers: { 'Content-Type': 'text/html' },
  });
});