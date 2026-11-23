import { dateKey } from "./hours.js";

// Whether `week` ({ start, end } as "YYYY-MM-DD", both days included) is on at `date`.
export function dealWeekIsOn(date, week) {
  const day = dateKey(date);
  return day >= week.start && day <= week.end;
}
