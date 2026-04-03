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
    const amStrainLevel = body.am_strain_level || 'moderate';

    let pmIntensity = 'drills';
    let loadAdjustment = 0;
    let notification = '';

    // Whoop-driven bio-logic
    if (recoveryScore > 67) {
      pmIntensity = 'high_intensity';
      loadAdjustment = 2.5;
      notification = '🟢 GREEN RECOVERY: >67%. Progress Load +2.5%. Clear for High-Intensity PM Combat. Attack.';
    } else if (recoveryScore >= 34 && recoveryScore <= 66) {
      pmIntensity = 'drills';
      loadAdjustment = 0;
      notification = '🟡 YELLOW RECOVERY: 34-66%. Maintenance Load. PM Combat = Drills Only. No Failure Sets.';
    } else if (recoveryScore < 34) {
      pmIntensity = 'absolute_rest';
      loadAdjustment = -100;
      notification = '🔴 RED RECOVERY: <34%. Cancel AM Lift → 15m Specialized Stretch. PM = Absolute Rest. Respect the Red.';
    }

    // Store trigger decision
    const today = new Date().toISOString().split('T')[0];
    await base44.entities.ZuluShredMetrics.create({
      date: today,
      current_weight_lbs: body.current_weight_lbs || 260,
      target_weight_lbs: 225,
      recovery_score: recoveryScore,
      weekly_strain_avg: body.weekly_strain_avg || 12,
      notes: `[17:00 Daily Trigger] PM Intensity: ${pmIntensity} | Load Adj: ${loadAdjustment}% | ${notification}`,
    });

    console.log(`[Zulu Daily Trigger 17:00] ${user.email} | Recovery: ${recoveryScore}% | PM: ${pmIntensity}`);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      recovery_score: recoveryScore,
      am_strain: amStrainLevel,
      pm_intensity_level: pmIntensity,
      load_adjustment_percent: loadAdjustment,
      notification: notification,
      message: `17:00 Trigger Complete. PM Intensity: ${pmIntensity}. ${notification}`,
    });
  } catch (error) {
    console.error('[Zulu Daily Trigger Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});