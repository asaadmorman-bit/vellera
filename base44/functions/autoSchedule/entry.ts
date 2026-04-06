import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * autoSchedule — AI-assisted conflict detection & scheduling
 *
 * Payload:
 * {
 *   title: string,
 *   event_type: string,
 *   organizer_email: string,
 *   participant_emails: string[],
 *   start_datetime: string (ISO),
 *   end_datetime: string (ISO),
 *   location?: string,
 *   org_id?: string,
 *   notes?: string
 * }
 *
 * Returns: { schedule_id, conflicts, status }
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, event_type, organizer_email, participant_emails = [], start_datetime, end_datetime } = body;

  if (!title || !start_datetime || !end_datetime || !organizer_email) {
    return Response.json({ error: 'title, organizer_email, start_datetime, end_datetime required' }, { status: 400 });
  }

  const startMs = new Date(start_datetime).getTime();
  const endMs   = new Date(end_datetime).getTime();

  if (endMs <= startMs) {
    return Response.json({ error: 'end_datetime must be after start_datetime' }, { status: 400 });
  }

  // ── Conflict detection ───────────────────────────────────────────────────
  const allEvents = await base44.asServiceRole.entities.Schedule.list();
  const allParticipants = [organizer_email, ...participant_emails];

  const conflicts = allEvents.filter(ev => {
    if (ev.status === 'cancelled') return false;
    const evStart = new Date(ev.start_datetime).getTime();
    const evEnd   = new Date(ev.end_datetime).getTime();
    const timeOverlap = startMs < evEnd && endMs > evStart;
    if (!timeOverlap) return false;

    const evParticipants = [ev.organizer_email, ...(ev.participant_emails || [])];
    return allParticipants.some(p => evParticipants.includes(p));
  });

  const conflictDetails = conflicts.length > 0
    ? conflicts.map(c => `"${c.title}" (${new Date(c.start_datetime).toLocaleString()} – ${new Date(c.end_datetime).toLocaleTimeString()})`).join('; ')
    : null;

  // ── Generate Radix-44 share code ─────────────────────────────────────────
  const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$%*+-./:';
  const ts = Date.now() % (44 ** 6);
  let code = '', n = ts;
  while (n > 0) { code = ALPHABET[n % 44] + code; n = Math.floor(n / 44); }
  const shareCode = code.padStart(6, '0');

  // ── Create the schedule record ───────────────────────────────────────────
  const record = await base44.asServiceRole.entities.Schedule.create({
    title,
    event_type: event_type || 'clinic_appointment',
    organizer_email,
    participant_emails,
    start_datetime,
    end_datetime,
    location: body.location || null,
    org_id: body.org_id || null,
    notes: body.notes || null,
    conflict_detected: conflicts.length > 0,
    conflict_details: conflictDetails,
    status: 'scheduled',
    radix44_share_code: shareCode,
  });

  console.log(`[autoSchedule] Created "${title}" | Conflicts: ${conflicts.length} | Code: ${shareCode}`);

  return Response.json({
    schedule_id: record.id,
    share_code: shareCode,
    conflict_detected: conflicts.length > 0,
    conflicts: conflicts.map(c => ({ id: c.id, title: c.title, start: c.start_datetime, end: c.end_datetime })),
    status: record.status,
    message: conflicts.length > 0
      ? `Scheduled with ${conflicts.length} conflict(s) detected`
      : 'Scheduled successfully — no conflicts',
  });
});