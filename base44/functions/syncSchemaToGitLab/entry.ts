import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Entities whose schemas we want to track in GitLab
const TRACKED_ENTITIES = [
  'UserProfile', 'TrainingSession', 'MacroTracker', 'BiometricLog',
  'CoachFeedback', 'LabSession', 'LiftVideo', 'ExerciseLibrary',
  'BJJTacticalJournal', 'MobilityRoutine', 'HydrationLog', 'PhysiqueTracker',
  'SkillRoadmap', 'NutritionPlan', 'MonthlyConsistency', 'WhoopToken',
  'WearableToken', 'TeamSchedule', 'TrainingSquad', 'SquadMembership',
  'ReadinessCheckIn', 'WellnessLog', 'Session_History', 'VideoVault',
  'ZuluShredMetrics', 'System_Config', 'SyncState',
];

const GITLAB_API = 'https://gitlab.com/api/v4';
const SCHEMA_FILE_PATH = 'db%2Fschema.json'; // db/schema.json URL-encoded
const BRANCH = 'main';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow both authenticated users (admin) and service-role calls from automations
  let isAdmin = false;
  try {
    const user = await base44.auth.me();
    isAdmin = user?.role === 'admin';
  } catch (_) {
    // Automation / service-role call — allow
    isAdmin = true;
  }

  if (!isAdmin) {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gitlab');
  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // 1. Get the GitLab user to find their namespace/project
  const meRes = await fetch(`${GITLAB_API}/user`, { headers: authHeader });
  if (!meRes.ok) {
    const err = await meRes.text();
    console.error('GitLab /user error:', err);
    return Response.json({ error: 'Failed to get GitLab user', detail: err }, { status: 502 });
  }
  const me = await meRes.json();

  // 2. Find a project named "vellera" or "vellera-app" in the user's namespace
  const projectsRes = await fetch(
    `${GITLAB_API}/users/${me.id}/projects?search=vellera&per_page=10`,
    { headers: authHeader }
  );
  const projects = projectsRes.ok ? await projectsRes.json() : [];

  // Fall back: list all projects and pick the first one
  let project = projects.find(p =>
    p.name.toLowerCase().includes('vellera') ||
    p.path.toLowerCase().includes('vellera')
  );

  if (!project) {
    // Try listing all projects
    const allRes = await fetch(`${GITLAB_API}/projects?membership=true&per_page=20&owned=true`, { headers: authHeader });
    const all = allRes.ok ? await allRes.json() : [];
    project = all[0]; // Use first owned project as fallback
  }

  if (!project) {
    return Response.json({
      error: 'No GitLab project found. Please create a project named "vellera" in your GitLab account.'
    }, { status: 404 });
  }

  const projectId = project.id;
  const encodedProjectId = encodeURIComponent(project.path_with_namespace);

  // 3. Fetch current entity schemas
  const schemas = {};
  for (const entityName of TRACKED_ENTITIES) {
    try {
      const schema = await base44.asServiceRole.entities[entityName]?.schema?.();
      if (schema) schemas[entityName] = schema;
    } catch (_) {
      // Entity may not exist — skip silently
    }
  }

  const schemaContent = JSON.stringify({
    generated_at: new Date().toISOString(),
    entity_count: Object.keys(schemas).length,
    entities: schemas,
  }, null, 2);

  const contentBase64 = btoa(unescape(encodeURIComponent(schemaContent)));

  // 4. Check if file already exists to decide create vs update
  const fileCheckRes = await fetch(
    `${GITLAB_API}/projects/${encodedProjectId}/repository/files/${SCHEMA_FILE_PATH}?ref=${BRANCH}`,
    { headers: authHeader }
  );

  const commitMessage = `chore: sync db schema [${new Date().toISOString().slice(0, 10)}]`;
  const filePayload = {
    branch: BRANCH,
    content: schemaContent,
    commit_message: commitMessage,
    encoding: 'text',
  };

  let fileMethod, fileUrl;
  if (fileCheckRes.ok) {
    // File exists — update it
    fileMethod = 'PUT';
    fileUrl = `${GITLAB_API}/projects/${encodedProjectId}/repository/files/${SCHEMA_FILE_PATH}`;
  } else {
    // File doesn't exist — create it
    fileMethod = 'POST';
    fileUrl = `${GITLAB_API}/projects/${encodedProjectId}/repository/files/${SCHEMA_FILE_PATH}`;
  }

  const pushRes = await fetch(fileUrl, {
    method: fileMethod,
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(filePayload),
  });

  if (!pushRes.ok) {
    const err = await pushRes.text();
    console.error('GitLab file push error:', err);
    return Response.json({ error: 'Failed to push schema file', detail: err }, { status: 502 });
  }

  const pushData = await pushRes.json();

  return Response.json({
    success: true,
    project: project.path_with_namespace,
    file: 'db/schema.json',
    branch: BRANCH,
    entities_synced: Object.keys(schemas).length,
    commit: pushData.id || pushData.file_path,
    commit_message: commitMessage,
  });
});