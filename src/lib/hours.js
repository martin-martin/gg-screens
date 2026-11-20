import { weeklyHours } from "../data/hours.js";
import { holidays } from "../data/holidays.js";

// "2026-11-26" for a Date, in the computer's local time zone.
export function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The hours for one date: a holiday's hours if there are any, else the regular ones.
// Returns { open, close, holiday } or { closed: true, holiday }.
export function hoursFor(date) {
  const holiday = holidays[dateKey(date)];
  if (holiday) {
    if (holiday.closed) {
      return { closed: true, holiday: holiday.name };
    }
    return { open: holiday.open, close: holiday.close, holiday: holiday.name };
  }
  const { open, close } = weeklyHours[date.getDay()];
  return { open, close, holiday: null };
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Whether the store is open at the given moment.
export function isOpen(date) {
  const hours = hoursFor(date);
  if (hours.closed) {
    return false;
  }
  const now = date.getHours() * 60 + date.getMinutes();
  return now >= toMinutes(hours.open) && now < toMinutes(hours.close);
}

// "07:00" -> "7 a.m.", "14:30" -> "2:30 p.m.", "12:00" -> "noon".
export function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  if (hours === 12 && minutes === 0) {
    return "noon";
  }
  const suffix = hours < 12 ? "a.m." : "p.m.";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutePart = minutes === 0 ? "" : `:${String(minutes).padStart(2, "0")}`;
  return `${hour12}${minutePart} ${suffix}`;
}

// "7 a.m. to 9 p.m.", or "Closed".
export function formatHours(hours) {
  if (hours.closed) {
    return "Closed";
  }
  return `${formatTime(hours.open)} to ${formatTime(hours.close)}`;
}
