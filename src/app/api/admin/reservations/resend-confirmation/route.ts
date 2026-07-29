import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";
import { dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { formatClientEmailHtml, CLIENT_CONFIRMATION_SUBJECT } from "@/lib/notification-templates";
import { appendNotificationLog } from "@/lib/notification-logs";
import { readAdminSettings } from "@/lib/admin-settings";
import { sendEmailMessage } from "@/lib/notification-service";

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();

    const body = (await request.json()) as {
      reservationId?: string;
    };

    const reservationId = (body.reservationId || "").trim();
    if (!reservationId) {
      return NextResponse.json(
        { error: "reservationId obligatoriu." },
        { status: 400 }
      );
    }

    const rows = await dbQuery<
      Array<{
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        room_name: string;
        room_price_per_night: number | null;
        check_in: string;
        check_out: string;
        adults: number;
        children: number;
        guest_count: number;
        phone: string;
        message: string;
      }>
    >(
      `SELECT id, first_name, last_name, email, room_name, room_price_per_night, check_in, check_out, adults, children, guest_count, phone, message
       FROM reservations WHERE id = ? LIMIT 1`,
      [reservationId]
    );

    const reservation = rows[0];
    if (!reservation) {
      return NextResponse.json(
        { error: "Rezervarea nu a fost gasita." },
        { status: 404 }
      );
    }

    const formattedReservation = {
      id: reservation.id,
      firstName: reservation.first_name,
      lastName: reservation.last_name,
      email: reservation.email,
      room: reservation.room_name || "",
      roomName: reservation.room_name || "",
      roomPricePerNight: reservation.room_price_per_night,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      adults: reservation.adults,
      children: reservation.children,
      guestCount: reservation.guest_count,
      phone: reservation.phone,
      message: reservation.message,
      createdAt: new Date().toISOString(),
      status: "pending" as const,
      notificationStatus: "pending" as const,
    };

    const emailHtml = formatClientEmailHtml(formattedReservation);
    const startTime = Date.now();

    const settings = await readAdminSettings();
    const result = await sendEmailMessage(
      settings,
      reservation.email,
      CLIENT_CONFIRMATION_SUBJECT,
      emailHtml
    );

    const responseTime = Date.now() - startTime;

    await appendNotificationLog({
      reservationId: reservation.id,
      channel: "email",
      kind: "client",
      recipient: reservation.email,
      subject: CLIENT_CONFIRMATION_SUBJECT,
      payloadPreview: emailHtml.slice(0, 500),
      status: result.ok ? "sent" : "failed",
      responseTimeMs: responseTime,
      errorMessage: result.errorMessage ?? null,
      providerResponse: result.providerResponse ?? null,
    });

    return NextResponse.json({
      success: result.ok,
      message: result.ok
        ? "Email de confirmare retrimis cu succes."
        : "Trimiterea emailului a esuat. Vezi Admin > Notificari pentru detalii.",
      details: {
        responseTimeMs: responseTime,
        error: result.errorMessage || null,
        logId: null,
      },
    });
  } catch (error) {
    console.error("Resend confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Eroare interna la retrimiterea confirmarii." },
      { status: 500 }
    );
  }
}
