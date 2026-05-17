/**
 * Drill Library Starter: 20 pre-loaded workouts
 * 10 Fitness, 10 Martial Arts
 * Used to seed new users on day 1
 */

export const STARTER_DRILLS = {
  fitness: [
    {
      name: 'Full Body Strength Day 1',
      category: 'strength',
      duration_minutes: 60,
      exercises: [
        { name: 'Squat', sets: 5, reps: 5, focus: 'hip_power' },
        { name: 'Bench Press', sets: 5, reps: 5, focus: 'upper_body_pressing' },
        { name: 'Deadlift', sets: 3, reps: 3, focus: 'posterior_chain' },
        { name: 'Accessory Work', sets: 3, reps: 8, focus: 'muscle_building' },
      ],
      difficulty: 'intermediate',
      description: 'Heavy compound day. Rest 3-5 min between sets.',
    },
    {
      name: 'Upper Body Push/Pull',
      category: 'strength',
      duration_minutes: 50,
      exercises: [
        { name: 'Overhead Press', sets: 4, reps: 6, focus: 'shoulder_power' },
        { name: 'Pull-ups', sets: 4, reps: 5, focus: 'back_strength' },
        { name: 'Barbell Row', sets: 4, reps: 6, focus: 'posterior_chain' },
        { name: 'Dips', sets: 3, reps: 8, focus: 'tricep_strength' },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'Lower Body Hypertrophy',
      category: 'strength',
      duration_minutes: 55,
      exercises: [
        { name: 'Leg Press', sets: 4, reps: 8, focus: 'quad_hypertrophy' },
        { name: 'Leg Curl', sets: 4, reps: 10, focus: 'hamstring_development' },
        { name: 'Leg Extension', sets: 3, reps: 12, focus: 'quad_isolation' },
        { name: 'Calf Raises', sets: 3, reps: 15, focus: 'calf_development' },
      ],
      difficulty: 'beginner',
    },
    {
      name: 'Zone 2 Cardio',
      category: 'conditioning',
      duration_minutes: 45,
      intensity: 'low',
      description: 'Sustainable aerobic work. Can talk but not sing. 60-70% max HR.',
      difficulty: 'beginner',
    },
    {
      name: 'HIIT Circuit',
      category: 'conditioning',
      duration_minutes: 30,
      exercises: [
        { name: '20 sec Burpees', rest_sec: 10 },
        { name: '20 sec Jump Rope', rest_sec: 10 },
        { name: '20 sec Mountain Climbers', rest_sec: 10 },
        { name: '20 sec Rest', rest_sec: 0 },
      ],
      rounds: 8,
      difficulty: 'advanced',
    },
    {
      name: 'Core & Mobility',
      category: 'recovery',
      duration_minutes: 20,
      exercises: [
        { name: 'Dead Bug', duration_min: 3 },
        { name: 'Bird Dog', duration_min: 3 },
        { name: 'Cat Cow Stretch', duration_min: 2 },
        { name: 'Hip Flexor Stretch', duration_min: 2 },
        { name: 'Thoracic Rotation', duration_min: 2 },
        { name: 'Pigeon Pose', duration_min: 4 },
      ],
      difficulty: 'beginner',
    },
    {
      name: 'Farmer Carries & Sled Push',
      category: 'strength',
      duration_minutes: 30,
      exercises: [
        { name: 'Farmer Carry', sets: 4, duration_sec: 30, focus: 'grip_and_core' },
        { name: 'Sled Push', sets: 4, distance_meters: 40, focus: 'explosive_power' },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'Olympic Lift Technique',
      category: 'strength',
      duration_minutes: 45,
      exercises: [
        { name: 'Clean & Jerk', sets: 6, reps: 2, focus: 'power' },
        { name: 'Snatch', sets: 6, reps: 2, focus: 'explosiveness' },
      ],
      difficulty: 'advanced',
      description: 'Technical day. Focus on form over weight.',
    },
    {
      name: 'Metabolic Conditioning',
      category: 'conditioning',
      duration_minutes: 20,
      exercises: [
        { name: '10 cal Row', rest_sec: 20 },
        { name: '10 cal Bike', rest_sec: 20 },
        { name: '30 Double-Unders', rest_sec: 20 },
      ],
      rounds: 5,
      difficulty: 'advanced',
    },
  ],
  martial_arts: [
    {
      name: 'BJJ Technique: Guard Retention',
      category: 'technique',
      duration_minutes: 45,
      description: 'Fundamental guard protection drills.',
      exercises: [
        { name: 'Knee Shield Defense', reps: 20 },
        { name: 'Underhook Escape', reps: 20 },
        { name: 'De La Riva Hook', reps: 20 },
        { name: 'Guard Retention Drill', reps: 50, sparring: true },
      ],
      difficulty: 'beginner',
    },
    {
      name: 'BJJ Technique: Guard Pass',
      category: 'technique',
      duration_minutes: 50,
      exercises: [
        { name: 'Stack Pass', reps: 20 },
        { name: 'Toreando Pass', reps: 20 },
        { name: 'Knee Slice Pass', reps: 20 },
        { name: 'Pass Defense Drill', reps: 50 },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'BJJ Open Mat Sparring',
      category: 'sparring',
      duration_minutes: 60,
      description: '3x 8-min rounds with different partners. Focus on position control.',
      rounds: 3,
      duration_per_round_min: 8,
      difficulty: 'intermediate',
    },
    {
      name: 'Wrestling Fundamentals',
      category: 'technique',
      duration_minutes: 50,
      exercises: [
        { name: 'Takedown Drill', reps: 30 },
        { name: 'Hip Throw Practice', reps: 20 },
        { name: 'Clinch Work', duration_min: 10 },
        { name: 'Sprawl Drills', reps: 30 },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'MMA Stand-Up Striking',
      category: 'striking',
      duration_minutes: 30,
      exercises: [
        { name: 'Jab-Cross Combinations', rounds: 3, duration_min: 3 },
        { name: 'Footwork Drills', rounds: 3, duration_min: 3 },
        { name: 'Pad Work', rounds: 3, duration_min: 3 },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'Boxing Technical Rounds',
      category: 'striking',
      duration_minutes: 40,
      description: 'Bag work focusing on angles and combinations.',
      rounds: 4,
      duration_per_round_min: 3,
      difficulty: 'beginner',
    },
    {
      name: 'Submission Transitions',
      category: 'technique',
      duration_minutes: 45,
      exercises: [
        { name: 'Armbar from Guard', reps: 20 },
        { name: 'Triangle Choke', reps: 20 },
        { name: 'Guillotine Choke', reps: 20 },
        { name: 'Submission Chain Drill', reps: 50 },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'BJJ Positional Sparring',
      category: 'sparring',
      duration_minutes: 30,
      description: 'Start from mount position. 5-min rounds x 3.',
      rounds: 3,
      starting_position: 'mount',
      difficulty: 'beginner',
    },
    {
      name: 'Escape & Reset Drills',
      category: 'technique',
      duration_minutes: 40,
      exercises: [
        { name: 'Mount Escape', reps: 20 },
        { name: 'Side Control Escape', reps: 20 },
        { name: 'Back Control Escape', reps: 20 },
      ],
      difficulty: 'beginner',
    },
    {
      name: 'Competition Simulation',
      category: 'sparring',
      duration_minutes: 60,
      description: '2x 8-min rounds with breaks. Match conditions.',
      rounds: 2,
      duration_per_round_min: 8,
      difficulty: 'advanced',
    },
  ],
  executive_protection: [
    {
      name: 'Pistol Draw & Presentation',
      category: 'ep_firearms',
      duration_minutes: 30,
      description: 'Holster draw from concealment: compressed ready, high guard, one-hand draw. 50 reps. Focus on sight alignment and trigger reset.',
      exercises: [
        { name: 'Draw from Concealment', reps: 20, focus: 'speed_and_accuracy' },
        { name: 'One-Hand Draw', reps: 15, focus: 'weapon_retention' },
        { name: 'High Guard Presentation', reps: 15, focus: 'target_acquisition' },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'Pack & Gear Carry Conditioning',
      category: 'ep_conditioning',
      duration_minutes: 45,
      description: 'Rucking intervals with loaded pack (45–65 lbs): 400m fast walk + 100m jog x 6. Builds load-bearing endurance for EP movements.',
      exercises: [
        { name: 'Loaded Ruck Walk', sets: 6, distance_meters: 400, load_lbs: 55, focus: 'load_endurance' },
        { name: 'Loaded Jog Interval', sets: 6, distance_meters: 100, load_lbs: 55, focus: 'cardiovascular' },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'Threat ID & 360° Scan',
      category: 'ep_awareness',
      duration_minutes: 30,
      description: 'Situational awareness circuit: scan drill, interview stance, verbal challenge scenarios. 10 reps each scenario.',
      exercises: [
        { name: 'Target Identification Scan', reps: 20, time_limit_sec: 2, focus: 'situational_awareness' },
        { name: 'Interview Stance Practice', reps: 15, focus: 'posture_and_presence' },
        { name: 'Verbal Challenge Scenarios', reps: 10, focus: 'communication_under_stress' },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'VIP Extraction Footwork',
      category: 'ep_movement',
      duration_minutes: 45,
      description: 'Protective formation movement: L-shape extraction, vehicle stack, building entry/exit under stress.',
      exercises: [
        { name: 'L-Shape Extraction', reps: 10, focus: 'principal_protection' },
        { name: 'Vehicle Stack Drill', reps: 10, focus: 'team_movement' },
        { name: 'Building Entry/Exit', reps: 10, focus: 'dynamic_entry' },
        { name: 'Formation Shadow Drill', duration_min: 10, focus: 'overwatch_positions' },
      ],
      difficulty: 'intermediate',
    },
    {
      name: 'EP Combatives: Control & Restraint',
      category: 'ep_combatives',
      duration_minutes: 60,
      description: 'EP ground control: wrist lock, arm bar escort, rear choke escape, weapon retention. 5x 3-min rounds.',
      rounds: 5,
      duration_per_round_min: 3,
      exercises: [
        { name: 'Standing Wrist Lock', reps: 20, focus: 'control' },
        { name: 'Arm Bar Escort', reps: 20, focus: 'compliance_techniques' },
        { name: 'Rear Choke Escape', reps: 15, focus: 'weapon_retention' },
        { name: 'Weapon Retention Drill', reps: 15, focus: 'disarm_prevention' },
      ],
      difficulty: 'advanced',
    },
    {
      name: 'Stress Inoculation Circuit',
      category: 'ep_conditioning',
      duration_minutes: 45,
      description: 'Elevated HR decision-making: burpees → dry draw, sprint → threat scan, push-ups → comms drill. 5 rounds.',
      rounds: 5,
      exercises: [
        { name: 'Burpees', reps: 10, focus: 'stress_elevation' },
        { name: 'Dry Draw & Present', reps: 5, focus: 'fine_motor_under_stress' },
        { name: '100m Sprint', sets: 1, focus: 'cardiovascular_stress' },
        { name: 'Threat Scan', reps: 1, focus: 'awareness_under_fatigue' },
        { name: 'Push-Ups', reps: 20, focus: 'endurance' },
        { name: 'Radio Comms Drill', reps: 1, focus: 'communication_under_stress' },
      ],
      difficulty: 'advanced',
    },
    {
      name: 'Vehicle Ambush Immediate Action',
      category: 'ep_movement',
      duration_minutes: 30,
      description: 'Immediate action on vehicle contact: dismount, react, cover positions, secure principal. 10 timed reps.',
      exercises: [
        { name: 'Vehicle Dismount', reps: 10, time_limit_sec: 3, focus: 'speed' },
        { name: 'React to Contact', reps: 10, focus: 'cover_and_concealment' },
        { name: 'Principal Secure', reps: 10, focus: 'principal_protection' },
      ],
      difficulty: 'advanced',
    },
    {
      name: 'Low-Light / Night Movement',
      category: 'ep_awareness',
      duration_minutes: 30,
      description: 'Flashlight techniques (FBI hold, Rogers), structure movement, corner clearing at night.',
      exercises: [
        { name: 'FBI Flashlight Hold', reps: 20, focus: 'target_illumination' },
        { name: 'Rogers Hold Technique', reps: 20, focus: 'weapons_integration' },
        { name: 'Structure Movement Dark', duration_min: 10, focus: 'low_vis_navigation' },
        { name: 'Corner Clearing Night', reps: 10, focus: 'tactical_movement' },
      ],
      difficulty: 'intermediate',
    },
  ],
};

export const seedStarterDrills = async (userEmail, base44) => {
  const drills = [
    ...STARTER_DRILLS.fitness.slice(0, 5),
    ...STARTER_DRILLS.martial_arts.slice(0, 5),
  ].map(drill => ({
    ...drill,
    user_email: userEmail,
    created_date: new Date().toISOString(),
  }));

  return drills;
};