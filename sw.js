
// sw.js
const RULE_ID = 9001;
// --- background.js (MV3 service worker) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openSummaryPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("summary.html"),
    });
  }
});

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "RECIPE_MODE") {
    msg.enabled ? await enableRule() : await disableRule();
  }
});

async function enableRule() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: RULE_ID,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "*://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket/item*",
        resourceTypes: ["xmlhttprequest"],
        requestMethods: ["post", "put"]
      }
    }],
    removeRuleIds: []
  });
}

async function disableRule() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [],
    removeRuleIds: [RULE_ID]
  });
}
