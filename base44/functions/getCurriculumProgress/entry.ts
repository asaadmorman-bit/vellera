import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let progress;
    
    if (user.role === 'admin') {
      // Admins can see all progress records
      progress = await base44.entities.Curriculum_Progress.list('-created_date', 500);
    } else {
      // Regular users see only their own progress
      progress = await base44.entities.Curriculum_Progress.filter({ user_email: user.email });
    }

    return Response.json({ progress });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});