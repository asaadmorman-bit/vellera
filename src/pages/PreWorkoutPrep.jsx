import { useState } from "react";
import { Play, ChevronDown, ChevronUp, Shield, Zap, Wind } from "lucide-react";
import BackButton from "../components/BackButton";
import SupplementTracker from "../components/SupplementTracker";

// ── Curated Library ────────────────────────────────────────────────────────────
const LIBRARY = {
  "Pre-Workout Activation": {
    icon: Zap,
    color: "text-yellow-400",
    border: "border-yellow-800",
    bg: "bg-yellow-950/20",
    desc: "Prime your CNS, activate glutes & hips before mat work or lifting",
    items: [
      {
        name: "Hip Circles & Leg Swings",
        duration: "2 min",
        photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
        video: "https://www.youtube.com/watch?v=4BOTvaRaDjI",
        videoId: "4BOTvaRaDjI",
        cues: ["10 circles each direction per hip", "20 leg swings front/back", "20 leg swings side/side", "Opens hip flexors for guard play"],
      },
      {
        name: "Glute Bridge Activation",
        duration: "3 sets × 15",
        photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
        video: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E",
        videoId: "OUgsJ8-Vi0E",
        cues: ["Feet hip-width apart", "Drive through heels", "Squeeze glutes at top for 2s", "Protects lower back under 250lb frame"],
      },
      {
        name: "Shoulder CARS (Controlled Articular Rotations)",
        duration: "5 circles each side",
        photo: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=80",
        video: "https://www.youtube.com/watch?v=fNrVLlCb1kI",
        videoId: "fNrVLlCb1kI",
        cues: ["Move slow and deliberate", "Max range at every point", "No compensation from trunk", "Prevents shoulder impingement in guard"],
      },
      {
        name: "World's Greatest Stretch",
        duration: "5 reps/side",
        photo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
        video: "https://www.youtube.com/watch?v=ZS7EzMFcSM0",
        videoId: "ZS7EzMFcSM0",
        cues: ["Lunge + rotate + reach", "Hold each position 2s", "Opens hips, thoracic, ankles", "Best single-move BJJ warmup"],
      },
    ],
  },
  "Injury Prevention": {
    icon: Shield,
    color: "text-red-400",
    border: "border-red-800",
    bg: "bg-red-950/20",
    desc: "Targeted protocols for the joints most at-risk in grappling at 43yo",
    items: [
      {
        name: "Neck Strengthening (Wrestler's Bridge Prep)",
        duration: "3 sets × 10 reps",
        photo: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=80",
        video: "https://www.youtube.com/watch?v=4o-VYBXxpms",
        videoId: "4o-VYBXxpms",
        cues: ["Start with isometric holds only", "4 directions: flex/extend/lateral × 2", "Never go to full bridge until strong", "Essential for takedown defense"],
      },
      {
        name: "Finger Tendon Warm-Up",
        duration: "5 min pre-roll",
        photo: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80",
        video: "https://www.youtube.com/watch?v=IIi3sBSmHCQ",
        videoId: "IIi3sBSmHCQ",
        cues: ["Open/close fist 20×", "Individual finger extension holds", "Rice bucket or therapy putty", "Tape A2 pulley if any pain"],
      },
      {
        name: "Knee Stability — Terminal Extension",
        duration: "3 × 15 each leg",
        photo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80",
        video: "https://www.youtube.com/watch?v=zEMOfCPpjCI",
        videoId: "zEMOfCPpjCI",
        cues: ["Band around post at knee height", "Walk out for tension, lock knee out", "VMO activation prevents tracking issues", "Critical at 250lb under single-leg shots"],
      },
      {
        name: "Rotator Cuff — Band External Rotation",
        duration: "3 × 15 each side",
        photo: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80",
        video: "https://www.youtube.com/watch?v=l6D2oVeOmH4",
        videoId: "l6D2oVeOmH4",
        cues: ["Elbow at 90° pinned to side", "Rotate outward against band", "Slow eccentric return (3s)", "Protects shoulder from armbar attempts"],
      },
    ],
  },
  "Mobility & Recovery Stretching": {
    icon: Wind,
    color: "text-blue-400",
    border: "border-blue-800",
    bg: "bg-blue-950/20",
    desc: "Post-mat decompression and 43yo joint restoration protocols",
    items: [
      {
        name: "Pigeon Pose (Hip Opener)",
        duration: "2 min each side",
        photo: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80",
        video: "https://www.youtube.com/watch?v=2UtTEXKAGQM",
        videoId: "2UtTEXKAGQM",
        cues: ["Shin parallel to body if possible", "Prop on block if hip raises", "Breathe into the hip each exhale", "Undoes hours of closed guard"],
      },
      {
        name: "Thoracic Spine Foam Roll",
        duration: "2 min continuous",
        photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
        video: "https://www.youtube.com/watch?v=LDW9fDxEoMk",
        videoId: "LDW9fDxEoMk",
        cues: ["Roll T4–T10 only (mid back)", "Arms crossed or overhead", "Pause on each tender spot 20s", "Reverses forward posture from top pressure"],
      },
      {
        name: "90/90 Hip Mobility Flow",
        duration: "3 min",
        photo: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80",
        video: "https://www.youtube.com/watch?v=jN3ZGIzZnoY",
        videoId: "jN3ZGIzZnoY",
        cues: ["Both legs at 90°", "Rotate knees side-to-side", "Front shin lift (hip IR)", "Rear shin lift (hip ER)", "Best single movement for guard game"],
      },
      {
        name: "Cervical Traction Hang",
        duration: "30s × 3 sets",
        photo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
        video: "https://www.youtube.com/watch?v=K3JeGiPLQsY",
        videoId: "K3JeGiPLQsY",
        cues: ["Dead hang from pull-up bar", "Relax neck completely", "Decompresses cervical spine post-rolling", "Skip if any neck injury present"],
      },
    ],
  },
};

