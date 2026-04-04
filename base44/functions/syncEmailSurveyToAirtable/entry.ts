import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function parseEmailBody(mimeMessage) {
  // Extract text from MIME body
  const parts = mimeMessage.payload?.parts || [];
  let text = '';

  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      text = Buffer.from(part.body.data, 'base64').toString('utf-8');
      break;
    }
  }

  if (!text && mimeMessage.payload?.body?.data) {
    text = Buffer.from(mimeMessage.payload.body.data, 'base64').toString('utf-8');
  }

  return text;
}

function extractSurveyData(emailText, senderEmail) {
  // Simple extraction: look for key: value pairs
  const data = { Email: senderEmail };
  const lines = emailText.split('\n');

  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      const cleanKey = key.trim();
      data[cleanKey] = value.trim();
    }
  }

  return data;
}

async function createAirtableRecord(accessToken, baseId, tableId, fields) {
  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Airtable error: ${err.error?.message || res.statusText}`);
  }

  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Get message IDs from webhook
    const messageIds = body.data?.new_message_ids || [];

    // Get params from request
    const { baseId, tableId, fromEmailFilter } = body;

    if (!messageIds.length) {
      return Response.json({ message: 'No new messages to process' });
    }

    if (!baseId || !tableId) {
      return Response.json(
        { error: 'baseId and tableId required' },
        { status: 400 }
      );
    }

    const gmailConn = await base44.asServiceRole.connectors.getConnection('gmail');
    const airtableConn = await base44.asServiceRole.connectors.getConnection('airtable');

    const gmailToken = gmailConn.accessToken;
    const airtableToken = airtableConn.accessToken;

    console.log(`Processing ${messageIds.length} email(s)...`);

    let synced = 0;
    let skipped = 0;

    for (const messageId of messageIds) {
      try {
        // Fetch full email message
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
          { headers: { Authorization: `Bearer ${gmailToken}` } }
        );

        if (!msgRes.ok) {
          console.warn(`Failed to fetch message ${messageId}`);
          continue;
        }

        const message = await msgRes.json();
        const headers = message.payload?.headers || [];

        // Extract sender and subject
        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const subjectHeader = headers.find(h => h.name === 'Subject')?.value || '';
        const senderEmail = fromHeader.match(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)?.[1] || fromHeader;

        // Skip if not matching filter (if provided)
        if (fromEmailFilter && !senderEmail.includes(fromEmailFilter)) {
          skipped++;
          continue;
        }

        // Parse email body
        const emailText = parseEmailBody(message);
        const surveyData = extractSurveyData(emailText, senderEmail);

        // Add email metadata
        surveyData['Email Subject'] = subjectHeader;
        surveyData['Gmail Message ID'] = messageId;
        surveyData['Received At'] = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

        // Create Airtable record
        await createAirtableRecord(airtableToken, baseId, tableId, surveyData);
        synced++;
        console.log(`Synced email from ${senderEmail} to Airtable`);
      } catch (err) {
        console.error(`Failed to process message ${messageId}:`, err.message);
      }
    }

    return Response.json({
      message: `Sync complete: ${synced} emails synced, ${skipped} skipped`,
      synced,
      skipped,
    });
  } catch (error) {
    console.error('syncEmailSurveyToAirtable error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});