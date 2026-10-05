import { useState } from 'react';
import { PromptScanner } from '@/components/PromptScanner';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import {
  Shield, ShieldCheck, LayoutDashboard, Settings as SettingsIcon,
  FileText, Scan, Github, ExternalLink, Chrome,
} from 'lucide-react';

type Tab = 'scanner' | 'dashboard' | 'settings' | 'privacy';

const TABS: Array<{ id: Tab; label: string; icon: typeof Shield }> = [
  { id: 'scanner', label: 'Scanner', icon: Scan },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'privacy', label: 'Privacy', icon: FileText },
];

function App() {
  const [tab, setTab] = useState<Tab>('scanner');

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-shield-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyber-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-dark-800/50 backdrop-blur-xl bg-dark-950/60">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-xl bg-shield-500/10 border border-shield-500/30">
                  <Shield className="w-5 h-5 text-shield-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-shield-500 rounded-full animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-dark-100 tracking-tight">
                  ContextShield <span className="text-shield-400">AI</span>
                </h1>
                <p className="text-[10px] text-dark-400 -mt-0.5">Your AI Privacy Firewall</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-shield-500/10 border border-shield-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-shield-400" />
                <span className="text-xs font-medium text-shield-400">Protected</span>
              </div>
              <button
                onClick={() => setTab('settings')}
                className="p-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-all"
                title="Extension settings"
              >
                <Chrome className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1 mt-4 -mb-4 overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative ${
                    active
                      ? 'text-shield-400 bg-dark-900/50'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-shield-400 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Page intro */}
        {tab === 'scanner' && (
          <div className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-100 tracking-tight">
              Are you revealing more than this AI needs?
            </h2>
            <p className="text-sm text-dark-400 mt-2 max-w-2xl mx-auto">
              ContextShield sits between you and AI chatbots — like Grammarly for AI privacy.
              Scan your prompt, see your privacy exposure, and generate a safer version.
            </p>
          </div>
        )}

        {tab === 'scanner' && <PromptScanner />}
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'settings' && <Settings />}
        {tab === 'privacy' && <PrivacyPolicy />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-800/50 backdrop-blur-xl bg-dark-950/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-dark-500">
            ContextShield AI — Privacy-first prompt protection for AI chatbots
          </p>
          <div className="flex items-center gap-4 text-xs text-dark-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-shield-500 animate-pulse" />
              Local mode active
            </span>
            <button onClick={() => setTab('privacy')} className="hover:text-dark-300 transition-colors">
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
