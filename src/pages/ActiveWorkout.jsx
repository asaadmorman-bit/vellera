import { useState, useEffect, useRef } from "react";
import { X, Pause, Play, SkipForward } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AudioPlayerWidget from "../components/AudioPlayerWidget";

// Simulated workout data (can be fetched from API)
const MOCK_WORKOUT = {
  title: "The Strike: Heavy Bag Intervals",
  totalRounds: 5,
  currentRound: 3,
  movements: [
    { name: "JAB-CROSS-HOOK", duration: 60 },
    { name: "UPPERCUTS", duration: 45 },
    { name: "SPEED ROUND", duration: 45 },
    { name: "REST", duration: 30 },
  ],
  currentMovementIndex: 0,
};

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitTapCount, setExitTapCount] = useState(0);
  const exitTapTimeoutRef = useRef(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(MOCK_WORKOUT.movements[0].duration);
  const [currentMovement, setCurrentMovement] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  // Wakelock: Prevent screen sleep during active workout
  // NOTE: In production, integrate with react-native-keep-awake or similar
  // For web: Use Screen Wake Lock API (if available)
  useEffect(() => {
    const acquireWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          const wakeLock = await navigator.wakeLock.request("screen");
          console.log("✅ Screen wake lock acquired");
          return wakeLock;
        }
      } catch (err) {
        console.warn("⚠️ Wake lock not available:", err);
      }
      return null;
    };

    let wakeLock = null;
    acquireWakeLock().then((lock) => {
      wakeLock = lock;
    });

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Main timer loop
  useEffect(() => {
    if (isPaused) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished - play bell sound and advance
          playBellSound();
          advanceToNextMovement();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isPaused, currentMovement]);

  // Play bell sound with audio ducking
  const playBellSound = async () => {
    try {
      const audio = new Audio("/sounds/bell.mp3");
      audio.volume = 1.0;
      
      // Audio ducking: lower external audio before bell
      // (Web Audio API limitation: cannot control Spotify/YouTube directly from browser)
      // On native iOS/Android, audio ducking would use:
      // - iOS: AVAudioSession with .duckOthers option
      // - Android: AudioAttributes with CONTENT_TYPE_SPEECH
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.warn("Bell playback failed:", err));
      }
      
      // Wait for bell to finish (~1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Bell sound error:", error);
    }
  };

  // Advance to next movement or round
  const advanceToNextMovement = () => {
    const nextIndex = (currentMovement + 1) % MOCK_WORKOUT.movements.length;
    setCurrentMovement(nextIndex);

    if (nextIndex === 0) {
      // Completed a full round
      setRoundsCompleted((prev) => prev + 1);
    }

    const nextDuration = MOCK_WORKOUT.movements[nextIndex].duration;
    setTimeLeft(nextDuration);
  };

  // Manual skip to next interval
  const handleSkipInterval = () => {
    advanceToNextMovement();
  };

  // Double-tap exit confirmation
  const handleExitAttempt = () => {
    setExitTapCount((prev) => prev + 1);

    if (exitTapCount === 0) {
      // First tap
      setShowExitConfirm(true);

      // Reset after 3 seconds
      if (exitTapTimeoutRef.current) clearTimeout(exitTapTimeoutRef.current);
      exitTapTimeoutRef.current = setTimeout(() => {
        setExitTapCount(0);
        setShowExitConfirm(false);
      }, 3000);
    } else if (exitTapCount === 1) {
      // Second tap - confirm exit
      setShowExitConfirm(false);
      setExitTapCount(0);
      if (exitTapTimeoutRef.current) clearTimeout(exitTapTimeoutRef.current);
      navigate(-1);
    }
  };

  const movement = MOCK_WORKOUT.movements[currentMovement];
  const nextMovement =
    MOCK_WORKOUT.movements[(currentMovement + 1) % MOCK_WORKOUT.movements.length];
  const progressPercent =
    ((movement.duration - timeLeft) / movement.duration) * 100;

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Determine color based on movement type
  const isRest = movement.name === "REST";
  const accentColor = isRest ? "text-green-400" : "text-blue-400";
  const ringColor = isRest ? "#22c55e" : "#00E5FF";

  return (
    <div className="w-full h-screen bg-vellera-dark flex flex-col relative overflow-hidden safe-area-top">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 px-4 py-4 flex items-center justify-between border-b border-commander-border bg-commander-dark/50 backdrop-blur">
        {/* Exit Button with Double-Tap Confirmation */}
        <div className="relative">
          <button
            onClick={handleExitAttempt}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-900/50 hover:bg-red-900 border border-red-700 rounded-lg transition-all"
            title="End Workout (double-tap)"
          >
            <X className="w-5 h-5 text-red-400" />
          </button>

          {/* Confirmation indicator */}
          {showExitConfirm && (
            <div className="absolute top-full mt-2 left-0 bg-red-900 border border-red-700 rounded-lg px-3 py-1 whitespace-nowrap text-xs text-red-300 font-bold">
              Tap again to confirm
            </div>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-white font-black text-sm md:text-base tracking-tight truncate">
            {MOCK_WORKOUT.title}
          </h1>
        </div>

        {/* Round Counter */}
        <div className="flex items-center gap-1 bg-commander-surface border border-commander-border rounded-lg px-3 py-2 text-xs font-bold">
          <span className="text-blue-400">Round</span>
          <span className="text-white">{roundsCompleted + 1}</span>
          <span className="text-commander-muted">/</span>
          <span className="text-white">{MOCK_WORKOUT.totalRounds}</span>
        </div>
      </header>

      {/* Main Timer Display */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        {/* Circular Progress Ring */}
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="#1f2937"
              strokeWidth="8"
            />

            {/* Progress ring with glow */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeDasharray={`${(progressPercent / 100) * 596.9} 596.9`}
              strokeLinecap="round"
              filter="url(#glow)"
              opacity="0.9"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Timer (massive, legible font) */}
            <div className="text-white font-mono font-black text-7xl md:text-8xl leading-none tracking-tighter">
              {formatTime(timeLeft)}
            </div>

            {/* Current movement label */}
            <div className={`mt-4 font-black text-lg md:text-xl tracking-widest uppercase ${accentColor}`}>
              {movement.name}
            </div>

            {/* Next up indicator */}
            <div className="mt-3 text-commander-muted text-xs md:text-sm text-center">
              Up Next: <span className="text-white font-semibold">{nextMovement.name}</span>
            </div>

            {/* Pause indicator */}
            {isPaused && (
              <div className="mt-4 px-3 py-1 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                <span className="text-yellow-400 text-xs font-bold">⏸ PAUSED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player Widget */}
      <AudioPlayerWidget
        isSpotifyConnected={false}
        currentTrack={{ name: "External Audio", artist: "YouTube Music" }}
        onPlayPause={() => console.log("Play/Pause")}
        onSkip={() => console.log("Skip track")}
      />

      {/* Bottom Controls */}
      <div className="relative z-20 px-4 py-6 flex items-center justify-center gap-6 bg-commander-dark/80 backdrop-blur border-t border-commander-border safe-area-bottom">
        {/* Pause/Resume Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full font-bold text-white transition-all shadow-lg shadow-blue-500/30 touch-target-min min-w-max"
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5 fill-white" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-5 h-5 fill-white" />
              Pause
            </>
          )}
        </button>

        {/* Skip Interval Button */}
        <button
          onClick={handleSkipInterval}
          className="flex items-center justify-center p-3 bg-commander-surface border-2 border-commander-border hover:border-blue-400 rounded-full transition-all touch-target-min"
          title="Skip to next interval"
        >
          <SkipForward className="w-5 h-5 text-blue-400" />
        </button>
      </div>
    </div>
  );
}