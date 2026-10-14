import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/booking";

/*
  POST /api/checkout/confirm
  Body: { bookingId, release? }

  Called by the booking page when the parent comes back from Yoco.
  It asks Yoco whether the payment really happened (the browser address
  alone is never trusted) and, if so, marks the booking as paid and sends
  the emails. Safe to call more than once.

  release: true  -> the parent cancelled or the payment failed, so free the spot
                    (only happens if the payment is not completed).
*/

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  if (!UUID_PATTERN.test(bookingId)) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  try {
    const result = await confirmPayment(bookingId, {
      release: body.release === true,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Confirm payment error:", err);
    return NextResponse.json(
      { error: "We couldn't check your payment. Please try again." },
      { status: 500 }
    );
  }
}