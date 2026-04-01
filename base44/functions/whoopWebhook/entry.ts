import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Whoop pushes events here in real-time when new data is available
Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ ok: true }); // verification ping

  const body = await req.json();
  const { user_id, type } = body;

  if (!user_id || !["recovery.updated", "sleep.updated", "workout.updated"].includes(type)) {
    return Response.json({ ok: true });
  }

  const base44 = createClientFromRequest(req);

  // Find token record by whoop_user_id
  const tokens = await base44.asServiceRole.entities.WhoopToken.filter({ whoop_user_id: String(user_id) });
  if (!tokens.length) return Response.json({ ok: true });

  // Trigger a sync for this user by invoking whoopSync as service role
  // We use the functions invoke to reuse sync logic
  try {
    await base44.asServiceRole.functions.invoke("whoopSync", {});
  } catch {
    // best-effort — don't fail the webhook
  }

  return Response.json({ ok: true });
});