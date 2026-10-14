import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCalendarClient } from "@/lib/googlecalendar";
import { validateSlot, getAvailability } from "@/lib/availability";
import { createCheckout } from "@/lib/yoco";
import {
  AMOUNT_IN_CENTS,
  HOLD_MINUTES,
  validateDetails,
  createHold,
} from "@/lib/booking";

/*
  POST /api/checkout
  Body: the same fields the booking form sends
    { location, date, time, parentName, ..., acceptTerms }

  1. Validates everything on the server
  2. Re-checks that the spot is still free
  3. Creates a Yoco checkout (R1000)
  4. Holds the spot in the calendar as UNPAID
  5. Returns the Yoco page address so the browser can send the parent there
*/

export async function POST(request) {
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

  if (body.acceptTerms !== true) {
    return NextResponse.json(
      { error: "Please accept the Terms and Conditions to continue." },
      { status: 400 }
    );
  }

  try {
    const client = getCalendarClient();

    // Make sure nobody grabbed the spot in the meantime
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

    const bookingId = randomUUID();
    const firstDay = classDates[0];

    // Where Yoco sends the parent back to (set SITE_URL in .env.local / Vercel)
    const siteUrl = (
      process.env.SITE_URL || new URL(request.url).origin
    ).replace(/\/+$/, "");
    const back = (payment) =>
      `${siteUrl}/book?payment=${payment}&ref=${bookingId}`;

    // Only non-personal details go to Yoco
    const checkout = await createCheckout({
      amountInCents: AMOUNT_IN_CENTS,
      metadata: {
        bookingId,
        location: location.id,
        firstClass: firstDay,
        time: time.id,
      },
      successUrl: back("success"),
      cancelUrl: back("cancelled"),
      failureUrl: back("failed"),
      idempotencyKey: bookingId,
    });

    await createHold({
      client,
      location,
      time,
      firstDay,
      details,
      bookingId,
      checkoutId: checkout.id,
    });

    return NextResponse.json({
      ok: true,
      bookingId,
      redirectUrl: checkout.redirectUrl,
      holdMinutes: HOLD_MINUTES,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again." },
      { status: 500 }
    );
  }
}