import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/yoco";
import { findBookingIdByCheckout, confirmPayment } from "@/lib/booking";

/*
  POST /api/webhooks/yoco
  Yoco calls this by itself when a payment succeeds, so a booking is still
  confirmed even if the parent closes the browser on Yoco's page.

  Register it in Postman (see the steps in the chat), then put the returned
  secret in .env.local as YOCO_WEBHOOK_SECRET.
*/

export async function POST(request) {
  // The signature is calculated on the raw text, so read it before parsing
  const rawBody = await request.text();

  let valid = false;
  try {
    valid = verifyWebhook(rawBody, request.headers);
  } catch (err) {
    console.error("Webhook setup error:", err);
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  // We only act on successful payments; acknowledge everything else
  if (event.type !== "payment.succeeded") {
    return NextResponse.json({ received: true });
  }

  const checkoutId = event.payload?.metadata?.checkoutId;
  if (!checkoutId) {
    console.error("Webhook: payment.succeeded without a checkoutId", event.id);
    return NextResponse.json({ received: true });
  }

  try {
    const bookingId = await findBookingIdByCheckout(checkoutId);
    if (!bookingId) {
      // Not one of our bookings (or already removed): nothing to do, don't make Yoco retry
      console.error("Webhook: no booking for checkout", checkoutId);
      return NextResponse.json({ received: true });
    }

    // Re-checks with Yoco, marks the booking paid and sends the emails (only once)
    const result = await confirmPayment(bookingId);
    console.log("Webhook confirmed", bookingId, result.status);
    return NextResponse.json({ received: true });
  } catch (err) {
    // A real error: answer 500 so Yoco tries again later
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Could not process." }, { status: 500 });
  }
}