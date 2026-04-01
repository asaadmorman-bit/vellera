import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const MOTIVATION_MESSAGES = [
  "Hey! We noticed you missed training today. Your squad is counting on you! 💪 The grind waits for no one.",
  "The mat calls. Your squad misses you. Every rep counts toward our challenge victory! 🔥",
  "You've got this! One session today puts you ahead of yesterday's self. Let's go! ⚡",
  "Your squad's leaderboard is heating up. Time to secure your spot! 🏆",
  "Recovery is important, but so is showing up. Your team believes in you. Get to it! 🥋",
  "Don't break the chain! One training day keeps the momentum alive. Let's build this together! 🔗",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { squad_id } = await req.json();

    if (!squad_id) {
      return Response.json({ error: 'Squad ID required' }, { status: 400 });
    }

    // Verify user is a captain of this squad
    const captainCheck = await base44.entities.SquadMembership.filter({
      squad_id: squad_id,
      user_email: user.email,
      role: 'captain'
    });
    
    if (captainCheck.length === 0) {
      return Response.json({ error: 'Only squad captains can send motivation' }, { status: 403 });
    }

    // Get all squad members
    const members = await base44.asServiceRole.entities.SquadMembership.filter({
      squad_id: squad_id
    });

    if (!members.length) {
      return Response.json({ motivated: 0 });
    }

    const today = new Date().toISOString().split('T')[0];
    const motivated = [];

    for (const member of members) {
      // Check if member logged a session today
      const todaySession = await base44.asServiceRole.entities.TrainingSession.filter({
        created_by: member.user_email,
        date: today
      });

      // If no session today, send motivation
      if (!todaySession.length) {
        const message = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
        
        // Log motivation message (in real app, could integrate SMS/email/push)
        await base44.asServiceRole.entities.SquadMotivationLog.create({
          squad_id: squad_id,
          member_email: member.user_email,
          message: message,
          sent_date: new Date().toISOString()
        });

        motivated.push({
          email: member.user_email,
          message: message
        });
      }
    }

    return Response.json({
      success: true,
      squad_id: squad_id,
      motivated: motivated.length,
      messages: motivated
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});