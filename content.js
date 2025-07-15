"use strict";
let overlay;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startRecipe") {
    sendResponse({ status: "started" });

    // If overlay already exists, just update it
    if (overlay) {
      overlay.remove();
      overlay = null; // Clear the reference to allow re-creation
    }
    // Create the overlay
    overlay = document.createElement("div");
    overlay.id = "recOverlay";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100%; padding: 12px;
        background: rgba(0,0,0,0.8); color: #fff;
        font-family: sans-serif; font-size: 16px;
        text-align: center; z-index: 999999;
      `;
    overlay.innerHTML = `
        <span style="margin-right: 16px;">● Recording Recipe ${message.recipeName}</span>
        <button id="stopRec" style="
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
        ">Finished</button>
      `;
    document.body.appendChild(overlay);

    // “Finished” button
    overlay.querySelector("#stopRec").addEventListener("click", () => {
      // tell background to clear badge
      chrome.runtime.sendMessage({ type: "stopRecording" });
      //message sw.js to open summary page
      chrome.runtime.sendMessage({ type: "openSummaryPage" });
      overlay.remove();
      overlay = null; // Clear the reference to allow re-creation
    });
  }
});
