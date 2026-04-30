// background.js — Clock Out Crew service worker
// Relays UPDATE_SETTINGS to all open tabs, injecting content script if needed

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'UPDATE_SETTINGS') return;

  chrome.tabs.query({}, async (tabs) => {
    for (const tab of tabs) {
      if (!tab.id || !tab.url) continue;
      if (!/^https?:\/\//.test(tab.url)) continue;
      try {
        await chrome.tabs.sendMessage(tab.id, msg);
      } catch {
        try {
          await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] });
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
          setTimeout(async () => {
            try { await chrome.tabs.sendMessage(tab.id, msg); } catch {}
          }, 350);
        } catch {}
      }
    }
  });

  sendResponse({ ok: true });
  return true;
});
