import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const WARRIOR_CREDOS = {
  protector: "Your strength is the shield for Shauntze and your son. Lead by example.",
  provider: "260 is the stone; 225 is the statue. Carve the man in the picture every single rep.",
  wisdom: "A broken protector cannot defend. Respect the Red Recovery; attack the Green.",
};

const LAB_DAYS = ['MON', 'TUE', 'THU'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const notificationType = body.notification_type || 'am'; // 'am' or 'pm'

    const dayOfWeek = new Date().getDay();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = dayNames[dayOfWeek];

    let notification = '';
    let title = '';

    if (notificationType === 'am') {
      // AM notification
      if (LAB_DAYS.includes(today)) {
        title = '🏋️ THE LAB AWAITS (05:00)';
        notification = `Colin Eaton is ready. ${WARRIOR_CREDOS.provider}\n\nFocus: Heavy movement. Form > ego. Report post-session adjustments.`;
      } else {
        title = '⚔️ THE FORGE OPENS (05:00)';
        notification = `${WARRIOR_CREDOS.wisdom}\n\nCheck your Whoop recovery. Green = Attack. Red = Reset.`;
      }
    } else if (notificationType === 'pm') {
      // PM notification based on recovery
      const recoveryScore = body.recovery_score || 50;

      if (recoveryScore > 67) {
        title = '🟢 COMBAT TIME (18:00)';
        notification = `Green recovery detected. ${WARRIOR_CREDOS.protector}\n\nHigh-intensity clearance. Go hard. Controlled aggression.`;
      } else if (recoveryScore >= 34) {
        title = '🟡 TECHNICAL WORK (18:00)';
        notification = `Yellow recovery. Drills and positioning. ${WARRIOR_CREDOS.wisdom}\n\nNo failure sets. Smart training = longevity.`;
      } else {
        title = '🔴 REST NIGHT';
        notification = `Red recovery. Absolute rest. Stretching optional. ${WARRIOR_CREDOS.protector}\n\nRecovery IS the workout tonight.`;
      }
    }

    console.log(`[Warrior Notification] ${user.email} | Type: ${notificationType} | Day: ${today}`);

    return Response.json({
      success: true,
      notification_type: notificationType,
      day: today,
      title: title,
      message: notification,
      credo: WARRIOR_CREDOS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Warrior Notification Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});