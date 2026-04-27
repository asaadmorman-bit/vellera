import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RECOVERY_LIST_TITLE = 'Vellera Recovery Logs';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Use the shared Google Calendar connector (already authorized, same Google OAuth)
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('googlecalendar');
      accessToken = conn.accessToken;
    } catch (e) {
      console.error('[addRecoveryLogTask] Connector not available:', e.message);
      return Response.json({ error: 'Google connector not available.' }, { status: 400 });
    }

    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Find or create the "Vellera Recovery Logs" task list
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', { headers: authHeader });
    if (!listsRes.ok) {
      const err = await listsRes.text();
      console.error('[addRecoveryLogTask] Lists fetch failed:', listsRes.status, err);
      return Response.json({ error: 'Google Tasks API unavailable. Ensure Tasks scope is authorized.' }, { status: 400 });
    }

    const listsData = await listsRes.json();
    const lists = listsData.items || [];

    let targetList = lists.find(l => l.title === RECOVERY_LIST_TITLE);
    if (!targetList) {
      const createListRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ title: RECOVERY_LIST_TITLE }),
      });
      targetList = await createListRes.json();
      console.log(`[addRecoveryLogTask] Created task list: ${RECOVERY_LIST_TITLE}`);
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const due = new Date(today);
    due.setHours(23, 59, 0, 0);

    const taskBody = {
      title: `📊 Log Recovery Data — ${dateStr}`,
      notes: `Daily biometric check-in for Vellera.\n\nLog: HRV, Recovery %, Sleep Performance, Resting HR, Strain.\n\nOpen: /wellness-dashboard`,
      due: due.toISOString(),
    };

    const createTaskRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${targetList.id}/tasks`,
      { method: 'POST', headers: authHeader, body: JSON.stringify(taskBody) }
    );

    if (!createTaskRes.ok) {
      const err = await createTaskRes.text();
      console.error('[addRecoveryLogTask] Failed to create task:', err);
      return Response.json({ error: 'Failed to create task in Google Tasks.' }, { status: 500 });
    }

    const task = await createTaskRes.json();
    console.log(`[addRecoveryLogTask] Created task for ${user.email}: ${task.id}`);
    return Response.json({ success: true, task });
  } catch (error) {
    console.error('[addRecoveryLogTask] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});