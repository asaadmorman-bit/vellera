import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Syncs production entity schemas to GitLab as db/schema.json.
 * Schema data is pulled from the Base44 platform (entity definitions),
 * then committed to the configured GitLab project.
 *
 * Triggered daily by automation, or manually by an admin.
 */

// All entities to document in the schema snapshot
const TRACKED_ENTITIES = [
  'UserProfile', 'TrainingSession', 'MacroTracker', 'BiometricLog',
  'CoachFeedback', 'LabSession', 'LiftVideo', 'ExerciseLibrary',
  'BJJTacticalJournal', 'MobilityRoutine', 'HydrationLog', 'PhysiqueTracker',
  'SkillRoadmap', 'NutritionPlan', 'MonthlyConsistency', 'WhoopToken',
  'WearableToken', 'TeamSchedule', 'TrainingSquad', 'SquadMembership',
  'ReadinessCheckIn', 'WellnessLog', 'Session_History', 'VideoVault',
  'ZuluShredMetrics', 'System_Config', 'SyncState', 'RecoveryAlert',
  'Activity_Logs', 'Operational_Businesses', 'TrainingPlan', 'Achievement',
  'SquadChallenge', 'TrainingProgram', 'StudentProfile', 'Instructor',
  'Schedule', 'Organization', 'Task', 'Message', 'BJJTacticalJournal',
  'HydrationLog', 'MobilityRoutine', 'PhysiqueTracker', 'SkillRoadmap',
];

const GITLAB_API = 'https://gitlab.com/api/v4';
const SCHEMA_FILE_PATH = 'db%2Fschema.json';
const BRANCH = 'main';

// Infer field types from a sample record
function inferSchemaFromRecord(record) {
  if (!record) return { type: 'object', properties: {}, note: 'no_records_found' };
  const properties = {};
  const systemFields = ['id', 'created_date', 'updated_date', 'created_by'];
  for (const [key, value] of Object.entries(record)) {
    if (systemFields.includes(key)) continue;
    if (value === null || value === undefined) {
      properties[key] = { type: 'unknown' };
    } else if (Array.isArray(value)) {
      properties[key] = { type: 'array', sample_item: value[0] ?? null };
    } else if (typeof value === 'object') {
      properties[key] = { type: 'object', sample_keys: Object.keys(value) };
    } else {
      properties[key] = { type: typeof value };
    }
  }
  return {
    type: 'object',
    properties,
    system_fields: systemFields,
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow admin users or automation/service-role calls
  let isAdmin = false;
  try {
    const user = await base44.auth.me();
    isAdmin = user?.role === 'admin';
  } catch (_) {
    isAdmin = true; // automation call — no user context
  }

  if (!isAdmin) {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // --- Step 1: Get GitLab access token ---
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gitlab');
  const authHeader = { Authorization: `Bearer ${accessToken}` };

  const meRes = await fetch(`${GITLAB_API}/user`, { headers: authHeader });
  if (!meRes.ok) {
    const err = await meRes.text();
    console.error('GitLab /user error:', err);
    return Response.json({ error: 'Failed to get GitLab user', detail: err }, { status: 502 });
  }
  const me = await meRes.json();
  console.log('GitLab user:', me.username);

  // --- Step 2: Find GitLab project ---
  const projectsRes = await fetch(
    `${GITLAB_API}/projects?membership=true&per_page=50&owned=true`,
    { headers: authHeader }
  );
  const projects = projectsRes.ok ? await projectsRes.json() : [];

  let project = projects.find(p =>
    p.name.toLowerCase().includes('vellera') ||
    p.path.toLowerCase().includes('vellera') ||
    p.name.toLowerCase().includes('asaad') ||
    p.path.toLowerCase().includes('asaad')
  ) || projects[0];

  if (!project) {
    return Response.json({ error: 'No GitLab project found.' }, { status: 404 });
  }

  console.log('Using project:', project.path_with_namespace);
  const encodedProjectId = encodeURIComponent(project.path_with_namespace);

  // --- Step 3: Introspect entity schemas from Base44 ---
  // We fetch one record per entity to infer its field structure,
  // plus we capture record counts for change detection.
  const dedupedEntities = [...new Set(TRACKED_ENTITIES)];
  const entitySnapshots = {};
  let totalEntitiesSynced = 0;

  await Promise.allSettled(
    dedupedEntities.map(async (entityName) => {
      try {
        const entityApi = base44.asServiceRole.entities[entityName];
        if (!entityApi) return;

        // Fetch a sample record to infer schema
        const records = await entityApi.list('-created_date', 1);
        const sample = records?.[0] ?? null;
        const inferredSchema = inferSchemaFromRecord(sample);

        // Get approximate count (list with high limit returns actual count)
        const countRecords = await entityApi.list('-created_date', 1000);
        const recordCount = countRecords?.length ?? 0;

        entitySnapshots[entityName] = {
          ...inferredSchema,
          record_count: recordCount,
          last_updated: sample?.updated_date ?? null,
        };

        totalEntitiesSynced++;
        console.log(`✓ ${entityName}: ${recordCount} records`);
      } catch (err) {
        console.warn(`✗ ${entityName}: ${err.message}`);
        entitySnapshots[entityName] = { type: 'object', error: err.message };
      }
    })
  );

  console.log(`Schema snapshot: ${totalEntitiesSynced}/${dedupedEntities.length} entities loaded`);

  // --- Step 4: Build schema document ---
  const schemaDoc = {
    generated_at: new Date().toISOString(),
    app: 'Vellera',
    entity_count: totalEntitiesSynced,
    entities: entitySnapshots,
  };

  const schemaContent = JSON.stringify(schemaDoc, null, 2);

  // --- Step 5: Push to GitLab ---
  const fileCheckRes = await fetch(
    `${GITLAB_API}/projects/${encodedProjectId}/repository/files/${SCHEMA_FILE_PATH}?ref=${BRANCH}`,
    { headers: authHeader }
  );

  const commitMessage = `chore: sync db schema [${new Date().toISOString().slice(0, 10)}] — ${totalEntitiesSynced} entities`;
  const filePayload = {
    branch: BRANCH,
    content: schemaContent,
    commit_message: commitMessage,
    encoding: 'text',
  };

  const fileMethod = fileCheckRes.ok ? 'PUT' : 'POST';
  const fileUrl = `${GITLAB_API}/projects/${encodedProjectId}/repository/files/${SCHEMA_FILE_PATH}`;

  console.log(`${fileMethod === 'PUT' ? 'Updating' : 'Creating'} db/schema.json`);

  const pushRes = await fetch(fileUrl, {
    method: fileMethod,
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(filePayload),
  });

  if (!pushRes.ok) {
    const err = await pushRes.text();
    console.error('GitLab push error:', err);
    return Response.json({ error: 'Failed to push schema file', detail: err }, { status: 502 });
  }

  const pushData = await pushRes.json();

  return Response.json({
    success: true,
    project: project.path_with_namespace,
    file: 'db/schema.json',
    branch: BRANCH,
    entities_synced: totalEntitiesSynced,
    commit: pushData.id || pushData.file_path,
    commit_message: commitMessage,
  });
});