import { useState } from "react";
import { Music, Zap, Flame, Shield, RotateCcw } from "lucide-react";

export default function Home() {
  const [userName] = useState("Champion");

  const workoutCategories = [
    {
      title: "The Primer",
      subtitle: "Warm-ups",
      icon: "🔥",
      color: "from-orange-500/20 to-orange-600/10",
      border: "border-orange-500/30",
    },
    {
      title: "The Tempo",
      subtitle: "Cardio / HIIT",
      icon: "⚡",
      color: "from-vellera-blue/20 to-cyan-600/10",
      border: "border-vellera-blue/30",
    },
    {
      title: "The Foundation",
      subtitle: "Strength",
      icon: "💪",
      color: "from-vellera-green/20 to-lime-600/10",
      border: "border-vellera-green/30",
    },
    {
      title: "The Reset",
      subtitle: "Recovery",
      icon: "🧘",
      color: "from-purple-500/20 to-violet-600/10",
      border: "border-purple-500/30",
    },
  ];

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-24 safe-area-top">
      {/* Header Greeting */}
      <div className="space-y-2">
        <h1 className="text-white text-2xl font-black">
          Welcome back, <span className="text-vellera-blue">{userName}</span>.
        </h1>
        <p className="text-vellera-muted text-sm">Let's find your pace today.</p>
      </div>

      {/* Music Integration Widget */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-vellera-blue/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-vellera-blue" />
          <h2 className="text-white font-bold text-lg">Bring your own energy</h2>
        </div>
        <p className="text-vellera-muted text-sm">
          Connect your favorite music streaming to power your workouts.
        </p>
        <div className="flex gap-2">
          <button className="flex-1 bg-vellera-blue/20 border border-vellera-blue hover:bg-vellera-blue/30 text-vellera-blue font-semibold py-3 rounded-lg transition-all">
            Spotify
          </button>
          <button className="flex-1 bg-vellera-blue/20 border border-vellera-blue hover:bg-vellera-blue/30 text-vellera-blue font-semibold py-3 rounded-lg transition-all">
            Apple Music
          </button>
        </div>
      </div>

      {/* Workout Categories Grid */}
      <div className="space-y-3">
        <p className="text-vellera-muted text-xs uppercase tracking-widest font-bold">
          Pick Your Workout
        </p>
        <div className="grid grid-cols-2 gap-3">
          {workoutCategories.map((cat) => (
            <button
              key={cat.title}
              className={`bg-gradient-to-br ${cat.color} border ${cat.border} rounded-xl p-4 text-left hover:border-opacity-100 transition-all min-h-[140px] flex flex-col justify-between`}
            >
              <div className="text-3xl">{cat.icon}</div>
              <div>
                <h3 className="text-white font-bold text-sm">{cat.title}</h3>
                <p className="text-vellera-muted text-xs">{cat.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex justify-around text-center">
        <div>
          <p className="text-vellera-green text-2xl font-black">12</p>
          <p className="text-vellera-muted text-xs">Workouts</p>
        </div>
        <div className="w-px bg-gray-700" />
        <div>
          <p className="text-vellera-blue text-2xl font-black">4.5</p>
          <p className="text-vellera-muted text-xs">Avg Rating</p>
        </div>
        <div className="w-px bg-gray-700" />
        <div>
          <p className="text-orange-400 text-2xl font-black">42</p>
          <p className="text-vellera-muted text-xs">Streak Days</p>
        </div>
      </div>
    </div>
  );
}