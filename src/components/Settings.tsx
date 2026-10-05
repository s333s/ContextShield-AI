import { useState } from 'react';
import {
  Shield, ShieldCheck, Trash2, ToggleLeft, ToggleRight,
  Lock, Info, Zap, Eye,
} from 'lucide-react';

export function Settings() {
  const [localFirst, setLocalFirst] = useState(true);
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [showAIWarning, setShowAIWarning] = useState(true);
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    try {
      localStorage.removeItem('contextshield_stats');
      localStorage.removeItem('contextshield_settings');
    } catch {
      // ignore
    }
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      {/* Scanning Settings */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-shield-500" />
          Scanning Settings
        </h3>
        <div className="space-y-4">
          <SettingToggle
            label="Enable scanning"
            description="Analyze prompts for sensitive information on supported AI websites."
            value={scanningEnabled}
            onChange={setScanningEnabled}
          />
          <SettingToggle
            label="Auto-analyze on paste"
            description="Automatically scan prompts when text is pasted into AI chat inputs."
            value={autoAnalyze}
            onChange={setAutoAnalyze}
          />
          <SettingToggle
            label="Local-first privacy mode"
            description="ContextShield attempts local detection before using AI analysis."
            value={localFirst}
            onChange={setLocalFirst}
            highlighted
          />
          <SettingToggle
            label="Show AI processing warning"
            description="Display a notice when external AI processing is used."
            value={showAIWarning}
            onChange={setShowAIWarning}
          />
        </div>
      </div>

      {/* AI Provider Info */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyber-400" />
          AI Provider Status
        </h3>
        <div className="flex items-center justify-between p-3 rounded-xl bg-dark-950/50 border border-dark-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-shield-500/10 border border-shield-500/30">
              <ShieldCheck className="w-4 h-4 text-shield-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-100">Local Rule-Based Analyzer</p>
              <p className="text-xs text-dark-400">Running in demo/local mode</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-shield-500/10 text-shield-400 border border-shield-500/30 font-semibold">
            Active
          </span>
        </div>
        <div className="mt-3 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-dark-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-dark-400 leading-relaxed">
            No external AI API key is configured. ContextShield is running in local mode using
            regex-based detection and heuristic rules. All analysis happens entirely in your browser.
            To enable AI-powered analysis, add an API key to your environment configuration.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-dark-400" />
          Data Management
        </h3>
        <div className="flex items-start gap-2 mb-4">
          <Eye className="w-3.5 h-3.5 text-dark-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-dark-400 leading-relaxed">
            ContextShield stores only anonymized local statistics (counts and averages).
            Your actual prompts are never stored, logged, or sent to any backend for analytics.
          </p>
        </div>
        <button
          onClick={handleClearData}
          className="btn-danger flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {cleared ? 'Data cleared!' : 'Clear All Data'}
        </button>
      </div>

      {/* Supported Websites */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-shield-500" />
          Supported AI Websites
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {['ChatGPT', 'Gemini', 'Claude'].map((site) => (
            <div key={site} className="p-3 rounded-xl bg-dark-950/50 border border-dark-800 text-center">
              <p className="text-sm font-medium text-dark-100">{site}</p>
              <span className="text-[10px] px-2 py-0.5 mt-1 inline-block rounded-full bg-shield-500/10 text-shield-400 border border-shield-500/30 font-semibold">
                Supported
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  highlighted?: boolean;
}

function SettingToggle({ label, description, value, onChange, highlighted }: SettingToggleProps) {
  return (
    <div className={`flex items-start justify-between p-3 rounded-xl transition-all ${
      highlighted ? 'bg-shield-500/5 border border-shield-500/20' : 'bg-dark-950/30'
    }`}>
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-dark-100">{label}</p>
        <p className="text-xs text-dark-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex-shrink-0 transition-colors ${value ? 'text-shield-400' : 'text-dark-500'}`}
      >
        {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
      </button>
    </div>
  );
}
