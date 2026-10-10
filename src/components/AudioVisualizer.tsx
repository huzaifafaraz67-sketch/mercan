import React from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  volumeLevel?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isListening,
  isSpeaking,
  volumeLevel = 0,
}) => {
  const bars = [0.4, 0.7, 1.0, 0.6, 0.85, 0.5, 0.9, 0.3];

  return (
    <div className="flex items-center justify-center gap-1.5 h-8 px-3">
      {bars.map((weight, i) => {
        let height = 6;
        if (isListening) {
          // Dynamic height according to mic volume
          height = Math.max(6, Math.min(30, (volumeLevel * 36 + 6) * weight));
        } else if (isSpeaking) {
          // Playful oscillation when Mercan is speaking
          height = Math.max(8, 24 * weight);
        }

        return (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ${
              isListening
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : isSpeaking
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                : 'bg-stone-700'
            }`}
            style={{
              height: `${height}px`,
              transition: isListening ? 'height 80ms ease' : 'height 180ms ease',
            }}
          />
        );
      })}
    </div>
  );
};
