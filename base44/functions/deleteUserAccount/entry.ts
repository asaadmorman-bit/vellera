import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user-associated data in order of dependencies
    // Delete all custom entities linked to the user
    const userEmail = user.email;

    // Delete training sessions
    const sessions = await base44.asServiceRole.entities.TrainingSession.filter({ created_by: userEmail });
    for (const session of sessions) {
      await base44.asServiceRole.entities.TrainingSession.delete(session.id);
    }

    // Delete biometric logs
    const biometrics = await base44.asServiceRole.entities.BiometricLog.filter({ created_by: userEmail });
    for (const bio of biometrics) {
      await base44.asServiceRole.entities.BiometricLog.delete(bio.id);
    }

    // Delete techniques
    const techniques = await base44.asServiceRole.entities.Technique.filter({ created_by: userEmail });
    for (const tech of techniques) {
      await base44.asServiceRole.entities.Technique.delete(tech.id);
    }

    // Delete food logs
    const foodLogs = await base44.asServiceRole.entities.FoodLog.filter({ created_by: userEmail });
    for (const log of foodLogs) {
      await base44.asServiceRole.entities.FoodLog.delete(log.id);
    }

    // Delete wellness targets
    const targets = await base44.asServiceRole.entities.Wellness_Targets.filter({ created_by: userEmail });
    for (const target of targets) {
      await base44.asServiceRole.entities.Wellness_Targets.delete(target.id);
    }

    // Delete curriculum progress
    const progress = await base44.asServiceRole.entities.Curriculum_Progress.filter({ user_email: userEmail });
    for (const p of progress) {
      await base44.asServiceRole.entities.Curriculum_Progress.delete(p.id);
    }

    // Delete video vault entries
    const videos = await base44.asServiceRole.entities.VideoVault.filter({ created_by: userEmail });
    for (const video of videos) {
      await base44.asServiceRole.entities.VideoVault.delete(video.id);
    }

    // Delete junior sessions
    const juniorSessions = await base44.asServiceRole.entities.JuniorSession.filter({ created_by: userEmail });
    for (const js of juniorSessions) {
      await base44.asServiceRole.entities.JuniorSession.delete(js.id);
    }

    // Delete sparring partners
    const partners = await base44.asServiceRole.entities.SparringPartner.filter({ created_by: userEmail });
    for (const partner of partners) {
      await base44.asServiceRole.entities.SparringPartner.delete(partner.id);
    }

    // Delete temporal countdowns
    const countdowns = await base44.asServiceRole.entities.Temporal_Countdowns.filter({ created_by: userEmail });
    for (const countdown of countdowns) {
      await base44.asServiceRole.entities.Temporal_Countdowns.delete(countdown.id);
    }

    // Finally, the user account itself will be deleted by the platform
    // This function just cleans up all associated data

    return Response.json({ success: true, message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});