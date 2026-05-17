import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  // sessions: [{ title, startDateTime, endDateTime, description }]
  const { sessions } = body;

  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return Response.json({ error: 'No sessions provided' }, { status: 400 });
  }

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

  const results = [];
  for (const session of sessions) {
    const event = {
      summary: session.title,
      description: session.description || 'Martial arts drill session scheduled via Vellera.',
      start: { dateTime: session.startDateTime, timeZone: 'America/New_York' },
      end: { dateTime: session.endDateTime, timeZone: 'America/New_York' },
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 30 }],
      },
    };

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      results.push({ success: false, title: session.title, error: data.error?.message });
    } else {
      results.push({ success: true, title: session.title, eventId: data.id, htmlLink: data.htmlLink });
    }
  }

  const allOk = results.every(r => r.success);
  return Response.json({ success: allOk, results });
});