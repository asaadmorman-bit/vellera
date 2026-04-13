import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * biometricAutoSync — scheduled background job
 * Pulls HRV, sleep, strain/recovery from Whoop + Strava for every connected user
 * and upserts a BiometricLog record for today.
 */

// ── Whoop helpers ────────────────────────────────────────────────────────────

async function refreshWhoopToken(base44, tokenRecord) {
  const res = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenRecord.refresh_token,
      client_id: Deno.env.get('WHOOP_CLIENT_ID'),
      client_secret: Deno.env.get('WHOOP_CLIENT_SECRET'),
    }),
  });
  if (!res.ok) throw new Error(`Whoop token refresh failed: ${res.status}`);
  const data = await res.json();
  const updated = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
  };
  await base44.asServiceRole.entities.WhoopToken.update(tokenRecord.id, updated);
  return { ...tokenRecord, ...updated };
}

async function fetchWhoopData(base44, tokenRecord) {
  // Refresh if within 5 min of expiry
  if (tokenRecord.expires_at - Date.now() < 5 * 60 * 1000) {
    tokenRecord = await refreshWhoopToken(base44, tokenRecord);
  }

  const headers = { Authorization: `Bearer ${tokenRecord.access_token}` };
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Recovery (HRV + resting HR + recovery %)
  const recoveryRes = await fetch(
    `https://api.prod.whoop.com/developer/v1/recovery?start=${yesterday}T00:00:00.000Z&end=${today}T23:59:59.000Z&limit=1`,
    { headers }
  );
  const recovery = recoveryRes.ok ? await recoveryRes.json() : null;
  const latestRecovery = recovery?.records?.[0];

  // Sleep
  const sleepRes = await fetch(
    `https://api.prod.whoop.com/developer/v1/activity/sleep?start=${yesterday}T00:00:00.000Z&end=${today}T23:59:59.000Z&limit=1`,
    { headers }
  );
  const sleep = sleepRes.ok ? await sleepRes.json() : null;
  const latestSleep = sleep?.records?.[0];

  // Cycle strain for today
  const cycleRes = await fetch(
    `https://api.prod.whoop.com/developer/v1/cycle?start=${today}T00:00:00.000Z&end=${today}T23:59:59.000Z&limit=1`,
    { headers }
  );
  const cycle = cycleRes.ok ? await cycleRes.json() : null;
  const latestCycle = cycle?.records?.[0];

  return {
    recovery_pct: latestRecovery?.score?.recovery_score ?? null,
    hrv: latestRecovery?.score?.hrv_rmssd_milli ?? null,
    rhr: latestRecovery?.score?.resting_heart_rate ?? null,
    sleep_performance: latestSleep?.score?.sleep_performance_percentage ?? null,
    strain: latestCycle?.score?.strain ?? null,
  };
}

// ── Strava helpers ───────────────────────────────────────────────────────────

async function refreshStravaToken(base44, tokenRecord) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: Deno.env.get('STRAVA_CLIENT_ID'),
      client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
      grant_type: 'refresh_token',
      refresh_token: tokenRecord.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);
  const data = await res.json();
  const updated = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at * 1000,
  };
  await base44.asServiceRole.entities.WearableToken.update(tokenRecord.id, updated);
  return { ...tokenRecord, ...updated };
}

async function fetchStravaData(base44, tokenRecord) {
  if (tokenRecord.expires_at - Date.now() < 5 * 60 * 1000) {
    tokenRecord = await refreshStravaToken(base44, tokenRecord);
  }

  const headers = { Authorization: `Bearer ${tokenRecord.access_token}` };
  const todayEpoch = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

  // Athlete stats (lifetime)
  const statsRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${todayEpoch}&per_page=5`,
    { headers }
  );
  const activities = statsRes.ok ? await statsRes.json() : [];
  const todayActivity = Array.isArray(activities) ? activities[0] : null;

  return {
    // Strava doesn't expose HRV directly, but average HR is useful
    rhr: todayActivity?.average_heartrate ?? null,
    // Moving time as a proxy for strain (minutes)
    strain: todayActivity ? Math.round((todayActivity.moving_time || 0) / 60) : null,
  };
}

// ── Upsert BiometricLog ──────────────────────────────────────────────────────

async function upsertBiometricLog(base44, userEmail, newData, source) {
  const today = new Date().toISOString().split('T')[0];

  // Find existing record for today
  const existing = await base44.asServiceRole.entities.BiometricLog.filter({
    date: today,
    created_by: userEmail,
  });

  // Build patch — only overwrite non-null values from new data
  const patch = { date: today, notes: `Auto-synced from ${source} at ${new Date().toISOString()}` };
  for (const [key, val] of Object.entries(newData)) {
    if (val !== null && val !== undefined) patch[key] = val;
  }

  if (existing.length > 0) {
    await base44.asServiceRole.entities.BiometricLog.update(existing[0].id, patch);
    console.log(`[biometricAutoSync] Updated BiometricLog for ${userEmail} (${source})`);
  } else {
    await base44.asServiceRole.entities.BiometricLog.create({ ...patch, created_by: userEmail });
    console.log(`[biometricAutoSync] Created BiometricLog for ${userEmail} (${source})`);
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow scheduled calls (no user auth needed for background jobs)
  // Optionally verify admin if called manually
  try {
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
  } catch (_) { /* scheduled — no user context, proceed */ }

  const results = { whoop: 0, strava: 0, errors: [] };

  // ── Whoop: sync all WhoopToken records ────────────────────────────────────
  try {
    const whoopTokens = await base44.asServiceRole.entities.WhoopToken.list('-created_date', 200);
    for (const token of whoopTokens) {
      try {
        const data = await fetchWhoopData(base44, token);
        await upsertBiometricLog(base44, token.user_email, data, 'Whoop');
        results.whoop++;
      } catch (err) {
        console.error(`[biometricAutoSync] Whoop error for ${token.user_email}:`, err.message);
        results.errors.push({ provider: 'whoop', user: token.user_email, error: err.message });
      }
    }
  } catch (err) {
    console.error('[biometricAutoSync] Failed to list Whoop tokens:', err.message);
  }

  // ── Strava: sync all WearableToken records with provider=strava ───────────
  try {
    const stravaTokens = await base44.asServiceRole.entities.WearableToken.filter({ provider: 'strava' });
    for (const token of stravaTokens) {
      try {
        const data = await fetchStravaData(base44, token);
        await upsertBiometricLog(base44, token.user_email, data, 'Strava');
        results.strava++;
      } catch (err) {
        console.error(`[biometricAutoSync] Strava error for ${token.user_email}:`, err.message);
        results.errors.push({ provider: 'strava', user: token.user_email, error: err.message });
      }
    }
  } catch (err) {
    console.error('[biometricAutoSync] Failed to list Strava tokens:', err.message);
  }

  console.log(`[biometricAutoSync] Done — Whoop: ${results.whoop}, Strava: ${results.strava}, Errors: ${results.errors.length}`);
  return Response.json({ success: true, ...results });
});