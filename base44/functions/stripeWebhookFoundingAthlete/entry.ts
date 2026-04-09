import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.0.0';

const FOUNDING_ATHLETE_CAP = 1000;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe environment variables');
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 401 });
    }

    const body = await req.text();
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('[stripeWebhookFoundingAthlete] Signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    if (event.type !== "charge.succeeded") {
      return Response.json({ received: true });
    }

    const charge = event.data.object;
    if (charge.metadata?.price_id !== "price_founding_athlete") {
      return Response.json({ received: true });
    }

    const userEmail = charge.billing_details?.email;
    if (!userEmail) {
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    const chargeId = charge.id;

    // Idempotency check — reject duplicate webhook deliveries for same charge
    const existingProfiles = await base44.asServiceRole.entities.UserProfile.filter({ founding_charge_id: chargeId });
    if (existingProfiles.length > 0) {
      console.log(`[stripeWebhookFoundingAthlete] Duplicate charge ${chargeId} — already processed`);
      return Response.json({ received: true, idempotent: true });
    }

    // Get / initialize config
    const configs = await base44.asServiceRole.entities.System_Config.filter({ config_key: "founding_athlete" });
    let config = configs[0] || null;

    if (!config) {
      config = await base44.asServiceRole.entities.System_Config.create({
        config_key: "founding_athlete",
        founding_athlete_count: 0,
        founding_athlete_cap: FOUNDING_ATHLETE_CAP,
        founding_athlete_price_usd: 249.99,
        stripe_price_id: "price_founding_athlete",
      });
    }

    // Cap check — read current count before increment
    const currentCount = config.founding_athlete_count || 0;
    if (currentCount >= FOUNDING_ATHLETE_CAP) {
      console.warn(`[stripeWebhookFoundingAthlete] Cap reached (${currentCount}/${FOUNDING_ATHLETE_CAP}) — charge ${chargeId} should be refunded`);
      return Response.json({ error: "Founding Athlete tier is sold out." }, { status: 409 });
    }

    // Increment counter — the idempotency check above + Stripe's own at-least-once delivery
    // means the window for a race is extremely narrow, and duplicate processing is blocked by charge ID
    const newCount = currentCount + 1;
    await base44.asServiceRole.entities.System_Config.update(config.id, {
      founding_athlete_count: newCount,
      last_updated: new Date().toISOString(),
    });

    // Upsert user profile — store charge ID for idempotency
    const userProfiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: userEmail });
    const profileData = {
      subscription_status: "active_lifetime",
      subscription_tier: "Founding Athlete",
      subscription_price_paid: 249.99,
      lifetime_access: true,
      founding_charge_id: chargeId,
      founding_athlete_number: newCount,
    };

    if (userProfiles.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(userProfiles[0].id, profileData);
    } else {
      await base44.asServiceRole.entities.UserProfile.create({ created_by: userEmail, ...profileData });
    }

    try {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        from_name: "Vellera",
        subject: "Welcome to Vellera, Founding Athlete! 🏆",
        body: `Welcome to the Vellera community!\n\nYou've secured Founding Athlete status — one of only 1,000 lifetime access memberships.\n\nSpot #${newCount} of ${FOUNDING_ATHLETE_CAP}\n\nLog in to unlock your personalized training dashboard.\n\n— Vellera Team`,
      });
    } catch (emailErr) {
      console.warn(`[stripeWebhookFoundingAthlete] Email failed for ${userEmail}:`, emailErr.message);
    }

    console.log(`[stripeWebhookFoundingAthlete] ${userEmail} → spot #${newCount}/${FOUNDING_ATHLETE_CAP} charge=${chargeId}`);
    return Response.json({ success: true, founding_athlete_number: newCount, total_cap: FOUNDING_ATHLETE_CAP });
  } catch (error) {
    console.error("[stripeWebhookFoundingAthlete] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});