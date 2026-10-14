// Server-only booking logic shared by the checkout routes (and the webhook later).
//
// The flow:
//   1. createHold()      saves the booking in the calendar as UNPAID and holds the spot
//   2. the parent pays on Yoco's page
//   3. confirmPayment()  asks Yoco if it was paid, then marks the booking PAID and sends the emails
//
// An unpaid hold stops counting after HOLD_MINUTES (see availability.js), so an
// abandoned payment never blocks a spot for long.

import { getCalendarClient } from "./googlecalendar";
import { todayInSA, addDays } from "./availability";
import {
  LOCATIONS,
  TIMEZONE,
  CLASS_DURATION_MINUTES,
  WEEKS,
} from "./classconfig";
import { getCheckout } from "./yoco";
import { sendBookingEmails } from "./email";

export const AMOUNT_IN_CENTS = 100000; // R1000 for the 5 classes
export const PRICE_LABEL = "R1000";
export const HOLD_MINUTES = 30; // how long a spot is held while the parent pays

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s\-()]{7,19}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");

/* ---------- Small helpers ---------- */

// True only for real "YYYY-MM-DD" dates (rejects things like 2026-02-31)
function isRealDate(str) {
  if (!DATE_PATTERN.test(str)) return false;
  const d = new Date(`${str}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

// Whole months between two "YYYY-MM-DD" dates (earlier first)
function monthsBetween(fromStr, toStr) {
  const [fy, fm, fd] = fromStr.split("-").map(Number);
  const [ty, tm, td] = toStr.split("-").map(Number);
  let months = (ty - fy) * 12 + (tm - fm);
  if (td < fd) months -= 1;
  return months;
}

function formatAge(months) {
  if (months < 1) return "under 1 month";
  return months === 1 ? "1 month" : `${months} months`;
}

// "2026-05-12" -> "12 May 2026"
function formatDob(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// "08:00" + 60 minutes -> "09:00"
function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

const saTime = (ms) =>
  new Date(ms).toLocaleTimeString("en-ZA", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  });

const saDateTime = () =>
  new Date().toLocaleString("en-ZA", { timeZone: TIMEZONE });

/* ---------- Validation ---------- */

// Checks and cleans everything the parent typed.
// Returns { data } when it is fine, or { error } with a message for the parent.
export function validateDetails(body) {
  const parentName = text(body.parentName);
  const relationship = text(body.relationship);
  const phone = text(body.phone);
  const email = text(body.email);
  const babyName = text(body.babyName);
  const babyDob = text(body.babyDob);
  const preferredName = text(body.preferredName);
  const medicalNotes = text(body.medicalNotes);
  const doctorName = text(body.doctorName);
  const doctorPhone = text(body.doctorPhone);

  // A consent is only ever "yes" when the box was really ticked
  const hasHealthConditions = body.hasHealthConditions === true;
  const productConsent = body.productConsent === true;
  const photoConsent = body.photoConsent === true;

  if (body.acceptTerms !== true) {
    return { error: "Please accept the Terms and Conditions to continue." };
  }
  if (parentName.length < 2 || parentName.length > 100) {
    return { error: "Please enter the parent or guardian's full name." };
  }
  if (relationship.length < 2 || relationship.length > 50) {
    return { error: "Please enter your relationship to the baby." };
  }
  if (!PHONE_PATTERN.test(phone)) {
    return { error: "Please enter a valid cellphone number." };
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (babyName.length < 2 || babyName.length > 100) {
    return { error: "Please enter your baby's full name." };
  }
  if (!isRealDate(babyDob) || babyDob > todayInSA()) {
    return { error: "Please enter your baby's date of birth." };
  }
  if (preferredName.length > 100) {
    return { error: "The preferred name is too long." };
  }
  if (
    hasHealthConditions &&
    (medicalNotes.length < 3 || medicalNotes.length > 1000)
  ) {
    return {
      error:
        "Please describe your baby's health condition, allergy or special consideration.",
    };
  }
  if (doctorName.length > 100) {
    return { error: "The medical practitioner's name is too long." };
  }
  if (doctorPhone && !PHONE_PATTERN.test(doctorPhone)) {
    return {
      error:
        "Please enter a valid medical practitioner contact number, or leave it empty.",
    };
  }

  return {
    data: {
      parentName,
      relationship,
      phone,
      email,
      babyName,
      babyDob,
      preferredName,
      hasHealthConditions,
      // health details are only kept when the parent said there is something to tell
      medicalNotes: hasHealthConditions ? medicalNotes : "",
      doctorName: hasHealthConditions ? doctorName : "",
      doctorPhone: hasHealthConditions ? doctorPhone : "",
      productConsent,
      photoConsent,
    },
  };
}

/* ---------- 1. Hold the spot (UNPAID) ---------- */

function buildDescription({ details, location, firstDay, bookingId, holdUntil }) {
  const babyAge = formatAge(monthsBetween(details.babyDob, firstDay));

  return [
    // The first line is rewritten when the payment is confirmed
    `PAYMENT: PENDING - not paid yet (spot held until ${saTime(holdUntil)})`,
    "",
    `Parent / guardian: ${details.parentName} (${details.relationship})`,
    `Phone: ${details.phone}`,
    `Email: ${details.email}`,
    "",
    `Baby: ${details.babyName}${
      details.preferredName ? ` (preferred name: ${details.preferredName})` : ""
    }`,
    `Date of birth: ${formatDob(details.babyDob)} (${babyAge} at the first class)`,
    "",
    details.hasHealthConditions
      ? `HEALTH / ALLERGIES / SPECIAL CONSIDERATIONS:\n${details.medicalNotes}`
      : "Health conditions: none disclosed",
    ...(details.hasHealthConditions && (details.doctorName || details.doctorPhone)
      ? [
          `Medical practitioner: ${[details.doctorName, details.doctorPhone]
            .filter(Boolean)
            .join(", ")}`,
        ]
      : []),
    "",
    `Topical products / oils: ${
      details.productConsent ? "consent given" : "NO CONSENT - do not use"
    }`,
    `Photo/video consent: ${details.photoConsent ? "YES" : "No"}`,
    `Terms & Conditions and Privacy Policy accepted: ${saDateTime()}`,
    "",
    `${WEEKS} weekly classes starting ${firstDay}`,
    `Booking ID: ${bookingId}`,
    "",
    "To cancel this booking, delete the whole series (all events).",
  ].join("\n");
}

// Saves ONE weekly repeating event (5 weeks), marked UNPAID, so the spot is held while the parent pays.
export async function createHold({
  client,
  location,
  time,
  firstDay,
  details,
  bookingId,
  checkoutId,
}) {
  const { calendar, calendarId } = client;
  const holdUntil = Date.now() + HOLD_MINUTES * 60 * 1000;
  const endTime = addMinutes(time.id, CLASS_DURATION_MINUTES);

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `[UNPAID] ${details.parentName} - Baby massage (${location.name})`,
      description: buildDescription({
        details,
        location,
        firstDay,
        bookingId,
        holdUntil,
      }),
      start: { dateTime: `${firstDay}T${time.id}:00`, timeZone: TIMEZONE },
      end: { dateTime: `${firstDay}T${endTime}:00`, timeZone: TIMEZONE },
      recurrence: [`RRULE:FREQ=WEEKLY;COUNT=${WEEKS}`],
      // The availability route counts bookings using these tags.
      // The contact details are kept here so the confirmation email can be sent after payment.
      extendedProperties: {
        private: {
          location: location.id,
          slot: time.id,
          bookingId,
          checkoutId,
          payment: "pending",
          holdUntil: String(holdUntil),
          parentName: details.parentName,
          parentEmail: details.email,
          parentPhone: details.phone,
          productConsent: String(details.productConsent),
          photoConsent: String(details.photoConsent),
          termsAccepted: "true",
        },
      },
    },
  });
}

/* ---------- 2. Confirm the payment ---------- */

// Finds the repeating event (the whole series) for a booking
async function findBooking(client, bookingId) {
  const { calendar, calendarId } = client;
  const { data } = await calendar.events.list({
    calendarId,
    privateExtendedProperty: [`bookingId=${bookingId}`],
    singleEvents: false, // we want the series itself, not each week
    maxResults: 5,
  });
  return (data.items ?? []).find((e) => e.status !== "cancelled") ?? null;
}

/*
  Asks Yoco what really happened and updates the booking.
  Safe to call more than once (the return page, and the webhook later).

  Returns { status, parentName, email, emailSent } where status is:
    "paid"        payment confirmed, booking is final
    "processing"  Yoco is still processing the payment
    "pending"     not paid (yet)
    "released"    not paid and the held spot was given back (only when release is true)
    "not_found"   no booking with that ID
    "unknown"     we could not reach Yoco, try again
*/
export async function confirmPayment(bookingId, { release = false } = {}) {
  const client = getCalendarClient();
  const { calendar, calendarId } = client;

  const event = await findBooking(client, bookingId);
  if (!event) return { status: "not_found" };

  const props = event.extendedProperties?.private ?? {};
  const who = { parentName: props.parentName ?? "", email: props.parentEmail ?? "" };

  // Already confirmed earlier: do nothing again (no second email)
  if (props.payment === "paid") {
    return {
      status: "paid",
      ...who,
      emailSent: props.emailSent === "true" ? true : null,
    };
  }

  let checkout;
  try {
    checkout = await getCheckout(props.checkoutId);
  } catch (err) {
    console.error("Could not read the Yoco checkout:", err);
    return { status: "unknown", ...who };
  }

  // ---- Paid ----
  if (checkout.status === "completed") {
    const paymentId = String(checkout.paymentId ?? checkout.id ?? "");
    const lines = (event.description ?? "").split("\n");
    lines[0] = `PAYMENT: PAID ${PRICE_LABEL} via Yoco on ${saDateTime()} (payment ${paymentId})`;

    // Mark it paid first, so a second call does not send the emails again
    await calendar.events.patch({
      calendarId,
      eventId: event.id,
      requestBody: {
        summary: (event.summary ?? "").replace(/^\[UNPAID\]\s*/, ""),
        description: lines.join("\n"),
        extendedProperties: {
          private: { ...props, payment: "paid", paymentId },
        },
      },
    });

    const location = LOCATIONS[props.location];
    const time = location?.times.find((t) => t.id === props.slot);
    const firstDay = event.start.dateTime.slice(0, 10);
    const classDates = Array.from({ length: WEEKS }, (_, i) =>
      addDays(firstDay, i * 7)
    );

    // A failed email must never undo a paid booking
    let emailSent = false;
    try {
      const sent = await sendBookingEmails({
        bookingId,
        customer: {
          name: props.parentName,
          email: props.parentEmail,
          phone: props.parentPhone,
        },
        location,
        time,
        classDates,
      });
      emailSent = sent.customerSent;
    } catch (err) {
      console.error("Email error:", err);
    }

    try {
      await calendar.events.patch({
        calendarId,
        eventId: event.id,
        requestBody: {
          extendedProperties: {
            private: {
              ...props,
              payment: "paid",
              paymentId,
              emailSent: String(emailSent),
            },
          },
        },
      });
    } catch (err) {
      console.error("Could not save the email result:", err);
    }

    return { status: "paid", ...who, emailSent };
  }

  // ---- Not paid ----
  if (checkout.status === "processing") return { status: "processing", ...who };

  // The parent cancelled or the payment failed: give the held spot back
  if (release && checkout.status !== "refunded") {
    await calendar.events.delete({ calendarId, eventId: event.id });
    return { status: "released", ...who };
  }

  return { status: "pending", ...who };
}