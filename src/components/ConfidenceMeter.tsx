import React from 'react';

interface ConfidenceMeterProps {
  label: string;
  confidence: number;
  threshold: number;
}

export function ConfidenceMeter({ label, confidence, threshold }: ConfidenceMeterProps) {
  const percent = Math.min(100, Math.max(0, confidence * 100));
  const isPassing = confidence >= threshold;

  return (
    <div className="flex flex-col gap-1 w-full text-sm">
      <div className="flex justify-between text-zinc-400">
        <span>{label}</span>
        <span className={isPassing ? "text-emerald-400 font-bold" : ""}>{percent.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-300 ${isPassing ? 'bg-emerald-500' : 'bg-primary-500'}`} 
          style={{ width: `${percent}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500/80 z-10"
          style={{ left: `${threshold * 100}%` }}
        />
      </div>
    </div>
  );
}
