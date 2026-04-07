import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CLIENT_ID = Deno.env.get("WHOOP_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("WHOOP_CLIENT_SECRET");
const REDIRECT_URI = "https://api.base44.com/api/apps/69c722c665db36b41f55ba9c/functions/whoopOAuthCallback";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return new Response(`<html><body><script>window.close();</script><p>Connection failed: ${error || "no code"}</p></body></html>`, {
      headers: { "Content-Type": "text/html" }
    });
  }

  // Verify state token and retrieve user email
  const base44 = createClientFromRequest(req);

  let userEmail = null;

  // Try to decode as base64 JSON (old Wix-style state)
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(state)));
    if (decoded.email) {
      userEmail = decoded.email;
      console.log('State decoded from base64 JSON, email:', userEmail);
    }
  } catch (_) {
    // Not base64 JSON — try our hex token lookup
    const agents = await base44.asServiceRole.entities.UserAgent.filter({
      state_token: state,
      provider: 'whoop',
    });
    if (agents.length === 0) {
      return new Response("Invalid or expired state token", { status: 401 });
    }
    const agent = agents[0];
    if (new Date(agent.expires_at) < new Date()) {
      return new Response("State token expired", { status: 401 });
    }
    userEmail = agent.user_email;
    await base44.asServiceRole.entities.UserAgent.delete(agent.id);
  }

  if (!userEmail) {
    return new Response("Could not determine user from state", { status: 401 });
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return new Response(`Token exchange failed: ${err}`, { status: 500 });
  }

  const tokens = await tokenRes.json();
  const expiresAt = Date.now() + (tokens.expires_in * 1000);

  // Get Whoop user ID
  const profileRes = await fetch("https://api.prod.whoop.com/developer/v1/user/profile/basic", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = profileRes.ok ? await profileRes.json() : {};

  // Store tokens (base44 already initialized above)
  const existing = await base44.asServiceRole.entities.WhoopToken.filter({ user_email: userEmail });

  if (existing.length > 0) {
    await base44.asServiceRole.entities.WhoopToken.update(existing[0].id, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      whoop_user_id: String(profile.user_id || ""),
      last_synced: new Date().toISOString(),
    });
  } else {
    await base44.asServiceRole.entities.WhoopToken.create({
      user_email: userEmail,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      whoop_user_id: String(profile.user_id || ""),
      last_synced: new Date().toISOString(),
    });
  }

  // (state token cleanup handled above per format)

  // Redirect back to app with success
  return new Response(
    `<html><body><script>
      if (window.opener) { window.opener.postMessage('whoop_connected', '*'); window.close(); }
      else { window.location.href = '/'; }
    </script><p>Whoop connected! You can close this tab.</p></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
});