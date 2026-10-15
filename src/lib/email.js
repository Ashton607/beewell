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

export const escapeHtml = (value) =>
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

// "2026-05-12" -> "12 May 2026"
function formatDob(dateStr) {
  if (!dateStr) return "Not given";
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;color:${C.green};font-weight:bold;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;text-align:right;color:${C.ink};font-weight:bold;">${escapeHtml(value)}</td>
  </tr>`;
}

export function layout(title, intro, bodyHtml) {
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
          Nurturing touch. Bond &bull; Relax &bull; Grow
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function customerEmail({ customer, baby, location, time, classDates }) {
  const dates = classDates
    .map((d, i) => row(`Week ${i + 1}`, formatDate(d)))
    .join("");

  const html = layout(
    "Your booking is confirmed",
    `Hi ${escapeHtml(customer.name)}, thank you for booking! We&rsquo;re looking forward to seeing you and your little one.`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${row("Baby", baby.preferredName || baby.name)}
      ${row("Location", location.name)}
      ${row("Time", `${time.label}, every ${location.dayName}`)}
      ${row("Classes", `${WEEKS} weekly classes`)}
      ${row("Total", PRICE)}
    </table>
    <p style="margin:0 0 6px;font-weight:bold;color:${C.ink};">Your class dates</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sage};border-radius:14px;padding:8px 16px;margin-bottom:20px;">
      ${dates}
    </table>
    <p style="margin:0;font-size:14px;line-height:1.5;">Need to change something, or has anything changed with your baby&rsquo;s health? Just reply to this email.</p>`
  );

  const text = [
    `Hi ${customer.name},`,
    "",
    "Your BeeWell baby massage booking is confirmed.",
    "",
    `Baby: ${baby.preferredName || baby.name}`,
    `Location: ${location.name}`,
    `Time: ${time.label}, every ${location.dayName}`,
    `Total: ${PRICE} for ${WEEKS} classes`,
    "",
    "Your class dates:",
    ...classDates.map((d, i) => `Week ${i + 1}: ${formatDate(d)}`),
    "",
    "Need to change something, or has anything changed with your baby's health? Just reply to this email.",
  ].join("\n");

  return {
    subject: "Your BeeWell baby massage booking is confirmed",
    html,
    text,
  };
}

function notesBlock(label, value) {
  return `<p style="margin:0 0 6px;font-weight:bold;color:${C.ink};">${escapeHtml(label)}</p>
    <div style="background:#ffffff;border-radius:12px;padding:12px 14px;font-size:15px;line-height:1.5;color:${C.ink};margin-bottom:12px;">
      ${escapeHtml(value).replace(/\n/g, "<br>")}
    </div>`;
}

function ownerEmail({
  bookingId,
  customer,
  baby,
  health,
  consents,
  location,
  time,
  classDates,
}) {
  const dates = classDates
    .map((d, i) => row(`Week ${i + 1}`, formatDate(d)))
    .join("");

  const babyLabel = baby.preferredName
    ? `${baby.name} (${baby.preferredName})`
    : baby.name;
  const dobLabel = `${formatDob(baby.dob)}${
    baby.ageAtFirstClass ? ` (${baby.ageAtFirstClass} at first class)` : ""
  }`;

  const healthHtml = health.noted
    ? `<div style="background:#f7b8a8;border-radius:14px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0 0 8px;font-weight:bold;color:#7a2f1d;">Health information noted by the parent</p>
        ${
          health.notes
            ? notesBlock("Details", health.notes)
            : `<p style="margin:0 0 8px;font-size:14px;color:#7a2f1d;">No details were added.</p>`
        }
        ${
          health.doctorName || health.doctorPhone
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${health.doctorName ? row("Medical practitioner", health.doctorName) : ""}
                ${health.doctorPhone ? row("Practitioner contact", health.doctorPhone) : ""}
              </table>`
            : ""
        }
        <p style="margin:8px 0 0;font-size:13px;color:#7a2f1d;">You may want to ask for medical clearance before the first class (see the Terms).</p>
      </div>`
    : "";

  const html = layout(
    "New booking",
    `${escapeHtml(customer.name)} just booked ${escapeHtml(location.name)}, ${escapeHtml(time.label)}, for baby ${escapeHtml(baby.name)}.`,
    `${healthHtml}
    <p style="margin:0 0 6px;font-weight:bold;color:${C.ink};">Parent / legal guardian</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${row("Name", customer.name)}
      ${row("Relationship", customer.relationship)}
      ${row("Email", customer.email)}
      ${row("Phone", customer.phone)}
    </table>
    <p style="margin:0 0 6px;font-weight:bold;color:${C.ink};">Baby</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${row("Name", babyLabel)}
      ${row("Date of birth", dobLabel)}
      ${row("Oils and lotions", consents.productConsent ? "Consent given" : "NOT allowed")}
      ${row("Photos and videos", consents.photoConsent ? "Consent given" : "No consent")}
    </table>
    <p style="margin:0 0 6px;font-weight:bold;color:${C.ink};">Class</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sage};border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${row("Location", location.name)}
      ${row("Time", `${time.label}, every ${location.dayName}`)}
      ${dates}
    </table>
    <p style="margin:0;font-size:12px;color:${C.green};">Booking ID: ${escapeHtml(bookingId)}</p>`
  );

  const text = [
    `New booking: ${customer.name} (${customer.relationship}) for baby ${babyLabel}`,
    `Email: ${customer.email}`,
    `Phone: ${customer.phone}`,
    `Baby date of birth: ${dobLabel}`,
    `Oils and lotions: ${consents.productConsent ? "consent given" : "NOT allowed"}`,
    `Photos and videos: ${consents.photoConsent ? "consent given" : "no consent"}`,
    "",
    ...(health.noted
      ? [
          "HEALTH INFORMATION NOTED BY THE PARENT",
          `Details: ${health.notes || "none added"}`,
          ...(health.doctorName ? [`Medical practitioner: ${health.doctorName}`] : []),
          ...(health.doctorPhone ? [`Practitioner contact: ${health.doctorPhone}`] : []),
          "",
        ]
      : []),
    `${location.name}, ${time.label}, every ${location.dayName}`,
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