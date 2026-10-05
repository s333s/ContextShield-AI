import { DetectedEntity, Severity } from '@/types';
import { AlertTriangle, MapPin, User, Heart, Lock } from 'lucide-react';

const CATEGORY_ICONS = {
  direct_identifier: User,
  location: MapPin,
  personal_context: Heart,
  sensitive_context: Lock,
} as const;

const CATEGORY_LABELS = {
  direct_identifier: 'Direct Identifier',
  location: 'Location',
  personal_context: 'Personal Context',
  sensitive_context: 'Sensitive Context',
} as const;

const SEVERITY_BADGE = {
  critical: 'severity-critical',
  high: 'severity-high',
  medium: 'severity-medium',
  low: 'severity-low',
} as const;

interface EntityCardProps {
  entity: DetectedEntity;
  onClick?: () => void;
  highlighted?: boolean;
}

export function EntityCard({ entity, onClick, highlighted }: EntityCardProps) {
  const Icon = CATEGORY_ICONS[entity.category];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
        highlighted
          ? 'bg-dark-700/50 border-shield-500/50 ring-1 ring-shield-500/30'
          : 'bg-dark-800/50 border-dark-700/50 hover:border-dark-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-1.5 rounded-lg border ${SEVERITY_BADGE[entity.severity]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-dark-200 truncate">
              "{entity.text}"
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] text-dark-400 uppercase tracking-wider">
              {CATEGORY_LABELS[entity.category]}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase border ${SEVERITY_BADGE[entity.severity]}`}>
              {entity.severity}
            </span>
            {entity.necessary && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase bg-cyber-500/10 text-cyber-400 border border-cyber-500/30">
                needed
              </span>
            )}
          </div>
          <p className="text-xs text-dark-400 leading-relaxed">
            <AlertTriangle className="w-3 h-3 inline mr-1 text-yellow-500/70" />
            {entity.reason}
          </p>
        </div>
      </div>
    </button>
  );
}

export { CATEGORY_LABELS, SEVERITY_BADGE };
export type SeverityBadge = typeof SEVERITY_BADGE;
export type { Severity };
