import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CLIENT_ID = Deno.env.get("WHOOP_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("WHOOP_CLIENT_SECRET");

async function refreshToken(tokenRecord, base44) {
  const res = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tokenRecord.refresh_token,
    }),
  });
  if (!res.ok) throw new Error("Token refresh failed");
  const tokens = await res.json();
  const updated = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || tokenRecord.refresh_token,
    expires_at: Date.now() + (tokens.expires_in * 1000),
  };
  await base44.asServiceRole.entities.WhoopToken.update(tokenRecord.id, updated);
  return { ...tokenRecord, ...updated };
}

async function getValidToken(tokenRecord, base44) {
  if (Date.now() > tokenRecord.expires_at - 60000) {
    return await refreshToken(tokenRecord, base44);
  }
  return tokenRecord;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  // Allow webhook calls without auth, but require email parameter; require auth for direct calls
  let userEmail = user?.email;
  if (!userEmail) {
    const body = await req.json().catch(() => ({}));
    userEmail = body.user_email;
    if (!userEmail) {
      return Response.json({ error: "Unauthorized or missing user_email" }, { status: 401 });
    }
  }

  const tokens = await base44.asServiceRole.entities.WhoopToken.filter({ user_email: userEmail });
  if (!tokens.length) return Response.json({ error: "Whoop not connected" }, { status: 400 });

  let tokenRecord = await getValidToken(tokens[0], base44);
  const headers = { Authorization: `Bearer ${tokenRecord.access_token}` };

  // Fetch last 7 days of cycles (contains recovery + strain)
  const start = new Date(Date.now() - 7 * 86400000).toISOString();
  const [cycleRes, sleepRes] = await Promise.all([
    fetch(`https://api.prod.whoop.com/developer/v1/cycle?start=${start}&limit=25`, { headers }),
    fetch(`https://api.prod.whoop.com/developer/v1/activity/sleep?start=${start}&limit=25`, { headers }),
  ]);

  const cycleData = cycleRes.ok ? await cycleRes.json() : { records: [] };
  const sleepData = sleepRes.ok ? await sleepRes.json() : { records: [] };

  const sleepByDate = {};
  for (const s of (sleepData.records || [])) {
    if (!s.end) continue;
    const date = s.end.split("T")[0];
    sleepByDate[date] = s;
  }

  const synced = [];
  for (const cycle of (cycleData.records || [])) {
    if (!cycle.end) continue;
    const date = cycle.end.split("T")[0];
    const recovery = cycle.score?.recovery_score ?? null;
    const strain = cycle.score?.strain ?? null;
    const hrv = cycle.score?.hrv_rmssd_milli ?? null;
    const rhr = cycle.score?.resting_heart_rate ?? null;

    const sleep = sleepByDate[date];
    const sleepPerf = sleep?.score?.sleep_performance_percentage ?? null;
    const sleepHours = sleep ? ((sleep.score?.total_sleep_time_milli || 0) / 3600000) : null;

    // Check if we already have a log for this date (scoped to current user)
    const existing = await base44.asServiceRole.entities.BiometricLog.filter({ date, created_by: userEmail });

    const payload = {
      date,
      recovery_pct: recovery,
      hrv: hrv ? Math.round(hrv) : null,
      resting_hr: rhr,
      sleep_performance: sleepPerf,
      sleep_hours: sleepHours ? Math.round(sleepHours * 10) / 10 : null,
      body_battery: strain ? Math.round((1 - strain / 21) * 100) : null,
      source: "whoop",
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.BiometricLog.update(existing[0].id, payload);
    } else {
      // Ensure created_by is set to prevent orphaned records
      await base44.asServiceRole.entities.BiometricLog.create({ ...payload, created_by: userEmail });
    }
    synced.push(date);
  }

  await base44.asServiceRole.entities.WhoopToken.update(tokenRecord.id, {
    last_synced: new Date().toISOString(),
  });

  return Response.json({ success: true, synced_dates: synced });
});