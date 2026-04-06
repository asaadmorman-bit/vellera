import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * securityAudit — Admin-only pre-deployment security scan
 * Checks: required secrets, Stripe key type safety, env coverage, advisory notes
 * Invoke via: base44.functions.invoke('securityAudit', {})
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
  }

  const findings = [];
  const passed = [];

  // ── Check 1: Required secrets present ───────────────────────────────────
  const requiredSecrets = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'BASE44_APP_ID'];
  for (const key of requiredSecrets) {
    if (Deno.env.get(key)) {
      passed.push(`Secret '${key}' is set`);
    } else {
      findings.push({
        severity: 'HIGH',
        issue: `Secret '${key}' is NOT set`,
        recommendation: 'Set in Dashboard → Settings → Environment Variables',
      });
    }
  }

  // ── Check 2: Stripe publishable key type safety ──────────────────────────
  const pubKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY') || '';
  if (pubKey.startsWith('sk_')) {
    findings.push({
      severity: 'CRITICAL',
      issue: 'STRIPE_PUBLISHABLE_KEY contains a secret key (sk_...) — dangerous exposure risk',
      recommendation: 'Replace with pk_... publishable key immediately',
    });
  } else if (pubKey) {
    passed.push('STRIPE_PUBLISHABLE_KEY correctly uses pk_ prefix');
  }

  // ── Check 3: Third-party integration secrets coverage ───────────────────
  const integrationSecrets = [
    'OPENAI_API_KEY', 'GEMINI_API_KEY', 'SPOTIFY_API_KEY',
    'WHOOP_CLIENT_SECRET', 'FITBIT_CLIENT_SECRET',
    'STRAVA_CLIENT_SECRET', 'POLAR_CLIENT_SECRET',
  ];
  for (const s of integrationSecrets) {
    if (Deno.env.get(s)) {
      passed.push(`${s} is set via environment (not hardcoded)`);
    }
  }

  // ── Check 4: EDS Hub data integrity ─────────────────────────────────────
  const hubs = await base44.asServiceRole.entities.EDS_Enterprise_Hub.list();
  const unscoped = hubs.filter(h => !h.primary_instructor_uid);
  if (unscoped.length > 0) {
    findings.push({
      severity: 'MEDIUM',
      issue: `${unscoped.length} EDS_Enterprise_Hub record(s) missing primary_instructor_uid — RLS will not filter correctly`,
      recommendation: 'Populate primary_instructor_uid on all hub records',
    });
  } else {
    passed.push(`EDS_Enterprise_Hub: all ${hubs.length} records have primary_instructor_uid`);
  }

  // ── Check 5: Activity logs org scoping ──────────────────────────────────
  const logs = await base44.asServiceRole.entities.Activity_Logs.list();
  const missingOrg = logs.filter(l => !l.org_id);
  if (missingOrg.length > 0) {
    findings.push({
      severity: 'MEDIUM',
      issue: `${missingOrg.length} Activity_Log record(s) missing org_id — coach-level RLS filter bypassed`,
      recommendation: 'Backfill org_id on all Activity_Log records',
    });
  } else {
    passed.push(`Activity_Logs: all ${logs.length} records are org-scoped`);
  }

  // ── Check 6: Auth-guard advisory ────────────────────────────────────────
  findings.push({
    severity: 'ADVISORY',
    issue: 'Manual review: verify all admin backend functions call base44.auth.me() and check user.role === "admin"',
    recommendation: 'Webhook handlers (stripe-webhook, whoopWebhook) intentionally skip user auth — use signature validation instead',
  });

  const summary = {
    total_checks: passed.length + findings.length,
    passed: passed.length,
    findings: findings.length,
    critical: findings.filter(f => f.severity === 'CRITICAL').length,
    high:     findings.filter(f => f.severity === 'HIGH').length,
    medium:   findings.filter(f => f.severity === 'MEDIUM').length,
    advisory: findings.filter(f => f.severity === 'ADVISORY').length,
    deploy_status: findings.some(f => f.severity === 'CRITICAL') ? 'BLOCK'
      : findings.some(f => f.severity === 'HIGH') ? 'REVIEW_REQUIRED'
      : 'PASS',
  };

  console.log('[securityAudit] Result:', summary.deploy_status, '| Findings:', findings.length);

  return Response.json({
    deploy_status: summary.deploy_status,
    summary,
    findings,
    passed,
    scanned_at: new Date().toISOString(),
    scanned_by: user.email,
  });
});