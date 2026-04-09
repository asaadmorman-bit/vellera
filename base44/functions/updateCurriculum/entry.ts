import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Allowlist of fields admins may update on Training_Curriculum — prevents mass assignment
const ALLOWED_FIELDS = new Set([
  'title', 'description', 'status', 'level', 'duration_weeks',
  'target_audience', 'modules', 'learning_objectives', 'prerequisites',
  'tags', 'is_published', 'cover_image_url', 'category',
  'estimated_hours', 'order_index', 'instructor_notes',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const { curriculum_id, data } = payload;

    if (!curriculum_id || !data || typeof data !== 'object') {
      return Response.json({ error: 'Missing curriculum_id or data' }, { status: 400 });
    }

    // Strip any fields not in the allowlist — prevents mass assignment of sensitive fields
    const safeData = {};
    for (const [key, value] of Object.entries(data)) {
      if (ALLOWED_FIELDS.has(key)) {
        safeData[key] = value;
      } else {
        console.warn(`[updateCurriculum] Rejected field: "${key}" from admin ${user.email}`);
      }
    }

    if (Object.keys(safeData).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await base44.entities.Training_Curriculum.update(curriculum_id, safeData);
    console.log(`[updateCurriculum] admin=${user.email} curriculum_id=${curriculum_id} fields=${Object.keys(safeData).join(',')}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[updateCurriculum] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});