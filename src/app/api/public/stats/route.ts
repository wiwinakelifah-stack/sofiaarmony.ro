import { NextResponse } from "next/server";
import { getHomeStats } from "@/lib/content-db";

export async function GET() {
  try {
    const stats = await getHomeStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("GET /api/public/stats failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca statisticile." }, { status: 500 });
  }
}
