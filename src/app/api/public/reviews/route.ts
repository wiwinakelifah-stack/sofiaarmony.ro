import { NextResponse } from "next/server";
import { getPublicReviews } from "@/lib/content-db";

export async function GET() {
  try {
    const reviews = await getPublicReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/public/reviews failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca recenziile." }, { status: 500 });
  }
}
