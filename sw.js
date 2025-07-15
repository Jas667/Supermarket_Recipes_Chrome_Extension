// --- background.js (MV3 service worker) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openSummaryPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("summary.html"),
    });
  }
});
