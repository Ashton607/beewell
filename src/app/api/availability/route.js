import { NextResponse } from "next/server";
import { validateSlot, getAvailability } from "@/lib/availability";
import { CAPACITY } from "@/lib/classconfig";

// GET /api/availability?location=douglas&date=2026-10-16
// `date` is the FIRST class. A time only has room if there is space on all 5 weekly dates.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const { location, error } = validateSlot(searchParams.get("location"), date);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const { classDates, times } = await getAvailability(location, date);

    return NextResponse.json({
      location: location.id,
      date,
      capacity: CAPACITY,
      classDates,
      times,
    });
  } catch (err) {
    console.error("Availability error:", err);
    return NextResponse.json(
      { error: "Could not check availability right now." },
      { status: 500 }
    );
  }
}