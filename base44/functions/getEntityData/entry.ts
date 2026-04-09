import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * getEntityData — Authenticated entity data fetcher
 *
 * Access control:
 * - All callers must be authenticated
 * - Regular users: only entities in USER_ALLOWED_ENTITIES, fetched via user-scoped SDK (RLS enforced)
 * - Admins: access to ADMIN_ALLOWED_ENTITIES, fetched via service role
 *
 * Payload: { entity: string, filter?: object, sort?: string, limit?: number }
 */

// Entities regular users may query — all subject to entity-level RLS
const USER_ALLOWED_ENTITIES = new Set([
  'TrainingSession', 'TrainingPlan', 'WellnessLog', 'BiometricLog',
  'NutritionPlan', 'MacroTracker', 'HydrationLog', 'MobilityRoutine',
  'PhysiqueTracker', 'BJJTacticalJournal', 'SkillRoadmap', 'Milestone',
  'Achievement', 'SquadMembership', 'SquadPost', 'SquadChallenge',
  'SparringPartner', 'FoodLog', 'SupplementLog', 'Technique',
  'Curriculum_Progress', 'ReadinessCheckIn', 'CoachFeedback',
  'Task', 'Message', 'LiftVideo', 'VideoVault',
]);

// Additional entities admins may query via service role
const ADMIN_ALLOWED_ENTITIES = new Set([
  ...USER_ALLOWED_ENTITIES,
  'BetaTester', 'BetaRequest', 'Organization', 'OrganizationMember',
  'Coach', 'Instructor', 'InstructorAssignment', 'Activity_Logs',
  'Operational_Businesses', 'EDS_Enterprise_Hub', 'TeamSchedule',
  'Schedule', 'ClinicalAssessment', 'ExerciseLibrary', 'ExerciseModification',
  'Referral', 'ZuluShredMetrics', 'ApprovalRequest', 'System_Config',
  'Session_History', 'MonthlyConsistency', 'PlanAdjustment',
]);

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { entity, filter = {}, sort = '-created_date', limit = 50 } = body;

  if (!entity) {
    return Response.json({ error: 'Missing required field: entity' }, { status: 400 });
  }

  const isAdmin = user.role === 'admin';
  const allowedEntities = isAdmin ? ADMIN_ALLOWED_ENTITIES : USER_ALLOWED_ENTITIES;

  if (!allowedEntities.has(entity)) {
    console.warn(`[getEntityData] Denied: user=${user.email} entity=${entity} isAdmin=${isAdmin}`);
    return Response.json({ error: `Access denied for entity: ${entity}` }, { status: 403 });
  }

  // Clamp limit to prevent large data dumps
  const safeLimit = Math.min(Math.max(1, parseInt(limit) || 50), 200);

  console.log(`[getEntityData] user=${user.email} entity=${entity} limit=${safeLimit}`);

  // Regular users: use user-scoped SDK so entity RLS is enforced
  // Admins: use service role for full access
  const sdk = isAdmin ? base44.asServiceRole : base44;
  const entityStore = sdk.entities[entity];

  if (!entityStore) {
    return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
  }

  const data = Object.keys(filter).length > 0
    ? await entityStore.filter(filter, sort, safeLimit)
    : await entityStore.list(sort, safeLimit);

  return Response.json({ success: true, entity, count: data.length, data });
});