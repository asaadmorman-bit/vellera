import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { code, state: stateToken } = body;

  if (!code || !stateToken) return Response.json({ error: 'Missing code or state' }, { status: 400 });

  // Verify state token and retrieve user email
  const agents = await base44.asServiceRole.entities.UserAgent.filter({
    state_token: stateToken,
    provider: 'strava',
  });

  if (agents.length === 0) {
    return Response.json({ error: 'Invalid or expired state token' }, { status: 401 });
  }

  const agent = agents[0];
  if (new Date(agent.expires_at) < new Date()) {
    return Response.json({ error: 'State token expired' }, { status: 401 });
  }

  const userEmail = agent.user_email;

  // Clean up used state token
  await base44.asServiceRole.entities.UserAgent.delete(agent.id);

  const clientId = Deno.env.get('STRAVA_CLIENT_ID');
  const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code' }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) return Response.json({ error: 'Token exchange failed', details: tokenData }, { status: 400 });

  const existing = await base44.asServiceRole.entities.WearableToken.filter({ provider: 'strava', user_email: userEmail });
  const payload = {
    provider: 'strava',
    user_email: userEmail,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: tokenData.expires_at * 1000,
    provider_user_id: String(tokenData.athlete?.id || ''),
    last_synced: new Date().toISOString(),
  };

  if (existing[0]) {
    await base44.asServiceRole.entities.WearableToken.update(existing[0].id, payload);
  } else {
    await base44.asServiceRole.entities.WearableToken.create(payload);
  }

  return new Response('<html><body><script>window.close();</script><p>Strava connected! You can close this window.</p></body></html>', {
    headers: { 'Content-Type': 'text/html' },
  });
});