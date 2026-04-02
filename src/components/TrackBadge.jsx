import { cn } from "@/lib/utils";

const TRACK_CONFIG = {
  strength: { label: "Strength", color: "bg-yellow-900/40 border-yellow-700 text-yellow-300", icon: "💪" },
  bjj: { label: "BJJ", color: "bg-blue-900/40 border-blue-700 text-blue-300", icon: "🥋" },
  endurance: { label: "Endurance", color: "bg-green-900/40 border-green-700 text-green-300", icon: "⚡" },
  bodybuilding: { label: "Bodybuilding", color: "bg-orange-900/40 border-orange-700 text-orange-300", icon: "🏋️" },
  tactical: { label: "Tactical", color: "bg-red-900/40 border-red-700 text-red-300", icon: "🎯" },
  competitor: { label: "Competitor", color: "bg-purple-900/40 border-purple-700 text-purple-300", icon: "🏆" },
  whole_health: { label: "Whole Health", color: "bg-emerald-900/40 border-emerald-700 text-emerald-300", icon: "🧘" },
  momentum: { label: "Momentum", color: "bg-vellera-blue/20 border-vellera-blue text-vellera-blue", icon: "🚀" },
};

export default function TrackBadge({ track, size = "sm", showLabel = true }) {
  const config = TRACK_CONFIG[track] || TRACK_CONFIG.momentum;

  const sizeClasses = {
    xs: "px-2 py-1 text-xs gap-1",
    sm: "px-3 py-1.5 text-sm gap-2",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2",
  };

  return (
    <div className={cn(`border rounded-lg flex items-center ${config.color} ${sizeClasses[size]}`)}>
      <span className="text-lg">{config.icon}</span>
      {showLabel && <span className="font-semibold">{config.label}</span>}
    </div>
  );
}