function VideoCard({ item, color, border, bg }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`rounded-xl border overflow-hidden ${border} ${bg}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left">
        <div className="relative">
          <img src={item.photo} alt={item.name} className="w-full h-36 object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur border border-white/30">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-0.5 text-xs text-white">{item.duration}</div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <p className="text-white text-sm font-semibold">{item.name}</p>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {/* Embedded video */}
          {!playing ? (
            <button
              onClick={() => setPlaying(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-800 bg-red-950/40 text-red-300 text-xs font-bold hover:bg-red-900/40 transition-all"
            >
              <Play className="w-4 h-4 fill-red-300" /> Watch on YouTube
            </button>
          ) : (
            <div className="rounded-lg overflow-hidden aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={item.name}
              />
            </div>
          )}

          {/* Coaching cues */}
          <div className="space-y-1">
            {item.cues.map((cue, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-xs font-bold mt-0.5 ${color}`}>›</span>
                <p className="text-gray-300 text-xs">{cue}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PreWorkoutPrep() {
  const [activeTab, setActiveTab] = useState("library");
  const [activeSection, setActiveSection] = useState("Pre-Workout Activation");

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24 safe-area-top overflow-auto h-screen">
      <div className="flex items-center gap-2">
        <BackButton to="/" />
        <h1 className="text-white text-xl font-black tracking-tight">Prep & Supplements</h1>
      </div>

      {/* Main Tab */}
      <div className="flex bg-commander-surface border border-commander-border rounded-xl overflow-hidden">
        {[["library", "🎥 Exercise Library"], ["supplements", "💊 Supplements"]].map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v)}
            className={`flex-1 py-2.5 text-xs font-bold transition-all min-h-[44px] ${activeTab === v ? "bg-commander-red text-white" : "text-commander-muted"}`}>
            {l}
          </button>
        ))}
      </div>

      {activeTab === "library" && <>
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(LIBRARY).map(([section, { icon: Icon, color }]) => (
            <button key={section} onClick={() => setActiveSection(section)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border transition-all min-h-[36px] ${activeSection === section ? "bg-commander-red border-commander-red text-white" : "border-commander-border text-commander-muted"}`}>
              <Icon className={`w-3 h-3 ${activeSection === section ? "text-white" : color}`} />
              {section.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Section Description */}
        {LIBRARY[activeSection] && (
          <div className={`rounded-xl border p-3 ${LIBRARY[activeSection].bg} ${LIBRARY[activeSection].border}`}>
            <p className={`text-xs font-bold ${LIBRARY[activeSection].color} mb-1`}>{activeSection}</p>
            <p className="text-gray-400 text-xs">{LIBRARY[activeSection].desc}</p>
          </div>
        )}

        {/* Video Cards */}
        <div className="space-y-3">
          {LIBRARY[activeSection]?.items.map(item => (
            <VideoCard
              key={item.name}
              item={item}
              color={LIBRARY[activeSection].color}
              border={LIBRARY[activeSection].border}
              bg={LIBRARY[activeSection].bg}
            />
          ))}
        </div>
      </>}

      {activeTab === "supplements" && <SupplementTracker />}
    </div>
  );
}