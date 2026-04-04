import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FORM_TITLE = 'Vellera Member Onboarding Survey';

async function findForm(accessToken) {
  const res = await fetch('https://api.typeform.com/forms?page_size=50', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return (data.items || []).find(f => f.title === FORM_TITLE);
}

async function getResponses(accessToken, formId) {
  const res = await fetch(`https://api.typeform.com/forms/${formId}/responses?page_size=100&sort=submitted_at%2Cdesc`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return data.items || [];
}

function parseResponse(item) {
  const answers = {};
  (item.answers || []).forEach(a => {
    const label = a.field?.ref || a.field?.id || '';
    answers[label] = a.text || a.email || a.number || a.choice?.label || a.choices?.labels?.join(', ') || '';
  });
  // Build a readable summary from answers
  const vals = Object.values(answers).filter(Boolean);
  return {
    response_id: item.response_id,
    submitted_at: item.submitted_at,
    summary: vals.join(' | '),
    raw: answers,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { response_id } = body; // optional: process a single response

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('typeform');
    const form = await findForm(accessToken);
    if (!form) return Response.json({ error: 'Onboarding form not found. Visit /member-onboarding to create it.' }, { status: 404 });

    const rawItems = await getResponses(accessToken, form.id);
    const toProcess = response_id
      ? rawItems.filter(i => i.response_id === response_id)
      : rawItems;

    console.log(`Processing ${toProcess.length} Typeform responses into training plans...`);

    const results = [];
    for (const item of toProcess) {
      const parsed = parseResponse(item);

      // Check if we already generated a plan for this response
      const existing = await base44.asServiceRole.entities.TrainingPlan.filter({ notes: `typeform:${parsed.response_id}` });
      if (existing.length > 0) {
        results.push({ response_id: parsed.response_id, status: 'already_exists', plan_id: existing[0].id });
        continue;
      }

      // Use LLM to generate a structured training plan from the survey answers
      const prompt = `You are Vellera's AI performance coach. A new member completed the onboarding survey.

Survey answers: ${parsed.summary}

Based on their answers, generate a personalized 4-week training plan JSON with:
- plan_name: descriptive name based on their goals
- primary_goal: one of [strength, bjj, endurance, bodybuilding, tactical, whole_health]
- base_intensity_level: one of [Beginner, Intermediate, Advanced]
- total_phases: 2
- weeks: array of 4 weeks. Each week has week_number, phase (1 or 2), focus (string), and days (array of 7 days with day_of_week 0-6, base_activity string, base_duration_minutes number, base_intensity one of [light, moderate, high, max], is_adjusted: false)
- notes: brief coaching note for this athlete (keep it under 100 words)

Ensure rest days exist (1-2 per week). Tailor to their stated fitness level, goals, and available days per week.`;

      const planData = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            plan_name: { type: 'string' },
            primary_goal: { type: 'string' },
            base_intensity_level: { type: 'string' },
            total_phases: { type: 'number' },
            weeks: { type: 'array', items: { type: 'object' } },
            notes: { type: 'string' },
          },
        },
      });

      // Extract email from answers if available
      const memberEmail = Object.values(parsed.raw).find(v => v && v.includes('@')) || 'unknown@vellera.app';
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0];

      const plan = await base44.asServiceRole.entities.TrainingPlan.create({
        plan_name: planData.plan_name || 'Personalized Vellera Plan',
        user_email: memberEmail,
        start_date: startDate,
        end_date: endDate,
        primary_goal: planData.primary_goal || 'whole_health',
        base_intensity_level: planData.base_intensity_level || 'Beginner',
        total_phases: planData.total_phases || 2,
        current_phase: 1,
        auto_adjust_enabled: true,
        weeks: planData.weeks || [],
        notes: `typeform:${parsed.response_id} | ${planData.notes || ''}`,
      });

      console.log(`Created plan ${plan.id} for response ${parsed.response_id}`);
      results.push({ response_id: parsed.response_id, status: 'created', plan_id: plan.id, plan_name: plan.plan_name, member_email: memberEmail });
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    console.error('generatePlansFromTypeform error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});