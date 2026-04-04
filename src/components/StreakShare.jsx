import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * StreakShare: Branded workout streak graphic for social sharing
 * Student exports stats as Instagram Story graphic
 */
export default function StreakShare({ streakDays, totalWorkouts, userName }) {
  const graphicRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const exportGraphic = async () => {
    setExporting(true);
    try {
      const canvas = await html2canvas(graphicRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `vellera-streak-${streakDays}-days.png`;
      link.click();
      toast.success('Streak graphic downloaded!');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const shareToStory = () => {
    toast.info('Open Instagram app → Stories → select image from camera roll');
    exportGraphic();
  };

  return (
    <div className="space-y-4">
      {/* Graphic Preview (Instagram Story aspect: 9:16) */}
      <div
        ref={graphicRef}
        className="mx-auto aspect-[9/16] w-72 bg-gradient-to-b from-vellera-green/20 via-vellera-dark to-vellera-blue/20 border-2 border-vellera-green rounded-2xl p-6 flex flex-col justify-between items-center text-center"
      >
        {/* Top Section */}
        <div className="space-y-2 pt-4">
          <p className="text-vellera-green text-sm uppercase tracking-widest font-black">Training Streak</p>
          <p className="text-white text-5xl font-black">{streakDays}</p>
          <p className="text-commander-muted text-lg">DAYS</p>
        </div>

        {/* Middle - Stats */}
        <div className="space-y-4 py-6">
          <div className="bg-vellera-green/20 border border-vellera-green rounded-xl p-4 w-full">
            <p className="text-vellera-green text-xs uppercase tracking-wider font-bold">Workouts</p>
            <p className="text-white text-3xl font-black mt-1">{totalWorkouts}</p>
          </div>
          <div className="bg-vellera-blue/20 border border-vellera-blue rounded-xl p-4 w-full">
            <p className="text-vellera-blue text-xs uppercase tracking-wider font-bold">Discipline</p>
            <p className="text-white text-lg font-black mt-1">Hybrid Athlete</p>
          </div>
        </div>

        {/* Bottom - Branding */}
        <div className="border-t border-vellera-green/40 pt-4 pb-4 space-y-2">
          <p className="text-white font-black text-sm">{userName}</p>
          <p className="text-vellera-green text-xs font-bold uppercase">Tracked on Vellera</p>
          <p className="text-vellera-green text-xs">vellera.app</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
        <button
          onClick={exportGraphic}
          disabled={exporting}
          className="bg-vellera-blue/20 border border-vellera-blue rounded-lg py-3 text-vellera-blue font-bold text-sm flex items-center justify-center gap-2 hover:bg-vellera-blue/30 transition disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Exporting...' : 'Download'}
        </button>
        <button
          onClick={shareToStory}
          disabled={exporting}
          className="bg-vellera-green/20 border border-vellera-green rounded-lg py-3 text-vellera-green font-bold text-sm flex items-center justify-center gap-2 hover:bg-vellera-green/30 transition disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}