import { Resend } from "resend";
import { WEEKS, PRICE } from "./classconfig";

// Server-only. Needs RESEND_API_KEY, RESEND_FROM_EMAIL and OWNER_EMAIL in .env.local

// Theme colours (same as the website)
const C = {
  cream: "#fbf8ec",
  honey: "#f6c945",
  sage: "#cfe3c3",
  green: "#4f7a5a",
  ink: "#2b2b2b",
  navy: "#1f3a6b",
};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

// "2026-10-16" -> "Friday, 16 October 2026"
function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;color:${C.green};font-weight:bold;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;text-align:right;color:${C.ink};font-weight:bold;">${escapeHtml(value)}</td>
  </tr>`;
}

function layout(title, intro, bodyHtml) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px 12px;background:${C.cream};font-family:Arial,Helvetica,sans-serif;color:${C.navy};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
      <tr>
        <td style="background:${C.honey};padding:24px;text-align:center;">
          <div style="font-size:26px;font-weight:bold;color:${C.ink};">BeeWell <span style="font-weight:normal;">Infant Spa</span></div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:${C.ink};">${escapeHtml(title)}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">${intro}</p>
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="background:${C.sage};padding:14px 24px;text-align:center;font-size:13px;color:${C.green};">
          Gentle touch. Big benefits. Bond &bull; Relax &bull; Grow
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function customerEmail({ customer, location, time, classDates }) {
  const dates = classDates
    .map((d, i) => row(`Week ${i + 1}`, formatDate(d)))
    .join("");

  const html = layout(
    "Your booking is confirmed",
    `Hi ${escapeHtml(customer.name)}, thank you for booking! We&rsquo;re looking forward to seeing you and your little one.`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${row("Location", location.name)}
      ${row("Time", `${time.label}, every ${location.dayName}`)}
      ${row("Classes", `${WEEKS} weekly classes`)}
      ${row("Total", PRICE)}
    </table>
    <p style="margin:0 0 6px;font-weight:bold;color:${C.ink};">Your class dates</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sage};border-radius:14px;padding:8px 16px;margin-bottom:20px;">
      ${dates}
    </table>
    <p style="margin:0;font-size:14px;line-height:1.5;">Need to change something? Just reply to this email.</p>`
  );

  const text = [
    `Hi ${customer.name},`,
    "",
    "Your BeeWell baby massage booking is confirmed.",
    "",
    `Location: ${location.name}`,
    `Time: ${time.label}, every ${location.dayName}`,
    `Total: ${PRICE} for ${WEEKS} classes`,
    "",
    "Your class dates:",
    ...classDates.map((d, i) => `Week ${i + 1}: ${formatDate(d)}`),
    "",
    "Need to change something? Just reply to this email.",
  ].join("\n");

  return {
    subject: "Your BeeWell baby massage booking is confirmed",
    html,
    text,
  };
}

function ownerEmail({ bookingId, customer, location, time, classDates }) {
  const dates = classDates
    .map((d, i) => row(`Week ${i + 1}`, formatDate(d)))
    .join("");

  const html = layout(
    "New booking",
    `${escapeHtml(customer.name)} just booked ${escapeHtml(location.name)}, ${escapeHtml(time.label)}.`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${row("Name", customer.name)}
      ${row("Email", customer.email)}
      ${row("Phone", customer.phone)}
      ${row("Location", location.name)}
      ${row("Time", `${time.label}, every ${location.dayName}`)}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sage};border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${dates}
    </table>
    <p style="margin:0;font-size:12px;color:${C.green};">Booking ID: ${escapeHtml(bookingId)}</p>`
  );

  const text = [
    `New booking: ${customer.name}`,
    `Email: ${customer.email}`,
    `Phone: ${customer.phone}`,
    `${location.name}, ${time.label}, every ${location.dayName}`,
    "",
    ...classDates.map((d, i) => `Week ${i + 1}: ${formatDate(d)}`),
    "",
    `Booking ID: ${bookingId}`,
  ].join("\n");

  return {
    subject: `New booking: ${customer.name} (${location.name}, ${time.label})`,
    html,
    text,
  };
}

async function send(resend, message) {
  // Resend returns { data, error } instead of throwing
  const { error } = await resend.emails.send(message);
  if (error) {
    console.error("Resend error:", error);
    return false;
  }
  return true;
}

export async function sendBookingEmails(booking) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const owner = process.env.OWNER_EMAIL;

  if (!apiKey || !from) {
    console.error("Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)");
    return { customerSent: false, ownerSent: false };
  }

  const resend = new Resend(apiKey);

  const [customerSent, ownerSent] = await Promise.all([
    send(resend, {
      from,
      to: booking.customer.email,
      replyTo: owner || undefined,
      ...customerEmail(booking),
    }),
    owner
      ? send(resend, {
          from,
          to: owner,
          replyTo: booking.customer.email,
          ...ownerEmail(booking),
        })
      : Promise.resolve(false),
  ]);

  return { customerSent, ownerSent };
}