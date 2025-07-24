"use strict";

// import { getBearerToken, getWCAuthtoken } from "../storage";

export const sainsburysUrlFilter =
  "*://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket/item*";

export const SAINSBURYS_RULE_ID = 9001;

export function handleSainsburysAddToBasket(data) {
  console.log("🛒 Sainsbury's Add to Basket:", data);
}

//practice fetch request to test adding an item to the basket
export async function addItemToSainsburysBasket() {
  const [bearerToken, wcauthtoken] = await Promise.all([
    getBearerToken(),
    getWCAuthtoken(),
  ]);

  const response = await fetch(
    "https://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket/item",
    {
      method: "POST",
      credentials: "include", // <--- sends cookies
      headers: {
        "Content-Type": "application/json",
        Authorization: bearerToken,
        WCAUTHToken: wcauthtoken,
      },
      body: JSON.stringify({
        product_uid: "7508829",
        quantity: 1,
        uom: "ea",
        selected_catchweight: "",
      }),
    }
  );

  const result = await response.json();
  return result;
}
