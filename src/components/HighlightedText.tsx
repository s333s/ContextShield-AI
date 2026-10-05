import { DetectedEntity } from '@/types';
import { useMemo } from 'react';

interface HighlightedTextProps {
  text: string;
  entities: DetectedEntity[];
  activeIndex?: number | null;
  onEntityClick?: (index: number) => void;
}

export function HighlightedText({
  text,
  entities,
  activeIndex,
  onEntityClick,
}: HighlightedTextProps) {
  const segments = useMemo(() => {
    if (entities.length === 0) return [{ text, type: 'normal' as const, index: -1 }];

    const sorted = [...entities].sort((a, b) => a.startIndex - b.startIndex);
    const result: Array<{ text: string; type: 'normal' | 'critical' | 'high' | 'medium' | 'low'; index: number }> = [];
    let cursor = 0;

    for (let i = 0; i < sorted.length; i++) {
      const e = sorted[i];
      if (e.startIndex > cursor) {
        result.push({ text: text.slice(cursor, e.startIndex), type: 'normal', index: -1 });
      }
      result.push({ text: text.slice(e.startIndex, e.endIndex), type: e.severity, index: i });
      cursor = e.endIndex;
    }
    if (cursor < text.length) {
      result.push({ text: text.slice(cursor), type: 'normal', index: -1 });
    }
    return result;
  }, [text, entities]);

  const colors = {
    normal: '',
    critical: 'bg-red-500/20 text-red-300 border-b border-red-500/40',
    high: 'bg-orange-500/20 text-orange-300 border-b border-orange-500/40',
    medium: 'bg-yellow-500/20 text-yellow-300 border-b border-yellow-500/40',
    low: 'bg-green-500/20 text-green-300 border-b border-green-500/40',
  };

  return (
    <p className="text-sm text-dark-200 leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.type === 'normal') {
          return <span key={i}>{seg.text}</span>;
        }
        const isActive = activeIndex === seg.index;
        return (
          <span
            key={i}
            onClick={() => onEntityClick?.(seg.index)}
            className={`px-1 py-0.5 rounded cursor-pointer transition-all duration-200 ${colors[seg.type]} ${
              isActive ? 'ring-2 ring-shield-400 ring-offset-1 ring-offset-dark-900 scale-105' : 'hover:brightness-125'
            }`}
          >
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}
