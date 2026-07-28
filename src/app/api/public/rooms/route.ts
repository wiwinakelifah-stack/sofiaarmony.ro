import { NextRequest, NextResponse } from "next/server";
import { getPublicRooms, type Locale } from "@/lib/content-db";

function resolveLocale(input: string | null): Locale {
  return input === "en" ? "en" : "ro";
}

export async function GET(request: NextRequest) {
  try {
    const locale = resolveLocale(request.nextUrl.searchParams.get("locale"));
    const rooms = await getPublicRooms(locale);
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("GET /api/public/rooms failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca camerele." }, { status: 500 });
  }
}
