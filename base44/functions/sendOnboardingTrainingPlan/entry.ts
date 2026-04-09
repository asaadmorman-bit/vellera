import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Escape user-supplied values for safe HTML embedding — prevents XSS
const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function buildMimeEmail(from, to, subject, htmlBody) {
  const mimeEmail = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    htmlBody,
  ].join('\n');
  return btoa(mimeEmail).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmailMessage(accessToken, raw) {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Gmail error: ${err.error?.message || res.statusText}`);
  }
  return res.json();
}

async function generateTrainingPlan(base44, typeformData) {
  const prompt = `You are an elite fitness coach. Create a personalized 4-week training plan for a new recruit.

Recruit Profile:
- Name: ${typeformData.name || 'Unknown'}
- Age: ${typeformData.age || 'Not specified'}
- Fitness Level: ${typeformData.fitness_level || 'Beginner'}
- Primary Disciplines: ${typeformData.disciplines || 'General Fitness'}
- Goals: ${typeformData.goals || 'Improve overall fitness'}
- Availability: ${typeformData.availability || '3-4 days/week'}
- Known Injuries: ${typeformData.injuries || 'None'}

Format as plain text with section headers (Week 1, Week 2, etc.) and actionable tips. Keep it motivational and achievable.`;

  return base44.integrations.Core.InvokeLLM({ prompt, model: 'gpt_5_mini' });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only — prevents open email relay abuse
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { recruitEmail, recruitName, typeformData } = body;

    // Validate email format and strip newlines — prevents MIME header injection
    if (!recruitEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recruitEmail) || /[\r\n]/.test(recruitEmail)) {
      return Response.json({ error: 'Invalid or missing recruitEmail' }, { status: 400 });
    }

    if (!typeformData) {
      return Response.json({ error: 'recruitEmail and typeformData required' }, { status: 400 });
    }

    console.log(`[sendOnboardingTrainingPlan] Generating plan for ${recruitEmail}`);
    const planContent = await generateTrainingPlan(base44, typeformData);

    const gmailConn = await base44.asServiceRole.connectors.getConnection('gmail');
    const gmailAccessToken = gmailConn.accessToken;

    // Escape all user-supplied values embedded in HTML — prevents XSS via LLM output or user data
    const safeRecruitName = escapeHtml(recruitName || 'Recruit');
    const safeFitnessLevel = escapeHtml(typeformData.fitness_level || 'Not specified');
    const safeDisciplines = escapeHtml(typeformData.disciplines || 'Not specified');
    const safeGoals = escapeHtml(typeformData.goals || 'Not specified');
    // LLM output is plain text — wrap in <pre> to prevent HTML interpretation
    const safePlanContent = `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(planContent)}</pre>`;

    const htmlBody = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #00E5FF;">Your Personalized 4-Week Training Plan</h1>
      <p>Hi ${safeRecruitName},</p>
      <p>Welcome to Vellera! Based on your onboarding profile, we've crafted a personalized training plan to help you achieve your fitness goals.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${safePlanContent}
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">Questions? Reply to this email or visit your Vellera dashboard.</p>
      <p style="color: #666; font-size: 12px;">Coach Colin &amp; the Vellera Team</p>
    </div>
  </body>
</html>`;

    const from = 'noreply@vellera.io';
    const subject = `Your Personalized 4-Week Training Plan - ${safeRecruitName}`;
    const result = await sendGmailMessage(gmailAccessToken, buildMimeEmail(from, recruitEmail, subject, htmlBody));
    console.log(`[sendOnboardingTrainingPlan] Training plan sent to ${recruitEmail}`);

    // Notify coach
    const coachEmail = 'colin@example.com';
    const coachHtmlBody = `
<html><body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #00E5FF;">Training Plan Generated</h2>
    <p>A new plan was generated for:</p>
    <ul>
      <li><strong>Recruit:</strong> ${safeRecruitName}</li>
      <li><strong>Email:</strong> ${escapeHtml(recruitEmail)}</li>
      <li><strong>Fitness Level:</strong> ${safeFitnessLevel}</li>
      <li><strong>Disciplines:</strong> ${safeDisciplines}</li>
      <li><strong>Goals:</strong> ${safeGoals}</li>
    </ul>
  </div>
</body></html>`;

    try {
      await sendGmailMessage(gmailAccessToken, buildMimeEmail('noreply@vellera.io', coachEmail, `[Vellera] Training Plan — ${safeRecruitName}`, coachHtmlBody));
    } catch (err) {
      console.warn(`[sendOnboardingTrainingPlan] Coach notification failed: ${err.message}`);
    }

    return Response.json({ message: `Training plan sent to ${recruitEmail}`, messageId: result.id });
  } catch (error) {
    console.error('[sendOnboardingTrainingPlan] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});