// background.js — Clock Out Crew service worker
// activeTab 방식: 저장 시 현재 탭 + 알려진 모든 탭에 스크립트 주입

// ── 탭 주입 헬퍼 ─────────────────────────────────────────────
async function injectTab(tabId) {
  try {
    // 이미 주입돼 있으면 skip (ping으로 확인)
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
  } catch {
    // 주입 안 돼 있으면 scripting API로 주입
    try {
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['content.css']
      });
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    } catch {
      // chrome://, edge:// 등 제한된 페이지는 무시
    }
  }
}

// ── 설정 저장 메시지 처리 ────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'UPDATE_SETTINGS') {
    // 현재 열린 모든 http/https 탭에 적용
    chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, async (tabs) => {
      for (const tab of tabs) {
        if (!tab.id) continue;
        await injectTab(tab.id);
        try {
          await chrome.tabs.sendMessage(tab.id, msg);
        } catch {}
      }
    });
    sendResponse({ ok: true });
  }
  return true;
});

// ── 팝업 열릴 때 현재 탭에 자동 주입 ────────────────────────
// 사용자가 아이콘 클릭 → popup 열림 → 현재 탭에 크루 없으면 주입
chrome.action.onClicked.addListener((tab) => {
  // popup이 설정돼 있으면 onClicked 대신 popup이 열림
  // 이 핸들러는 popup 없을 때만 실행됨 (현재는 popup 있으므로 사용 안 함)
});

// ── 탭이 완전히 로드될 때 자동 주입 ─────────────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || !/^https?:\/\//.test(tab.url)) return;

  // 설정 확인 후 크루가 활성화된 경우만 주입
  chrome.storage.sync.get({ activePets: [], crewVisible: true }, (settings) => {
    if (!settings.crewVisible || !settings.activePets.length) return;
    injectTab(tabId).then(() => {
      chrome.tabs.sendMessage(tabId, {
        type: 'UPDATE_SETTINGS',
        settings
      }).catch(() => {});
    });
  });
});
