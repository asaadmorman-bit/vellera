import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FORM_TITLE = 'Vellera Member Onboarding Survey';

const SURVEY_DEFINITION = {
  title: FORM_TITLE,
  fields: [
    { title: "What's your full name?", type: 'short_text', validations: { required: true } },
    { title: "What's your email address?", type: 'email', validations: { required: true } },
    { title: "How old are you?", type: 'number', validations: { required: true, min_value: 13, max_value: 99 } },
    {
      title: "What is your current fitness level?", type: 'multiple_choice', validations: { required: true },
      properties: {
        choices: [
          { label: 'Complete Beginner' },
          { label: 'Some Experience (1-2 years)' },
          { label: 'Intermediate (3-5 years)' },
          { label: 'Advanced / Competitive' },
        ],
      },
    },
    {
      title: "Which disciplines are you most interested in? (Select all that apply)", type: 'multiple_choice',
      properties: {
        allow_multiple_selection: true,
        choices: [
          { label: 'BJJ / Grappling' },
          { label: 'MMA / Striking' },
          { label: 'Strength & Conditioning' },
          { label: 'Endurance / Cardio' },
          { label: 'Mobility & Recovery' },
          { label: 'Wrestling' },
        ],
      },
    },
    {
      title: "What is your primary training goal?", type: 'multiple_choice', validations: { required: true },
      properties: {
        choices: [
          { label: 'Compete in BJJ or MMA' },
          { label: 'Lose weight / Get lean' },
          { label: 'Build strength & muscle' },
          { label: 'Improve overall fitness' },
          { label: 'Stress relief & mental health' },
          { label: 'Self-defense' },
        ],
      },
    },
    {
      title: "How many days per week can you train?", type: 'multiple_choice', validations: { required: true },
      properties: { choices: [{ label: '1-2 days' }, { label: '3-4 days' }, { label: '5-6 days' }, { label: 'Every day' }] },
    },
    { title: "Do you have any injuries or physical limitations we should know about?", type: 'long_text' },
    {
      title: "How did you hear about Vellera?", type: 'multiple_choice',
      properties: {
        choices: [
          { label: 'Social media' },
          { label: 'Friend / Referral' },
          { label: 'Google search' },
          { label: 'YouTube' },
          { label: 'Other' },
        ],
      },
    },
    { title: "Anything else you'd like your coach to know before your first session?", type: 'long_text' },
  ],
  settings: { is_public: true },
};

async function findExistingForm(accessToken) {
  const res = await fetch('https://api.typeform.com/forms?page_size=50', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return (data.items || []).find(f => f.title === FORM_TITLE);
}

async function createForm(accessToken) {
  const res = await fetch('https://api.typeform.com/forms', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(SURVEY_DEFINITION),
  });
  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action = 'get' } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('typeform');

    // Find or create the onboarding form
    let form = await findExistingForm(accessToken);
    let created = false;
    if (!form) {
      form = await createForm(accessToken);
      created = true;
      console.log('Created Typeform onboarding survey:', form.id);
    }

    const formId = form.id;
    const formUrl = form._links?.display || `https://form.typeform.com/to/${formId}`;

    // Fetch responses if admin
    let responses = [];
    if (action === 'responses' && user.role === 'admin') {
      const resData = await fetch(`https://api.typeform.com/forms/${formId}/responses?page_size=50&sort=submitted_at%2Cdesc`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const rJson = await resData.json();
      responses = (rJson.items || []).map(item => {
        const answers = {};
        (item.answers || []).forEach(a => {
          const field = a.field?.ref || a.field?.id;
          answers[field] = a.text || a.email || a.number || a.choice?.label || a.choices?.labels?.join(', ') || '';
        });
        return { submitted_at: item.submitted_at, answers, response_id: item.response_id };
      });
      console.log(`Fetched ${responses.length} responses for form ${formId}`);
    }

    return Response.json({ formId, formUrl, created, responses, totalResponses: form.response_count || 0 });
  } catch (error) {
    console.error('typeformOnboarding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});