import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const GOOGLE_FIT_BASE = 'https://www.googleapis.com/fitness/v1/users/me';

const ACTIVITY_TYPE_MAP = {
  1:   'S&C Strength',
  7:   'BJJ/Grappling',
  8:   'S&C Zone2',
  13:  'S&C Zone2',
  16:  'S&C Zone2',
  17:  'S&C Strength',
  20:  'S&C Strength',
  21:  'S&C Zone2',
  26:  'Home Mobility',
  27:  'S&C Strength',
  28:  'BJJ/Grappling',
  29:  'Home Mobility',
  33:  'S&C Strength',
  34:  'S&C Strength',
  35:  'Striking/MMA',
  41:  'BJJ/Grappling',
  45:  'S&C Zone2',
  46:  'S&C Zone2',
  47:  'S&C Zone2',
  52:  'S&C Zone2',
  56:  'S&C Zone2',
  57:  'S&C Zone2',
  63:  'S&C Strength',
  64:  'S&C Zone2',
  68:  'Home Mobility',
  70:  'Home Mobility',
  73:  'Home Mobility',
  74:  'S&C Zone2',
  75:  'S&C Strength',
  82:  'S&C Zone2',
  108: 'S&C Strength',
  113: 'S&C Strength',
  115: 'BJJ/Grappling',
};

function mapActivityType(typeId) {
  return ACTIVITY_TYPE_MAP[typeId] || 'S&C Strength';
}

function msToMinutes(ms) {
  return Math.round(ms / 60000);
}

function intensityFromCalories(calories, durationMin) {
  if (!calories || !durationMin) return 5;
  const cpm = calories / durationMin;
  if (cpm > 12) return 9;
  if (cpm > 9)  return 8;
  if (cpm > 7)  return 7;
  if (cpm > 5)  return 6;
  if (cpm > 3)  return 5;
  return 4;
}

