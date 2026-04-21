import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the app user's Google Calendar connection
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69e7a7202687f45218c44281');

    // Fetch calendar events for the next 7 days
    const now = new Date().toISOString();
    const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: 'GET',
    });

    if (!res.ok) {
      console.error('[getUserCalendarEvents] Calendar API error:', res.status);
      return Response.json({ error: 'Failed to fetch calendar events' }, { status: res.status });
    }

    const data = await res.json();
    const events = (data.items || [])
      .filter(e => e.start?.dateTime && new Date(e.start.dateTime) >= new Date(now) && new Date(e.start.dateTime) <= new Date(weekLater))
      .map(e => ({
        id: e.id,
        title: e.summary,
        start: e.start?.dateTime,
        end: e.end?.dateTime,
        description: e.description,
      }))
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    return Response.json({ events });
  } catch (error) {
    console.error('[getUserCalendarEvents] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});