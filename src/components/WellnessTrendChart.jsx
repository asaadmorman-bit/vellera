import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CHART_LINES = {
  pain_vas:      { label: 'Pain (VAS)',       color: '#ef4444', inverted: true  },
  mood_score:    { label: 'Mood',             color: '#00E5FF', inverted: false },
  sleep_quality: { label: 'Sleep Quality',    color: '#CCFF00', inverted: false },
  fatigue_score: { label: 'Fatigue',          color: '#f59e0b', inverted: false },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-commander-dark border border-commander-border rounded-xl px-3 py-2 text-xs space-y-1 shadow-xl">
      <p className="text-commander-muted font-bold">{label}</p>
      {payload.map(({ name, value, color }) => (
        <p key={name} style={{ color }}>{CHART_LINES[name]?.label ?? name}: <span className="font-black">{value}</span></p>
      ))}
    </div>
  );
}

/**
 * WellnessTrendChart
 * @param {{ logs: Array, metrics?: string[], days?: number }} props
 */
export default function WellnessTrendChart({ logs = [], metrics = ['pain_vas', 'mood_score', 'sleep_quality'], days = 30 }) {
  const data = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const filtered = logs
      .filter(l => l.log_date && new Date(l.log_date) >= cutoff)
      .sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

    return filtered.map(l => ({
      date: new Date(l.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pain_vas:      l.pain_vas,
      mood_score:    l.mood_score,
      sleep_quality: l.sleep_quality,
      fatigue_score: l.fatigue_score,
    }));
  }, [logs, days]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-commander-muted text-sm">
        No wellness data in the last {days} days
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3 mb-2">
        {metrics.map(m => (
          <div key={m} className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: CHART_LINES[m]?.color }} />
            <span className="text-xs text-commander-muted">{CHART_LINES[m]?.label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#888', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#888', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {metrics.includes('pain_vas') && (
            <ReferenceLine y={7} stroke="#ef444460" strokeDasharray="4 2" label={{ value: 'High Pain', fill: '#ef4444', fontSize: 9 }} />
          )}
          {metrics.map(m => (
            <Line
              key={m}
              type="monotone"
              dataKey={m}
              stroke={CHART_LINES[m]?.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}