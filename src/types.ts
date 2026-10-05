// ContextShield AI — Core Type Definitions

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type PrivacyCategory =
  | 'direct_identifier'
  | 'location'
  | 'personal_context'
  | 'sensitive_context';

export interface DetectedEntity {
  text: string;
  category: PrivacyCategory;
  severity: Severity;
  reason: string;
  startIndex: number;
  endIndex: number;
  necessary: boolean;
}

export interface PrivacyAnalysis {
  intent: string;
  riskScore: number;
  entities: DetectedEntity[];
  safePrompt: string;
  removedInformation: string[];
  intentPreserved: boolean;
  category: string;
}

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface AIStructuredOutput {
  intent: string;
  risk_score: number;
  entities: Array<{
    text: string;
    category: string;
    severity: Severity;
    reason: string;
  }>;
  safe_prompt: string;
  removed_information: string[];
}

// Provider abstraction — the project can work with an LLM API or run in demo/local mode.

export interface AIProvider {
  name: string;
  isLocal: boolean;
  analyze(prompt: string): Promise<AIStructuredOutput>;
}

export interface PrivacyStats {
  promptsAnalyzed: number;
  sensitiveDetailsDetected: number;
  promptsProtected: number;
  averageExposureReduced: number;
}

export interface DashboardDataPoint {
  label: string;
  value: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  color: string;
}
