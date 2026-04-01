/**
 * Vellera Track Routing Logic — "The Brain"
 * Assigns users to a track based on onboarding answers.
 *
 * Tracks:
 *   whole_health — Veterans, MOVE!, rehab, beginners
 *   tactical     — Military, first responders, functional strength
 *   competitor   — Pro/amateur athletes, fight camp
 *   momentum     — Everyday fitness, habit building
 */

export const TRACKS = {
  whole_health: {
    id: "whole_health",
    label: "Whole Health Track",
    tagline: "Rebuild. Restore. Resilience.",
    color: "#a855f7",
    accent: "purple",
    greeting: (name) => `Welcome back${name ? `, ${name}` : ""}. Let's focus on your foundation today.`,
    featured_routine: {
      title: "The Reset: 15-Min Joint Mobility Flow",
      subtitle: "Low-impact · No equipment · Recovery focused",
      icon: "🧘",
      path: "/recovery",
    },
    alt_routine: {
      title: "Steady State Walk Timer",
      subtitle: "30 min · Zone 2 · Breath control",
      icon: "🚶",
      path: "/hub",
    },
    focus_tags: ["Mobility", "Zone 2 Cardio", "Mental Resilience", "Low Impact"],
    intensity_cap: "LOW",
  },
  tactical: {
    id: "tactical",
    label: "Tactical Track",
    tagline: "Functional. Fearless. Fight-Ready.",
    color: "#f59e0b",
    accent: "yellow",
    greeting: (name) => `Ready for shift${name ? `, ${name}` : ""}. Let's build that functional armor.`,
    featured_routine: {
      title: "The Grind: Sandbag Carry & Bodyweight Circuit",
      subtitle: "45 min · Full body · Load-bearing endurance",
      icon: "⚙️",
      path: "/hub",
    },
    alt_routine: {
      title: "HIIT Tactical Conditioning",
      subtitle: "20 min · High intensity · Work capacity",
      icon: "🔥",
      path: "/combat",
    },
    focus_tags: ["Functional Strength", "Load Endurance", "HIIT", "Operational Fitness"],
    intensity_cap: "HIGH",
  },
  competitor: {
    id: "competitor",
    label: "Competitor Track",
    tagline: "Fight Camp. No Days Off.",
    color: "#ef4444",
    accent: "red",
    greeting: (name) => `Fight camp continues${name ? `, ${name}` : ""}. Time to push the pace.`,
    featured_routine: {
      title: "The Strike: 5x5 Heavy Bag Intervals",
      subtitle: "25 min · Max intensity · Combat conditioning",
      icon: "🥊",
      path: "/combat",
    },
    alt_routine: {
      title: "Grappling Flow: Live Positional Drilling",
      subtitle: "60 min · Technique + pressure",
      icon: "🥋",
      path: "/techniques",
    },
    focus_tags: ["Explosive Power", "Combat Timers", "Peak Performance", "Fight IQ"],
    intensity_cap: "MAX",
  },
  momentum: {
    id: "momentum",
    label: "Momentum Track",
    tagline: "Your Pace. Your Progress.",
    color: "#00E5FF",
    accent: "cyan",
    greeting: (name) => `Let's keep it moving${name ? `, ${name}` : ""}. Consistency is everything.`,
    featured_routine: {
      title: "The Foundation: Balanced Strength Circuit",
      subtitle: "30 min · Full gym · Progressive overload",
      icon: "💪",
      path: "/hub",
    },
    alt_routine: {
      title: "Cardio Tempo: Beat-Driven HIIT",
      subtitle: "20 min · Bodyweight · Energy boost",
      icon: "⚡",
      path: "/combat",
    },
    focus_tags: ["Balanced Strength", "Habit Building", "Cardio", "Body Composition"],
    intensity_cap: "MODERATE",
  },
};

/**
 * Assigns a Vellera Track from onboarding answers.
 * @param {string} goal - onboarding_goal
 * @param {string} journey - onboarding_journey
 * @param {string} equipment - onboarding_equipment
 * @returns {string} track id
 */
export function assignTrack(goal, journey, equipment) {
  // Explicit mappings
  if (goal === "Rehab, Mobility & Whole Health") return "whole_health";
  if (goal === "Tactical & First Responder Readiness") return "tactical";
  if (goal === "Combat Sports & Competition") return "competitor";

  // General Fitness — sub-route by journey
  if (journey === "Active Duty / Professional") return "tactical";
  if (journey === "Preparing for a season/fight") return "competitor";
  if (journey === "Just starting out / Getting back into it") {
    if (equipment === "Need low-impact/joint-friendly options") return "whole_health";
    return "momentum";
  }

  // Default
  return "momentum";
}

export function getTrack(trackId) {
  return TRACKS[trackId] || TRACKS.momentum;
}