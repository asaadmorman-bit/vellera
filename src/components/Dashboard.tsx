import React, { useState } from 'react';
import { velleraApi } from '../services/api';
import { useBiometricCalibrator } from '../hooks/useBiometricCalibrator';

export const Dashboard: React.FC = () => {
  const [currentWeight, setCurrentWeight] = useState<number>(180);
  const [targetWeight, setTargetWeight] = useState<number>(170);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const insights = useBiometricCalibrator({ currentWeight, targetWeight, avgHeartRate: heartRate });

  const handleDataSync = async () => {
    try {
      setSyncStatus('Encrypting & Sending FHIR payload...');
      await velleraApi.logBiometrics({
        weight: currentWeight,
        heartRate: heartRate,
        caloriesIn: insights.targetCalories,
        date: new Date().toISOString()
      });
      setSyncStatus('Successfully synced securely with Health Provider! ✅');
    } catch (error) {
      setSyncStatus('Sync failed. Please verify API endpoints.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">Vellera Core Engine</h1>
        <p className="text-slate-400 text-sm">Adaptive Health Metrics & Advanced EHR Telemetry Pipeline</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-slate-200">Biometric Live Matrix</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Current Weight (lbs)</label>
              <input 
                type="number" 
                value={currentWeight} 
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 focus:outline-none focus:border-emerald-500 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Target Goal Weight (lbs)</label>
              <input 
                type="number" 
                value={targetWeight} 
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 focus:outline-none focus:border-emerald-500 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Resting Heart Rate (BPM)</label>
              <input 
                type="number" 
                value={heartRate} 
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 focus:outline-none focus:border-emerald-500 text-white"
              />
            </div>
          </div>
        </div>

        {/* System Recalibrations */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-200">System Adaptations</h2>
            <div className="space-y-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-xs text-slate-500 block font-bold">CALORIC INTAKE THRESHOLD</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">{insights.targetCalories} kcal</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-xs text-slate-500 block font-bold">RECOMMENDED INTENSITY STAGE</span>
                <span className="text-lg font-bold text-sky-400">{insights.intensityLevel} Intensity</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-xs text-slate-500 block font-bold">WORKOUT VARIATION TARGET</span>
                <span className="text-lg font-bold text-purple-400">{insights.focusType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Gateway Sync */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 text-slate-200">Doctor Network Portal</h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Transmit historical biometric changes over a cryptographic connection straight to your primary care clinic's patient registry profile.
            </p>
          </div>
          <div className="mt-4 space-y-4">
            <button 
              onClick={handleDataSync}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 transition duration-200 text-white font-bold rounded-lg shadow-md uppercase text-xs tracking-wider"
            >
              Sync Records with Medical Provider
            </button>
            {syncStatus && (
              <p className="text-xs text-center bg-slate-950 border border-slate-800 p-3 rounded text-slate-300 font-mono">
                {syncStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
