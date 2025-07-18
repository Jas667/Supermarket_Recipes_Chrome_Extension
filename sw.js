import { startNewRecipe, removeNewRecipe } from "./storage.js";

const RULE_ID = 9001;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.type) {
    case "openSummaryPage":
      chrome.tabs.create({
        url: chrome.runtime.getURL("summary.html"),
      });
      // no response needed
      return false;

    case "RECIPE_MODE":
      try {
        if (message.enabled === true) {
          await enableRule();
        } else {
          await disableRule();
        }
      } catch (err) {
        console.error("Failed to toggle rule:", err);
      }
      // no sendResponse for fire‑and‑forget
      return false;

    case "startNewRecipe":
      try {
        await startNewRecipe(message.recipeName);
        sendResponse({ success: true });
      } catch (err) {
        console.error("Failed to save new recipe:", err);
        sendResponse({ success: false, error: err.message });
      }
      // keep channel open for our async sendResponse
      return true;

    case "removeNewRecipe":
      try {
        await removeNewRecipe();
        sendResponse({ success: true });
      } catch (err) {
        console.error("Failed to remove new recipe:", err);
        sendResponse({ success: false, error: err.message });
      }
      return true;

    default:
      // unknown message type
      return false;
  }
});

// rule‐toggling helpers stay the same
async function enableRule() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter:
            "*://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket/item*",
          resourceTypes: ["xmlhttprequest"],
          requestMethods: ["post", "put"],
        },
      },
    ],
    removeRuleIds: [],
  });
}

async function disableRule() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [],
    removeRuleIds: [RULE_ID],
  });
}
