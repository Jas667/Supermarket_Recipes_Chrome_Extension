"use strict";

export const sainsburysUrlFilter =
  "*://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket/item*";

export const SAINSBURYS_RULE_ID = 9001;

export function handleSainsburysAddToBasket(data) {
  console.log("🛒 Sainsbury's Add to Basket:", data);
}
