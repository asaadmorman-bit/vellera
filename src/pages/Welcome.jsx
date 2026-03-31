import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Placeholder function for intro audio playback
const playIntroAudio = () => {
  // TODO: Decode and play 30-second Base64 audio on load
  // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // const audioData = atob(BASE64_AUDIO_STRING);
  // audioContext.decodeAudioData(audioData, (buffer) => {
  //   const source = audioContext.createBufferSource();
  //   source.buffer = buffer;
  //   source.connect(audioContext.destination);
  //   source.start(0);
  // });
  console.log("Intro audio would play here");
};

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    playIntroAudio();
  }, []);

  return (
    <div className="w-full h-screen bg-vellera-dark flex flex-col items-center justify-center p-4 space-y-6">
      {/* Vellera Logo - Dynamic V Arrow */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-4">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* V-shaped arrow pointing forward */}
          <path
            d="M 30 20 L 50 60 L 70 20"
            stroke="#00E5FF"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow head pointing right */}
          <path
            d="M 70 45 L 85 50 L 70 55"
            stroke="#00E5FF"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Headline */}
      <h1 className="text-white text-4xl font-black text-center tracking-tight">
        Welcome to your <span className="text-vellera-blue">Vellera</span> era.
      </h1>

      {/* Subtext */}
      <p className="text-vellera-muted text-lg text-center">
        Let's build your momentum.
      </p>

      {/* CTA Button */}
      <button
        onClick={() => navigate("/home")}
        className="mt-8 bg-vellera-blue text-vellera-dark font-bold px-8 py-4 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-vellera-blue/50 transition-all min-h-[56px] touch-target-min"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Tagline */}
      <p className="text-vellera-muted text-xs absolute bottom-8 text-center">
        Your Pace. Your Progress.
      </p>
    </div>
  );
}