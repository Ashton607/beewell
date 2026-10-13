import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCalendarClient } from "@/lib/googlecalendar";
import { validateSlot, getAvailability } from "@/lib/availability";
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

  1. Validates everything on the server
  2. Re-checks availability for all 5 weeks
  3. Creates ONE weekly repeating calendar event (5 weeks) with full details
  4. Sends the confirmation emails with Resend
*/

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s\-()]{7,19}$/;

function validateCustomer(body) {
  if (typeof body.parentName !== "string" || body.parentName.trim().length < 2 || body.parentName.length > 100) {
    return "Please enter the parent/guardian name.";
  }
  if (typeof body.relationship !== "string" || body.relationship.trim().length < 2) {
    return "Please specify your relationship to the baby.";
  }
  if (
    typeof body.email !== "string" ||
    body.email.length > 254 ||
    !EMAIL_PATTERN.test(body.email.trim())
  ) {
    return "Please enter a valid email address.";
  }
  if (typeof body.phone !== "string" || !PHONE_PATTERN.test(body.phone.trim())) {
    return "Please enter a valid phone number.";
  }
  if (typeof body.babyName !== "string" || body.babyName.trim().length < 2) {
    return "Please enter the baby's full name.";
  }
  if (typeof body.babyDob !== "string" || !body.babyDob.trim()) {
    return "Please enter the baby's date of birth.";
  }
  if (!body.acceptTerms) {
    return "You must accept the Terms and Conditions to book.";
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

  const validationError = validateCustomer(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const customer = {
    parentName: body.parentName.trim(),
    relationship: body.relationship.trim(),
    phone: body.phone.trim(),
    email: body.email.trim(),
    babyName: body.babyName.trim(),
    babyDob: body.babyDob.trim(),
    preferredName: body.preferredName ? body.preferredName.trim() : "",
    hasHealthConditions: Boolean(body.hasHealthConditions),
    medicalNotes: body.medicalNotes ? body.medicalNotes.trim() : "None reported",
    doctorName: body.doctorName ? body.doctorName.trim() : "Not provided",
    doctorPhone: body.doctorPhone ? body.doctorPhone.trim() : "Not provided",
    productConsent: Boolean(body.productConsent),
    photoConsent: Boolean(body.photoConsent),
    acceptTerms: Boolean(body.acceptTerms),
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

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${customer.parentName} & ${customer.babyName} - Baby Massage (${location.name})`,
        description: [
          `--- Parent Details ---`,
          `Parent: ${customer.parentName} (${customer.relationship})`,
          `Email: ${customer.email}`,
          `Phone: ${customer.phone}`,
          ``,
          `--- Baby Details ---`,
          `Baby Name: ${customer.babyName}${customer.preferredName ? `(Preferred: ${customer.preferredName})` : ""}`,
          `Date of Birth: ${customer.babyDob}`,
          `Health Conditions/Allergies Reported: ${customer.hasHealthConditions ? "Yes" : "No"}`,
          `Health Details: ${customer.medicalNotes}`,
          `Medical Practitioner: ${customer.doctorName} (${customer.doctorPhone})`,
          ``,
          `--- Consents & Terms ---`,
          `Topical Products Consent: ${customer.productConsent ? "Yes" : "No"}`,
          `Marketing Photo/Video Consent: ${customer.photoConsent ? "Yes" : "No"}`,
          `Terms & Conditions Accepted: ${customer.acceptTerms ? "Yes" : "No"}`,
          ``,
          `${WEEKS} weekly classes starting ${firstDay}`,
          `Booking ID: ${bookingId}`,
          "",
          "To cancel this booking, delete the whole series (all events).",
        ].join("\n"),
        start: { dateTime: `${firstDay}T${time.id}:00`, timeZone: TIMEZONE },
        end: { dateTime: `${firstDay}T${endTime}:00`, timeZone: TIMEZONE },
        recurrence: [`RRULE:FREQ=WEEKLY;COUNT=${WEEKS}`],
        extendedProperties: {
          private: { location: location.id, slot: time.id, bookingId },
        },
      },
    });

    // ---- Send emails ----
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