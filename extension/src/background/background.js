// ContextShield AI — Background Service Worker
// Handles messaging between popup and content scripts, manages local statistics.

// Initialize stats on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['contextshield_stats'], (result) => {
    if (!result.contextshield_stats) {
      chrome.storage.local.set({
        contextshield_stats: {
          analyzed: 0,
          detected: 0,
          protected: 0,
        },
        contextshield_settings: {
          scanningEnabled: true,
          localFirst: true,
          autoAnalyze: false,
          showAIWarning: true,
        },
      });
    }
  });
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['contextshield_stats'], (result) => {
      sendResponse(result.contextshield_stats || { analyzed: 0, detected: 0, protected: 0 });
    });
    return true;
  }

  if (message.type === 'UPDATE_STATS') {
    chrome.storage.local.get(['contextshield_stats'], (result) => {
      const stats = result.contextshield_stats || { analyzed: 0, detected: 0, protected: 0 };
      stats.analyzed += 1;
      if (message.detected) stats.detected += 1;
      if (message.protected) stats.protected += 1;
      chrome.storage.local.set({ contextshield_stats: stats });
      sendResponse(stats);
    });
    return true;
  }

  if (message.type === 'CLEAR_STATS') {
    chrome.storage.local.set({
      contextshield_stats: { analyzed: 0, detected: 0, protected: 0 },
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['contextshield_settings'], (result) => {
      sendResponse(result.contextshield_settings || {
        scanningEnabled: true,
        localFirst: true,
        autoAnalyze: false,
        showAIWarning: true,
      });
    });
    return true;
  }

  if (message.type === 'UPDATE_SETTINGS') {
    chrome.storage.local.get(['contextshield_settings'], (result) => {
      const settings = { ...result.contextshield_settings, ...message.settings };
      chrome.storage.local.set({ contextshield_settings: settings });
      sendResponse(settings);
    });
    return true;
  }

  if (message.type === 'SCAN_PROMPT') {
    // Content script requests analysis — handled locally by the content script itself
    sendResponse({ success: true, local: true });
    return true;
  }
});
