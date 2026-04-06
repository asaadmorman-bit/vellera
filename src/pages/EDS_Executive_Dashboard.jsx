import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, Users, DollarSign, CheckCircle, AlertTriangle, Shield, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  active: 'bg-vellera-green/20 text-vellera-green border border-vellera-green/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  closed: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const HEALTH_STYLES = {
  healthy: 'text-vellera-green',
  at_risk: 'text-yellow-400',
  critical: 'text-red-400',
};

function KPICard({ label, value, sub, icon: Icon, iconColor }) {
  return (
    <div className="bg-commander-surface border border-commander-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-commander-muted text-xs uppercase tracking-widest font-bold">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-commander-dark flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-white text-3xl font-black leading-none">{value}</p>
      {sub && <p className="text-commander-muted text-xs">{sub}</p>}
    </div>
  );
}

function OrgCard({ org }) {
  const healthColor = org.health_score >= 75 ? 'bg-vellera-green' : org.health_score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-commander-surface border border-commander-border rounded-2xl p-5 space-y-4 hover:border-vellera-blue/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-bold">{org.org_name}</p>
          <p className="text-commander-muted text-xs mt-0.5">{org.location || 'No location'}</p>
        </div>
        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg whitespace-nowrap ${STATUS_STYLES[org.status] || STATUS_STYLES.paused}`}>
          {org.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-commander-dark rounded-xl p-3">
          <p className="text-commander-muted text-xs uppercase tracking-wider mb-1">Students</p>
          <p className="text-white text-xl font-black">{org.student_roster_count ?? 0}</p>
        </div>
        <div className="bg-commander-dark rounded-xl p-3">
          <p className="text-commander-muted text-xs uppercase tracking-wider mb-1">Revenue</p>
          <p className="text-white text-xl font-black">${(org.monthly_revenue_usd ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-commander-muted uppercase tracking-wider">Health</span>
          <span className={`font-bold ${org.health_score >= 75 ? 'text-vellera-green' : org.health_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {org.health_score ?? 0}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-commander-dark rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${healthColor}`} style={{ width: `${org.health_score ?? 0}%` }} />
        </div>
      </div>

      {org.primary_instructor_email && (
        <p className="text-commander-muted text-xs truncate">{org.primary_instructor_email}</p>
      )}
    </div>
  );
}

function ActivityRow({ activity }) {
  const statusStyle = {
    approved: 'bg-vellera-green/20 text-vellera-green',
    reviewed: 'bg-vellera-blue/20 text-vellera-blue',
    submitted: 'bg-yellow-500/20 text-yellow-400',
    needs_revision: 'bg-red-500/20 text-red-400',
  }[activity.status] || 'bg-gray-800 text-gray-400';

  return (
    <div className="flex items-center justify-between py-3 border-b border-commander-border last:border-0 gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-semibold truncate">{activity.title || activity.activity_type}</p>
        <p className="text-commander-muted text-xs mt-0.5">{activity.student_id} · {new Date(activity.timestamp).toLocaleString()}</p>
      </div>
      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg shrink-0 ${statusStyle}`}>
        {activity.status}
      </span>
    </div>
  );
}

