import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ClipboardList, ExternalLink, RefreshCw, Loader2, Users, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MemberOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      await fetchForm();
    };
    init();
  }, []);

  const fetchForm = async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("typeformOnboarding", { action: "get" });
    if (res.data?.error) setError(res.data.error);
    else setFormData(res.data);
    setLoading(false);
  };

  const fetchResponses = async () => {
    setLoadingResponses(true);
    const res = await base44.functions.invoke("typeformOnboarding", { action: "responses" });
    if (res.data?.responses) setResponses(res.data.responses);
    setLoadingResponses(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(formData.formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto pb-24 safe-area-top">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-commander-muted hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-xl font-black">Member Onboarding</h1>
            <p className="text-commander-muted text-xs">Typeform survey for new recruits</p>
          </div>
        </div>
        <button onClick={fetchForm} disabled={loading} className="p-2 bg-commander-surface border border-commander-border rounded-lg hover:border-vellera-blue transition-all">
          <RefreshCw className={`w-4 h-4 text-vellera-blue ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-vellera-blue" />
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      )}

      {formData && !loading && (
        <>
          {/* Survey Link Card */}
          <div className="bg-gradient-to-br from-vellera-blue/10 to-vellera-green/10 border border-vellera-blue/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-vellera-blue/20 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-vellera-blue" />
              </div>
              <div>
                <p className="text-white font-black">Vellera Member Onboarding Survey</p>
                <p className="text-commander-muted text-xs">{formData.totalResponses} response{formData.totalResponses !== 1 ? 's' : ''} received</p>
              </div>
            </div>

            <p className="text-commander-muted text-xs break-all">{formData.formUrl}</p>

            <div className="flex gap-2">
              <button onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 bg-vellera-blue/20 border border-vellera-blue text-vellera-blue rounded-lg py-2.5 text-sm font-bold hover:bg-vellera-blue/30 transition-all">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a href={formData.formUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-vellera-green/20 border border-vellera-green text-vellera-green rounded-lg py-2.5 text-sm font-bold hover:bg-vellera-green/30 transition-all">
                <ExternalLink className="w-4 h-4" />
                Open Survey
              </a>
            </div>
          </div>

          {/* Survey Questions Summary */}
          <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-3">
            <p className="text-white text-xs font-bold uppercase tracking-widest">Survey covers</p>
            <div className="grid grid-cols-2 gap-2">
              {["Full name & email", "Age", "Fitness level", "Disciplines of interest", "Training goals", "Weekly availability", "Injuries / limitations", "Referral source", "Coach notes"].map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-vellera-blue shrink-0" />
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* Responses (admin only) */}
          {isAdmin && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-vellera-green" />
                  <p className="text-white font-bold text-sm">Recruit Responses</p>
                </div>
                <button onClick={fetchResponses} disabled={loadingResponses}
                  className="text-xs text-vellera-blue border border-vellera-blue/40 px-3 py-1.5 rounded-lg hover:bg-vellera-blue/10 transition-all flex items-center gap-1.5">
                  {loadingResponses ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Load Responses
                </button>
              </div>

              {responses.length === 0 && !loadingResponses && (
                <div className="bg-commander-surface border border-commander-border rounded-xl p-6 text-center">
                  <p className="text-commander-muted text-sm">Click "Load Responses" to view submissions.</p>
                </div>
              )}

              {responses.map((r, i) => (
                <div key={i} className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-vellera-blue text-xs font-bold">Response #{i + 1}</p>
                    <p className="text-commander-muted text-xs">{new Date(r.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(r.answers).map(([key, val]) => val ? (
                      <div key={key} className="text-xs border-b border-commander-border pb-1.5 last:border-0">
                        <p className="text-commander-muted mb-0.5 font-medium">Field {key}</p>
                        <p className="text-white">{val}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isAdmin && (
            <div className="bg-commander-surface border border-commander-border rounded-xl p-4 text-center">
              <p className="text-commander-muted text-sm">Share the link above with new recruits to collect their onboarding info.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}