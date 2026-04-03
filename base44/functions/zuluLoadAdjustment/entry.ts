import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const recoveryScore = body.recovery_score || 50;
    const lastWeekLoad = body.last_week_load || 100; // Baseline

    let adjustment, loadFactor, recommendation;

    if (recoveryScore > 67) {
      adjustment = "green";
      loadFactor = 1.025; // +2.5%
      recommendation = "Progressive Overload: Add 2.5% to all main lift weights. Proceed to PM Combat.";
    } else if (recoveryScore >= 34) {
      adjustment = "yellow";
      loadFactor = 0.85; // -15%
      recommendation = "Technical Volume: Reduce load 15%. PM = Drills only (no live rolling, no sparring).";
    } else {
      adjustment = "red";
      loadFactor = 0; // No lift
      recommendation = "Shield Recovery: Cancel AM lift. Execute stretching protocol. PM complete rest.";
    }

    const adjustedLoad = Math.round(lastWeekLoad * loadFactor);

    console.log(`[Zulu Load Adjustment] Recovery: ${recoveryScore}% | Status: ${adjustment.toUpperCase()} | Load: ${lastWeekLoad} → ${adjustedLoad}`);

    return Response.json({
      success: true,
      recovery_status: adjustment,
      load_factor: loadFactor,
      last_week_load: lastWeekLoad,
      adjusted_load: adjustedLoad,
      recommendation: recommendation,
    });
  } catch (error) {
    console.error('[Zulu Load Adjustment Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});