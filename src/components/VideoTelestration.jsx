import { useState, useRef, useEffect } from 'react';
import { Download, Edit3, RotateCcw } from 'lucide-react';

export default function VideoTelestration({ videoUrl }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#00E5FF');
  const [lineWidth, setLineWidth] = useState(3);
  const [context, setContext] = useState(null);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    setContext(ctx);

    const video = new Image();
    video.onload = () => {
      canvas.width = video.width;
      canvas.height = video.height;
      ctx.drawImage(video, 0, 0);
      setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    video.src = videoUrl;
  }, [videoUrl]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    if (context) {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (context) context.closePath();
  };

  const reset = () => {
    if (context && imageData) {
      context.putImageData(imageData, 0, 0);
    }
  };

  const downloadAnnotation = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.href = canvasRef.current.toDataURL();
      link.download = 'form_feedback.png';
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-xl overflow-hidden border border-commander-border">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className="w-full cursor-crosshair touch-none"
        />
      </div>

      {/* Drawing Tools */}
      <div className="bg-commander-surface border border-commander-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-vellera-blue" />
          <p className="text-white text-sm font-bold">Annotation Tools</p>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <label className="text-commander-muted text-xs">Pen Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-2">
          <label className="text-commander-muted text-xs">Width:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            className="flex-1"
          />
          <span className="text-commander-muted text-xs">{lineWidth}px</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={reset}
            className="bg-gray-900 border border-gray-800 rounded-lg py-2 text-white text-sm font-bold hover:border-gray-700 transition flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={downloadAnnotation}
            className="bg-vellera-green/20 border border-vellera-green rounded-lg py-2 text-vellera-green text-sm font-bold hover:bg-vellera-green/30 transition flex items-center justify-center gap-1"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}