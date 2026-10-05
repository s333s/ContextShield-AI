import { useEffect, useState } from 'react';
import { getScoreBand } from '@/analyzers/PrivacyScorer';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function ScoreGauge({ score, label, size = 'md', animate = true }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const band = getScoreBand(score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    const duration = 800;
    const steps = 40;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score, animate]);

  const dimensions = {
    sm: { size: 80, stroke: 6, font: 'text-xl' },
    md: { size: 120, stroke: 8, font: 'text-3xl' },
    lg: { size: 160, stroke: 10, font: 'text-5xl' },
  }[size];

  const radius = dimensions.size / 2 - dimensions.stroke;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
        <svg width={dimensions.size} height={dimensions.size} className="-rotate-90">
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={dimensions.stroke}
          />
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            fill="none"
            stroke={band.color}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${dimensions.font} font-bold`} style={{ color: band.color }}>
            {displayScore}
          </span>
          <span className="text-[10px] text-dark-400 font-medium">/ 100</span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">{label}</span>
      )}
      <span className="text-xs font-semibold" style={{ color: band.color }}>
        {band.label}
      </span>
    </div>
  );
}
