import { NextRequest, NextResponse } from "next/server";
import { getPublicGallery, type Locale } from "@/lib/content-db";

function resolveLocale(input: string | null): Locale {
  return input === "en" ? "en" : "ro";
}

export async function GET(request: NextRequest) {
  try {
    const locale = resolveLocale(request.nextUrl.searchParams.get("locale"));
    const images = await getPublicGallery(locale);
    return NextResponse.json({ images });
  } catch (error) {
    console.error("GET /api/public/gallery failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca galeria." }, { status: 500 });
  }
}
