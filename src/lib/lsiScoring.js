/**
 * Limb Symmetry Index (LSI) Utility
 *
 * Formula: LSI = (injured_score / uninjured_score) × 100
 *
 * Clinical return-to-play thresholds:
 *   LSI ≥ 90% — Cleared for progression
 *   LSI 75–89% — Moderate risk — continue rehab
 *   LSI < 75%  — High risk — do NOT progress
 *
 * Reference: Limb symmetry indices are standard in ACL reconstruction
 * and lower-limb injury return-to-sport protocols.
 */

export const LSI_THRESHOLDS = {
  CLEARED:   { min: 90,  label: 'Cleared for Progression',      color: 'text-vellera-green', bg: 'bg-vellera-green/20 border-vellera-green/40' },
  MODERATE:  { min: 75,  label: 'Moderate Risk — Continue Rehab', color: 'text-yellow-400',   bg: 'bg-yellow-500/20 border-yellow-500/40' },
  HIGH_RISK: { min: 0,   label: 'High Risk — Do Not Progress',   color: 'text-red-400',       bg: 'bg-red-500/20 border-red-500/40' },
};

/**
 * Calculate LSI from two limb scores
 * @param {number} injuredScore  - Test result from injured limb
 * @param {number} uninjuredScore - Test result from uninjured limb
 * @returns {{ lsi: number, percentage: string, risk: string, label: string, color: string, bg: string, rtp_cleared: boolean }}
 */
export function calculateLSI(injuredScore, uninjuredScore) {
  if (!uninjuredScore || uninjuredScore === 0) {
    throw new Error('Uninjured score must be greater than 0');
  }
  if (injuredScore < 0 || uninjuredScore < 0) {
    throw new Error('Scores must be non-negative');
  }

  const lsi = (injuredScore / uninjuredScore) * 100;
  const rounded = Math.round(lsi * 10) / 10;

  let risk, threshold;
  if (rounded >= LSI_THRESHOLDS.CLEARED.min) {
    risk = 'CLEARED';
    threshold = LSI_THRESHOLDS.CLEARED;
  } else if (rounded >= LSI_THRESHOLDS.MODERATE.min) {
    risk = 'MODERATE';
    threshold = LSI_THRESHOLDS.MODERATE;
  } else {
    risk = 'HIGH_RISK';
    threshold = LSI_THRESHOLDS.HIGH_RISK;
  }

  return {
    lsi: rounded,
    percentage: `${rounded}%`,
    risk,
    label: threshold.label,
    color: threshold.color,
    bg: threshold.bg,
    rtp_cleared: risk === 'CLEARED',
  };
}

/**
 * Batch LSI for multiple test types (e.g., quad strength, hop test, single-leg squat)
 * @param {Array<{ name: string, injured: number, uninjured: number }>} tests
 * @returns {{ results: Array, composite_lsi: number, overall_risk: string }}
 */
export function batchLSI(tests = []) {
  const results = tests.map(({ name, injured, uninjured }) => ({
    name,
    ...calculateLSI(injured, uninjured),
  }));

  const compositeLSI = results.reduce((sum, r) => sum + r.lsi, 0) / results.length;
  const rounded = Math.round(compositeLSI * 10) / 10;

  const { risk } = calculateLSI(rounded, 100);

  return {
    results,
    composite_lsi: rounded,
    composite_percentage: `${rounded}%`,
    overall_risk: risk,
    rtp_cleared: risk === 'CLEARED',
  };
}