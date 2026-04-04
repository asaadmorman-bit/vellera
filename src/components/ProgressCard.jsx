import { useState, useRef } from 'react';
import { Download, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

/**
 * ProgressCard: Generates shareable progress card for Instagram/TikTok
 * Student can download as image or share directly
 */
export default function ProgressCard({ milestone, user }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCard = async () => {
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `vellera-milestone-${milestone.id}.png`;
      link.click();
      toast.success('Progress card downloaded!');
    } catch (err) {
      toast.error('Failed to download: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const shareOnSocial = async (platform) => {
    const text = `🎯 Just unlocked "${milestone.title}" on Vellera! 💪\n\nTraining my way to greatness. Join me: https://vellera.app?ref=YOUR_CODE`;
    const encodedText = encodeURIComponent(text);

    const urls = {
      instagram: `https://instagram.com/`, // User opens app manually
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      tiktok: `https://www.tiktok.com/`, // Opens app
      facebook: `https://www.facebook.com/sharer/sharer.php?u=https://vellera.app`,
    };

    if (platform === 'instagram' || platform === 'tiktok') {
      toast.info(`Open ${platform} app and share your progress card!`);
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Preview */}
      <div
        ref={cardRef}
        className="bg-gradient-to-br from-vellera-green/20 to-vellera-blue/20 border-2 border-vellera-green rounded-2xl p-8 text-center aspect-square flex flex-col items-center justify-center max-w-sm mx-auto"
      >
        <div className="space-y-4">
          {milestone.image_url && (
            <img src={milestone.image_url} alt={milestone.title} className="w-24 h-24 mx-auto" />
          )}
          <div>
            <p className="text-vellera-green text-lg font-black">🏆</p>
            <h3 className="text-white font-black text-2xl mt-2">{milestone.title}</h3>
          </div>
          <p className="text-commander-muted text-sm">{milestone.description}</p>
          <p className="text-vellera-green font-bold text-xs uppercase tracking-widest">
            Achieved on Vellera
          </p>
          <p className="text-white text-xs font-semibold">{new Date(milestone.achievement_date).toLocaleDateString()}</p>
          <div className="pt-4 border-t border-vellera-green/40">
            <p className="text-white text-sm font-bold">vellera.app</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="bg-vellera-blue/20 border border-vellera-blue rounded-lg py-3 text-vellera-blue font-bold text-sm flex items-center justify-center gap-2 hover:bg-vellera-blue/30 transition disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download
        </button>
        <button
          onClick={() => shareOnSocial('twitter')}
          className="bg-vellera-green/20 border border-vellera-green rounded-lg py-3 text-vellera-green font-bold text-sm flex items-center justify-center gap-2 hover:bg-vellera-green/30 transition"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {['instagram', 'twitter', 'tiktok', 'facebook'].map(platform => (
          <button
            key={platform}
            onClick={() => shareOnSocial(platform)}
            className="bg-gray-900 border border-gray-800 rounded-lg py-2 text-white text-xs font-bold hover:border-gray-700 transition capitalize"
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
}