export default function EDS_Executive_Dashboard() {
  const navigate = useNavigate();
  const [hub, setHub] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (me?.role !== 'admin') { navigate('/'); return; }

      const hubs = await base44.entities.EDS_Enterprise_Hub.list();
      const hubRecord = hubs[0] || null;
      setHub(hubRecord);

      const [orgResults, allActivities] = await Promise.all([
        hubRecord
          ? base44.entities.Operational_Businesses.filter({ parent_company_id: hubRecord.id })
          : Promise.resolve([]),
        base44.entities.Activity_Logs.list('-timestamp', 20),
      ]);

      setOrgs(orgResults);
      setActivities(allActivities);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const runSecurityScan = async () => {
    setScanning(true);
    setScanResult(null);
    const res = await base44.functions.invoke('securityScan', {});
    setScanResult(res.data);
    setScanning(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-commander-dark">
        <Loader2 className="w-8 h-8 animate-spin text-vellera-blue" />
      </div>
    );
  }

  const totalStudents = orgs.reduce((s, o) => s + (o.student_roster_count ?? 0), 0);
  const totalRevenue = orgs.reduce((s, o) => s + (o.monthly_revenue_usd ?? 0), 0);
  const avgHealth = orgs.length
    ? (orgs.reduce((s, o) => s + (o.health_score ?? 0), 0) / orgs.length).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-commander-dark p-4 md:p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-commander-muted hover:text-white transition p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-black tracking-tight">EDS Executive</h1>
            <p className="text-commander-muted text-xs uppercase tracking-widest mt-0.5">
              {hub?.business_name ?? 'Global Management'}
            </p>
          </div>
        </div>
        <button
          onClick={runSecurityScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-commander-surface border border-commander-border hover:border-vellera-blue text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 text-vellera-blue" />}
          {scanning ? 'Scanning...' : 'Security Scan'}
        </button>
      </div>

      {/* Security Scan Result */}
      {scanResult && (
        <div className={`rounded-2xl border p-4 space-y-3 ${scanResult.summary.deploy_safe ? 'bg-vellera-green/10 border-vellera-green/30' : 'bg-red-900/20 border-red-700/50'}`}>
          <div className="flex items-center gap-2">
            {scanResult.summary.deploy_safe
              ? <CheckCircle className="w-5 h-5 text-vellera-green" />
              : <AlertTriangle className="w-5 h-5 text-red-400" />}
            <p className="text-white font-black text-sm">
              {scanResult.summary.deploy_safe ? 'Deploy Safe ✓' : `${scanResult.summary.total_findings} Issue(s) Found`}
            </p>
            <p className="text-commander-muted text-xs ml-auto">{scanResult.summary.passed_checks} checks passed</p>
          </div>
          {scanResult.findings.map((f, i) => (
            <div key={i} className="bg-commander-dark rounded-xl p-3 text-xs space-y-0.5">
              <p className={`font-bold uppercase tracking-wider ${f.severity === 'HIGH' ? 'text-red-400' : f.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-commander-muted'}`}>
                [{f.severity}] {f.entity}
              </p>
              <p className="text-white">{f.issue}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bento KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Students" value={totalStudents} sub={`${orgs.length} org${orgs.length !== 1 ? 's' : ''}`} icon={Users} iconColor="text-vellera-green" />
        <KPICard label="Monthly Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}K`} sub={hub?.revenue_target_usd ? `Target $${(hub.revenue_target_usd / 12000).toFixed(1)}K/mo` : ''} icon={DollarSign} iconColor="text-vellera-blue" />
        <KPICard label="Portfolio Health" value={`${avgHealth}%`} sub="Average across all orgs" icon={TrendingUp} iconColor="text-vellera-green" />
        <KPICard
          label="Status"
          value={hub?.health_status ? hub.health_status.charAt(0).toUpperCase() + hub.health_status.slice(1) : 'Unknown'}
          sub={hub?.last_updated ? `Updated ${new Date(hub.last_updated).toLocaleDateString()}` : 'Never updated'}
          icon={CheckCircle}
          iconColor={HEALTH_STYLES[hub?.health_status] ?? 'text-commander-muted'}
        />
      </div>

      {/* Bento Main Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Org Cards — spans 2 cols */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-white font-black text-lg">Sub-Organizations</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {orgs.map(org => <OrgCard key={org.id} org={org} />)}
            {orgs.length === 0 && (
              <div className="col-span-2 bg-commander-surface border border-commander-border rounded-2xl p-8 text-center">
                <p className="text-commander-muted text-sm">No sub-organizations linked yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed — 1 col */}
        <div className="space-y-3">
          <p className="text-white font-black text-lg">Recent Activity</p>
          <div className="bg-commander-surface border border-commander-border rounded-2xl p-4">
            {activities.length === 0 && (
              <p className="text-commander-muted text-sm text-center py-4">No activity yet.</p>
            )}
            {activities.map(a => <ActivityRow key={a.id} activity={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}