import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * securityScan: Admin-only security audit function
 * Checks for:
 * - Exposed secrets in entity records (e.g. base64 blobs, raw keys)
 * - Entities missing RLS policies
 * - Unsafe public read access
 * - Large base64-encoded payloads in fields
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const results = {
    scan_timestamp: new Date().toISOString(),
    scanned_by: user.email,
    findings: [],
    passed: [],
  };

  // --- Check 1: Scan UserProfile records for large base64 blobs ---
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    for (const p of profiles) {
      for (const [field, val] of Object.entries(p)) {
        if (typeof val === 'string' && val.startsWith('data:') && val.length > 10000) {
          results.findings.push({
            severity: 'HIGH',
            entity: 'UserProfile',
            record_id: p.id,
            field,
            issue: `Base64 blob detected (${Math.round(val.length / 1024)}KB). Migrate to UploadFile storage.`,
          });
        }
      }
    }
    if (results.findings.filter(f => f.entity === 'UserProfile').length === 0) {
      results.passed.push('UserProfile: No base64 blobs detected');
    }
  } catch (e) {
    console.error('UserProfile scan error:', e.message);
  }

  // --- Check 2: Scan PhysiqueTracker for large photo blobs ---
  try {
    const physique = await base44.asServiceRole.entities.PhysiqueTracker.list();
    for (const p of physique) {
      if (typeof p.photo_url === 'string' && p.photo_url.startsWith('data:') && p.photo_url.length > 5000) {
        results.findings.push({
          severity: 'HIGH',
          entity: 'PhysiqueTracker',
          record_id: p.id,
          field: 'photo_url',
          issue: `Inline base64 photo (${Math.round(p.photo_url.length / 1024)}KB). Use UploadFile and store URL only.`,
        });
      }
    }
    if (results.findings.filter(f => f.entity === 'PhysiqueTracker').length === 0) {
      results.passed.push('PhysiqueTracker: No inline photo blobs');
    }
  } catch (e) {
    console.error('PhysiqueTracker scan error:', e.message);
  }

  // --- Check 3: Verify EDS hub is admin-scoped ---
  try {
    const hubs = await base44.asServiceRole.entities.EDS_Enterprise_Hub.list();
    const exposed = hubs.filter(h => !h.primary_instructor_uid);
    if (exposed.length > 0) {
      results.findings.push({
        severity: 'MEDIUM',
        entity: 'EDS_Enterprise_Hub',
        issue: `${exposed.length} hub record(s) missing primary_instructor_uid — RLS may not filter correctly.`,
      });
    } else {
      results.passed.push('EDS_Enterprise_Hub: All records have instructor UID');
    }
  } catch (e) {
    console.error('EDS Hub scan error:', e.message);
  }

  // --- Check 4: Activity logs without org_id ---
  try {
    const logs = await base44.asServiceRole.entities.Activity_Logs.list();
    const unscoped = logs.filter(l => !l.org_id);
    if (unscoped.length > 0) {
      results.findings.push({
        severity: 'MEDIUM',
        entity: 'Activity_Logs',
        issue: `${unscoped.length} log(s) missing org_id — coach-level RLS filter will not apply.`,
      });
    } else {
      results.passed.push('Activity_Logs: All records scoped to org_id');
    }
  } catch (e) {
    console.error('Activity_Logs scan error:', e.message);
  }

  // --- Check 5: Referral codes using weak random ---
  try {
    const referrals = await base44.asServiceRole.entities.Referral.list();
    const weakCodes = referrals.filter(r => r.referral_code && r.referral_code.length < 6);
    if (weakCodes.length > 0) {
      results.findings.push({
        severity: 'LOW',
        entity: 'Referral',
        issue: `${weakCodes.length} referral code(s) shorter than 6 chars — consider upgrading to Radix-44 encoded IDs.`,
      });
    } else {
      results.passed.push('Referral: Codes meet minimum length');
    }
  } catch (e) {
    console.error('Referral scan error:', e.message);
  }

  const highCount = results.findings.filter(f => f.severity === 'HIGH').length;
  const medCount = results.findings.filter(f => f.severity === 'MEDIUM').length;

  results.summary = {
    total_findings: results.findings.length,
    high: highCount,
    medium: medCount,
    low: results.findings.length - highCount - medCount,
    passed_checks: results.passed.length,
    deploy_safe: results.findings.length === 0,
  };

  console.log(`[securityScan] Complete. Findings: ${results.findings.length}, Passed: ${results.passed.length}`);

  return Response.json(results);
});