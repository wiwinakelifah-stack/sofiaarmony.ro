import { NextResponse } from "next/server";
import { sendTestWhatsApp } from "@/lib/notifications-admin";

export async function POST() {
  try {
    const { result, log } = await sendTestWhatsApp();
    return NextResponse.json({
      success: result.ok,
      message: result.ok
        ? "Mesajul WhatsApp de test a fost trimis cu succes."
        : "Trimiterea mesajului WhatsApp de test a esuat.",
      details: {
        responseTimeMs: result.responseTimeMs,
        error: result.errorMessage || null,
        providerResponse: result.providerResponse || null,
        logId: log.id,
      },
    });
  } catch (error) {
    console.error("WhatsApp test error:", error);
    return NextResponse.json(
      { success: false, error: "Eroare interna la testul WhatsApp." },
      { status: 500 }
    );
  }
}
