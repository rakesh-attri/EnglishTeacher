import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  volumeLevel: number;
  isListening: boolean;
  color?: string;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  volumeLevel,
  isListening,
  color = "#4f46e5",
  height = 48,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const barsCount = 32;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barsCount - 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barsCount; i++) {
        // Generate pseudo-waveform based on real volume level and sine wave harmonics
        const time = Date.now() * 0.005;
        const sineMultiplier = Math.sin(time + i * 0.3) * 0.5 + 0.5;
        
        let barHeight = isListening
          ? Math.max(4, (volumeLevel * canvas.height * 0.8 + 4) * sineMultiplier)
          : 3;

        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        ctx.fillStyle = isListening ? color : "#cbd5e1";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [volumeLevel, isListening, color]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        className="w-full max-w-sm rounded-lg"
      />
    </div>
  );
};
