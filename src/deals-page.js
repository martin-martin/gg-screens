import { dealWeek, deals } from "./data/deals.js";
import { formatDealPrice, formatPrice, savings } from "./lib/prices.js";
import { dealWeekIsOn } from "./lib/deals.js";

function formatDay(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// This week's deals while their week is on. Otherwise (before it starts, or once it has
// ended) the same deals with their dates, until the next week's deals arrive.
const start = formatDay(dealWeek.start);
const end = formatDay(dealWeek.end);
if (dealWeekIsOn(new Date(), dealWeek)) {
  document.querySelector("#deals-heading").textContent = "This week's deals";
  document.querySelector("#deal-week").textContent = `Prices good ${start} through ${end}.`;
} else {
  document.querySelector("#deals-heading").textContent = "Weekly deals";
  document.querySelector("#deal-week").textContent = `Deals for ${start} through ${end}.`;
}

const list = document.querySelector("#deals");
for (const deal of deals) {
  const card = document.createElement("li");
  card.className = "deal";

  const name = document.createElement("h3");
  name.textContent = deal.item;

  const price = document.createElement("p");
  price.className = "deal-price";
  price.textContent = formatDealPrice(deal);

  const saved = document.createElement("p");
  saved.className = "deal-savings";
  saved.textContent = `Save ${formatPrice(savings(deal))}`;

  card.append(name, price, saved);
  list.append(card);
}
