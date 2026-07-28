import { NextResponse } from "next/server";
import { getNotificationsOverview } from "@/lib/notifications-admin";

export async function GET() {
  try {
    const data = await getNotificationsOverview();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Notifications overview error:", error);
    return NextResponse.json(
      { error: "Nu am putut incarca datele de notificare." },
      { status: 500 }
    );
  }
}
