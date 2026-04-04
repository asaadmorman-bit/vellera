import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrgActivity } from '../hooks/useOrgActivity';
import { AlertCircle, Users, Video, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function InstructorOrgDashboard() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [orgMember, setOrgMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const { pendingReviews, myAssignments, messages, isLoading: activityLoading } = useOrgActivity(org?.id);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);

      // Fetch instructor's org membership
      const members = await base44.entities.OrganizationMember.filter({
        user_email: me.email,
        member_type: 'INSTRUCTOR',
      });

      if (members.length > 0) {
        setOrgMember(members[0]);

        // Fetch organization
        const orgs = await base44.entities.Organization.filter({ id: members[0].org_id });
        if (orgs.length > 0) setOrg(orgs[0]);
      }

      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-4 max-w-lg mx-auto pt-24">
        <BackButton to="/" />
        <div className="bg-commander-surface border border-commander-border rounded-xl p-6 text-center mt-8">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-white font-bold">No Organization</p>
          <p className="text-commander-muted text-sm mt-1">You're not assigned to any organization yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24 safe-area-top">
      <div className="flex items-center gap-2 mb-4">
        <BackButton to="/" />
        <div>
          <h1 className="text-white text-2xl font-black">{org.name}</h1>
          <p className="text-commander-muted text-xs">{orgMember?.certifications?.join(', ') || 'Instructor'}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-commander-muted text-xs uppercase">Pending Reviews</p>
          </div>
          <p className="text-white text-3xl font-black">{pendingReviews.length}</p>
        </div>
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="text-commander-muted text-xs uppercase">Assigned to Me</p>
          </div>
          <p className="text-white text-3xl font-black">{myAssignments.length}</p>
        </div>
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-vellera-blue" />
            <p className="text-commander-muted text-xs uppercase">Members</p>
          </div>
          <p className="text-white text-3xl font-black">{org.member_count}</p>
        </div>
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-vellera-green" />
            <p className="text-commander-muted text-xs uppercase">Messages</p>
          </div>
          <p className="text-white text-3xl font-black">{messages.length}</p>
        </div>
      </div>

      {/* Pending Reviews Feed */}
      {pendingReviews.length > 0 && (
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-4 h-4 text-red-500" />
            <p className="text-white font-bold">Pending Video Reviews</p>
          </div>
          {pendingReviews.map((review) => (
            <Link
              key={review.id}
              to={`/review-task/${review.id}`}
              className="flex items-start justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-red-500 transition"
            >
              <div>
                <p className="text-white text-sm font-bold">{review.title}</p>
                <p className="text-commander-muted text-xs">{review.student_email}</p>
              </div>
              <div className="text-right">
                <span className="text-red-500 text-xs font-bold">REVIEW</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* My Assignments */}
      {myAssignments.length > 0 && (
        <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="text-white font-bold">Assignments for Me</p>
          </div>
          {myAssignments.map((assign) => (
            <div key={assign.id} className="p-3 bg-gray-900 border border-gray-800 rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white text-sm font-bold">{assign.review_type}</p>
                  <p className="text-commander-muted text-xs">From: {assign.assigned_by}</p>
                </div>
                <span className="text-yellow-500 text-xs font-bold">PENDING</span>
              </div>
              {assign.notes && <p className="text-commander-muted text-xs italic">{assign.notes}</p>}
              <div className="flex gap-2 pt-2">
                {assign.shared_notes?.length > 0 && (
                  <span className="text-vellera-blue text-xs bg-vellera-blue/10 px-2 py-1 rounded">
                    {assign.shared_notes.length} notes
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organization Members */}
      <Link to={`/org/${org.id}/members`} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-vellera-blue transition">
        <span className="text-white font-bold flex items-center gap-2">
          <Users className="w-4 h-4" />
          View Organization Members
        </span>
        <span className="text-gray-500">→</span>
      </Link>
    </div>
  );
}