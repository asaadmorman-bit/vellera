import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import OpenAI from 'npm:openai@4.47.1';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.12.0';

// ── Unified System Prompt Template ────────────────────────────────────────────
function buildPrompt(agentPersona, workoutContext) {
  return `You are an in-ear audio fitness coach for the Vellera app. Your persona is: ${agentPersona}. The current situation is: ${workoutContext}. Respond with exactly one or two short, punchy sentences that will be converted to speech. Do not use emojis, hashtags, or formatting. Speak directly to the athlete.`;
}

// ── Adapter: OpenAI ───────────────────────────────────────────────────────────
async function callOpenAI(prompt) {
  const client = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a concise, high-intensity fitness coach. Only output the coaching line — no meta-commentary.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 80,
    temperature: 0.85,
  });
  return response.choices[0].message.content.trim();
}

// ── Adapter: Google Gemini ────────────────────────────────────────────────────
async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { provider = 'openai', agentPersona, workoutContext } = await req.json();

    if (!agentPersona || !workoutContext) {
      return Response.json({ error: 'agentPersona and workoutContext are required' }, { status: 400 });
    }

    const prompt = buildPrompt(agentPersona, workoutContext);

    // Determine primary and fallback adapters based on provider config
    const isPrimaryOpenAI = provider !== 'gemini';
    const [primaryFn, fallbackFn, primaryName, fallbackName] = isPrimaryOpenAI
      ? [callOpenAI, callGemini, 'openai', 'gemini']
      : [callGemini, callOpenAI, 'gemini', 'openai'];

    let text = null;
    let usedProvider = primaryName;

    // ── Strategy: Primary with automatic fallback ─────────────────────────────
    try {
      text = await primaryFn(prompt);
    } catch (primaryError) {
      const isRateLimit = primaryError?.status === 429 || primaryError?.message?.includes('429') || primaryError?.message?.toLowerCase().includes('rate limit') || primaryError?.message?.toLowerCase().includes('quota');
      const isTimeout   = primaryError?.message?.toLowerCase().includes('timeout') || primaryError?.message?.toLowerCase().includes('timed out');

      if (isRateLimit || isTimeout) {
        console.warn(`[CoachAudio] ${primaryName} failed (${isRateLimit ? 'rate limit' : 'timeout'}), falling back to ${fallbackName}`);
        try {
          text = await fallbackFn(prompt);
          usedProvider = fallbackName;
        } catch (fallbackError) {
          console.error(`[CoachAudio] Fallback ${fallbackName} also failed:`, fallbackError.message);
          throw new Error(`Both providers failed. Last error: ${fallbackError.message}`);
        }
      } else {
        // Non-retriable error — surface immediately
        throw primaryError;
      }
    }

    return Response.json({ text, provider: usedProvider });

  } catch (error) {
    console.error('[CoachAudio] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});