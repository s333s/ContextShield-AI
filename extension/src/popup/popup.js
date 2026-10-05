// ContextShield AI — Popup Script
// Displays statistics and provides quick actions.

document.addEventListener('DOMContentLoaded', () => {
  // Load stats from storage
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (stats) => {
    if (stats) {
      document.getElementById('stat-analyzed').textContent = stats.analyzed || 0;
      document.getElementById('stat-detected').textContent = stats.detected || 0;
      document.getElementById('stat-protected').textContent = stats.protected || 0;
      const reduction = stats.analyzed > 0
        ? Math.round((stats.protected / stats.analyzed) * 100) + '%'
        : '—';
      document.getElementById('stat-reduced').textContent = reduction;
    }
  });

  // Detect current tab's site
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url) {
      const host = new URL(tab.url).hostname;
      let siteName = 'No AI site detected';
      if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) siteName = 'ChatGPT detected';
      else if (host.includes('gemini.google.com')) siteName = 'Gemini detected';
      else if (host.includes('claude.ai')) siteName = 'Claude detected';
      document.getElementById('footer-site').textContent = siteName;
    }
  });

  // Scan button — trigger content script scan
  document.getElementById('btn-scan').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'SCAN_PROMPT' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded — open demo page
          chrome.tabs.create({ url: 'https://contextshield.ai/demo' });
        }
      });
    }
  });

  // Protect button — trigger content script protect
  document.getElementById('btn-protect').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'PROTECT_PROMPT' }, (response) => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({ url: 'https://contextshield.ai/demo' });
        }
      });
    }
  });

  // Dashboard button — open the dashboard
  document.getElementById('btn-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://contextshield.ai/dashboard' });
  });
});
