const NEW_RECIPE_STORAGE_KEY = "newRecipe";

//functions
export async function startNewRecipe(recipeName) {
  await chrome.storage.local.set({
    [NEW_RECIPE_STORAGE_KEY]: {
      name: recipeName,
      cost: 0,
      numberOfItems: 0,
      items: {},
    },
  });
}

export async function removeNewRecipe() {
  await chrome.storage.local.remove(NEW_RECIPE_STORAGE_KEY);
}

export async function getBearerToken() {
  const token = await chrome.storage.session.get(["bearerToken"]);
  return token.bearerToken;
}

export async function getWCAuthtoken() {
  const token = await chrome.storage.session.get(["wcauthtoken"]);
  return token.wcauthtoken;
}

export async function setBearerToken(token) {
  await chrome.storage.session.set({ bearerToken: token });
}

export async function setWCAuthtoken(token) {
  await chrome.storage.session.set({ wcauthtoken: token });
}
