import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Whitelist of fields callers are allowed to update — prevents mass assignment
const ALLOWED_FIELDS = new Set([
  'status', 'progress_pct', 'completed_at', 'score', 'notes',
  'current_module', 'current_lesson', 'feedback', 'attempts',
  'last_activity_at', 'is_complete', 'xp_earned',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { progress_id, data } = payload;

    if (!progress_id || !data || typeof data !== 'object') {
      return Response.json({ error: 'Missing progress_id or data' }, { status: 400 });
    }

    // Strip any fields not in the allowlist — prevents mass assignment
    const safeData = {};
    for (const [key, value] of Object.entries(data)) {
      if (ALLOWED_FIELDS.has(key)) {
        safeData[key] = value;
      } else {
        console.warn(`[updateCurriculumProgress] Rejected field: ${key} from user ${user.email}`);
      }
    }

    if (Object.keys(safeData).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Fetch the progress record to verify ownership
    const progressRecord = await base44.asServiceRole.entities.Curriculum_Progress.get(progress_id);
    if (!progressRecord) {
      return Response.json({ error: 'Progress record not found' }, { status: 404 });
    }

    // Users can only update their own progress; admins can update any
    if (user.role !== 'admin' && progressRecord.user_email !== user.email) {
      return Response.json({ error: 'Forbidden: Cannot update other users progress' }, { status: 403 });
    }

    await base44.entities.Curriculum_Progress.update(progress_id, safeData);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[updateCurriculumProgress] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});