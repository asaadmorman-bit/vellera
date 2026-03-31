import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { progress_id, data } = payload;

    if (!progress_id || !data) {
      return Response.json({ error: 'Missing progress_id or data' }, { status: 400 });
    }

    // Fetch the progress record to verify ownership
    const progressRecord = await base44.asServiceRole.entities.Curriculum_Progress.get(progress_id);

    if (!progressRecord) {
      return Response.json({ error: 'Progress record not found' }, { status: 404 });
    }

    // Users can only update their own progress, admins can update any
    if (user.role !== 'admin' && progressRecord.user_email !== user.email) {
      return Response.json({ error: 'Forbidden: Cannot update other users progress' }, { status: 403 });
    }

    await base44.entities.Curriculum_Progress.update(progress_id, data);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});