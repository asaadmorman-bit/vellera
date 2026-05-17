import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, CalendarCheck, Loader2, ExternalLink, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const DRILL_PRESETS = [
  { label: "BJJ — Guard Passing", duration: 60, description: "Guard passing drills: knee slice, torreando, leg weave." },
  { label: "BJJ — Submissions", duration: 75, description: "Submission chains from dominant positions." },
  { label: "Striking — Heavy Bag", duration: 45, description: "Combo work on the heavy bag: jab-cross-hook, body shots, footwork." },
  { label: "Takedown Drilling", duration: 60, description: "Shoot / sprawl takedown entries and finishes." },
  { label: "Positional Sparring", duration: 90, description: "Positional rounds focused on guard retention and escapes." },
  { label: "Strength & Conditioning", duration: 60, description: "Combat S&C: explosive movements, carries, and conditioning circuits." },
  { label: "Custom", duration: 60, description: "" },
];

function getDefaultDatetime(daysFromNow, hour = 18) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function addMinutes(datetimeLocal, mins) {
  const d = new Date(datetimeLocal);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString().slice(0, 16);
}

export default function ScheduleDrills() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([
    {
      id: 1,
      preset: DRILL_PRESETS[0].label,
      title: DRILL_PRESETS[0].label,
      description: DRILL_PRESETS[0].description,
      startDateTime: getDefaultDatetime(1),
      duration: DRILL_PRESETS[0].duration,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const addSession = () => {
    const id = Date.now();
    setSessions(prev => [
      ...prev,
      {
        id,
        preset: DRILL_PRESETS[0].label,
        title: DRILL_PRESETS[0].label,
        description: DRILL_PRESETS[0].description,
        startDateTime: getDefaultDatetime(prev.length + 1),
        duration: DRILL_PRESETS[0].duration,
      },
    ]);
  };

  const removeSession = (id) => setSessions(prev => prev.filter(s => s.id !== id));

  const updateSession = (id, field, value) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === "preset") {
        const found = DRILL_PRESETS.find(p => p.label === value);
        if (found) {
          updated.title = found.label === "Custom" ? "" : found.label;
          updated.description = found.description;
          updated.duration = found.duration;
        }
      }
      return updated;
    }));
  };

  const handleSchedule = async () => {
    const payload = sessions.map(s => ({
      title: s.title || s.preset,
      description: s.description,
      startDateTime: new Date(s.startDateTime).toISOString(),
      endDateTime: new Date(addMinutes(s.startDateTime, s.duration)).toISOString(),
    }));

    setLoading(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke("scheduleDrillSessions", { sessions: payload });
      setResults(res.data.results);
      const ok = res.data.results.filter(r => r.success).length;
      toast.success(`${ok} session${ok !== 1 ? "s" : ""} added to Google Calendar!`);
    } catch (err) {
      toast.error("Failed to schedule: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-commander-dark p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="text-commander-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-xl font-black">Schedule Drill Sessions</h1>
            <p className="text-commander-muted text-xs">Add martial arts drills directly to Google Calendar</p>
          </div>
        </div>

        {/* Sessions */}
        {sessions.map((s, idx) => (
          <div key={s.id} className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-sm">Session {idx + 1}</p>
              {sessions.length > 1 && (
                <button onClick={() => removeSession(s.id)} className="text-commander-muted hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Preset picker */}
            <div>
              <label className="text-commander-muted text-xs block mb-1">Drill Type</label>
              <select
                value={s.preset}
                onChange={e => updateSession(s.id, "preset", e.target.value)}
                className="w-full bg-gray-800 border border-commander-border rounded-lg px-3 py-2 text-white text-sm"
              >
                {DRILL_PRESETS.map(p => (
                  <option key={p.label} value={p.label}>{p.label} ({p.duration} min)</option>
                ))}
              </select>
            </div>

            {/* Custom title (shown when preset is Custom) */}
            {s.preset === "Custom" && (
              <div>
                <label className="text-commander-muted text-xs block mb-1">Custom Title</label>
                <input
                  type="text"
                  value={s.title}
                  onChange={e => updateSession(s.id, "title", e.target.value)}
                  placeholder="e.g. Wrestling Takedowns"
                  className="w-full bg-gray-800 border border-commander-border rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-commander-muted text-xs block mb-1">Notes / Description</label>
              <textarea
                value={s.description}
                onChange={e => updateSession(s.id, "description", e.target.value)}
                rows={2}
                className="w-full bg-gray-800 border border-commander-border rounded-lg px-3 py-2 text-white text-sm resize-none"
              />
            </div>

            {/* Date/time + duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-commander-muted text-xs block mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={s.startDateTime}
                  onChange={e => updateSession(s.id, "startDateTime", e.target.value)}
                  className="w-full bg-gray-800 border border-commander-border rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-commander-muted text-xs block mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={s.duration}
                  min={15}
                  max={240}
                  step={15}
                  onChange={e => updateSession(s.id, "duration", parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-commander-border rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add session */}
        <button
          onClick={addSession}
          className="w-full border border-dashed border-commander-border rounded-xl py-3 text-commander-muted hover:text-white hover:border-vellera-blue transition-all flex items-center justify-center gap-2 text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> Add Another Session
        </button>

        {/* Schedule button */}
        <button
          onClick={handleSchedule}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-vellera-blue to-vellera-green text-black font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all text-base"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Scheduling...</>
          ) : (
            <><CalendarCheck className="w-5 h-5" /> Add {sessions.length} Session{sessions.length !== 1 ? "s" : ""} to Google Calendar</>
          )}
        </button>

        {/* Results */}
        {results && (
          <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-2">
            <p className="text-white font-black text-sm mb-3">Results</p>
            {results.map((r, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${r.success ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"}`}>
                <div className="flex items-center gap-2">
                  {r.success
                    ? <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  <span className={r.success ? "text-green-200" : "text-red-200"}>{r.title}</span>
                </div>
                {r.success && r.htmlLink && (
                  <a href={r.htmlLink} target="_blank" rel="noopener noreferrer" className="text-vellera-blue hover:text-vellera-green flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {!r.success && <span className="text-red-400">{r.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}