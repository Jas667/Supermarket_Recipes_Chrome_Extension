const NEW_RECIPE_STORAGE_KEY = "newRecipe";

//functions
export async function startNewRecipe(recipeName) {
    await chrome.storage.local.set({
        [NEW_RECIPE_STORAGE_KEY]: {
            name: recipeName,
            cost: 0,
            numberOfItems: 0,
            items: {}
        }
    });
};

export async function removeNewRecipe() {
    await chrome.storage.local.remove(NEW_RECIPE_STORAGE_KEY);
};
