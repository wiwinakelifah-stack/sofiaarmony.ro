import { NextRequest, NextResponse } from "next/server";
import { retryFailedNotification } from "@/lib/notifications-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const logId = String(body.logId || "").trim();

    if (!logId) {
      return NextResponse.json(
        { success: false, error: "logId este obligatoriu." },
        { status: 400 }
      );
    }

    const result = await retryFailedNotification(logId);

    return NextResponse.json({
      success: result.ok,
      message: result.ok
        ? "Notificarea a fost retrimisa cu succes."
        : result.message,
      log: "log" in result ? result.log : null,
    });
  } catch (error) {
    console.error("Retry notification error:", error);
    return NextResponse.json(
      { success: false, error: "Eroare interna la retrimiterea notificarii." },
      { status: 500 }
    );
  }
}
