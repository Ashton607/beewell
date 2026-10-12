import { Resend } from "resend";
import { layout, row, escapeHtml } from "./email";

// Server-only. Uses its own API key so contact emails are separate from booking emails.
// Needs RESEND_CONTACT_API_KEY, RESEND_FROM_EMAIL and OWNER_EMAIL in .env.local

export async function sendContactEmail({
  name,
  email,
  phone,
  enquiryLabel,
  message,
}) {
  const apiKey = process.env.RESEND_CONTACT_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const owner = process.env.OWNER_EMAIL;

  if (!apiKey || !from || !owner) {
    console.error(
      "Contact email is not configured (RESEND_CONTACT_API_KEY / RESEND_FROM_EMAIL / OWNER_EMAIL)"
    );
    return false;
  }

  const html = layout(
    "New message from the website",
    `${escapeHtml(name)} sent an enquiry about <strong>${escapeHtml(enquiryLabel)}</strong>. Reply to this email to answer them directly.`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf8ec;border-radius:14px;padding:8px 16px;margin-bottom:16px;">
      ${row("Name", name)}
      ${row("Email", email)}
      ${row("Phone", phone || "Not provided")}
      ${row("Enquiry", enquiryLabel)}
    </table>
    <p style="margin:0 0 6px;font-weight:bold;color:#2b2b2b;">Message</p>
    <div style="background:#cfe3c3;border-radius:14px;padding:14px 16px;font-size:15px;line-height:1.5;color:#2b2b2b;">
      ${escapeHtml(message).replace(/\n/g, "<br>")}
    </div>`
  );

  const text = [
    `New message from ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Enquiry: ${enquiryLabel}`,
    "",
    message,
  ].join("\n");

  const resend = new Resend(apiKey);

  // Resend returns { data, error } instead of throwing
  const { error } = await resend.emails.send({
    from,
    to: owner,
    replyTo: email, // hitting "Reply" answers the customer
    subject: `New enquiry (${enquiryLabel}): ${name}`,
    html,
    text,
  });

  if (error) {
    console.error("Resend contact error:", error);
    return false;
  }

  return true;
}