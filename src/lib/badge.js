import dayjs from "dayjs";
import { formatTime, hoursFor, isOpen, nextOpening } from "./hours.js";

// The home page's badge: "Open now, until 9 p.m." while the store is open,
// else when it opens next, holiday hours included.
export function badgeText(date) {
  if (isOpen(date)) {
    return `Open now, until ${formatTime(hoursFor(date).close)}`;
  }
  const now = dayjs(date);
  const opening = dayjs(nextOpening(date));
  let day = opening.format("dddd");
  if (opening.isSame(now, "day")) {
    day = "today";
  } else if (opening.isSame(now.add(1, "day"), "day")) {
    day = "tomorrow";
  }
  return `Closed now. Opens ${day} at ${formatTime(opening.format("HH:mm"))}`;
}
