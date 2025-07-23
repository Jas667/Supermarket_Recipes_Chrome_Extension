"use strict";
let overlay;

//Function to end new recipe recording and remove overlay
function endRecipe() {
  chrome.runtime.sendMessage({ type: "RECIPE_MODE", enabled: false });
  chrome.runtime.sendMessage({ type: "removeNewRecipe" });
  overlay.remove();
  overlay = null;
}

//Function to check if a recipe is being recorded and create an overlay
const checkRecordingStatus = () => {
  chrome.storage.local.get("newRecipe", (data) => {
    if (data.newRecipe) {
      createOverlay(data.newRecipe);
    }
  });
};

const createOverlay = (message) => {
  // ─── overlay code unchanged ───
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  overlay = document.createElement("div");
  overlay.id = "recOverlay";
  overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; padding: 12px;
      background: rgba(0,0,0,0.8); color: #fff; font-size: 16px;
      text-align: center; z-index: 999999;
    `;
  overlay.innerHTML = `
      <span style="margin-right:16px;">● Recording Recipe ${message.recipeName}</span>
      <button id="stopRec" style="padding:6px 12px; font-size:14px; cursor:pointer;">
        Finished
      </button>
      <button id="cancelRec" style="padding:6px 12px; font-size:14px; cursor:pointer;">
        Cancel
      </button>
    `;
  document.body.appendChild(overlay);

  /* 1‑B ▸ DISABLE rule when user clicks “Finished” */
  overlay.querySelector("#stopRec").addEventListener("click", endRecipe);

  /* 1‑C ▸ DISABLE rule when user clicks “Cancel” */
  overlay.querySelector("#cancelRec").addEventListener("click", endRecipe);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startRecipe") {
    sendResponse({ status: "started" });

    /* 1‑A ▸ ENABLE rule right away */
    chrome.runtime.sendMessage({ type: "RECIPE_MODE", enabled: true });

    //  Create the overlay with the recipe name
    createOverlay(message);
  }
});

//Listener for DOM load to check if new recipe is being recorded. If so, create the overlay
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  checkRecordingStatus();
} else {
  document.addEventListener("DOMContentLoaded", checkRecordingStatus);
}
