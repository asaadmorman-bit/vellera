import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = null, label = 'Back' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-commander-muted hover:text-white transition-colors touch-target-min"
      title={label}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">{label}</span>
    </button>
  );
}