import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Users, Activity, ClipboardList, Dumbbell, ChevronRight, CheckCircle2, Clock, X, Plus, Send, BarChart3, Heart, Zap, Video } from 'lucide-react';
import BackButton from '../components/BackButton';
import { toast } from 'sonner';

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: BarChart3 },
  { id: 'students',  label: 'Students',  icon: Users },
  { id: 'assign',    label: 'Assign',    icon: Dumbbell },
  { id: 'health',    label: 'Health',    icon: Heart },
];

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-commander-muted text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-white text-3xl font-black">{value}</p>
    </div>
  );
}

export default function InstructorOrgDashboard() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Data
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Assign form state
  const [assignForm, setAssignForm] = useState({ student_email: '', title: '', task_type: 'Drill', description: '', due_date: '' });
  const [assigning, setAssigning] = useState(false);

  // Selected student for drill-down
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);

      const members = await base44.entities.OrganizationMember.filter({ user_email: me.email, member_type: 'INSTRUCTOR' });
      if (members.length === 0) { setLoading(false); return; }

      const orgId = members[0].org_id;
      const orgs = await base44.entities.Organization.filter({ id: orgId });
      if (orgs.length > 0) setOrg(orgs[0]);

      // Load all data in parallel
      const [allMembers, allTasks, allPrograms] = await Promise.all([
        base44.entities.OrganizationMember.filter({ org_id: orgId, member_type: 'STUDENT' }),
        base44.entities.Task.filter({ coach_email: me.email }),
        base44.entities.TrainingProgram.list('-created_date', 20).catch(() => []),
      ]);

      setStudents(allMembers);
      setTasks(allTasks);
      setPrograms(allPrograms);

      // Load wellness for all known student emails
      if (allMembers.length > 0) {
        const wellnessAll = await Promise.all(
          allMembers.slice(0, 10).map(s =>
            base44.entities.WellnessLog.filter({ user_email: s.user_email }).catch(() => [])
          )
        );
        setWellnessLogs(wellnessAll.flat());
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.student_email || !assignForm.title) { toast.error('Please fill all required fields'); return; }
    setAssigning(true);
    await base44.entities.Task.create({
      coach_email: user.email,
      student_email: assignForm.student_email,
      title: assignForm.title,
      task_type: assignForm.task_type,
      description: assignForm.description,
      due_date: assignForm.due_date || undefined,
      status: 'Assigned',
    });
    setTasks(prev => [...prev, { ...assignForm, coach_email: user.email, status: 'Assigned' }]);
    setAssignForm({ student_email: '', title: '', task_type: 'Drill', description: '', due_date: '' });
    toast.success('Task assigned!');
    setAssigning(false);
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    await base44.entities.Task.update(taskId, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    toast.success(`Marked as ${newStatus}`);
  };

  const pendingCount = tasks.filter(t => ['Assigned', 'In Progress', 'Submitted'].includes(t.status)).length;
  const completedCount = tasks.filter(t => t.status === 'Complete').length;

  // Aggregate wellness per student
  const getStudentWellness = (email) => {
    const logs = wellnessLogs.filter(l => l.user_email === email);
    if (!logs.length) return null;
    const recent = logs.slice(-7);
    return {
      avgReadiness: Math.round(recent.reduce((s, l) => s + (l.readiness_score || 0), 0) / recent.length),
      avgMood: (recent.reduce((s, l) => s + (l.mood_score || 0), 0) / recent.length).toFixed(1),
      avgSleep: (recent.reduce((s, l) => s + (l.sleep_hours || 0), 0) / recent.length).toFixed(1),
      flagged: logs.some(l => l.flagged),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-commander-dark">
        <div className="w-8 h-8 border-4 border-vellera-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-4 max-w-lg mx-auto pt-24">
        <BackButton to="/" />
        <div className="bg-commander-surface border border-commander-border rounded-xl p-8 text-center mt-8 space-y-3">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <p className="text-white font-bold text-lg">No Organization</p>
          <p className="text-commander-muted text-sm">You're not assigned as an instructor to any organization yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-commander-dark p-4 pb-28 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <BackButton to="/" />
        <div>
          <h1 className="text-white text-xl font-black">{org.name}</h1>
          <p className="text-commander-muted text-xs">Coach Dashboard · {students.length} students</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-commander-surface border border-commander-border rounded-xl p-1 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === id ? 'bg-vellera-blue text-black' : 'text-commander-muted hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Students" value={students.length} icon={Users} color="text-vellera-blue" />
            <StatCard label="Active Tasks" value={pendingCount} icon={ClipboardList} color="text-yellow-400" />
            <StatCard label="Completed" value={completedCount} icon={CheckCircle2} color="text-vellera-green" />
            <StatCard label="Flagged" value={wellnessLogs.filter(l => l.flagged).length} icon={AlertCircle} color="text-red-400" />
          </div>

          {/* Recent tasks */}
          <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
            <p className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-vellera-blue" /> Recent Task Activity
            </p>
            {tasks.length === 0 && <p className="text-commander-muted text-sm">No tasks assigned yet.</p>}
            <div className="space-y-2">
              {tasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white font-semibold">{t.title}</p>
                    <p className="text-commander-muted text-xs">{t.student_email}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Submissions needing review */}
          {tasks.filter(t => t.status === 'Submitted').length > 0 && (
            <div className="bg-red-950/20 border border-red-700/40 rounded-xl p-4">
              <p className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                <Video className="w-4 h-4" /> Needs Review ({tasks.filter(t => t.status === 'Submitted').length})
              </p>
              {tasks.filter(t => t.status === 'Submitted').map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-red-900/30 last:border-0">
                  <div>
                    <p className="text-white text-sm font-bold">{t.title}</p>
                    <p className="text-commander-muted text-xs">{t.student_email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(t.id, 'Reviewed')}
                      className="text-xs px-2 py-1 bg-vellera-green/20 text-vellera-green border border-vellera-green/30 rounded font-bold"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(t.id, 'Complete')}
                      className="text-xs px-2 py-1 bg-blue-900/30 text-vellera-blue border border-vellera-blue/30 rounded font-bold"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STUDENTS TAB ── */}
      {activeTab === 'students' && (
        <div className="space-y-3">
          {students.length === 0 && (
            <div className="text-center py-12 text-commander-muted">No students in this organization yet.</div>
          )}
          {students.map(s => {
            const w = getStudentWellness(s.user_email);
            const studentTasks = tasks.filter(t => t.student_email === s.user_email);
            return (
              <div key={s.id} className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{s.user_name || s.user_email}</p>
                    <p className="text-commander-muted text-xs">{s.user_email}</p>
                    {s.certifications?.length > 0 && (
                      <p className="text-xs text-vellera-blue mt-0.5">{s.certifications.join(', ')}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${s.status === 'active' ? 'bg-vellera-green/20 text-vellera-green' : 'bg-gray-700 text-gray-400'}`}>
                    {s.status}
                  </span>
                </div>

                {/* Progress logs summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-900 rounded-lg p-2 text-center">
                    <p className="text-vellera-blue font-black text-lg">{studentTasks.length}</p>
                    <p className="text-commander-muted text-xs">Tasks</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2 text-center">
                    <p className="text-vellera-green font-black text-lg">
                      {studentTasks.filter(t => t.status === 'Complete').length}
                    </p>
                    <p className="text-commander-muted text-xs">Done</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2 text-center">
                    <p className={`font-black text-lg ${w?.flagged ? 'text-red-400' : 'text-commander-muted'}`}>
                      {w ? `${w.avgReadiness}%` : '—'}
                    </p>
                    <p className="text-commander-muted text-xs">Readiness</p>
                  </div>
                </div>

                {w && (
                  <div className="flex gap-3 text-xs text-commander-muted">
                    <span>😴 {w.avgSleep}h sleep</span>
                    <span>😊 {w.avgMood}/5 mood</span>
                    {w.flagged && <span className="text-red-400 font-bold">⚠️ Flagged</span>}
                  </div>
                )}

                <button
                  onClick={() => { setAssignForm(f => ({ ...f, student_email: s.user_email })); setActiveTab('assign'); }}
                  className="w-full py-2 rounded-lg bg-vellera-blue/10 border border-vellera-blue/30 text-vellera-blue text-xs font-bold hover:bg-vellera-blue/20 transition"
                >
                  <Plus className="w-3 h-3 inline mr-1" /> Assign Task
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ASSIGN PROGRAM TAB ── */}
      {activeTab === 'assign' && (
        <div className="space-y-4">
          <p className="text-white font-black text-sm uppercase tracking-wider">Assign Training Task</p>
          <form onSubmit={handleAssign} className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-4">
            {/* Student select */}
            <div>
              <label className="text-commander-muted text-xs font-bold block mb-1">Student *</label>
              <select
                value={assignForm.student_email}
                onChange={e => setAssignForm(f => ({ ...f, student_email: e.target.value }))}
                className="w-full bg-gray-900 border border-commander-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-vellera-blue"
                required
              >
                <option value="">Select student…</option>
                {students.map(s => (
                  <option key={s.id} value={s.user_email}>{s.user_name || s.user_email}</option>
                ))}
              </select>
            </div>

            {/* Task type */}
            <div>
              <label className="text-commander-muted text-xs font-bold block mb-1">Task Type *</label>
              <select
                value={assignForm.task_type}
                onChange={e => setAssignForm(f => ({ ...f, task_type: e.target.value }))}
                className="w-full bg-gray-900 border border-commander-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-vellera-blue"
              >
                {['Drill', 'Strength', 'Conditioning', 'Form Check', 'Video Review', 'Homework'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-commander-muted text-xs font-bold block mb-1">Task Title *</label>
              <input
                type="text"
                placeholder="e.g., 3×5 Back Squat at 80% 1RM"
                value={assignForm.title}
                onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-gray-900 border border-commander-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-vellera-blue placeholder-gray-600"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-commander-muted text-xs font-bold block mb-1">Instructions</label>
              <textarea
                placeholder="Detailed instructions, cues, or video link…"
                value={assignForm.description}
                onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-900 border border-commander-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-vellera-blue placeholder-gray-600 resize-none"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="text-commander-muted text-xs font-bold block mb-1">Due Date</label>
              <input
                type="date"
                value={assignForm.due_date}
                onChange={e => setAssignForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full bg-gray-900 border border-commander-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-vellera-blue"
              />
            </div>

            <button
              type="submit"
              disabled={assigning}
              className="w-full py-3 rounded-xl bg-vellera-blue text-black font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
            >
              {assigning ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Assign Task
            </button>
          </form>

          {/* Existing tasks list */}
          <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
            <p className="text-white font-bold text-sm mb-3">All Assigned Tasks ({tasks.length})</p>
            {tasks.length === 0 && <p className="text-commander-muted text-sm">No tasks yet.</p>}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm py-2 border-b border-commander-border last:border-0">
                  <div>
                    <p className="text-white font-semibold">{t.title}</p>
                    <p className="text-commander-muted text-xs">{t.student_email} · {t.task_type}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEALTH DATA TAB ── */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <p className="text-white font-black text-sm uppercase tracking-wider">Squad Health Summary</p>

          {/* Aggregated squad stats */}
          {wellnessLogs.length > 0 ? (
            <>
              <SquadHealthSummary logs={wellnessLogs} students={students} />

              {/* Per-student health rows */}
              <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
                <p className="text-white font-bold text-sm mb-3">Individual Readiness</p>
                <div className="space-y-3">
                  {students.map(s => {
                    const w = getStudentWellness(s.user_email);
                    if (!w) return (
                      <div key={s.id} className="flex items-center justify-between text-sm py-1">
                        <p className="text-white">{s.user_name || s.user_email.split('@')[0]}</p>
                        <span className="text-commander-muted text-xs">No data</span>
                      </div>
                    );
                    return (
                      <div key={s.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold">{s.user_name || s.user_email.split('@')[0]}</p>
                            {w.flagged && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                          </div>
                          <div className="flex gap-3 text-xs text-commander-muted">
                            <span className="text-vellera-blue font-bold">{w.avgReadiness}%</span>
                            <span>😴{w.avgSleep}h</span>
                            <span>😊{w.avgMood}</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full">
                          <div
                            className={`h-1.5 rounded-full ${w.avgReadiness >= 70 ? 'bg-vellera-green' : w.avgReadiness >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${w.avgReadiness}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-commander-surface border border-commander-border rounded-xl p-8 text-center space-y-2">
              <Heart className="w-10 h-10 text-commander-muted mx-auto" />
              <p className="text-white font-bold">No Health Data Yet</p>
              <p className="text-commander-muted text-sm">Students need to complete Wellness Check-ins for data to appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Assigned:    'bg-gray-700 text-gray-300',
    'In Progress': 'bg-blue-900/40 text-vellera-blue',
    Submitted:   'bg-yellow-900/40 text-yellow-400',
    Reviewed:    'bg-purple-900/40 text-purple-400',
    Complete:    'bg-vellera-green/20 text-vellera-green',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap ${map[status] || 'bg-gray-700 text-gray-400'}`}>
      {status}
    </span>
  );
}

function SquadHealthSummary({ logs, students }) {
  const recentLogs = logs.slice(-30);
  const avg = (key) => {
    const vals = recentLogs.filter(l => l[key]).map(l => l[key]);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Avg Readiness', value: avg('readiness_score') + (avg('readiness_score') !== '—' ? '%' : ''), color: 'text-vellera-green', icon: Zap },
        { label: 'Avg Sleep', value: avg('sleep_hours') + (avg('sleep_hours') !== '—' ? 'h' : ''), color: 'text-vellera-blue', icon: Activity },
        { label: 'Avg Mood', value: `${avg('mood_score')}/5`, color: 'text-yellow-400', icon: Heart },
      ].map(({ label, value, color, icon: Icon }) => (
        <div key={label} className="bg-commander-surface border border-commander-border rounded-xl p-3 text-center">
          <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
          <p className={`text-xl font-black ${color}`}>{value}</p>
          <p className="text-commander-muted text-xs">{label}</p>
        </div>
      ))}
    </div>
  );
}