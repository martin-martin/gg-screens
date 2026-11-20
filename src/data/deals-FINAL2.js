// This week's deals. Prices are in cents, and `unit` is "each", "lb" or "dozen".
// A deal week runs from Wednesday to Tuesday, like the printed weekly ad.
// use this one for thanksgiving?? (not live yet)
export const dealWeek = { start: "2026-11-18", end: "2026-11-24" };

export const deals = [
  { item: "Large brown eggs", unit: "dozen", regular: 499, sale: 399 },
  { item: "Bananas", unit: "lb", regular: 69, sale: 49 },
  { item: "Ground beef, 85% lean", unit: "lb", regular: 699, sale: 549 },
  { item: "Sourdough loaf", unit: "each", regular: 599, sale: 449 },
  { item: "Fresh apple cider, 1 gallon", unit: "each", regular: 799, sale: 599 },
  { item: "Sweet potatoes", unit: "lb", regular: 149, sale: 99 },
  { item: "Canned pumpkin, 15 oz", unit: "each", regular: 249, sale: 179 },
  { item: "Stuffing mix, 6 oz", unit: "each", regular: 329, sale: 249 },
];
