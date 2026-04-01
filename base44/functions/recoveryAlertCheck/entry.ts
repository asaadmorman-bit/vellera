import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const INTENSITY_ZONES = [
  { min: 0, max: 33, label: "Rest / Recovery Only", color: "🛑" },
  { min: 34, max: 50, label: "Technique Only", color: "🟡" },
  { min: 51, max: 67, label: "Moderate Training", color: "🟢" },
  { min: 68, max: 84, label: "Full Training Green", color: "⚡" },
  { min: 85, max: 100, label: "Peak Performance Day", color: "🏆" },
];

function getZone(score) {
  return INTENSITY_ZONES.find(z => score >= z.min && score <= z.max) || INTENSITY_ZONES[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const logs = await base44.entities.BiometricLog.filter({ date: today, created_by: user.email });
    
    if (logs.length === 0) {
      return Response.json({ sent: false, reason: 'No biometric data for today' });
    }

    const log = logs[0];
    const recovery = log.recovery_pct;

    // Alert threshold: recovery below 50% (Technique Only or Rest)
    if (recovery === null || recovery >= 50) {
      return Response.json({ sent: false, reason: `Recovery ${recovery}% — above alert threshold` });
    }

    const zone = getZone(recovery);
    const subject = `⚠️ Low Recovery Alert — ${zone.label}`;
    const body = `
Hi ${user.full_name},

Your recovery score for today is **${recovery}%** — this is below the recommended threshold for high-intensity training.

**Current Intensity Zone:** ${zone.color} ${zone.label}

**Recommendation:** 
Consider a rest day or light mobility work instead of hard sparring/heavy lifting. Your CNS needs recovery.

**What to do today:**
- Mobility work only
- Light drilling (no live sparring)
- Film study
- Sleep prioritization

Check your Recovery Hub for more details and restoration protocols.

**Recovery Metrics:**
- Sleep Performance: ${log.sleep_performance || 'N/A'}%
- HRV: ${log.hrv || 'N/A'} ms
- Resting HR: ${log.resting_hr || 'N/A'} bpm
- Body Battery: ${log.body_battery || 'N/A'}

Stay smart. Recover stronger.
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject,
      body,
    });

    // Optionally create a notification record (if you add a Notification entity)
    // await base44.entities.Notification.create({
    //   user_email: user.email,
    //   type: 'recovery_alert',
    //   title: subject,
    //   message: `Recovery at ${recovery}% — ${zone.label}`,
    //   read: false,
    // });

    return Response.json({ 
      sent: true, 
      recovery, 
      zone: zone.label,
      user_email: user.email 
    });
  } catch (error) {
    console.error('Recovery alert check failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});