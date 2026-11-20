// 399 -> "$3.99", 49 -> "49¢".
export function formatPrice(cents) {
  if (cents < 100) {
    return `${cents}¢`;
  }
  return `$${(cents / 100).toFixed(2)}`;
}

const unitLabels = { each: "", lb: "/lb", dozen: "/dozen" };

// A deal's sale price with its unit: "$5.49/lb", "$4.49", "$3.99/dozen".
export function formatDealPrice(deal) {
  return formatPrice(deal.sale) + unitLabels[deal.unit];
}

// How much a deal saves, in cents.
export function savings(deal) {
  return deal.regular - deal.sale;
}
