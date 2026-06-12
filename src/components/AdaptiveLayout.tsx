import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Dashboard } from './Dashboard'; // The core engine component we added earlier

export const AdaptiveLayout: React.FC = () => {
  const { user, login, logout } = useAuth();

  // If session is empty, present a quick cross-platform profile simulator switcher
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
          <h1 className="text-3xl font-extrabold text-emerald-400 mb-2">Vellera Cross-Platform</h1>
          <p className="text-slate-400 text-sm mb-6">Select your entry deployment profile</p>
          <div className="space-y-3">
            <button onClick={() => login('USER')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl border border-slate-700 transition">
              Log In as Client (Mobile Focus)
            </button>
            <button onClick={() => login('TRAINER')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl transition">
              Log In as Personal Trainer (Desktop Focus)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Universal Top Bar for All Devices */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-xl font-black text-emerald-400 tracking-wide">VELLERA</span>
          <span className="ml-2 text-xs uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
            {user.role} Portal
          </span>
        </div>
        <button onClick={logout} className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition">
          Disconnect Session
        </button>
      </nav>

      {/* Render Perspective Based On User Role Type */}
      <main className="p-4 md:p-8">
        {user.role === 'TRAINER' ? (
          <div className="space-y-6">
            <div className="bg-emerald-950/30 border border-emerald-900/50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-emerald-400">Trainer Control Station (Desktop View Optimized)</h2>
              <p className="text-slate-400 text-xs">Reviewing metrics across {user.assignedClients?.length} active rosters.</p>
            </div>
            
            {/* Split Panel Configuration for Desktop Management */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <h3 className="font-bold mb-2 border-b border-slate-800 pb-2 text-slate-300">Client List</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">● Alex Johnson (Active)</li>
                  <li className="p-2 bg-slate-950 rounded border border-slate-800">● Sarah Jenkins (Idle)</li>
                  <li className="p-2 bg-slate-950 rounded border border-slate-800">● Marcus Vance (Synced)</li>
                </ul>
              </div>
              <div className="md:col-span-2">
                {/* Dynamically loads specific client biometric dashboard matrix directly inside trainer display */}
                <Dashboard />
              </div>
            </div>
          </div>
        ) : (
          /* Mobile optimized clean layout path designed for simple touch targets */
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Welcome Back,</p>
              <h2 className="text-2xl font-bold">{user.name}</h2>
            </div>
            <Dashboard />
          </div>
        )}
      </main>
    </div>
  );
};
