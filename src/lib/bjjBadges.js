export const BADGE_DEFINITIONS = [
  { id: "guard_specialist",       name: "Guard Specialist",       icon: "🛡️",  category: "Guard Retention",    description: "Mastered all Guard Retention techniques" },
  { id: "sweep_king",             name: "Sweep King",             icon: "🌀",  category: "Sweeps",             description: "Mastered all Sweep techniques" },
  { id: "submission_sniper",      name: "Submission Sniper",      icon: "🔒",  category: "Submissions",        description: "Mastered all Submission techniques" },
  { id: "escape_artist",          name: "The Escape Artist",      icon: "💨",  category: "Escapes",            description: "Mastered all Escape techniques" },
  { id: "positional_dominator",   name: "Positional Dominator",   icon: "⚔️",  category: "Positional Control", description: "Mastered all Positional Control techniques" },
  { id: "iron_defense",           name: "Iron Defense",           icon: "🧱",  category: "Defense",            description: "Mastered all Defense techniques" },
  { id: "white_belt_complete",    name: "White Belt Complete",    icon: "🥋",  belt: "White",                  description: "All White Belt techniques mastered" },
  { id: "blue_belt_ready",        name: "Blue Belt Ready",        icon: "💙",  belt: "Blue",                   description: "All Blue Belt techniques mastered" },
  { id: "purple_belt_ready",      name: "Purple Belt Ready",      icon: "💜",  belt: "Purple",                 description: "All Purple Belt techniques mastered" },
];

export function computeBadges(skills) {
  const byCategory = {};
  const byBelt = {};
  skills.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = { total: 0, mastered: 0 };
    byCategory[s.category].total++;
    if (s.status === "Mastered") byCategory[s.category].mastered++;

    if (!byBelt[s.belt_level]) byBelt[s.belt_level] = { total: 0, mastered: 0 };
    byBelt[s.belt_level].total++;
    if (s.status === "Mastered") byBelt[s.belt_level].mastered++;
  });

  return BADGE_DEFINITIONS.map(badge => {
    let unlocked = false;
    if (badge.category) {
      const cat = byCategory[badge.category];
      unlocked = cat && cat.total > 0 && cat.mastered === cat.total;
    } else if (badge.belt) {
      const belt = byBelt[badge.belt];
      unlocked = belt && belt.total > 0 && belt.mastered === belt.total;
    }
    return { ...badge, unlocked };
  });
}