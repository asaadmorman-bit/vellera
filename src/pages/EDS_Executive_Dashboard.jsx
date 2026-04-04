import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EDS_Executive_Dashboard() {
  const navigate = useNavigate();
  const [hub, setHub] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);

      if (me?.role !== 'admin') {
        navigate('/');
        return;
      }

      // Fetch EDS hub
      const hubs = await base44.entities.EDS_Enterprise_Hub.filter({
        $or: [
          { primary_instructor_uid: me.email },
          { secondary_instructor_uid: me.email },
        ]
      });
      if (hubs.length > 0) setHub(hubs[0]);

      // Fetch all sub-organizations
      const orgResults = await base44.entities.Operational_Businesses.filter({
        parent_company_id: hubs[0]?.id
      });
      setOrgs(orgResults);

      // Fetch recent activities across all orgs
      const allActivities = await base44.entities.Activity_Logs.list('-timestamp', 50);
      setActivities(allActivities.slice(0, 20));

      setLoading(false);
    };
    init();
  }, [navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-commander-dark">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4 text-center text-white">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  // Calculate aggregates
  const totalStudents = orgs.reduce((sum, org) => sum + (org.student_roster_count || 0), 0);
  const totalRevenue = orgs.reduce((sum, org) => sum + (org.monthly_revenue_usd || 0), 0);
  const avgHealthScore = orgs.length > 0 
    ? (orgs.reduce((sum, org) => sum + (org.health_score || 0), 0) / orgs.length).toFixed(1)
    : 0;

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto pb-24 safe-area-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="text-commander-muted hover:text-white p-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white text-3xl font-black tracking-tight">EDS Executive Dashboard</h1>
          <p className="text-commander-muted text-xs uppercase tracking-wider mt-1">
            Global Business Management for {hub?.business_name}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-commander-muted text-xs uppercase tracking-wider font-bold">Total Students</p>
            <Users className="w-4 h-4 text-vellera-green" />
          </div>
          <p className="text-white text-3xl font-black">{totalStudents}</p>
          <p className="text-commander-muted text-xs">Across {orgs.length} organization{orgs.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-commander-muted text-xs uppercase tracking-wider font-bold">Monthly Revenue</p>
            <DollarSign className="w-4 h-4 text-vellera-blue" />
          </div>
          <p className="text-white text-3xl font-black">${(totalRevenue / 1000).toFixed(1)}K</p>
          <p className="text-commander-muted text-xs">Target: ${(hub?.revenue_target_usd / 12000).toFixed(1)}K/mo</p>
        </div>

        {/* Avg Health Score */}
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-commander-muted text-xs uppercase tracking-wider font-bold">Health Score</p>
            <TrendingUp className="w-4 h-4 text-vellera-green" />
          </div>
          <p className="text-white text-3xl font-black">{avgHealthScore}%</p>
          <p className="text-commander-muted text-xs">Portfolio average</p>
        </div>

        {/* Status */}
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-commander-muted text-xs uppercase tracking-wider font-bold">Portfolio Status</p>
            <CheckCircle className={`w-4 h-4 ${hub?.health_status === 'healthy' ? 'text-vellera-green' : hub?.health_status === 'at_risk' ? 'text-yellow-400' : 'text-red-400'}`} />
          </div>
          <p className="text-white text-xl font-black capitalize">{hub?.health_status}</p>
          <p className="text-commander-muted text-xs">Last update: {hub?.last_updated ? new Date(hub.last_updated).toLocaleDateString() : 'Never'}</p>
        </div>
      </div>

      {/* Sub-Organizations Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-black">Sub-Organizations</h2>
          <p className="text-commander-muted text-xs uppercase tracking-wider font-bold">{orgs.length} Active</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-commander-border">
                <th className="px-4 py-3 text-commander-muted text-xs uppercase tracking-wider font-bold">Organization</th>
                <th className="px-4 py-3 text-commander-muted text-xs uppercase tracking-wider font-bold">Location</th>
                <th className="px-4 py-3 text-commander-muted text-xs uppercase tracking-wider font-bold">Students</th>
                <th className="px-4 py-3 text-commander-muted text-xs uppercase tracking-wider font-bold">Revenue</th>
                <th className="px-4 py-3 text-commander-muted text-xs uppercase tracking-wider font-bold">Health</th>
                <th className="px-4 py-3 text-commander-muted text-xs uppercase tracking-wider font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-commander-border">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-commander-surface/50 transition">
                  <td className="px-4 py-3">
                    <p className="text-white font-bold">{org.org_name}</p>
                    <p className="text-commander-muted text-xs">{org.primary_instructor_email}</p>
                  </td>
                  <td className="px-4 py-3 text-commander-muted">{org.location || '—'}</td>
                  <td className="px-4 py-3 text-white font-bold">{org.student_roster_count}</td>
                  <td className="px-4 py-3 text-white font-bold">${org.monthly_revenue_usd?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-3">
                    <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${org.health_score >= 75 ? 'bg-vellera-green' : org.health_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${org.health_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-commander-muted mt-1">{org.health_score}%</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs uppercase font-bold px-2 py-1 rounded-lg ${
                      org.status === 'active' ? 'bg-vellera-green/20 text-vellera-green' :
                      org.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orgs.length === 0 && (
          <div className="bg-commander-surface border border-commander-border rounded-xl p-8 text-center">
            <p className="text-commander-muted">No sub-organizations linked yet.</p>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-3">
        <h2 className="text-white text-xl font-black">Recent Activity</h2>
        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-commander-surface border border-commander-border rounded-lg p-4 flex items-start justify-between hover:border-vellera-blue transition">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{activity.title}</p>
                  <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${
                    activity.status === 'approved' ? 'bg-vellera-green/20 text-vellera-green' :
                    activity.status === 'reviewed' ? 'bg-vellera-blue/20 text-vellera-blue' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-commander-muted text-xs">{activity.student_id} • {activity.activity_type}</p>
                <p className="text-commander-muted text-xs">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
              {activity.performance_score && (
                <div className="text-right">
                  <p className="text-white text-sm font-bold">{activity.performance_score}%</p>
                  <p className="text-commander-muted text-xs">Performance</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}