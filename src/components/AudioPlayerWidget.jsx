import { useState } from "react";
import { Play, Pause, SkipForward, Volume2, Music } from "lucide-react";

export default function AudioPlayerWidget({ isSpotifyConnected = false, currentTrack = null, onPlayPause, onSkip }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioMode, setAudioMode] = useState("spotify"); // "spotify" | "external" | "vellera"

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    onPlayPause?.();
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-30 bg-gradient-to-r from-commander-surface via-commander-surface to-gray-800 border border-commander-border rounded-xl px-4 py-3 shadow-2xl">
      {/* Spotify Connected State */}
      {audioMode === "spotify" && isSpotifyConnected && (
        <div className="flex items-center gap-3">
          {currentTrack?.albumArt ? (
            <img
              src={currentTrack.albumArt}
              alt="Album"
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-green-500"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-green-600/30 flex items-center justify-center flex-shrink-0 border border-green-600">
              <Music className="w-5 h-5 text-green-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {currentTrack?.name || "Now Playing"}
            </p>
            <p className="text-commander-muted text-xs truncate">
              {currentTrack?.artist || "Spotify"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-green-600 hover:bg-green-500 rounded-full transition-all touch-target-min"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white fill-white" />
              ) : (
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleSkip}
              className="p-2 bg-green-600/50 hover:bg-green-600 rounded-full transition-all touch-target-min"
              title="Skip Track"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* External Audio Active State (YouTube Music, Apple Music, etc.) */}
      {audioMode === "external" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 flex-shrink-0">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className="w-1 bg-blue-400 rounded-full"
                style={{
                  height: `${8 + bar * 3}px`,
                  animation: `pulse ${0.6 + bar * 0.1}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">External Audio Active</p>
            <p className="text-commander-muted text-xs leading-tight">
              Vellera will duck volume for timers & bells
            </p>
          </div>

          <Volume2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
        </div>
      )}

      {/* Vellera Anthems State */}
      {audioMode === "vellera" && (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center flex-shrink-0 border border-blue-400">
            <Music className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">
              Vellera Combat Anthem
            </p>
            <p className="text-commander-muted text-xs">Built-in</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-red-600 hover:bg-red-500 rounded-full transition-all touch-target-min"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white fill-white" />
              ) : (
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}