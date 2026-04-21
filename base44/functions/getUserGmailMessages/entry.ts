import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the app user's Gmail connection
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69e7a84510812dfc2ff006af');

    // Fetch latest 10 unread messages
    const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=10', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listRes.ok) {
      console.error('[getUserGmailMessages] Gmail API error:', listRes.status);
      return Response.json({ error: 'Failed to fetch messages' }, { status: listRes.status });
    }

    const listData = await listRes.json();
    const messageIds = (listData.messages || []).map(m => m.id);

    // Fetch full message details
    const messages = await Promise.all(
      messageIds.slice(0, 5).map(async (id) => {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];
        return {
          id: msg.id,
          from: headers.find(h => h.name === 'From')?.value || 'Unknown',
          subject: headers.find(h => h.name === 'Subject')?.value || '(No subject)',
          date: headers.find(h => h.name === 'Date')?.value,
        };
      })
    );

    return Response.json({ messages });
  } catch (error) {
    console.error('[getUserGmailMessages] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});