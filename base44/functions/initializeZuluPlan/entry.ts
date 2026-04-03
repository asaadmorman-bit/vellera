import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the 15-week Zulu plan
    const plan = await base44.entities.TrainingPlan.create({
      plan_name: "Zulu Warrior: Strength, Stamina & Aesthetic v1.0",
      user_email: user.email,
      start_date: "2026-04-07",
      end_date: "2026-07-18",
      primary_goal: "strength",
      total_phases: 15,
      current_phase: 1,
      base_intensity_level: "Advanced",
      auto_adjust_enabled: true,
      notes: "Functional Hypertrophy + BJJ Competition Stamina. Whoop 5.0 auto-regulation: Green +2.5% load, Yellow -15% load, Red → Shield Recovery. Max 90 mins/session. Target: 1.2g protein/lb, high carbs pre-BJJ.",
      weeks: [
        {
          week_number: 1,
          phase: 1,
          focus: "The Shield & Charge Foundation",
          days: [
            { day_of_week: 1, date: "2026-04-07", base_activity: "Weighted Pull-ups / Barbell OHP", base_duration_minutes: 60, base_intensity: "high", adjusted_activity: "Weighted Pull-ups / Barbell OHP", adjusted_intensity: "high", is_adjusted: false },
            { day_of_week: 2, date: "2026-04-08", base_activity: "Back Squat / Weighted Lunges + 5x 40yd Sprints", base_duration_minutes: 75, base_intensity: "high", adjusted_activity: "Back Squat / Weighted Lunges + 5x 40yd Sprints", adjusted_intensity: "high", is_adjusted: false },
            { day_of_week: 3, date: "2026-04-09", base_activity: "Zone 2 Walk (Recovery)", base_duration_minutes: 20, base_intensity: "light", adjusted_activity: "Zone 2 Walk", adjusted_intensity: "light", is_adjusted: false },
            { day_of_week: 4, date: "2026-04-10", base_activity: "Deadlift / Bent Over Rows + Heavy Sled Pushes", base_duration_minutes: 70, base_intensity: "high", adjusted_activity: "Deadlift / Bent Over Rows + Heavy Sled Pushes", adjusted_intensity: "high", is_adjusted: false },
            { day_of_week: 5, date: "2026-04-11", base_activity: "Weighted Dips / Landmine Press + 5-Round KB Circuit", base_duration_minutes: 65, base_intensity: "high", adjusted_activity: "Weighted Dips / Landmine Press + 5-Round KB Circuit", adjusted_intensity: "high", is_adjusted: false },
            { day_of_week: 6, date: "2026-04-12", base_activity: "Technical Rolling / High-Intensity BJJ Session", base_duration_minutes: 90, base_intensity: "max", adjusted_activity: "Technical Rolling / High-Intensity BJJ Session", adjusted_intensity: "max", is_adjusted: false },
            { day_of_week: 0, date: "2026-04-13", base_activity: "Mobility Flow (Full CNS Recovery)", base_duration_minutes: 30, base_intensity: "light", adjusted_activity: "Mobility Flow", adjusted_intensity: "light", is_adjusted: false },
          ],
        },
      ],
    });

    console.log(`[Zulu Plan] Created for ${user.email}: ${plan.id}`);

    return Response.json({
      success: true,
      plan_id: plan.id,
      plan_name: plan.plan_name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      message: "Zulu Warrior v1.0 initialized. Connect Whoop 5.0 for auto-regulation.",
    });
  } catch (error) {
    console.error('[Zulu Plan Initialization Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});