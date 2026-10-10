import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCalendarClient } from "@/lib/googlecalendar";
import { validateSlot, getAvailability } from "@/lib/availability";
import { TIMEZONE, CLASS_DURATION_MINUTES } from "@/lib/classconfig";
import { sendBookingEmails } from "@/lib/email";

/*
  POST /api/book
  Body: { location, date, time, name, email, phone }

  1. Validates everything on the server (never trust the browser)
  2. Re-checks availability for all 5 weeks
  3. Creates one calendar event per class (5 events)
  4. Sends the confirmation emails with Resend
*/

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s\-()]{7,19}$/;

function validateCustomer({ name, email, phone }) {
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
    return "Please enter your name.";
  }
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(email.trim())
  ) {
    return "Please enter a valid email address.";
  }
  if (typeof phone !== "string" || !PHONE_PATTERN.test(phone.trim())) {
    return "Please enter a valid phone number.";
  }
  return null;
}

// "08:00" + 60 minutes -> "09:00"
function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export async function POST(request) {
  // ---- Read and validate the request ----
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { location, error: slotError } = validateSlot(body.location, body.date);
  if (slotError) {
    return NextResponse.json({ error: slotError }, { status: 400 });
  }

  const time = location.times.find((t) => t.id === body.time);
  if (!time) {
    return NextResponse.json({ error: "Unknown class time." }, { status: 400 });
  }

  const customerError = validateCustomer(body);
  if (customerError) {
    return NextResponse.json({ error: customerError }, { status: 400 });
  }

  const customer = {
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
  };

  try {
    const client = getCalendarClient();
    const { calendar, calendarId } = client;

    // ---- Re-check availability so nobody can overbook ----
    const { classDates, times } = await getAvailability(
      location,
      body.date,
      client
    );
    const slot = times.find((t) => t.id === time.id);

    if (!slot || slot.full) {
      return NextResponse.json(
        { error: "Sorry, that time was just filled. Please choose another." },
        { status: 409 }
      );
    }

    // ---- Create the 5 calendar events ----
    const bookingId = randomUUID();
    const endTime = addMinutes(time.id, CLASS_DURATION_MINUTES);

    const results = await Promise.allSettled(
      classDates.map((day, i) =>
        calendar.events.insert({
          calendarId,
          requestBody: {
            summary: `${customer.name} - Baby massage (${location.name})`,
            description: [
              `Parent: ${customer.name}`,
              `Email: ${customer.email}`,
              `Phone: ${customer.phone}`,
              `Class ${i + 1} of ${classDates.length}`,
              `Booking ID: ${bookingId}`,
            ].join("\n"),
            start: { dateTime: `${day}T${time.id}:00`, timeZone: TIMEZONE },
            end: { dateTime: `${day}T${endTime}:00`, timeZone: TIMEZONE },
            // The availability route counts events using these tags
            extendedProperties: {
              private: { location: location.id, slot: time.id, bookingId },
            },
          },
        })
      )
    );

    // If any class failed to save, undo the ones that did so nothing is half-booked
    if (results.some((r) => r.status === "rejected")) {
      const createdIds = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value.data.id);
      await Promise.allSettled(
        createdIds.map((eventId) =>
          calendar.events.delete({ calendarId, eventId })
        )
      );
      throw new Error("Could not create every calendar event");
    }

    // ---- Send emails (a failed email must not undo a saved booking) ----
    let emailSent = false;
    try {
      const sent = await sendBookingEmails({
        bookingId,
        customer,
        location,
        time,
        classDates,
      });
      emailSent = sent.customerSent;
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    return NextResponse.json({ ok: true, bookingId, classDates, emailSent });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "We couldn't complete your booking. Please try again." },
      { status: 500 }
    );
  }
}