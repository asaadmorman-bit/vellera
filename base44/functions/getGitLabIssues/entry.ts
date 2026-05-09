import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gitlab');
    const headers = { 'Authorization': `Bearer ${accessToken}` };

    // First, search for projects matching "vellera" or "mobile" or "backend"
    const searchRes = await fetch(
      'https://gitlab.com/api/v4/projects?membership=true&per_page=50&order_by=last_activity_at',
      { headers }
    );

    if (!searchRes.ok) {
      const err = await searchRes.text();
      console.error('[getGitLabIssues] Projects fetch failed:', err);
      return Response.json({ error: 'Failed to fetch projects', details: err }, { status: 500 });
    }

    const projects = await searchRes.json();
    console.log('[getGitLabIssues] Found projects:', projects.map(p => p.path_with_namespace));

    const { projectId } = await req.json().catch(() => ({}));

    // If a specific project ID is provided, use it; otherwise return projects list
    if (!projectId) {
      return Response.json({ projects: projects.map(p => ({ id: p.id, name: p.name, path: p.path_with_namespace, url: p.web_url })) });
    }

    // Fetch open issues for the specified project
    const issuesRes = await fetch(
      `https://gitlab.com/api/v4/projects/${projectId}/issues?state=opened&per_page=50&order_by=updated_at&sort=desc`,
      { headers }
    );

    if (!issuesRes.ok) {
      const err = await issuesRes.text();
      console.error('[getGitLabIssues] Issues fetch failed:', err);
      return Response.json({ error: 'Failed to fetch issues', details: err }, { status: 500 });
    }

    const issues = await issuesRes.json();

    return Response.json({
      issues: issues.map(i => ({
        iid: i.iid,
        title: i.title,
        state: i.state,
        labels: i.labels,
        assignees: i.assignees?.map(a => a.name) || [],
        milestone: i.milestone?.title || null,
        created_at: i.created_at,
        updated_at: i.updated_at,
        url: i.web_url,
        author: i.author?.name,
        priority: i.labels?.find(l => l.toLowerCase().includes('priority') || l.toLowerCase().includes('urgent') || l.toLowerCase().includes('high')) || null,
      }))
    });

  } catch (error) {
    console.error('[getGitLabIssues] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});