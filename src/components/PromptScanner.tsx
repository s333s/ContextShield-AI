import { useState, useMemo, useCallback } from 'react';
import { DetectedEntity, PrivacyAnalysis, Severity } from '@/types';
import { analyzePrompt, groupBySeverity, SEVERITY_ORDER } from '@/analyzers';
import { SAMPLE_PROMPTS, SamplePrompt } from '@/analyzers/demoData';
import { ScoreGauge } from './ScoreGauge';
import { EntityCard } from './EntityCard';
import { HighlightedText } from './HighlightedText';
import { BeforeAfter } from './BeforeAfter';
import {
  Shield, ShieldCheck, Scan, Sparkles, Copy, RotateCcw,
  ChevronDown, ChevronUp, Info, Zap,
} from 'lucide-react';

type Phase = 'input' | 'analysis' | 'protection';

const SEVERITY_ORDER_LIST: Severity[] = ['critical', 'high', 'medium', 'low'];

export function PromptScanner() {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [analysis, setAnalysis] = useState<PrivacyAnalysis | null>(null);
  const [activeEntity, setActiveEntity] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingSafe, setEditingSafe] = useState(false);
  const [safePromptText, setSafePromptText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleScan = useCallback(() => {
    if (!prompt.trim()) return;
    const result = analyzePrompt(prompt);
    setAnalysis(result);
    setPhase('analysis');
    setShowDetails(false);
    setActiveEntity(null);
  }, [prompt]);

  const handleProtect = useCallback(() => {
    if (!analysis) return;
    setSafePromptText(analysis.safePrompt);
    setPhase('protection');
  }, [analysis]);

  const handleReset = useCallback(() => {
    setPhase('input');
    setAnalysis(null);
    setActiveEntity(null);
    setShowDetails(false);
    setEditingSafe(false);
  }, []);

  const handleLoadSample = useCallback((sample: SamplePrompt) => {
    setPrompt(sample.prompt);
    setPhase('input');
    setAnalysis(null);
  }, []);

  const handleCopySafe = useCallback(() => {
    navigator.clipboard.writeText(safePromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [safePromptText]);

  const grouped = useMemo(() => {
    if (!analysis) return null;
    return groupBySeverity(analysis.entities);
  }, [analysis]);

  const sortedEntities = useMemo(() => {
    if (!analysis) return [];
    return [...analysis.entities].sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]);
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* === INPUT PHASE === */}
      {phase === 'input' && (
        <div className="animate-fade-in space-y-6">
          {/* Prompt Input */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-dark-200">
                Enter or paste your AI prompt
              </label>
              <span className="text-xs text-dark-500">{prompt.length} characters</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write an email to my professor explaining why I missed class because my mother is receiving medical treatment at Royal Hospital in Muscat. I live in Al Khoudh and my student ID is 123456."
              className="w-full h-32 p-4 rounded-xl bg-dark-950/50 border border-dark-700 text-sm text-dark-100
                         placeholder:text-dark-500 resize-none focus:outline-none focus:border-shield-500/50
                         focus:ring-1 focus:ring-shield-500/30 transition-all"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <Shield className="w-3.5 h-3.5 text-shield-500" />
                <span>Local-first detection runs in your browser</span>
              </div>
              <button
                onClick={handleScan}
                disabled={!prompt.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Scan className="w-4 h-4" />
                Scan Prompt
              </button>
            </div>
          </div>

          {/* Sample Prompts */}
          <div>
            <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
              Try a sample prompt
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="text-left p-4 rounded-xl bg-dark-800/40 border border-dark-700/50
                             hover:border-shield-500/30 hover:bg-dark-800/70 transition-all
                             active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          sample.expectedScore > 80 ? 'rgba(220,38,38,0.15)' :
                          sample.expectedScore > 60 ? 'rgba(249,115,22,0.15)' :
                          'rgba(234,179,8,0.15)',
                        color:
                          sample.expectedScore > 80 ? '#f87171' :
                          sample.expectedScore > 60 ? '#fb923c' : '#facc15',
                      }}
                    >
                      ~{sample.expectedScore}/100
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-dark-100 group-hover:text-shield-400 transition-colors">
                    {sample.title}
                  </h4>
                  <p className="text-xs text-dark-400 mt-1">{sample.scenario}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === ANALYSIS PHASE === */}
      {phase === 'analysis' && analysis && grouped && (
        <div className="animate-fade-in space-y-5">
          {/* Warning Banner */}
          {analysis.riskScore > 20 && (
            <div className="glass-card p-4 border-l-4 border-l-yellow-500/50 animate-slide-down">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-100">
                    ContextShield detected potentially sensitive context
                  </p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {analysis.entities.filter((e) => !e.necessary).length} unnecessary item
                    {analysis.entities.filter((e) => !e.necessary).length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score + Prompt with highlights */}
          <div className="grid md:grid-cols-[auto_1fr] gap-5">
            {/* Score gauge */}
            <div className="glass-card p-5 flex flex-col items-center justify-center min-w-[160px]">
              <ScoreGauge score={analysis.riskScore} size="lg" />
              <div className="mt-3 text-center">
                <p className="text-[10px] text-dark-400 font-medium uppercase tracking-wider">
                  Privacy Exposure
                </p>
              </div>
              <div className="mt-2 flex items-start gap-1.5 px-2">
                <Info className="w-3 h-3 text-dark-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-dark-500 leading-relaxed text-left">
                  Estimated risk score by ContextShield, not a legal privacy assessment.
                </p>
              </div>
            </div>

            {/* Highlighted prompt */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-dark-200">Your prompt</h3>
                <button onClick={handleReset} className="text-xs text-dark-400 hover:text-dark-200 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="bg-dark-950/50 rounded-xl p-4 border border-dark-800 max-h-[200px] overflow-y-auto">
                <HighlightedText
                  text={prompt}
                  entities={analysis.entities}
                  activeIndex={activeEntity}
                  onEntityClick={(i) => setActiveEntity(activeEntity === i ? null : i)}
                />
              </div>
              <p className="text-xs text-dark-500 mt-2">
                Click highlighted text to see details below.
              </p>
            </div>
          </div>

          {/* Details toggle */}
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-between hover:bg-dark-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Scan className="w-4 h-4 text-shield-500" />
                <span className="text-sm font-semibold text-dark-100">
                  Detected information ({analysis.entities.length} items)
                </span>
              </div>
              {showDetails ? <ChevronUp className="w-4 h-4 text-dark-400" /> : <ChevronDown className="w-4 h-4 text-dark-400" />}
            </button>

            {showDetails && (
              <div className="px-4 pb-4 space-y-4 animate-slide-down">
                {SEVERITY_ORDER_LIST.map((sev) => {
                  const items = grouped[sev];
                  if (items.length === 0) return null;
                  return (
                    <div key={sev}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 px-1 ${
                        sev === 'critical' ? 'text-red-400' :
                        sev === 'high' ? 'text-orange-400' :
                        sev === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {sev} ({items.length})
                      </h4>
                      <div className="space-y-2">
                        {items.map((entity, i) => {
                          const globalIdx = sortedEntities.indexOf(entity);
                          return (
                            <EntityCard
                              key={i}
                              entity={entity}
                              highlighted={activeEntity === globalIdx}
                              onClick={() => setActiveEntity(activeEntity === globalIdx ? null : globalIdx)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={handleProtect} className="btn-primary flex items-center gap-2 px-6 py-3 text-base">
              <ShieldCheck className="w-5 h-5" />
              Protect My Prompt
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Keep Original
            </button>
          </div>
        </div>
      )}

      {/* === PROTECTION PHASE === */}
      {phase === 'protection' && analysis && (
        <div className="animate-fade-in space-y-5">
          <BeforeAfter
            originalPrompt={prompt}
            safePrompt={safePromptText}
            originalScore={analysis.riskScore}
            safeScore={analyzePrompt(safePromptText).riskScore}
            removedInformation={analysis.removedInformation}
            intentPreserved={analysis.intentPreserved}
          />

          {/* Safe prompt editor */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-dark-200">
                {editingSafe ? 'Edit safe version' : 'Protected prompt'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSafe(!editingSafe)}
                  className="text-xs text-dark-400 hover:text-shield-400 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {editingSafe ? 'Done' : 'Edit Safe Version'}
                </button>
              </div>
            </div>
            {editingSafe ? (
              <textarea
                value={safePromptText}
                onChange={(e) => setSafePromptText(e.target.value)}
                className="w-full h-28 p-4 rounded-xl bg-dark-950/50 border border-dark-700 text-sm text-dark-100
                           resize-none focus:outline-none focus:border-shield-500/50 focus:ring-1 focus:ring-shield-500/30"
              />
            ) : (
              <div className="bg-dark-950/50 rounded-xl p-4 border border-shield-500/20">
                <p className="text-sm text-dark-100 leading-relaxed">{safePromptText}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              <button
                onClick={() => {
                  setPrompt(safePromptText);
                  handleScan();
                }}
                className="btn-primary flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Use Safe Prompt
              </button>
              <button onClick={handleCopySafe} className="btn-secondary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Safe Prompt'}
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
            </div>
          </div>

          {/* AI reasoning */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyber-400" />
              <h4 className="text-xs font-semibold text-dark-300 uppercase tracking-wider">
                AI Reasoning
              </h4>
            </div>
            <p className="text-xs text-dark-400 leading-relaxed">
              Detected intent: <span className="text-dark-200 font-medium">"{analysis.intent}"</span>
            </p>
            <p className="text-xs text-dark-400 leading-relaxed mt-1">
              ContextShield identified {analysis.entities.length} sensitive entit
              {analysis.entities.length !== 1 ? 'ies' : 'y'} and generalized or removed
              {' '}{analysis.removedInformation.length} categor
              {analysis.removedInformation.length !== 1 ? 'ies' : 'y'} of information
              {' '}while preserving your original task.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
