// ContextShield AI — Privacy Scorer
// Calculates a transparent 0–100 Privacy Exposure Score.

import { DetectedEntity, ScoreBand, Severity } from '@/types';
import { SEVERITY_ORDER } from './LocalAnalyzer';

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 30,
  high: 20,
  medium: 12,
  low: 6,
};

export const SCORE_BANDS: ScoreBand[] = [
  { min: 0, max: 20, label: 'Low Exposure', color: '#22c55e' },
  { min: 21, max: 40, label: 'Moderate Exposure', color: '#eab308' },
  { min: 41, max: 60, label: 'Elevated Exposure', color: '#f97316' },
  { min: 61, max: 80, label: 'High Exposure', color: '#ef4444' },
  { min: 81, max: 100, label: 'Critical Exposure', color: '#dc2626' },
];

export function getScoreBand(score: number): ScoreBand {
  return SCORE_BANDS.find((b) => score >= b.min && score <= b.max) ?? SCORE_BANDS[0];
}

export function calculatePrivacyScore(entities: DetectedEntity[]): number {
  if (entities.length === 0) return 0;

  // Base score from entity severities
  let score = 0;
  const unnecessary = entities.filter((e) => !e.necessary);

  for (const e of unnecessary) {
    score += SEVERITY_WEIGHTS[e.severity];
  }

  // Also count necessary entities at a reduced weight — they still represent exposure
  for (const e of entities.filter((e) => e.necessary)) {
    score += SEVERITY_WEIGHTS[e.severity] * 0.3;
  }

  // Identifiability multiplier — direct identifiers are worse
  const identifierCount = entities.filter((e) => e.category === 'direct_identifier').length;
  if (identifierCount > 0) {
    score += identifierCount * 8;
  }

  // Specificity bonus — locations add to score
  const locationCount = entities.filter((e) => e.category === 'location').length;
  score += locationCount * 3;

  // Diminishing returns — cap growth
  if (entities.length > 5) {
    score += (entities.length - 5) * 2;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function groupBySeverity(
  entities: DetectedEntity[],
): Record<Severity, DetectedEntity[]> {
  return {
    critical: entities.filter((e) => e.severity === 'critical'),
    high: entities.filter((e) => e.severity === 'high'),
    medium: entities.filter((e) => e.severity === 'medium'),
    low: entities.filter((e) => e.severity === 'low'),
  };
}
