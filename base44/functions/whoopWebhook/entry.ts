import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Verify Whoop signature using Web Crypto API
async function verifyWhoopSignature(body, signature) {
  const whoopSecret = Deno.env.get('WHOOP_CLIENT_SECRET');
  if (!whoopSecret) {
    console.warn('WHOOP_CLIENT_SECRET not set');
    return false;
  }
  
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(whoopSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const computedSig = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(body)
    );
    
    const computedHex = Array.from(new Uint8Array(computedSig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === computedHex;
  } catch (err) {
    console.error('Signature verification error:', err.message);
    return false;
  }
}

// Whoop pushes events here in real-time when new data is available
Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ ok: true }); // verification ping

  try {
    const signature = req.headers.get('x-whoop-signature');
    if (!signature) {
      console.error('[Whoop Webhook] Missing signature');
      return Response.json({ error: 'Missing signature' }, { status: 401 });
    }

    const body = await req.text();
    
    // Verify signature
    const isValid = await verifyWhoopSignature(body, signature);
    if (!isValid) {
      console.error('[Whoop Webhook] Invalid signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { user_id, type } = data;

    if (!user_id || !["recovery.updated", "sleep.updated", "workout.updated"].includes(type)) {
      return Response.json({ ok: true });
    }

    const base44 = createClientFromRequest(req);

    // Find token record by whoop_user_id
    const tokens = await base44.asServiceRole.entities.WhoopToken.filter({ whoop_user_id: String(user_id) });
    if (!tokens.length) return Response.json({ ok: true });

    // Trigger a sync for this user by invoking whoopSync as service role
    // We use the functions invoke to reuse sync logic
    try {
      await base44.asServiceRole.functions.invoke("whoopSync", {});
    } catch (err) {
      console.warn('[Whoop Webhook] Sync invoke failed:', err.message);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[Whoop Webhook Error]', err.message);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
});