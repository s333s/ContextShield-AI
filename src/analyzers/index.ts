// ContextShield AI — Analysis Service
// Combines local detection, scoring, and sanitization into a single API.
// Implements the AIProvider abstraction with a local fallback.

import {
  AIProvider,
  AIStructuredOutput,
  DetectedEntity,
  PrivacyAnalysis,
} from '@/types';
import { analyzeLocally, SEVERITY_ORDER } from './LocalAnalyzer';
import { calculatePrivacyScore, groupBySeverity } from './PrivacyScorer';
import { sanitizePrompt } from './PromptSanitizer';

export class LocalAnalyzer implements AIProvider {
  name = 'Local Rule-Based Analyzer';
  isLocal = true;

  async analyze(prompt: string): Promise<AIStructuredOutput> {
    const { entities, intent } = analyzeLocally(prompt);
    const score = calculatePrivacyScore(entities);
    const sanitized = sanitizePrompt(prompt);

    return {
      intent,
      risk_score: score,
      entities: entities.map((e) => ({
        text: e.text,
        category: e.category,
        severity: e.severity,
        reason: e.reason,
      })),
      safe_prompt: sanitized.safePrompt,
      removed_information: sanitized.removedInformation,
    };
  }
}

export function analyzePrompt(prompt: string): PrivacyAnalysis {
  const { entities, intent } = analyzeLocally(prompt);
  const riskScore = calculatePrivacyScore(entities);
  const sanitized = sanitizePrompt(prompt);

  return {
    intent,
    riskScore,
    entities,
    safePrompt: sanitized.safePrompt,
    removedInformation: sanitized.removedInformation,
    intentPreserved: sanitized.intentPreserved,
    category: getDominantCategory(entities),
  };
}

function getDominantCategory(entities: DetectedEntity[]): string {
  if (entities.length === 0) return 'none';
  const grouped = groupBySeverity(entities);
  for (const sev of ['critical', 'high', 'medium', 'low'] as const) {
    if (grouped[sev].length > 0) {
      return grouped[sev][0].category;
    }
  }
  return 'none';
}

export { groupBySeverity, SEVERITY_ORDER };
