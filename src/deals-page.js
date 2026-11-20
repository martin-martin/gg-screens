import { dealWeek, deals } from "./data/deals.js";
import { formatDealPrice, formatPrice, savings } from "./lib/prices.js";

function formatDay(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

document.querySelector("#deal-week").textContent =
  `Prices good ${formatDay(dealWeek.start)} through ${formatDay(dealWeek.end)}.`;

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
