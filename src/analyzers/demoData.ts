// ContextShield AI — Sample Prompts for Demo Mode

export interface SamplePrompt {
  id: string;
  title: string;
  scenario: string;
  prompt: string;
  expectedScore: number;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: 'student-extension',
    title: 'Student Extension Request',
    scenario: 'A student emails a professor',
    prompt:
      'Write an email to my professor explaining why I missed class because my mother is receiving medical treatment at Royal Hospital in Muscat. I live in Al Khoudh and my student ID is 123456.',
    expectedScore: 91,
  },
  {
    id: 'job-application',
    title: 'Job Application Cover Letter',
    scenario: 'Someone writing a cover letter',
    prompt:
      'Write a cover letter for a software engineering position. I was fired from my last job at TechCorp because of a disagreement with my boss. My phone number is 555-123-4567 and my email is john.smith@gmail.com. I earn $45,000 and need at least $60,000.',
    expectedScore: 87,
  },
  {
    id: 'medical-appointment',
    title: 'Medical Appointment Email',
    scenario: 'A patient writes to a clinic',
    prompt:
      'Help me write a message to my therapist asking to reschedule my appointment. I have been feeling very anxious and depressed lately and my medication needs adjustment. My address is 123 Oak Street.',
    expectedScore: 84,
  },
  {
    id: 'financial-assistance',
    title: 'Financial Assistance Request',
    scenario: 'Someone requesting financial help',
    prompt:
      'Write a letter to the bank requesting a loan deferral. I am struggling financially after losing my job. My bank account number is 9876543210 and my national ID is AB1234567. I owe $15,000 in debt.',
    expectedScore: 95,
  },
  {
    id: 'travel-planning',
    title: 'Travel Itinerary Planning',
    scenario: 'Someone planning a trip',
    prompt:
      'Plan a 7-day trip to Dubai for me and my wife. We are flying from Muscat on October 15. My passport number is X1234567. I want to visit the Burj Khalifa and stay at a hotel near Dubai Mall.',
    expectedScore: 78,
  },
];

// Deterministic demo dashboard data — stored locally, never uploaded
export const DEMO_STATS = {
  promptsAnalyzed: 27,
  sensitiveDetailsDetected: 14,
  promptsProtected: 19,
  averageExposureReduced: 63,
};

export const DEMO_EXPOSURE_OVER_TIME = [
  { label: 'Mon', value: 85 },
  { label: 'Tue', value: 72 },
  { label: 'Wed', value: 91 },
  { label: 'Thu', value: 45 },
  { label: 'Fri', value: 38 },
  { label: 'Sat', value: 67 },
  { label: 'Sun', value: 22 },
];

export const DEMO_CATEGORY_DISTRIBUTION = [
  { category: 'Direct Identifiers', count: 18, color: '#dc2626' },
  { category: 'Location', count: 12, color: '#f97316' },
  { category: 'Personal Context', count: 15, color: '#eab308' },
  { category: 'Sensitive Context', count: 9, color: '#8b5cf6' },
];

export const DEMO_PROTECTION_RATE = [
  { label: 'Protected', value: 19 },
  { label: 'Unprotected', value: 8 },
];
