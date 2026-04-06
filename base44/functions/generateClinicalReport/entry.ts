import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@4.0.0';

/**
 * generateClinicalReport — Admin/Coach/Patient backend function
 * Generates a clinical PDF report for a given ClinicalAssessment record
 * and stores the URL back on the entity.
 *
 * Payload: { assessment_id: string }
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { assessment_id } = await req.json();
  if (!assessment_id) {
    return Response.json({ error: 'assessment_id is required' }, { status: 400 });
  }

  const records = await base44.entities.ClinicalAssessment.filter({ id: assessment_id });
  const record = records[0];

  if (!record) {
    return Response.json({ error: 'Assessment not found' }, { status: 404 });
  }

  // Access control: patient, their coach (if sharing enabled), or admin
  const isPatient = record.patient_email === user.email;
  const isCoach   = record.coach_email === user.email && record.data_sharing_enabled;
  const isAdmin   = user.role === 'admin';

  if (!isPatient && !isCoach && !isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── Build PDF ──────────────────────────────────────────────────────────────
  const doc = new jsPDF();
  const LINE = 10;
  let y = 20;

  const section = (title) => {
    y += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y);
    y += LINE;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  const row = (label, value) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(`${label}:`, 14, y);
    doc.text(String(value ?? '—'), 80, y);
    y += LINE;
  };

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL ASSESSMENT REPORT', 14, y);
  y += LINE + 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('INFORMATIONAL USE ONLY — NOT A CLINICAL DIAGNOSIS', 14, y);
  doc.setTextColor(0);
  y += LINE * 2;

  // Patient Info
  section('PATIENT INFORMATION');
  row('Patient', record.patient_email);
  row('Clinician/Coach', record.coach_email || '—');
  row('Assessment Date', record.assessment_date);
  row('Assessment Type', record.assessment_type?.toUpperCase());
  row('Status', record.status);

  // Beighton Score
  if (record.beighton_score != null) {
    section('BEIGHTON HYPERMOBILITY SCORE');
    row('Total Score', `${record.beighton_score} / 9`);
    row('Threshold', '≥ 4 indicates generalised joint hypermobility');
    const flag = record.beighton_score >= 4;
    row('Clinical Flag', flag ? '⚠ POSITIVE — Consider further evaluation' : 'Negative');

    if (record.beighton_inputs) {
      const tests = [
        ['Pinky >90° (Left)',      record.beighton_inputs.pinky_left],
        ['Pinky >90° (Right)',     record.beighton_inputs.pinky_right],
        ['Thumb to Forearm (L)',   record.beighton_inputs.thumb_left],
        ['Thumb to Forearm (R)',   record.beighton_inputs.thumb_right],
        ['Elbow Hyperext. (L)',    record.beighton_inputs.elbow_left],
        ['Elbow Hyperext. (R)',    record.beighton_inputs.elbow_right],
        ['Knee Hyperext. (L)',     record.beighton_inputs.knee_left],
        ['Knee Hyperext. (R)',     record.beighton_inputs.knee_right],
        ['Spinal Flexion',         record.beighton_inputs.spinal_flexion],
      ];
      tests.forEach(([label, val]) => row(`  ${label}`, val ? 'Positive (+1)' : 'Negative (0)'));
    }
  }

  // LEFS Score
  if (record.lefs_score != null) {
    section('LOWER EXTREMITY FUNCTIONAL SCALE (LEFS)');
    row('Total Score', `${record.lefs_score} / 80`);
    row('Percentage', `${Math.round((record.lefs_score / 80) * 100)}%`);
    row('Minimal Detectable Change', '9 points');
    const interp = record.lefs_score >= 70 ? 'High function'
      : record.lefs_score >= 50 ? 'Moderate function'
      : record.lefs_score >= 30 ? 'Low function'
      : 'Very low function';
    row('Interpretation', interp);
  }

  // Clinical Notes (only if sharing enabled or admin)
  if ((isPatient || isCoach || isAdmin) && record.clinical_notes) {
    section('CLINICAL NOTES');
    const lines = doc.splitTextToSize(record.clinical_notes, 180);
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += LINE;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated ${new Date().toUTCString()} · Vellera Clinical Module`, 14, 285);

  const pdfBytes = doc.output('arraybuffer');

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=clinical-report-${assessment_id}.pdf`,
    },
  });
});