import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SHRED_WEEKLY_SCHEDULE = [
  {
    day: 1,
    name: "MON",
    amPhase: "The Shield (OHP 4x8, Incline Press 3x10, Pull-ups 4x8) + 15m Zone 2 Ruck",
    amFocus: "heavy_upper",
    amDuration: 75,
    pmPhase: "BJJ Fundamentals (HIIT)",
    pmDuration: 90,
    carbTiming: "targeted",
    proteinTarget: 260,
  },
  {
    day: 2,
    name: "TUE",
    amPhase: "The Charge (Squat 5x5, Lunges 3x20, KB Swings 4x20) + 15m Zone 2",
    amFocus: "heavy_lower",
    amDuration: 80,
    pmPhase: "MMA Striking (HIIT)",
    pmDuration: 75,
    carbTiming: "targeted",
    proteinTarget: 260,
  },
  {
    day: 3,
    name: "WED",
    amPhase: "Shield Mobility Flow (90/90 Hip, Couch Stretch, Thoracic Bridge)",
    amFocus: "recovery",
    amDuration: 30,
    pmPhase: "Technical BJJ (Low Strain)",
    pmDuration: 60,
    carbTiming: "low_carb",
    proteinTarget: 260,
  },
  {
    day: 4,
    name: "THU",
    amPhase: "The Density (Deadlift 3x5, Rows 4x10, Hammer Curls 3x12) + 15m Zone 2",
    amFocus: "heavy_posterior",
    amDuration: 80,
    pmPhase: "BJJ Live Rolling (HIIT)",
    pmDuration: 90,
    carbTiming: "targeted",
    proteinTarget: 260,
  },
  {
    day: 5,
    name: "FRI",
    amPhase: "The Impi (Dips 4x10, Landmine Press 3x12, Leg Raises 4xAMRAP) + 15m Zone 2",
    amFocus: "heavy_push",
    amDuration: 75,
    pmPhase: "MMA Sparring (HIIT)",
    pmDuration: 75,
    carbTiming: "targeted",
    proteinTarget: 260,
  },
  {
    day: 6,
    name: "SAT",
    amPhase: "Speed Sprints (5x 40yd) + 10m Zone 2",
    amFocus: "speed_conditioning",
    amDuration: 55,
    pmPhase: "Open Mat / Comp Prep",
    pmDuration: 90,
    carbTiming: "maintenance",
    proteinTarget: 260,
  },
  {
    day: 0,
    name: "SUN",
    amPhase: "Absolute Reset (Mobility only)",
    amFocus: "recovery",
    amDuration: 20,
    pmPhase: "Complete Rest",
    pmDuration: 0,
    carbTiming: "low_carb",
    proteinTarget: 260,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build 12-week shred plan
    const startDate = new Date("2026-04-07");
    const weeks = [];

    for (let w = 1; w <= 12; w++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (w - 1) * 7);

      const days = SHRED_WEEKLY_SCHEDULE.map((dayConfig) => {
        const dayDate = new Date(weekStart);
        const dayOfWeek = dayConfig.day;
        const daysToAdd = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        dayDate.setDate(dayDate.getDate() + daysToAdd);

        return {
          day_of_week: dayConfig.day,
          date: dayDate.toISOString().split("T")[0],
          base_activity: `AM: ${dayConfig.amPhase} | PM: ${dayConfig.pmPhase}`,
          base_duration_minutes: dayConfig.amDuration + dayConfig.pmDuration,
          base_intensity: dayConfig.amFocus === "recovery" ? "light" : "high",
          adjusted_activity: `AM: ${dayConfig.amPhase} | PM: ${dayConfig.pmPhase}`,
          adjusted_intensity: dayConfig.amFocus === "recovery" ? "light" : "high",
          carb_timing: dayConfig.carbTiming,
          protein_target_g: dayConfig.proteinTarget,
          is_adjusted: false,
        };
      });

      weeks.push({
        week_number: w,
        phase: w <= 4 ? 1 : w <= 8 ? 2 : 3,
        focus: w <= 4 ? "Metabolic Shift (Muscle Preservation)" : w <= 8 ? "Shred Acceleration (Fat Oxidation)" : "Finish Line (Definition & Hardness)",
        days,
      });
    }

    // Create shred plan
    const plan = await base44.entities.TrainingPlan.create({
      plan_name: "Zulu Shred: Recomposition & Warrior Definition v3.0",
      user_email: user.email,
      start_date: "2026-04-07",
      end_date: "2026-06-29",
      primary_goal: "strength",
      total_phases: 3,
      current_phase: 1,
      base_intensity_level: "Advanced",
      auto_adjust_enabled: true,
      notes: "260→225 lbs recomposition. AM Heavy (6-10 reps) + 15m Zone 2. PM BJJ/MMA HIIT. 260g Protein daily. Carb Cycling: Low (Rest), Targeted 50g pre-PM (Training). 16:8 IF window (12PM-8PM). Whoop Triggers: Fat Loss +10m Impi if <1.5 lbs/week + Green. Preservation +300kcal if Red.",
      shred_metadata: {
        starting_weight_lbs: 260,
        target_weight_lbs: 225,
        weekly_loss_target_lbs: 1.5,
        protein_ceiling_g: 260,
        carb_cycling_enabled: true,
        zone2_minutes_daily: 15,
        weekly_strain_target: 14.0,
        ifasting_window: "12PM-8PM",
        whoop_integration: true,
      },
      weeks,
    });

    console.log(`[Zulu Shred v3.0] Created for ${user.email}: ${plan.id}`);

    return Response.json({
      success: true,
      plan_id: plan.id,
      plan_name: plan.plan_name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      duration_weeks: 12,
      starting_weight: 260,
      target_weight: 225,
      estimated_weekly_loss: 1.5,
      protein_daily: 260,
      message: "Zulu Shred v3.0: 260→225 lbs. AM Heavy + Zone 2. PM HIIT BJJ/MMA. Whoop-gated load adjustment. 260g Protein. Carb cycling active. Start Monday 05:00.",
    });
  } catch (error) {
    console.error('[Zulu Shred v3.0 Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});