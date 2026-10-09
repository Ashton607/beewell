import { NextResponse } from "next/server";
import { getCalendarClient } from "@/lib/googlecalendar";
import {
  LOCATIONS,
  CAPACITY,
  WEEKS,
  TIMEZONE,
  UTC_OFFSET,
} from "@/lib/classconfig";

/*
  GET /api/availability?location=douglas&date=2026-10-16

  `date` is the FIRST class the parent wants. Because a booking covers
  5 weekly classes, a time only has room if there is space on ALL 5 dates.

  Each booking must be saved in the calendar as one event per class, with:
    extendedProperties.private = { location: "douglas", slot: "08:00" }
  so we can count them here.
*/

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Add days to a "YYYY-MM-DD" string without timezone surprises
function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayInSA() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE }); // YYYY-MM-DD
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("location");
  const date = searchParams.get("date");

  // ---- Validate input ----
  const location = LOCATIONS[locationId];
  if (!location) {
    return NextResponse.json({ error: "Unknown location." }, { status: 400 });
  }

  if (!date || !DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
    return NextResponse.json(
      { error: "Date must be in YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  if (new Date(`${date}T00:00:00Z`).getUTCDay() !== location.weekday) {
    return NextResponse.json(
      { error: `${location.name} classes are not on that day of the week.` },
      { status: 400 }
    );
  }

  if (date < todayInSA()) {
    return NextResponse.json(
      { error: "That date is in the past." },
      { status: 400 }
    );
  }

  try {
    const { calendar, calendarId } = getCalendarClient();

    // The 5 weekly dates this booking would cover
    const classDates = Array.from({ length: WEEKS }, (_, i) =>
      addDays(date, i * 7)
    );
    const lastDate = classDates[classDates.length - 1];

    // One request for the whole 5-week window, this location only
    const { data } = await calendar.events.list({
      calendarId,
      timeMin: `${date}T00:00:00${UTC_OFFSET}`,
      timeMax: `${addDays(lastDate, 1)}T00:00:00${UTC_OFFSET}`,
      timeZone: TIMEZONE,
      singleEvents: true, // expands recurring events into each class
      privateExtendedProperty: [`location=${location.id}`],
      maxResults: 2500,
    });

    // Count parents per (date, time)
    const counts = {};
    for (const event of data.items ?? []) {
      if (event.status === "cancelled" || !event.start?.dateTime) continue;
      // Returned in our timezone, e.g. "2026-10-16T08:00:00+02:00"
      const day = event.start.dateTime.slice(0, 10);
      const time = event.start.dateTime.slice(11, 16);
      const key = `${day}|${time}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }

    // For each time, the busiest of the 5 weeks decides if it is full
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

    return NextResponse.json({
      location: location.id,
      date,
      capacity: CAPACITY,
      classDates,
      times,
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Could not check availability right now." },
      { status: 500 }
    );
  }
}