import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/notifications-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const to = String(body.to || "").trim();

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Introdu o adresa de email valida." },
        { status: 400 }
      );
    }

    const { result, log } = await sendTestEmail(to);
    return NextResponse.json({
      success: result.ok,
      message: result.ok
        ? "Emailul de test a fost trimis cu succes."
        : "Trimiterea emailului de test a esuat.",
      details: {
        responseTimeMs: result.responseTimeMs,
        error: result.errorMessage || null,
        providerResponse: result.providerResponse || null,
        logId: log.id,
      },
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { success: false, error: "Eroare interna la testul email." },
      { status: 500 }
    );
  }
}
