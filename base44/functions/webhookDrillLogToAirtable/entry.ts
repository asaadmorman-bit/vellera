import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * webhookDrillLogToAirtable: Send drill log data to Airtable webhook
 * Triggered when drill log (Task) is marked "Complete"
 * 
 * Flow:
 * 1. Receive drill log event
 * 2. Format payload for Airtable
 * 3. POST to Airtable webhook URL (configured in secrets)
 * 4. Log result for audit trail
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    const taskId = event?.entity_id;
    const studentEmail = data?.student_email;
    const drillTitle = data?.title;
    const videoUrl = data?.submitted_url;
    const coachEmail = data?.coach_email;
    const submittedDate = data?.submitted_date;
    const drillType = data?.task_type;

    console.log(`[webhookDrillLogToAirtable] Processing drill: ${taskId}`);

    // Get Airtable webhook URL from secrets
    const airtableWebhookUrl = Deno.env.get('AIRTABLE_WEBHOOK_URL');
    if (!airtableWebhookUrl) {
      console.warn('[webhookDrillLogToAirtable] No webhook URL configured');
      return Response.json({ 
        success: false, 
        error: 'Airtable webhook not configured' 
      }, { status: 500 });
    }

    // Build webhook payload
    const payload = {
      action: 'drill_log_completed',
      timestamp: new Date().toISOString(),
      data: {
        drill_id: taskId,
        student_email: studentEmail,
        drill_title: drillTitle,
        drill_type: drillType,
        video_url: videoUrl,
        coach_email: coachEmail,
        submitted_date: submittedDate,
        status: videoUrl ? 'complete' : 'missing_evidence',
      }
    };

    console.log('[webhookDrillLogToAirtable] Sending to:', airtableWebhookUrl);

    // POST to Airtable webhook
    const response = await fetch(airtableWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[webhookDrillLogToAirtable] Success:', result);

    return Response.json({
      success: true,
      drill_id: taskId,
      webhook_sent: true,
      status: 'synced_to_airtable',
    });

  } catch (error) {
    console.error('[webhookDrillLogToAirtable] Error:', error.message);
    return Response.json({
      success: false,
      error: error.message,
      status: 'error',
    }, { status: 500 });
  }
});