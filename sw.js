"use strict";
import { startNewRecipe, removeNewRecipe } from "./storage.js";
import {
  sainsburysUrlFilter,
  SAINSBURYS_RULE_ID,
  handleSainsburysAddToBasket,
} from "./sites/sainsburys.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "openSummaryPage":
      chrome.tabs.create({
        url: chrome.runtime.getURL("summary.html"),
      });
      return false; // no response

    case "RECIPE_MODE":
      // fire‑and‑forget; we don't send a response here
      (async () => {
        try {
          if (message.enabled) {
            //I need to create separate rules for each site
            await enableRule(SAINSBURYS_RULE_ID, sainsburysUrlFilter);
            chrome.webRequest.onBeforeRequest.addListener(
              registerAddToBasket,
              { urls: [sainsburysUrlFilter], types: ["xmlhttprequest"] },
              ["requestBody"]
            );
          } else {
            await disableRule(SAINSBURYS_RULE_ID);
            chrome.webRequest.onBeforeRequest.removeListener(
              registerAddToBasket
            );
          }
        } catch (e) {
          console.error("Failed to toggle rule:", e);
        }
      })();
      return false; // no response

    case "startNewRecipe":
      // we *will* send a response, so return true synchronously
      startNewRecipe(message.recipeName)
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          console.error("Failed to save new recipe:", err);
          sendResponse({ success: false, error: err.message });
        });
      return true;

    case "removeNewRecipe":
      removeNewRecipe()
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          console.error("Failed to remove new recipe:", err);
          sendResponse({ success: false, error: err.message });
        });
      return true;

    default:
      return false; // no response
  }
});

// rule‐toggling helpers stay the same
async function enableRule(RULE_ID, urlfilter) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: urlfilter,
          resourceTypes: ["xmlhttprequest"],
          requestMethods: ["post", "put"],
        },
      },
    ],
  });
}

async function disableRule(RULE_ID) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [],
    removeRuleIds: [RULE_ID],
  });
}

//Sainsburys Specific Sniffing
function registerAddToBasket(details) {
  if (details.requestBody?.raw?.length) {
    const buf = details.requestBody.raw[0].bytes;
    const text = new TextDecoder().decode(new Uint8Array(buf));
    try {
      const data = JSON.parse(text);
      console.log("🛒 Captured Sainsbury's item:", data);
    } catch (e) {
      console.warn("❗ parse failed:", e);
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startRecipeAdd") {
    chrome.tabs.create({ url: message.url, active: false }, (tab) => {
      const tabId = tab.id;

      const listener = (details) => {
        if (details.tabId === tabId && details.frameId === 0) {
          chrome.webNavigation.onCompleted.removeListener(listener);

          chrome.scripting.executeScript({
            target: { tabId },
            world: "MAIN",
            args: [3], // Quantity to add
            func: (recipeQty) => {
              const getCurrentQty = () => {
                const qtyBtn = document.querySelector(
                  '.pd__controls button[data-testid="pt-button-quantity"]'
                );
                return qtyBtn ? parseInt(qtyBtn.textContent.trim(), 10) : 0;
              };

              let currentQty = getCurrentQty();
              const targetQty = currentQty + recipeQty;
              console.log(`📦 Start: ${currentQty}, Target: ${targetQty}`);

              let waitingForUpdate = false;
              let lastKnownQty = currentQty;
              let tries = 0;
              const maxTries = 15;

              const interval = setInterval(() => {
                currentQty = getCurrentQty();

                // 🛑 Stop if we've reached the goal
                if (currentQty >= targetQty) {
                  console.log(`✅ Final quantity reached: ${currentQty}`);
                  clearInterval(interval);
                  return;
                }

                // 🧠 Wait until last click results in DOM update
                if (waitingForUpdate) {
                  if (currentQty > lastKnownQty) {
                    console.log(
                      `🔁 Detected update: ${lastKnownQty} → ${currentQty}`
                    );
                    waitingForUpdate = false;
                    lastKnownQty = currentQty;
                  } else {
                    console.log("⏳ Waiting for quantity to update...");
                    return; // Don't click again yet
                  }
                }

                // 🔄 Refresh buttons each loop to allow for React delay
                const addBtn = document.querySelector(
                  '.pd__controls button[data-testid="add-button"]'
                );
                const incBtn = document.querySelector(
                  '.pd__controls button[data-testid="pt-button-inc"]'
                );

                // 🤖 Ready to click again
                if (currentQty === 0 && addBtn) {
                  addBtn.click();
                  waitingForUpdate = true;
                  console.log("🛒 Clicked Add");
                } else if (incBtn) {
                  incBtn.click();
                  waitingForUpdate = true;
                  console.log(
                    `🔼 Clicked Increase (expecting ${currentQty + 1})`
                  );
                } else if (tries >= 5) {
                  console.warn("❌ No button to click");
                  clearInterval(interval);
                }

                if (++tries >= maxTries) {
                  console.warn("🛑 Max retries hit");
                  clearInterval(interval);
                }
              }, 2000);
            },
          });
        }
      };

      chrome.webNavigation.onCompleted.addListener(listener);
    });
  }
});
