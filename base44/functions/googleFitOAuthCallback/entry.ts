import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Standard redirect-based OAuth callback — Google sends GET with code & state as query params
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateToken = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(`<html><body><script>window.close();</script><p>Connection failed: Google denied access.</p></body></html>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!code || !stateToken) {
    return new Response('<html><body><p>Missing code or state</p></body></html>', {
      headers: { 'Content-Type': 'text/html' }, status: 400,
    });
  }

  const base44 = createClientFromRequest(req);

  // Verify state token from DB — proves this redirect was initiated by our own start function
  const agents = await base44.asServiceRole.entities.UserAgent.filter({
    state_token: stateToken,
    provider: 'google_fit',
  });

  if (agents.length === 0) {
    console.error('[googleFitOAuthCallback] Invalid state token');
    return new Response('<html><body><p>Invalid or expired state token</p></body></html>', {
      headers: { 'Content-Type': 'text/html' }, status: 401,
    });
  }

  const agent = agents[0];
  if (new Date(agent.expires_at) < new Date()) {
    await base44.asServiceRole.entities.UserAgent.delete(agent.id);
    return new Response('<html><body><p>State token expired. Please reconnect.</p></body></html>', {
      headers: { 'Content-Type': 'text/html' }, status: 401,
    });
  }

  const userEmail = agent.user_email;

  // Consume state token immediately — prevents replay
  await base44.asServiceRole.entities.UserAgent.delete(agent.id);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get('GOOGLE_FIT_CLIENT_ID'),
      client_secret: Deno.env.get('GOOGLE_FIT_CLIENT_SECRET'),
      redirect_uri: 'https://api.base44.com/api/apps/69c722c665db36b41f55ba9c/functions/googleFitOAuthCallback',
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error('[googleFitOAuthCallback] Token exchange failed:', tokenData.error);
    return new Response('<html><body><p>Token exchange failed. Please try again.</p></body></html>', {
      headers: { 'Content-Type': 'text/html' }, status: 400,
    });
  }

  const existing = await base44.asServiceRole.entities.WearableToken.filter({ provider: 'google_fit', user_email: userEmail });
  const payload = {
    provider: 'google_fit',
    user_email: userEmail,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || '',
    expires_at: Date.now() + (tokenData.expires_in || 3600) * 1000,
    last_synced: new Date().toISOString(),
  };

  if (existing[0]) {
    await base44.asServiceRole.entities.WearableToken.update(existing[0].id, payload);
  } else {
    await base44.asServiceRole.entities.WearableToken.create(payload);
  }

  console.log(`[googleFitOAuthCallback] Connected Google Fit for ${userEmail}`);

  return new Response(
    `<html><head><title>Connected</title></head><body><script>
      if (window.opener) { window.opener.postMessage('google_fit_connected', '*'); } window.close();
    </script><p style="font-family:sans-serif;padding:2rem">✅ Google Fit connected! You can close this tab and return to the app.</p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
});