import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCalendarClient } from "@/lib/googlecalendar";
import { validateSlot, getAvailability, todayInSA } from "@/lib/availability";
import { TIMEZONE, CLASS_DURATION_MINUTES, WEEKS } from "@/lib/classconfig";
import { sendBookingEmails } from "@/lib/email";

/*
  POST /api/book
  Body: {
    location, date, time,
    parentName, relationship, phone, email,
    babyName, babyDob, preferredName,
    hasHealthConditions, medicalNotes, doctorName, doctorPhone,
    productConsent, photoConsent, acceptTerms
  }

  1. Validates everything on the server (never trust the browser)
  2. Re-checks availability for all 5 weeks
  3. Creates ONE weekly repeating calendar event (5 weeks)
  4. Sends the confirmation emails with Resend
*/

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s\-()]{7,19}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");

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

// "Under 1 month", "1 month", "5 months"
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

// Checks and cleans the parent and baby details.
// Returns { data } when everything is fine, or { error } with a message for the parent.
function validateDetails(body) {
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

  // Consent is only ever "yes" when the box was really ticked
  const hasHealthConditions = body.hasHealthConditions === true;
  const productConsent = body.productConsent === true;
  const photoConsent = body.photoConsent === true;

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
  if (hasHealthConditions && (medicalNotes.length < 3 || medicalNotes.length > 1000)) {
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

  const { data: details, error: detailsError } = validateDetails(body);
  if (detailsError) {
    return NextResponse.json({ error: detailsError }, { status: 400 });
  }

  // The Terms and Conditions must have been accepted (checked here as well as in the form)
  if (body.acceptTerms !== true) {
    return NextResponse.json(
      { error: "Please accept the Terms and Conditions to continue." },
      { status: 400 }
    );
  }

  // The confirmation and owner emails use these three fields
  const customer = {
    name: details.parentName,
    email: details.email,
    phone: details.phone,
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

    // ---- Create ONE weekly repeating event (first class + 4 more weeks) ----
    const bookingId = randomUUID();
    const firstDay = classDates[0];
    const endTime = addMinutes(time.id, CLASS_DURATION_MINUTES);
    const babyAge = formatAge(monthsBetween(details.babyDob, firstDay));
    const acceptedAt = new Date().toLocaleString("en-ZA", {
      timeZone: TIMEZONE,
    });

    const description = [
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
      `Terms & Conditions and Privacy Policy accepted: ${acceptedAt}`,
      "",
      `${WEEKS} weekly classes starting ${firstDay}`,
      `Booking ID: ${bookingId}`,
      "",
      "To cancel this booking, delete the whole series (all events).",
    ].join("\n");

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${details.parentName} - Baby massage (${location.name})`,
        description,
        start: { dateTime: `${firstDay}T${time.id}:00`, timeZone: TIMEZONE },
        end: { dateTime: `${firstDay}T${endTime}:00`, timeZone: TIMEZONE },
        recurrence: [`RRULE:FREQ=WEEKLY;COUNT=${WEEKS}`],
        // The availability route counts bookings using these tags
        extendedProperties: {
          private: {
            location: location.id,
            slot: time.id,
            bookingId,
            productConsent: String(details.productConsent),
            photoConsent: String(details.photoConsent),
            termsAccepted: "true",
          },
        },
      },
    });

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