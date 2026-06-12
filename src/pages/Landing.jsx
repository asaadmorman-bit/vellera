import { useState } from "react";
import BJJBadgesShowcase from "../components/BJJBadgesShowcase";
import { ChevronRight, Shield, Lock, Eye, Database, ChevronLeft, Star, Activity, Brain, Dumbbell, Heart, Users, BarChart3, Calendar, Video, Target, Award, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function AppScreen({ title, icon: Icon, color, children }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-black" />
        </div>
        <span className="text-white font-bold text-sm">{title}</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-black" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function SecurityBadge({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-sky-400" />
      </div>
      <div>
        <p className="text-white font-bold text-sm">{title}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const [reviewIndex, setReviewIndex] = useState(0);
  const navigate = useNavigate();

  const reviews = [
    { name: "Jordan M.", role: "BJJ Athlete", text: "Finally, an app that gets combat sports. The MMA timers and grappling flows are exactly what I needed. No generic fitness noise.", rating: 5 },
    { name: "Maya P.", role: "Fitness Beginner", text: "I was intimidated by fitness apps, but Vellera's interface is clean and welcoming. The mobility routines are perfect for my pace.", rating: 5 },
    { name: "Alex T.", role: "Strength Coach", text: "The AI recovery predictions are game-changing. I can now adjust my athletes' load before they hit a wall, not after.", rating: 5 },
  ];

  const features = [
    { icon: Brain, title: "AI Coach", color: "bg-sky-500", desc: "Your 24/7 personal coach powered by AI. Get real-time form feedback, training adjustments, and personalized programming based on your biometrics and goals." },
    { icon: Activity, title: "Biometrics & Wearables", color: "bg-emerald-500", desc: "Connect Whoop, Strava, Polar, Fitbit, and Google Fit. See your HRV, strain, recovery score, and sleep data in one unified dashboard." },
    { icon: Dumbbell, title: "Lift Analysis", color: "bg-purple-400", desc: "Upload a video of your lift and get AI-powered form analysis, technique error detection, and safety alerts — like having a certified coach in your pocket." },
    { icon: Target, title: "BJJ & Combat", color: "bg-orange-400", desc: "Dedicated tools for BJJ, MMA, boxing, and wrestling. Technique library, sparring logs, belt progression tracker, and tactical journal." },
    { icon: BarChart3, title: "Progress Tracking", color: "bg-yellow-400", desc: "Track every metric that matters: strength PRs, body composition, training volume, consistency streaks, and performance correlation charts." },
    { icon: Heart, title: "Wellness & Recovery", color: "bg-red-400", desc: "Daily readiness check-ins, pain tracking, sleep quality monitoring, and AI-powered recovery predictions to keep you training safely." },
    { icon: Users, title: "Squads & Coaching", color: "bg-cyan-400", desc: "Join training squads, challenge friends, assign tasks as a coach, review student videos, and track your athletes' progress in real time." },
    { icon: Calendar, title: "Smart Scheduling", color: "bg-green-400", desc: "AI-generated training calendars that auto-adjust based on your recovery scores, upcoming events, and historical performance data." },
    { icon: Video, title: "Video Vault", color: "bg-pink-400", desc: "Store, organize, and analyze your technique videos. Draw on frames with the telestration tool to highlight movement patterns and corrections." },
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-white overflow-hidden font-inter">
      {/* Beta Banner */}
      <div className="bg-yellow-900/40 border-b border-yellow-700/50 px-4 py-2.5 text-center">
        <p className="text-sm text-yellow-300 font-semibold">
          ⚠️ <span className="uppercase tracking-widest text-xs">Beta</span> — Awaiting App Store & Play Store approval. Available now as a web app.
        </p>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative px-4 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-1.5">
                <Flame className="w-4 h-4 text-sky-400" />
                <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">Your All-In-One Training OS</span>
              </div>

              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                  Train Smarter.<br />
                  Recover Faster.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Own Your Data.</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  Vellera is the complete training platform for strength athletes, combat sports practitioners, and hybrid athletes — with AI coaching, biometric integration, and clinical-grade privacy.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/beta-request"
                  className="px-8 py-4 bg-gradient-to-r from-sky-400 to-emerald-400 text-black font-black rounded-xl text-lg hover:shadow-2xl hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-2"
                >
                  Join Beta (Invite-Only) <ChevronRight className="w-5 h-5" />
                </Link>
                <button disabled className="px-8 py-4 bg-gray-800 text-gray-400 font-bold rounded-xl text-lg cursor-not-allowed flex items-center justify-center gap-2">
                  📱 Coming to App Stores
                </button>
              </div>
              <p className="text-gray-500 text-sm">✨ No credit card required · Full access · Cancel anytime</p>
            </div>

            <div className="space-y-4 hidden lg:block">
              <AppScreen title="Dashboard" icon={Activity} color="bg-sky-500">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Today's Readiness</p>
                      <p className="text-3xl font-black text-emerald-400">87%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Streak</p>
                      <p className="text-2xl font-black text-sky-400">🔥 23</p>
                    </div>
                  </div>
                  <StatBar label="HRV Score" value={68} max={100} color="bg-emerald-500" />
                  <StatBar label="Sleep Quality" value={7.5} max={10} color="bg-sky-500" />
                  <StatBar label="Training Load" value={72} max={100} color="bg-purple-500" />
                </div>
              </AppScreen>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE NAME ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-sky-400 font-bold uppercase tracking-[0.3em] mb-4">The Name</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Vellera</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Derived from the Latin <em className="text-white font-semibold">vellere</em> — meaning <span className="text-emerald-400 font-bold">"to pull, to draw out, to forge"</span> — Vellera represents the act of pulling your best self forward.
          </p>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-24 px-4 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      <BJJBadgesShowcase />

      {/* Meet Creators Section */}
      <section className="py-24 px-4 bg-gray-900/30 border-t border-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-12">Meet the Creators</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-sky-400">Asaad Morman</h3>
            <p className="text-gray-400 text-sm mt-2">Founder & Tactical Specialist</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-4">Ready to Own Your Training?</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
            <Link to="/beta-request" className="px-10 py-5 bg-gradient-to-r from-sky-400 to-emerald-400 text-black font-black rounded-2xl text-lg hover:shadow-2xl transition-all">
              Request Beta Access
            </Link>
            <span className="text-gray-500 text-sm">or</span>
            <Link to="/auth" className="px-10 py-5 bg-gray-800 text-white font-black rounded-2xl text-lg hover:bg-gray-700 transition-all border border-gray-700">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
