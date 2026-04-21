import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the app user's Google Docs connection
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69e7a7d44ac5ccf6562aa4b4');

    // Fetch user's documents via Google Drive API (Docs are stored as files)
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&spaces=drive&pageSize=10&fields=files(id,name,createdTime,modifiedTime,webViewLink)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.error('[getUserDocs] Drive API error:', res.status);
      return Response.json({ error: 'Failed to fetch documents' }, { status: res.status });
    }

    const data = await res.json();
    const docs = (data.files || []).map(doc => ({
      id: doc.id,
      name: doc.name,
      created: doc.createdTime,
      modified: doc.modifiedTime,
      url: doc.webViewLink,
    }));

    return Response.json({ docs });
  } catch (error) {
    console.error('[getUserDocs] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});