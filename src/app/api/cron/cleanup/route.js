import { NextResponse } from "next/server";
import { cleanupUnpaidHolds } from "@/lib/booking";

/*
  GET /api/cron/cleanup
  Called once a day by Vercel Cron (see vercel.json). It removes unpaid
  [UNPAID] calendar events whose payment never happened.

  Needs CRON_SECRET in the Vercel environment variables. Vercel then sends it
  automatically, and anyone without it is turned away.
*/

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Cleanup: CRON_SECRET is missing");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const summary = await cleanupUnpaidHolds();
    console.log("Cleanup finished", summary);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json({ error: "Cleanup failed." }, { status: 500 });
  }
}