"Use strict";

const newRecipeName = document.getElementById("newRecipeName");
const newRecipeButton = document.getElementById("newRecipeButton");

//Functions
// 1) Get the active tab in the last-focused window
const getActiveTab = async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    return tab;
  } catch (error) {
    console.error("Error getting active tab:", error);
    return null;
  }
};

// 2) If no recipe name is entered, warn user
const warningNoRecipeName = () => {
  newRecipeName.classList.add("warning", "shake");
  newRecipeName.focus();
  setTimeout(() => {
    newRecipeName.classList.remove("warning", "shake");
  }, 1000);
};

//Event Listeners
// 1) When the "Add a New Recipe..." button is clicked
newRecipeButton.addEventListener("click", async () => {
  const recipeName = newRecipeName.value.trim();
  if (!recipeName) {
    warningNoRecipeName();
    return;
  }
  // 1) Get the active tab in the last-focused window
  const tab = await getActiveTab();

  if (!tab || !tab.id) {
    console.error("Could not find a valid tab to message.");
    return;
  }

  //2) Send a message to the content script in the active tab
  const response = await chrome.tabs.sendMessage(tab.id, {
    type: "startRecipe",
    recipeName: recipeName,
  });
  console.log("Response from content script:", response);
  // Send message to sw.js to save the new recipe to local storage
  const storageResponse = await chrome.runtime.sendMessage({
    type: "startNewRecipe",
    recipeName: recipeName,
  });
  
  if(!storageResponse.success) {
    //Handle the error with a warning. We then need to close the overlay
    console.error("Failed to save new recipe:", storageResponse.error);
    warningNoRecipeName();
    return;
  }

  if (response.status === "started") {
    window.close(); // Close the popup after starting the recipe
  } else {
    console.error("Failed to start recipe:", response);
  }
});

// 2) When the view/edit recipes button is clicked
document.getElementById("viewRecipesButton").addEventListener("click", () => {
  //open summary.html in a new tab
  chrome.tabs.create({ url: "summary.html" });
});
