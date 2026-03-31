import { Music } from "lucide-react";

export default function MusicWidget() {
  return (
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
  );
}