async function syncUser(targetEmail, tokenRecord, base44) {
  const accessToken = tokenRecord.access_token;
  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  const endMs   = Date.now();
  const startMs = endMs - (48 * 60 * 60 * 1000);

  const sessionsRes = await fetch(
    `${GOOGLE_FIT_BASE}/sessions?startTime=${new Date(startMs).toISOString()}&endTime=${new Date(endMs).toISOString()}`,
    { headers }
  );

  if (!sessionsRes.ok) {
    const err = await sessionsRes.text();
    console.error('[googleFitWebhook] Sessions fetch failed:', err);
    throw new Error(`Google Fit API error: ${err}`);
  }

  const sessionsData = await sessionsRes.json();
  const sessions = sessionsData.session || [];
  console.log(`[googleFitWebhook] Found ${sessions.length} sessions for ${targetEmail}`);

  const aggregatePayload = {
    aggregateBy: [
      { dataTypeName: 'com.google.calories.expended' },
      { dataTypeName: 'com.google.step_count.delta'  },
      { dataTypeName: 'com.google.heart_rate.bpm'    },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startMs,
    endTimeMillis:   endMs,
  };

  const aggRes = await fetch(`${GOOGLE_FIT_BASE}/dataset:aggregate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(aggregatePayload),
  });

  let dailyCalories = 0, dailySteps = 0, avgHR = 0;
  if (aggRes.ok) {
    const aggData = await aggRes.json();
    const buckets = aggData.bucket || [];
    buckets.forEach(b => {
      (b.dataset || []).forEach(ds => {
        (ds.point || []).forEach(p => {
          const val = p.value?.[0]?.fpVal ?? p.value?.[0]?.intVal ?? 0;
          if (ds.dataSourceId?.includes('calories')) dailyCalories += val;
          if (ds.dataSourceId?.includes('step_count')) dailySteps += val;
          if (ds.dataSourceId?.includes('heart_rate')) avgHR = val;
        });
      });
    });
  }

  const existingSessions = await base44.asServiceRole.entities.TrainingSession.filter({ created_by: targetEmail });
  const existingDates = new Set(existingSessions.map(s => s.date));

  let syncedCount = 0;
  for (const s of sessions) {
    const sessionDate = new Date(parseInt(s.startTimeMillis)).toISOString().split('T')[0];
    const durationMs  = parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis);
    const durationMin = msToMinutes(durationMs);
    if (durationMin < 5) continue;

    const sessionType = mapActivityType(s.activityType);
    if (existingDates.has(sessionDate)) {
      console.log(`[googleFitWebhook] Skipping duplicate: ${sessionDate}-${sessionType}`);
      continue;
    }

    const intensity = intensityFromCalories(dailyCalories, durationMin);

    await base44.asServiceRole.entities.TrainingSession.create({
      date:             sessionDate,
      session_type:     sessionType,
      duration_minutes: durationMin,
      intensity,
      session_notes:    `Auto-synced from Google Fit: ${s.name || 'Activity'}`,
      created_by:       targetEmail,
    });

    existingDates.add(sessionDate);
    syncedCount++;
    console.log(`[googleFitWebhook] Created session: ${sessionType} on ${sessionDate} (${durationMin} min)`);
  }

  const today = new Date().toISOString().split('T')[0];
  const existingWellness = await base44.asServiceRole.entities.WellnessLog.filter({ user_email: targetEmail, log_date: today });

  let wellnessUpdated = false;
  if (existingWellness.length === 0 && (dailySteps > 0 || dailyCalories > 0)) {
    const stepScore = Math.min(100, Math.round((dailySteps / 10000) * 40));
    const calScore  = Math.min(60,  Math.round((dailyCalories / 500) * 60));
    const readiness = stepScore + calScore;

    await base44.asServiceRole.entities.WellnessLog.create({
      user_email:      targetEmail,
      log_date:        today,
      readiness_score: readiness,
      notes:           `Auto-populated from Google Fit. Steps: ${Math.round(dailySteps).toLocaleString()}, Calories: ${Math.round(dailyCalories)} kcal`,
    });
    wellnessUpdated = true;
  }

  const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: targetEmail });
  let workloadUpdated = false;

  if (profiles.length > 0) {
    const profile = profiles[0];
    const totalMinutes = (profile.lifetime_minutes || 0) + sessions.reduce((sum, s) => {
      return sum + msToMinutes(parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis));
    }, 0);
    const totalWorkouts = (profile.lifetime_workouts || 0) + syncedCount;

    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      lifetime_minutes:  totalMinutes,
      lifetime_workouts: totalWorkouts,
      last_workout_date: today,
    });
    workloadUpdated = true;
  }

  return {
    success: true,
    user: targetEmail,
    synced_sessions: syncedCount,
    workload_updated: workloadUpdated,
    wellness_updated: wellnessUpdated,
    summary: {
      sessions_found:   sessions.length,
      sessions_created: syncedCount,
      daily_calories:   Math.round(dailyCalories),
      daily_steps:      Math.round(dailySteps),
      avg_heart_rate:   Math.round(avgHR),
    },
    synced_at: new Date().toISOString(),
  };
}

// Constant shared secret stored as GOOGLE_FIT_CRON_SECRET env var.
// Set this in Dashboard → Settings → Secrets and add it to your scheduler headers.
const CRON_SECRET = Deno.env.get('GOOGLE_FIT_CRON_SECRET');

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  const body = await req.json().catch(() => ({}));

  // Scheduled job (no auth): require CRON_SECRET to prevent public mass-sync
  if (!user) {
    const providedSecret = req.headers.get('x-cron-secret');
    if (!CRON_SECRET || !providedSecret || providedSecret !== CRON_SECRET) {
      console.error('[googleFitWebhook] Rejected unauthenticated batch request — missing or invalid x-cron-secret');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allTokens = await base44.asServiceRole.entities.WearableToken.filter({ provider: 'google_fit' });
    if (!allTokens.length) {
      console.log('[googleFitWebhook] No Google Fit tokens found, nothing to sync');
      return Response.json({ success: true, message: 'No connected users', results: [] });
    }
    const results = [];
    for (const t of allTokens) {
      try {
        const r = await syncUser(t.user_email, t, base44);
        console.log(`[googleFitWebhook] Synced ${t.user_email}: ${r.synced_sessions} sessions`);
        results.push(r);
      } catch (err) {
        console.error(`[googleFitWebhook] Failed for ${t.user_email}:`, err.message);
        results.push({ user: t.user_email, error: err.message });
      }
    }
    return Response.json({ success: true, results });
  }

  // Direct call with auth: sync specific user
  const targetEmail = (user.role === 'admin' && body.user_email) ? body.user_email : user.email;
  const tokens = await base44.asServiceRole.entities.WearableToken.filter({ user_email: targetEmail, provider: 'google_fit' });
  const tokenRecord = tokens[0];

  if (!tokenRecord?.access_token) {
    return Response.json({
      error: 'No Google Fit token found. Connect Google Fit first at /wearables.',
      user: targetEmail,
    }, { status: 404 });
  }

  return Response.json(await syncUser(targetEmail, tokenRecord, base44));
});