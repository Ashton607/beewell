import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only helpers for the Yoco Checkout API.
// Needs YOCO_SECRET_KEY in .env.local (use your TEST secret key while testing).
// Never import this file in a client component.

const YOCO_URL = "https://payments.yoco.com/api/checkouts";

function authHeaders() {
  const key = process.env.YOCO_SECRET_KEY;
  if (!key) throw new Error("YOCO_SECRET_KEY is missing");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

/*
  Creates a Yoco checkout and returns where to send the customer.
  `amountInCents` is the final charge (R1000 = 100000).
  `idempotencyKey` lets us safely retry without creating two checkouts.
*/
export async function createCheckout({
  amountInCents,
  metadata,
  successUrl,
  cancelUrl,
  failureUrl,
  idempotencyKey,
}) {
  const res = await fetch(YOCO_URL, {
    method: "POST",
    headers: {
      ...authHeaders(),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({
      amount: amountInCents,
      currency: "ZAR",
      successUrl,
      cancelUrl,
      failureUrl,
      metadata,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.id || !data.redirectUrl) {
    throw new Error(
      `Yoco could not create the checkout (HTTP ${res.status}): ${JSON.stringify(data)}`
    );
  }

  return { id: data.id, redirectUrl: data.redirectUrl };
}

/*
  Asks Yoco for the real state of a checkout. Statuses we expect:
  created, started, processing, completed, refunded.
  We use this (not the browser redirect) to decide whether a payment really went through.
*/
export async function getCheckout(checkoutId) {
  const res = await fetch(`${YOCO_URL}/${encodeURIComponent(checkoutId)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Yoco could not return the checkout (HTTP ${res.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

/*
  Checks that a webhook really came from Yoco (and was not replayed).
  Needs YOCO_WEBHOOK_SECRET (the "whsec_..." value Yoco returns when you register the webhook).
  `rawBody` must be the untouched request text, `headers` the request headers.
*/
export function verifyWebhook(rawBody, headers) {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) throw new Error("YOCO_WEBHOOK_SECRET is missing");

  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  // Reject old or far-future messages (3 minute window)
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 180) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest();

  // The header can hold several "v1,<signature>" entries
  return signatureHeader.split(" ").some((entry) => {
    const sig = Buffer.from(entry.split(",")[1] ?? "", "base64");
    return sig.length === expected.length && timingSafeEqual(sig, expected);
  });
}