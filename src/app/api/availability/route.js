import { getCalendarClient } from "./googleCalendar";
import {
  LOCATIONS,
  CAPACITY,
  WEEKS,
  TIMEZONE,
  UTC_OFFSET,
} from "./classConfig";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Add days to a "YYYY-MM-DD" string without timezone surprises
export function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayInSA() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE }); // YYYY-MM-DD
}

// Checks that the location and first-class date make sense.
// Returns { location } when valid, or { error } when not.
export function validateSlot(locationId, date) {
  const location = LOCATIONS[locationId];
  if (!location) return { error: "Unknown location." };

  if (
    typeof date !== "string" ||
    !DATE_PATTERN.test(date) ||
    Number.isNaN(Date.parse(date))
  ) {
    return { error: "Date must be in YYYY-MM-DD format." };
  }

  if (new Date(`${date}T00:00:00Z`).getUTCDay() !== location.weekday) {
    return {
      error: `${location.name} classes are not on that day of the week.`,
    };
  }

  if (date < todayInSA()) return { error: "That date is in the past." };

  return { location };
}

/*
  Counts how many parents are booked for each time over the 5 weekly dates
  starting at `date`. The busiest week decides whether a time is full.

  Each booking is saved as one calendar event per class with:
    extendedProperties.private = { location, slot, bookingId }
*/
export async function getAvailability(
  location,
  date,
  client = getCalendarClient()
) {
  const { calendar, calendarId } = client;

  const classDates = Array.from({ length: WEEKS }, (_, i) =>
    addDays(date, i * 7)
  );
  const lastDate = classDates[classDates.length - 1];

  const { data } = await calendar.events.list({
    calendarId,
    timeMin: `${date}T00:00:00${UTC_OFFSET}`,
    timeMax: `${addDays(lastDate, 1)}T00:00:00${UTC_OFFSET}`,
    timeZone: TIMEZONE,
    singleEvents: true, // expands recurring events into each class
    privateExtendedProperty: [`location=${location.id}`],
    maxResults: 2500,
  });

  const counts = {};
  for (const event of data.items ?? []) {
    if (event.status === "cancelled" || !event.start?.dateTime) continue;
    // Returned in our timezone, e.g. "2026-10-16T08:00:00+02:00"
    const day = event.start.dateTime.slice(0, 10);
    const time = event.start.dateTime.slice(11, 16);
    const key = `${day}|${time}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const times = location.times.map((t) => {
    const booked = Math.max(
      ...classDates.map((d) => counts[`${d}|${t.id}`] ?? 0)
    );
    const spotsLeft = Math.max(0, CAPACITY - booked);
    return {
      id: t.id,
      label: t.label,
      booked,
      spotsLeft,
      full: spotsLeft === 0,
    };
  });

  return { classDates, times };
}