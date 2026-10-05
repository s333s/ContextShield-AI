import { Shield, Lock, Eye, Trash2, Zap, FileText, ExternalLink } from 'lucide-react';

export function PrivacyPolicy() {
  const sections = [
    {
      icon: Eye,
      title: 'What we collect',
      content: [
        'ContextShield stores only anonymized local statistics: the number of prompts analyzed, sensitive items detected, and prompts protected.',
        'These statistics are stored locally in your browser using localStorage and never leave your device.',
        'No prompt text, no detected entities, and no personal data is ever stored or transmitted.',
      ],
    },
    {
      icon: Lock,
      title: 'How your prompts are processed',
      content: [
        'When you scan a prompt, the text is processed in-memory by the local analyzer running in your browser.',
        'In local-first mode (default), all detection happens entirely on your device using regex patterns and heuristic rules.',
        'If you enable AI-powered analysis, the prompt text may be sent to an external LLM API for deeper contextual analysis. This is clearly indicated in the UI when it occurs.',
        'Prompt text is discarded from memory immediately after the analysis result is displayed.',
      ],
    },
    {
      icon: Zap,
      title: 'Local-first architecture',
      content: [
        'ContextShield prioritizes local detection. The local analyzer identifies direct identifiers, locations, personal context, and sensitive context without sending any data externally.',
        'External AI processing is only used when explicitly enabled and when the local analyzer cannot fully assess the context.',
        'We do not falsely claim "100% local" when an external model is being used. The UI clearly indicates when AI processing occurs.',
      ],
    },
    {
      icon: Trash2,
      title: 'Your controls',
      content: [
        'You can clear all local statistics at any time using the "Clear All Data" button in Settings.',
        'You can disable scanning entirely at any time.',
        'You can toggle local-first mode to prevent any external AI processing.',
        'You can enable or disable automatic analysis on paste.',
      ],
    },
    {
      icon: FileText,
      title: 'API keys and security',
      content: [
        'API keys for external AI providers are never exposed in frontend code.',
        'In development, keys are loaded from environment variables.',
        'In production, AI provider requests should be proxied through a backend that holds the API key server-side.',
        'ContextShield does not embed any API keys in the extension or demo page source.',
      ],
    },
    {
      icon: Shield,
      title: 'Limitations',
      content: [
        'The ContextShield Privacy Exposure Score is an estimated risk score, not a legal privacy assessment.',
        'Local detection uses pattern matching and heuristics. It may miss contextually sensitive information that does not match known patterns.',
        'AI-powered analysis, when enabled, provides deeper contextual understanding but involves sending prompt text to an external provider.',
        'ContextShield is a privacy assistance tool, not a guarantee of complete privacy.',
      ],
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
      <div className="glass-card p-6 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-shield-500/10 border border-shield-500/30 mb-3">
          <Shield className="w-6 h-6 text-shield-400" />
        </div>
        <h2 className="text-xl font-bold text-dark-100">Privacy Policy</h2>
        <p className="text-sm text-dark-400 mt-2 max-w-xl mx-auto">
          ContextShield AI is itself a privacy product. This policy explains exactly what data is and
          is not collected, how your prompts are processed, and the controls you have.
        </p>
      </div>

      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-shield-400" />
              <h3 className="text-sm font-semibold text-dark-200">{section.title}</h3>
            </div>
            <ul className="space-y-2">
              {section.content.map((line, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-dark-300 leading-relaxed">
                  <span className="text-shield-500 mt-1.5 w-1 h-1 rounded-full bg-shield-500 flex-shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="glass-card p-4 border-l-4 border-l-cyber-500/50">
        <p className="text-xs text-dark-400 leading-relaxed">
          This privacy policy applies to the ContextShield AI demo application and Chrome extension.
          For questions about how external AI providers handle data, refer to their respective privacy policies.
        </p>
      </div>
    </div>
  );
}
