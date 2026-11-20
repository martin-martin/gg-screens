// This week's deals. Prices are in cents, and `unit` is "each", "lb" or "dozen".
// A deal week runs from Wednesday to Tuesday, like the printed weekly ad.
export const dealWeek = { start: "2026-11-11", end: "2026-11-17" };

export const deals = [
  { item: "Large brown eggs", unit: "dozen", regular: 499, sale: 449 },
  { item: "Honeycrisp apples", unit: "lb", regular: 299, sale: 199 },
  { item: "Chicken thighs", unit: "lb", regular: 399, sale: 299 },
  { item: "Sourdough loaf", unit: "each", regular: 599, sale: 499 },
  { item: "Butternut squash", unit: "lb", regular: 179, sale: 129 },
  { item: "Whole milk, 1 gallon", unit: "each", regular: 449, sale: 389 },
];
