import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TASKS_CONNECTOR_ID = '69e7a7a3999dc807bcd3b944';
const RECOVERY_LIST_TITLE = 'Vellera Recovery Logs';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(TASKS_CONNECTOR_ID);
    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Find or create the "Vellera Recovery Logs" task list
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', { headers: authHeader });
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
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const due = new Date(today);
    due.setHours(23, 59, 0, 0);

    const taskBody = {
      title: `📊 Log Recovery Data — ${dateStr}`,
      notes: `Daily biometric check-in for Vellera.\n\nLog: HRV, Recovery %, Sleep Performance, Resting HR, Strain.\n\nGo to: vellera.app/wellness-dashboard`,
      due: due.toISOString(),
    };

    const createTaskRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${targetList.id}/tasks`,
      { method: 'POST', headers: authHeader, body: JSON.stringify(taskBody) }
    );

    if (!createTaskRes.ok) {
      const err = await createTaskRes.text();
      console.error('[addRecoveryLogTask] Failed to create task:', err);
      return Response.json({ error: 'Failed to create task' }, { status: 500 });
    }

    const task = await createTaskRes.json();
    console.log(`[addRecoveryLogTask] Created task for ${user.email}: ${task.id}`);
    return Response.json({ success: true, task });
  } catch (error) {
    console.error('[addRecoveryLogTask] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});