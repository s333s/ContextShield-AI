import { ScoreGauge } from './ScoreGauge';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface BeforeAfterProps {
  originalPrompt: string;
  safePrompt: string;
  originalScore: number;
  safeScore: number;
  removedInformation: string[];
  intentPreserved: boolean;
}

export function BeforeAfter({
  originalPrompt,
  safePrompt,
  originalScore,
  safeScore,
  removedInformation,
  intentPreserved,
}: BeforeAfterProps) {
  const reduction = originalScore - safeScore;

  return (
    <div className="animate-slide-up">
      {/* Reduction Banner */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="glass-card px-6 py-3 flex items-center gap-3">
          <span className="text-2xl font-bold text-red-400">{originalScore}</span>
          <ArrowRight className="w-6 h-6 text-shield-500" />
          <span className="text-2xl font-bold text-shield-400">{safeScore}</span>
          <div className="ml-2 px-3 py-1 rounded-full bg-shield-500/15 border border-shield-500/30">
            <span className="text-sm font-semibold text-shield-400">
              ↓ {reduction} point reduction
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* BEFORE */}
        <div className="glass-card p-5 border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Before</h3>
              <p className="text-xs text-dark-400 mt-0.5">Original prompt</p>
            </div>
            <ScoreGauge score={originalScore} size="sm" animate={false} />
          </div>
          <div className="bg-dark-950/50 rounded-xl p-4 border border-dark-800">
            <p className="text-sm text-dark-300 leading-relaxed italic">
              "{originalPrompt.length > 200 ? originalPrompt.slice(0, 200) + '...' : originalPrompt}"
            </p>
          </div>
        </div>

        {/* AFTER */}
        <div className="glass-card p-5 border-shield-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-shield-400 uppercase tracking-wider">After</h3>
              <p className="text-xs text-dark-400 mt-0.5">Protected prompt</p>
            </div>
            <ScoreGauge score={safeScore} size="sm" animate={false} />
          </div>
          <div className="bg-dark-950/50 rounded-xl p-4 border border-dark-800">
            <p className="text-sm text-dark-100 leading-relaxed italic">
              "{safePrompt}"
            </p>
          </div>
        </div>
      </div>

      {/* Removed information */}
      {removedInformation.length > 0 && (
        <div className="mt-4 glass-card p-4">
          <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
            Information removed or generalized
          </h4>
          <div className="flex flex-wrap gap-2">
            {removedInformation.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-shield-500/10 border border-shield-500/20 animate-slide-down"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Check className="w-3.5 h-3.5 text-shield-400" />
                <span className="text-xs text-dark-200">{item}</span>
              </div>
            ))}
          </div>
          {intentPreserved && (
            <div className="mt-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-shield-400" />
              <span className="text-xs font-semibold text-shield-400">
                Intent preserved: YES
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
