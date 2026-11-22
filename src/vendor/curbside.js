// A stand-in for Generic Curbside's pickup ordering widget.
//
// Generic Curbside is a fictional pickup service, made up for this course, and so are
// its keys. This file talks to no server: it only draws a placeholder pickup form on
// the page, and its button sends no order anywhere.
//
// Use it like this, with the store's publishable key:
//
//   import { mountCurbside } from "./vendor/curbside.js";
//   mountCurbside(document.querySelector("#curbside"), { key });
//
// Generic Curbside gives every store two keys. The publishable key (curb_pub_...) is
// meant for the web page. The secret key (curb_sec_...) is for Generic Curbside's admin
// only, and never goes in the site.

const PUBLISHABLE_PREFIX = "curb_pub_";
const SECRET_PREFIX = "curb_sec_";

const PICKUP_TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00"];

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours < 12 ? "a.m." : "p.m.";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0 ? `${hour} ${suffix}` : `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function showError(element, text) {
  const line = document.createElement("p");
  line.className = "curbside-error";
  line.textContent = `Generic Curbside: ${text}`;
  element.replaceChildren(line);
}

export function mountCurbside(element, { key } = {}) {
  if (!element) {
    throw new Error("mountCurbside() needs the element to draw the widget in.");
  }
  if (typeof key === "string" && key.startsWith(SECRET_PREFIX)) {
    showError(
      element,
      "this is the secret key, which never goes in a web page. The widget needs the publishable key (curb_pub_...).",
    );
    return;
  }
  if (typeof key !== "string" || !key.startsWith(PUBLISHABLE_PREFIX)) {
    showError(element, "the widget needs the publishable key (curb_pub_...).");
    return;
  }

  const form = document.createElement("form");
  form.className = "curbside";

  const label = document.createElement("label");
  label.textContent = "Pickup time ";
  const select = document.createElement("select");
  select.name = "pickup-time";
  for (const time of PICKUP_TIMES) {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = `Today, ${formatTime(time)}`;
    select.append(option);
  }
  label.append(select);

  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Order for pickup";

  const status = document.createElement("p");
  status.className = "curbside-status";
  status.setAttribute("aria-live", "polite");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = `Pickup at ${formatTime(select.value)}: this is a demo, no order sent.`;
  });

  form.append(label, " ", button, status);
  element.replaceChildren(form);
}
