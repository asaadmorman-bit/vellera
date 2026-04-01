import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch biometric logs and training sessions for the month
    const [bioLogs, sessions] = await Promise.all([
      base44.entities.BiometricLog.filter({ date: { "$gte": monthStart, "$lte": monthEnd } }),
      base44.entities.TrainingSession.filter({ date: { "$gte": monthStart, "$lte": monthEnd } }),
    ]);

    // Calculate monthly stats
    const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const avgRecovery = bioLogs.length ? (bioLogs.reduce((sum, l) => sum + (l.recovery_pct || 0), 0) / bioLogs.length).toFixed(1) : 0;
    const avgSleep = bioLogs.length ? (bioLogs.reduce((sum, l) => sum + (l.sleep_performance || 0), 0) / bioLogs.length).toFixed(1) : 0;
    const avgHRV = bioLogs.length ? (bioLogs.reduce((sum, l) => sum + (l.hrv || 0), 0) / bioLogs.length).toFixed(0) : 0;
    const avgRestingHR = bioLogs.length ? (bioLogs.reduce((sum, l) => sum + (l.resting_hr || 0), 0) / bioLogs.length).toFixed(0) : 0;

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const avgIntensity = sessions.length ? (sessions.reduce((sum, s) => sum + (s.intensity_level || 0), 0) / sessions.length).toFixed(1) : 0;
    
    // Count by type
    const sessionsByType = {};
    sessions.forEach(s => {
      const type = s.session_type || 'Other';
      sessionsByType[type] = (sessionsByType[type] || 0) + 1;
    });

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(0, 229, 255); // Vellera blue
    doc.text('PERFORMANCE SUMMARY', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(136, 136, 136); // Muted
    doc.text(`${monthName} | ${user.full_name}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Divider
    doc.setDrawColor(204, 204, 204);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Biometric Summary
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('BIOMETRIC OVERVIEW', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    const bioData = [
      ['Metric', 'Average', 'Entries'],
      ['Recovery %', `${avgRecovery}%`, bioLogs.length],
      ['Sleep Performance', `${avgSleep}%`, bioLogs.length],
      ['HRV (ms)', avgHRV, bioLogs.length],
      ['Resting HR (bpm)', avgRestingHR, bioLogs.length],
    ];

    let bioY = y;
    bioData.forEach((row, idx) => {
      if (idx === 0) {
        doc.setTextColor(100, 200, 255);
        doc.setFont(undefined, 'bold');
      } else {
        doc.setTextColor(200, 200, 200);
        doc.setFont(undefined, 'normal');
      }
      doc.text(row[0], 25, bioY);
      doc.text(String(row[1]), 100, bioY);
      doc.text(String(row[2]), 150, bioY);
      bioY += 7;
    });

    y = bioY + 8;

    // Training Summary
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('TRAINING SUMMARY', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Total Sessions: ${totalSessions}`, 25, y);
    y += 6;
    doc.text(`Total Minutes: ${totalMinutes}`, 25, y);
    y += 6;
    doc.text(`Average Intensity: ${avgIntensity}/10`, 25, y);
    y += 10;

    // Sessions by Type
    doc.setTextColor(100, 200, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Sessions by Type:', 25, y);
    y += 6;

    doc.setTextColor(200, 200, 200);
    doc.setFont(undefined, 'normal');
    Object.entries(sessionsByType).forEach(([type, count]) => {
      doc.text(`• ${type}: ${count}`, 30, y);
      y += 6;
    });

    y += 8;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Performance_Summary_${monthName.replace(/\s+/g, '_')}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});