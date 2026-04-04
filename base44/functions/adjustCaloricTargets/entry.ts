import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TARGET_BF = 12;

function calcMacros({ weightLbs, dayType, targetCalories }) {
  const weightKg = (weightLbs || 225) / 2.205;
  const isBJJ = dayType === 'BJJ Training Day';
  const isStrength = dayType === 'Strength Day';
  const isActive = dayType === 'Active Recovery';
  const bmr = 10 * weightKg + 6.25 * 175 - 5 * 35 + 5;
  const tdee = isBJJ ? bmr * 1.7 : isStrength ? bmr * 1.6 : isActive ? bmr * 1.4 : bmr * 1.2;
  const calories = targetCalories || Math.round(tdee);
  const proteinG = Math.round(isBJJ || isStrength ? weightLbs * 1.0 : weightLbs * 0.85);
  const fatG = Math.round((calories * 0.27) / 9);
  const carbsG = Math.round(Math.max(50, (calories - proteinG * 4 - fatG * 9) / 4));
  return { calories, proteinG, carbsG, fatG };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { calorie_adjustment = 0 } = body;

    const today = new Date().toISOString().split('T')[0];

    // Load latest physique + profile
    const [physique, profiles] = await Promise.all([
      base44.entities.PhysiqueTracker.list('-date', 30),
      base44.entities.UserProfile.list('-created_date', 1),
    ]);

    const profile = profiles[0];
    const weightLbs = physique[0]?.weight_lbs || profile?.zulu_current_weight_lbs || 225;
    const targetWeight = profile?.zulu_target_weight_lbs || 215;

    // Trajectory analysis
    let autoAdjustment = calorie_adjustment;
    if (physique.length >= 2) {
      const sorted = [...physique].sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const daysDiff = Math.max(1, (new Date(last.date) - new Date(first.date)) / 86400000);
      const lbsPerWeek = ((last.weight_lbs - first.weight_lbs) / daysDiff) * 7;
      const weightGap = weightLbs - targetWeight;

      // If no explicit adjustment passed, auto-calculate
      if (calorie_adjustment === 0) {
        if (lbsPerWeek < -2) autoAdjustment = 250;          // losing too fast
        else if (lbsPerWeek > -0.5 && weightGap > 5) autoAdjustment = -200; // stalled
        else if (Math.abs(weightGap) <= 5) autoAdjustment = 100;            // near goal
      }
    }

    // Get or create today's nutrition plan
    const plans = await base44.entities.NutritionPlan.filter({ date: today });
    const plan = plans[0];
    const dayType = plan?.day_type || 'Rest Day';

    // Load existing targets (from plan or recalc)
    const baseCals = plan?.target_calories || calcMacros({ weightLbs, dayType }).calories;
    const newCalories = Math.max(1500, baseCals + autoAdjustment);
    const { proteinG, carbsG, fatG } = calcMacros({ weightLbs, dayType, targetCalories: newCalories });

    const updatedFields = {
      target_calories: newCalories,
      target_protein_g: proteinG,
      target_carbs_g: carbsG,
      target_fat_g: fatG,
      weight_lbs: physique[0]?.weight_lbs || plan?.weight_lbs || null,
    };

    if (plan) {
      await base44.entities.NutritionPlan.update(plan.id, updatedFields);
    } else {
      await base44.entities.NutritionPlan.create({
        date: today,
        day_type: dayType,
        ...updatedFields,
        notes: `Auto-adjusted: ${autoAdjustment > 0 ? '+' : ''}${autoAdjustment} kcal from physique progression analysis`,
      });
    }

    console.log(`Caloric adjustment for ${today}: ${autoAdjustment > 0 ? '+' : ''}${autoAdjustment} kcal → new target ${newCalories} kcal`);

    return Response.json({
      success: true,
      date: today,
      adjustment_applied: autoAdjustment,
      new_targets: { calories: newCalories, protein_g: proteinG, carbs_g: carbsG, fat_g: fatG },
    });
  } catch (error) {
    console.error('adjustCaloricTargets error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});