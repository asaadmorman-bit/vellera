import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * generateAgentResponse
 *
 * Constructs a dynamic motivational prompt from the user's custom agent persona
 * and real-time workout context, then returns LLM-generated coaching text.
 *
 * Payload shape:
 * {
 *   agent: { name, system_prompt, voice_id },
 *   context: {
 *     trigger: "start" | "halfway" | "rest" | "complete",
 *     exercise_name: string,
 *     time_elapsed_seconds: number,
 *     time_remaining_seconds: number,
 *     current_round: number,
 *     total_rounds: number,
 *     streak_days: number,
 *     recovery_pct: number | null,
 *   }
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { agent, context } = await req.json();

    if (!agent?.system_prompt || !context?.trigger) {
      return Response.json({ error: "Missing agent or context" }, { status: 400 });
    }

    // ── Prompt Construction Engine ────────────────────────────────────────────
    const triggerDescriptions = {
      start: `The user just started their workout. Give them a powerful, custom intro to fire them up. Max 2 sentences.`,
      halfway: `The user is at the halfway point of a ${context.exercise_name} set (${context.time_elapsed_seconds}s elapsed, ${context.time_remaining_seconds}s left on round ${context.current_round}/${context.total_rounds}). Give them a mid-set push. Max 2 sentences.`,
      rest: `The user just finished a hard set and is in a rest period. Give them recovery advice and set the mindset for the next round. Max 2 sentences.`,
      complete: `The user just completed their full workout (${context.total_rounds} rounds). Give them a powerful closing statement. Max 2 sentences.`,
    };

    const contextBlock = [
      context.exercise_name ? `Current exercise: ${context.exercise_name}` : null,
      context.current_round ? `Round ${context.current_round} of ${context.total_rounds}` : null,
      context.streak_days > 0 ? `Current streak: ${context.streak_days} days` : null,
      context.recovery_pct != null ? `Recovery score today: ${context.recovery_pct}%` : null,
    ].filter(Boolean).join(". ");

    const fullPrompt = `${agent.system_prompt}

Athlete context: ${contextBlock || "No biometric data available."}

Task: ${triggerDescriptions[context.trigger] || triggerDescriptions.halfway}

Rules: Stay strictly in character. Be concise (max 2 sentences). Never mention you are an AI.`;

    // ── LLM Call — route through unified coach service ─────────────────────────
    const coachRes = await base44.asServiceRole.functions.invoke('generateCoachAudio', {
      provider: 'openai',
      agentPersona: agent.system_prompt,
      workoutContext: fullPrompt,
    });
    const motivationText = coachRes?.text || await base44.integrations.Core.InvokeLLM({ prompt: fullPrompt });

    // ── TTS Integration Point ─────────────────────────────────────────────────
    // To add real audio generation, integrate ElevenLabs or similar here:
    //
    // const voiceMap = {
    //   deep_male: "ELEVENLABS_VOICE_ID_DEEP_MALE",
    //   energetic_female: "ELEVENLABS_VOICE_ID_ENERGETIC_FEMALE",
    //   calm_androgynous: "ELEVENLABS_VOICE_ID_CALM",
    //   gritty_male: "ELEVENLABS_VOICE_ID_GRITTY",
    //   hype_female: "ELEVENLABS_VOICE_ID_HYPE",
    // };
    //
    // const ttsResponse = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceMap[agent.voice_id], {
    //   method: "POST",
    //   headers: { "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY"), "Content-Type": "application/json" },
    //   body: JSON.stringify({ text: motivationText, model_id: "eleven_monolingual_v1" }),
    // });
    // const audioBuffer = await ttsResponse.arrayBuffer();
    // const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: new Uint8Array(audioBuffer) });
    // return Response.json({ text: motivationText, audio_url: file_url, voice_id: agent.voice_id });

    return Response.json({
      text: motivationText,
      audio_url: null, // null until TTS is wired up — frontend will use Web Speech API fallback
      voice_id: agent.voice_id,
      trigger: context.trigger,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});