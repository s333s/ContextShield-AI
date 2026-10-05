// ContextShield AI — Local Privacy Analyzer
// Lightweight regex + heuristic detection that runs entirely in the browser.
// This is the "local-first" layer that runs before any AI analysis.

import {
  DetectedEntity,
  PrivacyCategory,
  Severity,
} from '@/types';

interface PatternDef {
  regex: RegExp;
  category: PrivacyCategory;
  severity: Severity;
  reason: string;
  label: string;
}

const PATTERNS: PatternDef[] = [
  // --- Direct Identifiers ---
  {
    regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    category: 'direct_identifier',
    severity: 'critical',
    reason: 'Phone numbers can directly identify you and enable contact or harassment.',
    label: 'Phone number',
  },
  {
    regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    category: 'direct_identifier',
    severity: 'high',
    reason: 'Email addresses are direct identifiers linked to your identity.',
    label: 'Email address',
  },
  {
    regex: /\b(?:student|employee|staff|emp)\s*id[:\s#]*[A-Z0-9-]{3,}\b/gi,
    category: 'direct_identifier',
    severity: 'critical',
    reason: 'Institutional IDs can be used to directly identify and track you within an organization.',
    label: 'Student/Employee ID',
  },
  {
    regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    category: 'direct_identifier',
    severity: 'critical',
    reason: 'This looks like a US Social Security Number — one of the most sensitive identifiers.',
    label: 'SSN-like number',
  },
  {
    regex: /\b(?:passport|national)\s*(?:id|number)?[:\s#]*[A-Z0-9-]{5,}\b/gi,
    category: 'direct_identifier',
    severity: 'critical',
    reason: 'Government ID numbers are highly sensitive and can enable identity theft.',
    label: 'Passport/National ID',
  },
  {
    regex: /\b(?:credit|debit)\s*card[:\s]*\d[\d\s-]{12,18}\b/gi,
    category: 'direct_identifier',
    severity: 'critical',
    reason: 'Credit/debit card numbers are financial identifiers that must never be shared.',
    label: 'Credit card number',
  },
  {
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    category: 'direct_identifier',
    severity: 'critical',
    reason: 'This looks like a 16-digit card number — a direct financial identifier.',
    label: 'Card-like number',
  },
  {
    regex: /\bapi[_-]?key[:\s]*[a-zA-Z0-9-]{20,}\b/gi,
    category: 'direct_identifier',
    severity: 'critical',
    reason: 'API keys are credentials that grant access to services and must never be shared.',
    label: 'API key',
  },

  // --- Location ---
  {
    regex: /\b\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)\b/g,
    category: 'location',
    severity: 'high',
    reason: 'A specific street address can pinpoint your physical location.',
    label: 'Street address',
  },
  {
    regex: /(-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+)/g,
    category: 'location',
    severity: 'high',
    reason: 'GPS coordinates reveal your exact physical location.',
    label: 'GPS coordinates',
  },
  {
    regex: /\b(?:hospital|medical center|clinic)\s+(?:in|at|near)\s+[A-Z][a-zA-Z]+/gi,
    category: 'location',
    severity: 'high',
    reason: 'Naming a specific medical facility reveals location and potentially health context.',
    label: 'Specific medical facility',
  },
  {
    regex: /\b(?:Royal\s+Hospital|Al\s+Amerat|Al\s+Khoudh|Muscat|Dubai|Abu\s+Dhabi|Riyadh|Cairo|Beirut|Istanbul)\b/g,
    category: 'location',
    severity: 'medium',
    reason: 'Specific city or neighborhood names narrow down your geographic identity.',
    label: 'Specific location',
  },

  // --- Personal Context (heuristic keyword-based) ---
  {
    regex: /\b(?:my\s+(?:mother|father|mom|dad|sister|brother|wife|husband|daughter|son|spouse|parents|family|aunt|uncle|grandmother|grandfather|cousin))\b/gi,
    category: 'personal_context',
    severity: 'medium',
    reason: 'Family relationship details can be exploited for social engineering or profiling.',
    label: 'Family information',
  },
  {
    regex: /\b(?:I\s+(?:work|am\s+employed|got\s+fired|was\s+terminated|am\s+looking\s+for\s+work)|my\s+(?:job|boss|company|employer|salary|income|paycheck|wage))\b/gi,
    category: 'personal_context',
    severity: 'medium',
    reason: 'Employment details reveal your professional identity and financial situation.',
    label: 'Employment information',
  },
  {
    regex: /\b(?:my\s+(?:professor|teacher|university|college|school|class|course|exam|grade|GPA|scholarship)|I\s+(?:am\s+a\s+student|study\s+at|attend))\b/gi,
    category: 'personal_context',
    severity: 'medium',
    reason: 'Education details can identify your institution and academic record.',
    label: 'Education information',
  },
  {
    regex: /\b(?:I\s+(?:can'?t\s+afford|am\s+struggling\s+financially|am\s+in\s+debt|lost\s+my\s+job|need\s+financial)|my\s+(?:debt|loan|mortgage|rent|bills?|bankruptcy))\b/gi,
    category: 'personal_context',
    severity: 'high',
    reason: 'Financial hardship details are sensitive and can be used to profile or target you.',
    label: 'Financial hardship',
  },
  {
    regex: /\b(?:I\s+(?:travel|am\s+traveling|flying|going\s+to\s+(?:visit|travel))|my\s+(?:flight|trip|itinerary|travel\s+plans?))\b/gi,
    category: 'personal_context',
    severity: 'low',
    reason: 'Travel plans reveal your movements and potentially when your home is unoccupied.',
    label: 'Travel plans',
  },
  {
    regex: /\b(?:my\s+(?:daily\s+routine|schedule|commute|I\s+(?:usually|always|every\s+day)\s+(?:go|leave|arrive|return)))\b/gi,
    category: 'personal_context',
    severity: 'low',
    reason: 'Daily routine details can be used to predict your movements and patterns.',
    label: 'Daily routine',
  },

  // --- Sensitive Context ---
  {
    regex: /\b(?:my\s+(?:mother|father|mom|dad|sister|brother|wife|husband|daughter|son|spouse|parents)\s+(?:is\s+)?(?:sick|ill|hospitalized|receiving\s+treatment|has\s+cancer|has\s+a\s+disease|diagnosed|undergoing|suffering|medical|treatment|chemo|surgery|operation))\b/gi,
    category: 'sensitive_context',
    severity: 'high',
    reason: 'Medical information about family members is highly sensitive health context.',
    label: 'Medical/family health information',
  },
  {
    regex: /\b(?:I\s+(?:have|am\s+being\s+treated\s+for|was\s+diagnosed\s+with|suffer\s+from|am\s+taking\s+medication\s+for)|my\s+(?:diagnosis|condition|medication|therapy|treatment|symptoms?|depression|anxiety|illness|disease))\b/gi,
    category: 'sensitive_context',
    severity: 'high',
    reason: 'Personal medical information is among the most sensitive categories of personal data.',
    label: 'Medical information',
  },
  {
    regex: /\b(?:I'?m\s+(?:depressed|anxious|suicidal|seeing\s+a\s+therapist|in\s+therapy)|my\s+(?:therapist|psychiatrist|counseling|mental\s+health))\b/gi,
    category: 'sensitive_context',
    severity: 'high',
    reason: 'Mental health information is deeply sensitive and can lead to discrimination.',
    label: 'Mental health context',
  },
  {
    regex: /\b(?:I'?m\s+(?:being\s+sued|facing\s+charges|in\s+a\s+lawsuit|going\s+to\s+court|arrested|under\s+investigation)|my\s+(?:lawyer|attorney|legal\s+case|court\s+case|trial))\b/gi,
    category: 'sensitive_context',
    severity: 'high',
    reason: 'Legal information can affect employment, housing, and reputation.',
    label: 'Legal issues',
  },
  {
    regex: /\b(?:I\s+(?:owe|have\s+(?:saved|in\s+(?:my\s+)?(?:bank|account))|earn|make\s+\$|paid)|my\s+(?:salary|bank\s+account|account\s+number|balance|investment|savings|\$))\b/gi,
    category: 'sensitive_context',
    severity: 'high',
    reason: 'Financial information can be exploited for fraud, profiling, or targeted manipulation.',
    label: 'Financial information',
  },
  {
    regex: /\b(?:my\s+(?:religious|political|party|faith|belief)|I'?m\s+(?:a\s+(?:Christian|Muslim|Jew|Hindu|Buddhist|atheist)|a\s+(?:Democrat|Republican|liberal|conservative|socialist)))\b/gi,
    category: 'sensitive_context',
    severity: 'medium',
    reason: 'Religious and political views are sensitive personal beliefs that can cause bias.',
    label: 'Religious/political context',
  },
  {
    regex: /\b(?:my\s+(?:boyfriend|girlfriend|partner)\s+(?:cheated|left|broke\s+up|is\s+cheating)|I'?m\s+going\s+through\s+a\s+(?:divorce|breakup|separation))\b/gi,
    category: 'sensitive_context',
    severity: 'medium',
    reason: 'Private relationship details are personal and can be used to manipulate or embarrass.',
    label: 'Private communications',
  },
];

// Keywords that hint at the user's intent — used to determine if detected info is "necessary"
const INTENT_VERBS = [
  'write', 'draft', 'compose', 'create', 'generate', 'summarize', 'translate',
  'explain', 'describe', 'help', 'format', 'proofread', 'edit', 'review',
  'plan', 'organize', 'prepare', 'suggest', 'improve', 'rewrite',
];

const NECESSARY_CONTEXT_HINTS: Record<PrivacyCategory, string[]> = {
  direct_identifier: [], // identifiers are almost never necessary
  location: ['directions', 'nearby', 'local', 'restaurant', 'hotel', 'weather'],
  personal_context: ['email', 'letter', 'message', 'apology', 'explanation', 'request'],
  sensitive_context: ['medical', 'diagnosis', 'symptom', 'appointment', 'prescription'],
};

export interface AnalysisResult {
  entities: DetectedEntity[];
  intent: string;
}

function detectIntent(prompt: string): string {
  const lower = prompt.toLowerCase();
  const verb = INTENT_VERBS.find((v) => lower.includes(v));
  if (verb) {
    // Extract a short intent phrase — up to the first sentence boundary after the verb
    const idx = lower.indexOf(verb);
    const rest = prompt.slice(idx);
    const end = rest.search(/[.!?\n]/);
    const phrase = end === -1 ? rest : rest.slice(0, end);
    return phrase.length > 120 ? phrase.slice(0, 117) + '...' : phrase;
  }
  // Fallback: first 100 chars of the prompt
  return prompt.length > 120 ? prompt.slice(0, 117) + '...' : prompt;
}

function isNecessary(
  entityText: string,
  category: PrivacyCategory,
  prompt: string,
  intent: string,
): boolean {
  const lower = (intent + ' ' + prompt).toLowerCase();
  const hints = NECESSARY_CONTEXT_HINTS[category];
  return hints.some((h) => lower.includes(h));
}

export function analyzeLocally(prompt: string): AnalysisResult {
  const entities: DetectedEntity[] = [];
  const intent = detectIntent(prompt);

  for (const def of PATTERNS) {
    def.regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = def.regex.exec(prompt)) !== null) {
      const text = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + text.length;

      // De-duplicate overlapping matches — keep the more severe one
      const overlaps = entities.some(
        (e) =>
          startIndex < e.endIndex &&
          endIndex > e.startIndex &&
          !(startIndex >= e.endIndex || endIndex <= e.startIndex),
      );
      if (overlaps) continue;

      entities.push({
        text,
        category: def.category,
        severity: def.severity,
        reason: def.reason,
        startIndex,
        endIndex,
        necessary: isNecessary(text, def.category, prompt, intent),
      });
    }
  }

  entities.sort((a, b) => a.startIndex - b.startIndex);
  return { entities, intent };
}

// Severity ordering helper
export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
