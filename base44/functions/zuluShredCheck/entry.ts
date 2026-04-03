import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const currentWeight = body.current_weight_lbs || 260;
    const proteinIntake = body.protein_intake_g || 0;
    const recoveryScore = body.recovery_score || 50;
    const weeklyWeightLoss = body.weekly_weight_loss_lbs || 0;
    const weeklyStrainAvg = body.weekly_strain_avg || 12;

    const today = new Date().toISOString().split("T")[0];
    let caloriesAdjusted = 0;
    let fatLossTrigger = false;
    let preservationTrigger = false;
    let notification = "";

    // Fat Loss Trigger: weight loss < 1.5 lbs/week AND recovery is green
    if (weeklyWeightLoss < 1.5 && recoveryScore > 67) {
      fatLossTrigger = true;
      notification += "🔥 FAT LOSS TRIGGER: Weekly loss <1.5 lbs + Green recovery. Add 10m to The Impi finisher.\n";
    }

    // Preservation Trigger: recovery is red
    if (recoveryScore < 34) {
      preservationTrigger = true;
      caloriesAdjusted = 300;
      notification += "🛑 PRESERVATION TRIGGER: Recovery <34%. Add 300kcal (Protein/Fats) to prevent metabolic crash.\n";
    }

    // Protein compliance check
    const proteinTarget = 260;
    const proteinCompliance = ((proteinIntake / proteinTarget) * 100).toFixed(1);

    // Determine carb cycling for today
    const dayOfWeek = new Date().getDay();
    const isBjjMmaDay = [1, 2, 4, 5].includes(dayOfWeek); // MON, TUE, THU, FRI
    const carbTiming = isBjjMmaDay ? "targeted" : "low_carb";

    // Log to ZuluShredMetrics
    await base44.entities.ZuluShredMetrics.create({
      date: today,
      current_weight_lbs: currentWeight,
      target_weight_lbs: 225,
      weight_loss_this_week: weeklyWeightLoss,
      protein_intake_g: proteinIntake,
      protein_target_g: proteinTarget,
      carb_cycling_type: carbTiming,
      is_training_day: isBjjMmaDay,
      weekly_strain_avg: weeklyStrainAvg,
      recovery_score: recoveryScore,
      fat_loss_trigger_applied: fatLossTrigger,
      preservation_trigger_applied: preservationTrigger,
      calories_adjusted: caloriesAdjusted,
      notes: notification,
    });

    notification += `\n⚡ Warrior Credo: "260 is the current armor; 225 is the sharpened blade. Every rep carves the man underneath." Protein: ${proteinCompliance}% of target. Carb Timing: ${carbTiming === 'targeted' ? '50g complex carbs 90m pre-PM' : 'Low carb (fats + protein focus)'}`;

    console.log(`[Zulu Shred Check] ${user.email} | Weight: ${currentWeight} lbs | Protein: ${proteinIntake}g | Recovery: ${recoveryScore}% | Weekly Loss: ${weeklyWeightLoss} lbs`);

    return Response.json({
      success: true,
      current_weight_lbs: currentWeight,
      target_weight_lbs: 225,
      weekly_weight_loss: weeklyWeightLoss,
      protein_compliance_percent: parseFloat(proteinCompliance),
      carb_timing_today: carbTiming,
      recovery_score: recoveryScore,
      fat_loss_trigger: fatLossTrigger,
      preservation_trigger: preservationTrigger,
      calories_adjusted: caloriesAdjusted,
      notification: notification,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Zulu Shred Check Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});