import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the app user's Google Tasks connection
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69e7a7a3999dc807bcd3b944');

    // Fetch task lists
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listsRes.ok) {
      console.error('[getUserTasks] Tasks API error:', listsRes.status);
      return Response.json({ error: 'Failed to fetch tasks' }, { status: listsRes.status });
    }

    const listsData = await listsRes.json();
    const lists = listsData.items || [];

    // Fetch tasks from all lists
    const allTasks = [];
    await Promise.all(
      lists.map(async (list) => {
        const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks?showCompleted=false`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const tasksData = await tasksRes.json();
        (tasksData.items || []).forEach(task => {
          allTasks.push({
            id: task.id,
            title: task.title,
            listId: list.id,
            listTitle: list.title,
            due: task.due,
            completed: task.status === 'completed',
          });
        });
      })
    );

    return Response.json({ tasks: allTasks.slice(0, 20) });
  } catch (error) {
    console.error('[getUserTasks] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});