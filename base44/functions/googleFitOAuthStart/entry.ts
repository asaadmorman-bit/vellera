import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Generate cryptographically secure random state token
  const state = crypto.getRandomValues(new Uint8Array(32));
  const stateToken = Array.from(state).map(b => b.toString(16).padStart(2, '0')).join('');

  // Store state with user email in database (expires in 10 minutes)
  const expiresAt = Date.now() + 10 * 60 * 1000;
  await base44.asServiceRole.entities.UserAgent.create({
    state_token: stateToken,
    provider: 'google_fit',
    user_email: user.email,
    created_at: new Date().toISOString(),
    expires_at: new Date(expiresAt).toISOString(),
  });

  const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID');
  const redirectUri = 'https://api.base44.com/api/apps/69c722c665db36b41f55ba9c/functions/googleFitOAuthCallback';
  const scope = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
    state: stateToken,
  });

  return Response.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});