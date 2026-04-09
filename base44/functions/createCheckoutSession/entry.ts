import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Server-side price allowlist — user-supplied priceId is validated against this set
const PRICES = {
  premium:  'price_1THSpOE0ms2VThmPq0FfHc86',
  elite:    'price_1THSpOE0ms2VThmPkLinTRTz',
  founding: 'price_1THSpOE0ms2VThmPjx8L7GaT',
};
const ALLOWED_PRICE_IDS = new Set(Object.values(PRICES));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {
      return Response.json({ error: 'Failed to parse request body' }, { status: 400 });
    }

    const { priceId, planType } = body;

    if (!priceId && !planType) {
      return Response.json({ error: 'Missing priceId or planType' }, { status: 400 });
    }

    // Resolve price and validate against server-side allowlist — rejects arbitrary priceIds
    const selectedPrice = planType ? PRICES[planType] : priceId;
    if (!selectedPrice || !ALLOWED_PRICE_IDS.has(selectedPrice)) {
      console.warn(`[createCheckoutSession] Rejected invalid price: priceId=${priceId} planType=${planType} user=${user.email}`);
      return Response.json({ error: 'Invalid plan type or price' }, { status: 400 });
    }

    const mode = selectedPrice === PRICES.founding ? 'payment' : 'subscription';
    const successUrl = `${new URL(req.url).origin}/?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${new URL(req.url).origin}/paywall`;

    console.log(`[createCheckoutSession] user=${user.email} planType=${planType} mode=${mode}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode,
      line_items: [{ price: selectedPrice, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: { base44_app_id: Deno.env.get('BASE44_APP_ID'), user_email: user.email },
    });

    console.log(`[createCheckoutSession] Session created: ${session.id}`);
    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[createCheckoutSession] error:', error.message);
    return Response.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
});