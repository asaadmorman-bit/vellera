/**
 * Clinical Scoring Utilities
 * - Beighton Hypermobility Score (0-9)
 * - Lower Extremity Functional Scale (LEFS, 0-80)
 *
 * These are informational tools only — not a substitute for clinical diagnosis.
 */

// ─── Beighton Score ────────────────────────────────────────────────────────────
// 9-point scale: bilateral tests count 1 each side; spinal flexion counts 1.
// Score ≥ 4 = generalised joint hypermobility in adults.

const BEIGHTON_FIELDS = [
  { key: 'pinky_left',     label: 'Little finger passive dorsiflexion >90° (left)' },
  { key: 'pinky_right',    label: 'Little finger passive dorsiflexion >90° (right)' },
  { key: 'thumb_left',     label: 'Thumb passively apposed to forearm (left)' },
  { key: 'thumb_right',    label: 'Thumb passively apposed to forearm (right)' },
  { key: 'elbow_left',     label: 'Elbow hyperextension >10° (left)' },
  { key: 'elbow_right',    label: 'Elbow hyperextension >10° (right)' },
  { key: 'knee_left',      label: 'Knee hyperextension >10° (left)' },
  { key: 'knee_right',     label: 'Knee hyperextension >10° (right)' },
  { key: 'spinal_flexion', label: 'Forward flexion — palms flat on floor, knees straight' },
];

/**
 * Calculate Beighton Score from boolean input map
 * @param {Record<string, boolean>} inputs
 * @returns {{ score: number, max: number, interpretation: string, breakdown: object[] }}
 */
export function calculateBeighton(inputs = {}) {
  const breakdown = BEIGHTON_FIELDS.map(({ key, label }) => ({
    key,
    label,
    positive: Boolean(inputs[key]),
    points: inputs[key] ? 1 : 0,
  }));

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);

  return {
    score,
    max: 9,
    interpretation: score >= 5
      ? 'Hypermobility likely — consider referral for full HSD/hEDS evaluation'
      : score >= 4
      ? 'Borderline hypermobility — monitor with clinical context'
      : 'No significant generalised hypermobility detected',
    breakdown,
  };
}

// ─── LEFS — Lower Extremity Functional Scale ──────────────────────────────────
// 20 activity items, each rated 0 (extreme difficulty) to 4 (no difficulty).
// Max score: 80. MDC (Minimal Detectable Change) = 9 points.

export const LEFS_ITEMS = [
  'Normal work activities',
  'Normal hobbies / recreational activities',
  'Getting into / out of bath',
  'Walking between rooms',
  'Putting on shoes/socks',
  'Squatting',
  'Lifting an object from floor',
  'Performing light activities around home',
  'Performing heavy activities around home',
  'Getting into / out of car',
  'Walking 2 blocks',
  'Walking a mile',
  'Going up / down 10 stairs',
  'Standing for 1 hour',
  'Sitting for 1 hour',
  'Running on even ground',
  'Running on uneven ground',
  'Making sharp turns while running fast',
  'Hopping',
  'Rolling over in bed',
];

export const LEFS_RATING_LABELS = {
  0: 'Extreme difficulty',
  1: 'Quite a bit of difficulty',
  2: 'Moderate difficulty',
  3: 'A little bit of difficulty',
  4: 'No difficulty',
};

/**
 * Calculate LEFS score from array of 20 item responses (each 0-4)
 * @param {number[]} responses - Array of 20 values, each 0–4
 * @returns {{ score: number, max: number, interpretation: string, mdc_met: boolean }}
 */
export function calculateLEFS(responses = []) {
  if (responses.length !== 20) {
    throw new Error(`LEFS requires exactly 20 responses, got ${responses.length}`);
  }

  const score = responses.reduce((sum, val) => {
    const clamped = Math.max(0, Math.min(4, Math.round(val)));
    return sum + clamped;
  }, 0);

  const pct = Math.round((score / 80) * 100);

  return {
    score,
    max: 80,
    percentage: pct,
    mdc: 9,
    interpretation: score >= 70
      ? `High function (${pct}%) — minimal limitations`
      : score >= 50
      ? `Moderate function (${pct}%) — functional limitations present`
      : score >= 30
      ? `Low function (${pct}%) — significant limitations, consider formal PT evaluation`
      : `Very low function (${pct}%) — immediate clinical review recommended`,
  };
}

/**
 * Combined clinical summary for export
 * @param {{ beighton_inputs, lefs_inputs, patient_email, assessment_date }} assessment
 * @returns {{ beighton, lefs, summary }}
 */
export function generateClinicalSummary(assessment) {
  const beighton = calculateBeighton(assessment.beighton_inputs || {});
  const lefs = assessment.lefs_inputs?.length === 20
    ? calculateLEFS(assessment.lefs_inputs)
    : null;

  return {
    beighton,
    lefs,
    summary: {
      patient: assessment.patient_email,
      date: assessment.assessment_date,
      beighton_score: `${beighton.score}/9`,
      lefs_score: lefs ? `${lefs.score}/80` : 'Not completed',
      clinical_flag: beighton.score >= 4 || (lefs && lefs.score < 40),
    },
  };
}