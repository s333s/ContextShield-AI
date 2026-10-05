// ContextShield AI — Content Script
// Runs on ChatGPT, Gemini, and Claude. Detects prompt input, monitors text changes,
// provides ContextShield scan button, and displays privacy analysis overlay.

import { getAdapter } from '../adapters/WebsiteAdapter.js';

// === Inline local analyzer (same logic as the web app, standalone for the extension) ===

const PATTERNS = [
  { regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, cat: 'direct_identifier', sev: 'critical', reason: 'Phone numbers can directly identify you.', label: 'Phone number' },
  { regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, cat: 'direct_identifier', sev: 'high', reason: 'Email addresses are direct identifiers.', label: 'Email address' },
  { regex: /\b(?:student|employee|staff|emp)\s*id[:\s#]*[A-Z0-9-]{3,}\b/gi, cat: 'direct_identifier', sev: 'critical', reason: 'Institutional IDs can identify and track you.', label: 'Student/Employee ID' },
  { regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, cat: 'direct_identifier', sev: 'critical', reason: 'SSN-like number — extremely sensitive.', label: 'SSN-like number' },
  { regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, cat: 'direct_identifier', sev: 'critical', reason: '16-digit card number — financial identifier.', label: 'Card-like number' },
  { regex: /\bapi[_-]?key[:\s]*[a-zA-Z0-9-]{20,}\b/gi, cat: 'direct_identifier', sev: 'critical', reason: 'API keys must never be shared.', label: 'API key' },
  { regex: /\b\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b/g, cat: 'location', sev: 'high', reason: 'Street address pinpoints your location.', label: 'Street address' },
  { regex: /(-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+)/g, cat: 'location', sev: 'high', reason: 'GPS coordinates reveal exact location.', label: 'GPS coordinates' },
  { regex: /\b(?:hospital|medical center|clinic)\s+(?:in|at|near)\s+[A-Z][a-zA-Z]+/gi, cat: 'location', sev: 'high', reason: 'Naming a medical facility reveals location and health context.', label: 'Medical facility' },
  { regex: /\b(?:Royal\s+Hospital|Al\s+Amerat|Al\s+Khoudh|Muscat|Dubai|Abu\s+Dhabi|Riyadh|Cairo)\b/g, cat: 'location', sev: 'medium', reason: 'Specific city names narrow your geographic identity.', label: 'Specific location' },
  { regex: /\bmy\s+(?:mother|father|mom|dad|sister|brother|wife|husband|parents|family)\b/gi, cat: 'personal_context', sev: 'medium', reason: 'Family details can be exploited for social engineering.', label: 'Family information' },
  { regex: /\b(?:I\s+(?:work|am\s+employed|got\s+fired)|my\s+(?:job|boss|company|employer|salary))\b/gi, cat: 'personal_context', sev: 'medium', reason: 'Employment details reveal professional identity.', label: 'Employment info' },
  { regex: /\b(?:my\s+(?:professor|university|college|school|GPA)|I\s+(?:am\s+a\s+student|study\s+at))\b/gi, cat: 'personal_context', sev: 'medium', reason: 'Education details can identify your institution.', label: 'Education info' },
  { regex: /\b(?:I\s+(?:can'?t\s+afford|am\s+struggling|am\s+in\s+debt)|my\s+(?:debt|loan|mortgage|bankruptcy))\b/gi, cat: 'personal_context', sev: 'high', reason: 'Financial hardship is sensitive profiling data.', label: 'Financial hardship' },
  { regex: /\b(?:my\s+(?:mother|father|mom|dad|sister|brother|wife|husband|parents)\s+(?:is\s+)?(?:sick|ill|hospitalized|receiving\s+treatment|diagnosed))\b/gi, cat: 'sensitive_context', sev: 'high', reason: 'Family medical info is highly sensitive.', label: 'Medical/family health' },
  { regex: /\b(?:I\s+(?:have|was\s+diagnosed\s+with|suffer\s+from)|my\s+(?:diagnosis|condition|medication|treatment|depression|anxiety))\b/gi, cat: 'sensitive_context', sev: 'high', reason: 'Personal medical info is extremely sensitive.', label: 'Medical info' },
  { regex: /\b(?:I'?m\s+(?:depressed|anxious|in\s+therapy)|my\s+(?:therapist|psychiatrist|mental\s+health))\b/gi, cat: 'sensitive_context', sev: 'high', reason: 'Mental health info can cause discrimination.', label: 'Mental health' },
  { regex: /\b(?:I'?m\s+(?:being\s+sued|facing\s+charges)|my\s+(?:lawyer|attorney|legal\s+case))\b/gi, cat: 'sensitive_context', sev: 'high', reason: 'Legal info can affect employment and reputation.', label: 'Legal issues' },
  { regex: /\b(?:I\s+(?:owe|earn|make\s+\$)|my\s+(?:salary|bank\s+account|balance))\b/gi, cat: 'sensitive_context', sev: 'high', reason: 'Financial info can be exploited for fraud.', label: 'Financial info' },
  { regex: /\b(?:my\s+(?:religious|political|faith)|I'?m\s+(?:a\s+(?:Christian|Muslim|atheist|Democrat|Republican)))\b/gi, cat: 'sensitive_context', sev: 'medium', reason: 'Religious/political views can cause bias.', label: 'Religious/political' },
];

const SEVERITY_WEIGHTS = { critical: 30, high: 20, medium: 12, low: 6 };

function analyzeLocally(prompt) {
  const entities = [];
  for (const def of PATTERNS) {
    def.regex.lastIndex = 0;
    let match;
    while ((match = def.regex.exec(prompt)) !== null) {
      const overlaps = entities.some((e) => match.index < e.endIndex && match.index + match[0].length > e.startIndex);
      if (overlaps) continue;
      entities.push({
        text: match[0], category: def.cat, severity: def.sev,
        reason: def.reason, label: def.label,
        startIndex: match.index, endIndex: match.index + match[0].length,
      });
    }
  }
  let score = 0;
  for (const e of entities) score += SEVERITY_WEIGHTS[e.severity] || 0;
  const idCount = entities.filter((e) => e.category === 'direct_identifier').length;
  score += idCount * 8;
  return { entities, score: Math.min(100, Math.max(0, Math.round(score))) };
}

const GENERALIZATIONS = [
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, repl: '[phone number]', info: 'Phone number' },
  { pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, repl: '[email]', info: 'Email address' },
  { pattern: /\b(?:student|employee|staff|emp)\s*id[:\s#]*[A-Z0-9-]{3,}\b/gi, repl: '[student ID]', info: 'Student identifier' },
  { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, repl: '[ID number]', info: 'SSN-like number' },
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, repl: '[card number]', info: 'Card-like number' },
  { pattern: /\b(?:Royal\s+Hospital|Al\s+Amerat|Al\s+Khoudh|Muscat|Dubai|Abu\s+Dhabi|Riyadh|Cairo)\b/g, repl: 'my city', info: 'Precise location' },
  { pattern: /\b(?:hospital|medical center|clinic)\s+(?:in|at|near)\s+[A-Z][a-zA-Z]+/gi, repl: 'a medical facility', info: 'Specific medical facility' },
  { pattern: /\bmy\s+(?:mother|father|mom|dad|sister|brother|wife|husband|parents)\s+(?:is\s+)?(?:sick|ill|hospitalized|receiving\s+treatment|diagnosed)\b/gi, repl: 'a family medical situation', info: 'Family medical details' },
  { pattern: /\bmy\s+(?:mother|father|mom|dad|sister|brother|wife|husband|parents)\b/gi, repl: 'a family member', info: 'Family details' },
  { pattern: /\b(?:I\s+(?:have|was\s+diagnosed\s+with|suffer\s+from)|my\s+(?:diagnosis|condition|medication|treatment))\b/gi, repl: 'a medical condition', info: 'Medical information' },
  { pattern: /\b(?:I'?m\s+(?:depressed|anxious|in\s+therapy)|my\s+(?:therapist|mental\s+health))\b/gi, repl: 'a personal health matter', info: 'Mental health details' },
  { pattern: /\b(?:I'?m\s+(?:being\s+sued|facing\s+charges)|my\s+(?:lawyer|legal\s+case))\b/gi, repl: 'a legal matter', info: 'Legal issue details' },
  { pattern: /\b(?:I\s+(?:owe|earn|make\s+\$)|my\s+(?:salary|bank\s+account|balance))\b/gi, repl: 'a financial situation', info: 'Financial information' },
  { pattern: /\b(?:I\s+(?:can'?t\s+afford|am\s+struggling|am\s+in\s+debt)|my\s+(?:debt|loan|mortgage))\b/gi, repl: 'a financial difficulty', info: 'Financial hardship' },
  { pattern: /\b(?:I\s+(?:work|am\s+employed|got\s+fired)|my\s+(?:job|boss|company|employer|salary))\b/gi, repl: 'my work situation', info: 'Employment details' },
  { pattern: /\b(?:my\s+(?:professor|university|college|school|GPA)|I\s+(?:am\s+a\s+student|study\s+at))\b/gi, repl: 'my studies', info: 'Education details' },
  { pattern: /\b(?:my\s+(?:boyfriend|girlfriend|partner)\s+(?:cheated|left|broke\s+up)|I'?m\s+going\s+through\s+a\s+(?:divorce|breakup))\b/gi, repl: 'a personal situation', info: 'Relationship details' },
  { pattern: /\b(?:my\s+(?:religious|political|faith)|I'?m\s+(?:a\s+(?:Christian|Muslim|atheist|Democrat|Republican)))\b/gi, repl: 'a personal belief', info: 'Religious/political views' },
];

function sanitizePrompt(prompt) {
  let safe = prompt;
  const removed = new Set();
  for (const g of GENERALIZATIONS) {
    const before = safe;
    safe = safe.replace(g.pattern, g.repl);
    if (safe !== before) removed.add(g.info);
  }
  safe = safe.replace(/\s+/g, ' ').replace(/\s+([.,;!?])/g, '$1').trim();
  return { safePrompt: safe, removedInfo: Array.from(removed) };
}

// === Overlay UI ===

function createOverlay(analysis, safeResult, adapter) {
  // Remove existing overlay
  const existing = document.getElementById('contextshield-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'contextshield-overlay';

  const scoreColor = analysis.score > 80 ? '#dc2626' : analysis.score > 60 ? '#f97316' : analysis.score > 40 ? '#eab308' : '#22c55e';
  const sevColor = { critical: '#dc2626', high: '#f97316', medium: '#eab308', low: '#22c55e' };

  overlay.innerHTML = `
    <div class="cs-overlay-backdrop"></div>
    <div class="cs-overlay-panel">
      <div class="cs-overlay-header">
        <span class="cs-logo">🛡️ ContextShield</span>
        <button class="cs-close" id="cs-close-btn">✕</button>
      </div>
      <div class="cs-score-section">
        <div class="cs-score-display">
          <div class="cs-score-number" style="color: ${scoreColor}">${analysis.score}</div>
          <div class="cs-score-label">Privacy Exposure Score</div>
          <div class="cs-score-disclaimer">Estimated risk — not a legal assessment</div>
        </div>
        ${analysis.entities.length > 0 ? `
          <div class="cs-entities">
            <div class="cs-entities-title">Detected: ${analysis.entities.length} item${analysis.entities.length !== 1 ? 's' : ''}</div>
            ${analysis.entities.map(e => `
              <div class="cs-entity" style="border-left-color: ${sevColor[e.severity]}">
                <div class="cs-entity-label">${e.label}</div>
                <div class="cs-entity-sev" style="color: ${sevColor[e.severity]}">${e.severity.toUpperCase()}</div>
                <div class="cs-entity-reason">${e.reason}</div>
              </div>
            `).join('')}
          </div>
        ` : '<div class="cs-safe-msg">No sensitive information detected. Your prompt looks safe.</div>'}
      </div>
      ${analysis.score > 20 ? `
        <div class="cs-before-after">
          <div class="cs-ba-item">
            <div class="cs-ba-label">Before: ${analysis.score}/100</div>
            <div class="cs-ba-text cs-ba-original">"${promptTextPreview}"</div>
          </div>
          <div class="cs-ba-arrow">↓ ${analysis.score - safeResult.safeScore} point reduction</div>
          <div class="cs-ba-item">
            <div class="cs-ba-label">After: ${safeResult.safeScore}/100</div>
            <div class="cs-ba-text cs-ba-safe">"${safeResult.safePrompt}"</div>
          </div>
        </div>
        <div class="cs-removed">
          ${safeResult.removedInfo.map(i => `<div class="cs-removed-item">✓ ${i}</div>`).join('')}
        </div>
        <div class="cs-actions">
          <button class="cs-btn cs-btn-primary" id="cs-use-safe">Use Safe Prompt</button>
          <button class="cs-btn cs-btn-secondary" id="cs-keep">Keep Original</button>
        </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('cs-close-btn')?.addEventListener('click', () => overlay.remove());
  document.querySelector('.cs-overlay-backdrop')?.addEventListener('click', () => overlay.remove());

  document.getElementById('cs-use-safe')?.addEventListener('click', () => {
    adapter.setPromptText(safeResult.safePrompt);
    overlay.remove();
    showToast('Safe prompt inserted!', 'success');
    updateStats(true);
  });
  document.getElementById('cs-keep')?.addEventListener('click', () => {
    overlay.remove();
  });
}

let promptTextPreview = '';

function showToast(msg, type) {
  const toast = document.createElement('div');
  toast.className = 'cs-toast';
  toast.textContent = msg;
  toast.style.cssText = type === 'success'
    ? 'position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:10px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);color:#22c55e;font-size:14px;font-weight:600;z-index:999999;animation:fadeIn 0.3s ease-out;'
    : 'position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:10px;background:rgba(30,41,59,0.95);border:1px solid rgba(100,116,139,0.4);color:#e2e8f0;font-size:14px;z-index:999999;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateStats(protected_prompt) {
  try {
    const key = 'contextshield_stats';
    const stats = JSON.parse(localStorage.getItem(key) || '{"analyzed":0,"detected":0,"protected":0}');
    stats.analyzed = (stats.analyzed || 0) + 1;
    stats.detected = (stats.detected || 0) + 1;
    if (protected_prompt) stats.protected = (stats.protected || 0) + 1;
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) { /* ignore */ }
}

// === Main content script logic ===

const adapter = getAdapter();

if (adapter.name !== 'generic') {
  // Inject floating scan button
  function injectButton() {
    if (document.getElementById('contextshield-fab')) return;
    const fab = document.createElement('button');
    fab.id = 'contextshield-fab';
    fab.innerHTML = '🛡️';
    fab.title = 'ContextShield — Scan this prompt for privacy risks';
    fab.style.cssText = `
      position: fixed; bottom: 100px; right: 20px;
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(15, 23, 42, 0.9); border: 2px solid rgba(34, 197, 94, 0.4);
      color: #22c55e; font-size: 20px; cursor: pointer; z-index: 999998;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    `;
    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'scale(1.1)';
      fab.style.borderColor = 'rgba(34, 197, 94, 0.7)';
    });
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'scale(1)';
      fab.style.borderColor = 'rgba(34, 197, 94, 0.4)';
    });
    fab.addEventListener('click', () => {
      const text = adapter.getPromptText();
      if (!text.trim()) {
        showToast('No prompt text found. Type or paste a prompt first.', 'info');
        return;
      }
      promptTextPreview = text.length > 200 ? text.slice(0, 200) + '...' : text;
      const analysis = analyzeLocally(text);
      const safe = sanitizePrompt(text);
      const safeAnalysis = analyzeLocally(safe.safePrompt);
      createOverlay({ ...analysis, entities: analysis.entities }, { ...safe, safeScore: safeAnalysis.score }, adapter);
      updateStats(false);
    });
    document.body.appendChild(fab);
  }

  // Wait for page to settle, then inject
  setTimeout(injectButton, 2000);

  // Re-inject on SPA navigation
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(injectButton, 1500);
    }
  }, 1000);
}
