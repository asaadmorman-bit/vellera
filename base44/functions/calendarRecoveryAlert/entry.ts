import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Keywords that identify training/martial arts events
const TRAINING_KEYWORDS = [
  'bjj', 'jiu-jitsu', 'jiu jitsu', 'drill', 'sparring', 'grappling',
  'striking', 'wrestling', 'martial arts', 'training', 'workout',
  'strength', 'conditioning', 'combat', 'bag work', 'mma', 'boxing',
  'muay thai', 'kickboxing', 'takedown', 'vellera'
];

function isTrainingEvent(event) {
  const text = `${event.summary || ''} ${event.description || ''}`.toLowerCase();
  return TRAINING_KEYWORDS.some(kw => text.includes(kw));
}

function getRecoveryMessage(event) {
  const title = event.summary || 'Training session';
  const now = new Date();
  const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;
  const durationMs = endTime && event.start?.dateTime
    ? endTime - new Date(event.start.dateTime)
    : null;
  const durationMin = durationMs ? Math.round(durationMs / 60000) : null;

  return [
    `✅ ${title} completed${durationMin ? ` (${durationMin} min)` : ''}.`,
    ``,
    `🔁 Recovery Actions:`,
    `• Consume 20–40g protein within 30 min`,
    `• Rehydrate: drink 16–24 oz water now`,
    `• Light stretching or mobility (10 min)`,
    `• Log this session in Vellera for tracking`,
    ``,
    `💤 Prioritize 7–9 hours of sleep tonight for optimal adaptation.`,
  ].join('\n');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();

  // Google Calendar webhooks only signal a change — fetch recent events using incremental sync
  const state = body?.data?._provider_meta?.['x-goog-resource-state'];
  if (state === 'sync') return Response.json({ status: 'sync_ack' });

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // Load sync token
  const existing = await base44.asServiceRole.entities.SyncState.filter({ key: 'recovery_alert_sync' });
  const syncRecord = existing.length > 0 ? existing[0] : null;

  const now = new Date();
  let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&singleEvents=true';
  if (syncRecord?.sync_token) {
    url += `&syncToken=${encodeURIComponent(syncRecord.sync_token)}`;
  } else {
    // First run: only look at events in the past 24 hours
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    url += `&timeMin=${encodeURIComponent(since)}`;
  }

  let res = await fetch(url, { headers: authHeader });

  // syncToken expired — do a full fresh sync
  if (res.status === 410) {
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&singleEvents=true&timeMin=${encodeURIComponent(since)}`;
    res = await fetch(url, { headers: authHeader });
  }

  if (!res.ok) {
    console.error('Calendar API error:', await res.text());
    return Response.json({ status: 'api_error' }, { status: 200 });
  }

  const allItems = [];
  let pageData = await res.json();
  let newSyncToken = null;

  while (true) {
    allItems.push(...(pageData.items || []));
    if (pageData.nextSyncToken) newSyncToken = pageData.nextSyncToken;
    if (!pageData.nextPageToken) break;
    const nextRes = await fetch(url + `&pageToken=${pageData.nextPageToken}`, { headers: authHeader });
    if (!nextRes.ok) break;
    pageData = await nextRes.json();
  }

  // Save sync token
  if (newSyncToken) {
    if (syncRecord) {
      await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
        sync_token: newSyncToken,
        last_synced: now.toISOString(),
      });
    } else {
      await base44.asServiceRole.entities.SyncState.create({
        key: 'recovery_alert_sync',
        sync_token: newSyncToken,
        last_synced: now.toISOString(),
      });
    }
  }

  // Find training events that have just ended (within the last 2 hours)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const completedTraining = allItems.filter(event => {
    if (event.status === 'cancelled') return false;
    const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;
    if (!endTime) return false;
    // Event ended in the past 2 hours
    return endTime >= twoHoursAgo && endTime <= now && isTrainingEvent(event);
  });

  console.log(`Found ${allItems.length} changed events, ${completedTraining.length} completed training events`);

  // Create a recovery alert for each completed training event
  for (const event of completedTraining) {
    const message = getRecoveryMessage(event);
    const alertKey = `recovery_${event.id}_${event.end?.dateTime}`;

    // Avoid duplicate alerts
    const dupCheck = await base44.asServiceRole.entities.RecoveryAlert.filter({ description: alertKey });
    if (dupCheck.length > 0) {
      console.log(`Skipping duplicate alert for event: ${event.summary}`);
      continue;
    }

    const durationMs = event.end?.dateTime && event.start?.dateTime
      ? new Date(event.end.dateTime) - new Date(event.start.dateTime)
      : null;
    const durationMin = durationMs ? Math.round(durationMs / 60000) : null;

    await base44.asServiceRole.entities.RecoveryAlert.create({
      event_title: event.summary || 'Training Session',
      event_id: event.id,
      event_end_time: event.end.dateTime,
      alert_message: message,
      duration_minutes: durationMin,
      acknowledged: false,
      description: alertKey,
    });

    console.log(`Recovery alert created for: ${event.summary}`);
  }

  return Response.json({
    status: 'ok',
    events_scanned: allItems.length,
    alerts_triggered: completedTraining.length,
  });
});