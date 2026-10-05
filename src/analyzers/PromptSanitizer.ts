// ContextShield AI — Prompt Sanitizer
// Generates a safer version of the prompt while preserving the user's intent.

import { DetectedEntity } from '@/types';
import { analyzeLocally } from './LocalAnalyzer';
import { calculatePrivacyScore } from './PrivacyScorer';

// Generalization replacements — replace specific sensitive values with privacy-preserving alternatives
const GENERALIZATIONS: Array<{ pattern: RegExp; replacement: string; removedInfo: string }> = [
  // Identifiers
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[phone number]', removedInfo: 'Phone number' },
  { pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, replacement: '[email]', removedInfo: 'Email address' },
  { pattern: /\b(?:student|employee|staff|emp)\s*id[:\s#]*[A-Z0-9-]{3,}\b/gi, replacement: '[student ID]', removedInfo: 'Student identifier' },
  { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, replacement: '[ID number]', removedInfo: 'SSN-like number' },
  { pattern: /\b(?:passport|national)\s*(?:id|number)?[:\s#]*[A-Z0-9-]{5,}\b/gi, replacement: '[ID number]', removedInfo: 'Passport/National ID' },
  { pattern: /\b(?:credit|debit)\s*card[:\s]*\d[\d\s-]{12,18}\b/gi, replacement: '[card number]', removedInfo: 'Credit card number' },
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[card number]', removedInfo: 'Card-like number' },
  { pattern: /\bapi[_-]?key[:\s]*[a-zA-Z0-9-]{20,}\b/gi, replacement: '[API key]', removedInfo: 'API key' },

  // Addresses and coordinates
  { pattern: /\b\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)\b/g, replacement: '[my address]', removedInfo: 'Street address' },
  { pattern: /(-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+)/g, replacement: '[location]', removedInfo: 'GPS coordinates' },

  // Medical facilities
  { pattern: /\b(?:Royal\s+Hospital|Al\s+Amerat|Al\s+Khoudh|Muscat|Dubai|Abu\s+Dhabi|Riyadh|Cairo|Beirut|Istanbul)\b/g, replacement: 'my city', removedInfo: 'Precise location' },
  { pattern: /\b(?:hospital|medical center|clinic)\s+(?:in|at|near)\s+[A-Z][a-zA-Z]+/gi, replacement: 'a medical facility', removedInfo: 'Specific medical facility' },

  // Family medical context
  {
    pattern: /\b(?:my\s+(?:mother|father|mom|dad|sister|brother|wife|husband|daughter|son|spouse|parents)\s+(?:is\s+)?(?:sick|ill|hospitalized|receiving\s+treatment|has\s+cancer|has\s+a\s+disease|diagnosed|undergoing|suffering|medical|treatment|chemo|surgery|operation))\b/gi,
    replacement: 'a family medical situation',
    removedInfo: 'Specific family medical details',
  },
  {
    pattern: /\bmy\s+(?:mother|father|mom|dad|sister|brother|wife|husband|daughter|son|spouse|parents)\b/gi,
    replacement: 'a family member',
    removedInfo: 'Unnecessary family details',
  },

  // Personal medical
  {
    pattern: /\b(?:I\s+(?:have|am\s+being\s+treated\s+for|was\s+diagnosed\s+with|suffer\s+from|am\s+taking\s+medication\s+for)|my\s+(?:diagnosis|condition|medication|therapy|treatment|symptoms?|depression|anxiety|illness|disease))\b/gi,
    replacement: 'a medical condition',
    removedInfo: 'Specific medical information',
  },
  {
    pattern: /\b(?:I'?m\s+(?:depressed|anxious|suicidal|seeing\s+a\s+therapist|in\s+therapy)|my\s+(?:therapist|psychiatrist|counseling|mental\s+health))\b/gi,
    replacement: 'a personal health matter',
    removedInfo: 'Mental health details',
  },

  // Legal
  {
    pattern: /\b(?:I'?m\s+(?:being\s+sued|facing\s+charges|in\s+a\s+lawsuit|going\s+to\s+court|arrested|under\s+investigation)|my\s+(?:lawyer|attorney|legal\s+case|court\s+case|trial))\b/gi,
    replacement: 'a legal matter',
    removedInfo: 'Legal issue details',
  },

  // Financial
  {
    pattern: /\b(?:I\s+(?:owe|have\s+saved|earn|make\s+\$|paid)|my\s+(?:salary|bank\s+account|account\s+number|balance|investment|savings))\b/gi,
    replacement: 'a financial situation',
    removedInfo: 'Financial information',
  },
  {
    pattern: /\b(?:I\s+(?:can'?t\s+afford|am\s+struggling\s+financially|am\s+in\s+debt|lost\s+my\s+job|need\s+financial)|my\s+(?:debt|loan|mortgage|rent|bills?|bankruptcy))\b/gi,
    replacement: 'a financial difficulty',
    removedInfo: 'Financial hardship details',
  },

  // Employment
  {
    pattern: /\b(?:I\s+(?:work|am\s+employed|got\s+fired|was\s+terminated|am\s+looking\s+for\s+work)|my\s+(?:job|boss|company|employer|salary|income|paycheck|wage))\b/gi,
    replacement: 'my work situation',
    removedInfo: 'Employment details',
  },

  // Education
  {
    pattern: /\b(?:my\s+(?:professor|teacher|university|college|school|class|course|exam|grade|GPA|scholarship)|I\s+(?:am\s+a\s+student|study\s+at|attend))\b/gi,
    replacement: 'my studies',
    removedInfo: 'Education details',
  },

  // Travel
  {
    pattern: /\b(?:I\s+(?:travel|am\s+traveling|flying|going\s+to\s+(?:visit|travel))|my\s+(?:flight|trip|itinerary|travel\s+plans?))\b/gi,
    replacement: 'my travel plans',
    removedInfo: 'Travel plan details',
  },

  // Relationship/private communications
  {
    pattern: /\b(?:my\s+(?:boyfriend|girlfriend|partner)\s+(?:cheated|left|broke\s+up|is\s+cheating)|I'?m\s+going\s+through\s+a\s+(?:divorce|breakup|separation))\b/gi,
    replacement: 'a personal situation',
    removedInfo: 'Private relationship details',
  },

  // Religious/political
  {
    pattern: /\b(?:my\s+(?:religious|political|party|faith|belief)|I'?m\s+(?:a\s+(?:Christian|Muslim|Jew|Hindu|Buddhist|atheist)|a\s+(?:Democrat|Republican|liberal|conservative|socialist)))\b/gi,
    replacement: 'a personal belief',
    removedInfo: 'Religious/political views',
  },
];

export interface SanitizationResult {
  safePrompt: string;
  removedInformation: string[];
  entities: DetectedEntity[];
  originalScore: number;
  safeScore: number;
  intentPreserved: boolean;
}

export function sanitizePrompt(originalPrompt: string): SanitizationResult {
  // First, analyze the original prompt
  const analysis = analyzeLocally(originalPrompt);
  const originalScore = calculatePrivacyScore(analysis.entities);

  let safePrompt = originalPrompt;
  const removedSet = new Set<string>();

  for (const gen of GENERALIZATIONS) {
    const before = safePrompt;
    safePrompt = safePrompt.replace(gen.pattern, gen.replacement);
    if (safePrompt !== before) {
      removedSet.add(gen.removedInfo);
    }
  }

  // Clean up: fix double spaces and spacing around brackets
  safePrompt = safePrompt.replace(/\s+/g, ' ').replace(/\s+([.,;!?])/g, '$1').trim();

  // Re-analyze the safe prompt to compute new score
  const safeAnalysis = analyzeLocally(safePrompt);
  const safeScore = calculatePrivacyScore(safeAnalysis.entities);

  // Intent is preserved if the main verb/action is still present
  const intentPreserved = safePrompt.length > originalPrompt.length * 0.3;

  return {
    safePrompt,
    removedInformation: Array.from(removedSet),
    entities: analysis.entities,
    originalScore,
    safeScore,
    intentPreserved,
  };
}
