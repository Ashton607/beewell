import { NextResponse } from "next/server";
import { ENQUIRY_TYPES } from "@/lib/classconfig";
import { sendContactEmail } from "@/lib/contactEmail";

// POST /api/contact
// Body: { name, email, phone?, enquiryType, message, website }
// `website` is a hidden spam trap: humans leave it empty.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s\-()]{7,19}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Spam bots fill in the hidden field. Pretend it worked and send nothing.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const enquiry = ENQUIRY_TYPES.find((t) => t.value === body.enquiryType);

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number, or leave it empty." },
      { status: 400 }
    );
  }
  if (!enquiry) {
    return NextResponse.json(
      { error: "Please choose a type of enquiry." },
      { status: 400 }
    );
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json(
      { error: "Please write a message of at least 10 characters." },
      { status: 400 }
    );
  }

  try {
    const sent = await sendContactEmail({
      name,
      email,
      phone,
      enquiryLabel: enquiry.label,
      message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "We couldn't send your message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again." },
      { status: 500 }
    );
  }
}