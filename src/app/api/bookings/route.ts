import { NextRequest, NextResponse } from "next/server";
import { readAdminSettings } from "@/lib/admin-settings";
import { appendNotificationLog } from "@/lib/notification-logs";
import {
  sendEmailMessage,
  sendWhatsAppMessage,
} from "@/lib/notification-service";
import {
  CLIENT_CONFIRMATION_SUBJECT,
  formatAdminEmailHtml,
  formatAdminWhatsAppMessage,
  formatClientEmailHtml,
} from "@/lib/notification-templates";
import {
  createReservation,
  updateReservationNotificationStatus,
  type ReservationInput,
} from "@/lib/reservations";

interface IncomingBookingPayload {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  room?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number | string;
  children?: number | string;
  guests?: number | string;
  message?: string;
}

function parseNameParts(payload: IncomingBookingPayload) {
  if (payload.firstName || payload.lastName) {
    return {
      firstName: (payload.firstName || "").trim(),
      lastName: (payload.lastName || "").trim(),
    };
  }

  const fullName = (payload.name || "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validateReservationInput(input: ReservationInput) {
  const errors: string[] = [];

  if (!input.firstName) errors.push("Prenumele este obligatoriu.");
  if (!input.lastName) errors.push("Numele este obligatoriu.");
  if (!input.email) errors.push("Email-ul este obligatoriu.");
  if (!input.phone) errors.push("Telefonul este obligatoriu.");
  if (!input.checkIn) errors.push("Check-In este obligatoriu.");
  if (!input.checkOut) errors.push("Check-Out este obligatoriu.");
  if (input.adults < 1) errors.push("Trebuie cel putin un adult.");

  return errors;
}


async function logNotificationResult(input: {
  reservationId?: string;
  channel: "whatsapp" | "email";
  kind: "admin" | "client" | "test";
  recipient: string;
  subject?: string;
  payloadPreview: string;
  ok: boolean;
  responseTimeMs: number;
  errorMessage?: string;
  providerResponse?: string;
}) {
  return appendNotificationLog({
    reservationId: input.reservationId,
    channel: input.channel,
    kind: input.kind,
    recipient: input.recipient,
    subject: input.subject,
    payloadPreview: input.payloadPreview.slice(0, 1200),
    status: input.ok ? "sent" : "failed",
    responseTimeMs: input.responseTimeMs,
    errorMessage: input.errorMessage ?? null,
    providerResponse: input.providerResponse ?? null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as IncomingBookingPayload;
    const names = parseNameParts(payload);

    const reservationInput: ReservationInput = {
      firstName: names.firstName,
      lastName: names.lastName,
      email: (payload.email || "").trim(),
      phone: (payload.phone || "").trim(),
      room: (payload.room || "").trim(),
      checkIn: (payload.checkIn || "").trim(),
      checkOut: (payload.checkOut || "").trim(),
      adults: toNumber(payload.adults ?? payload.guests, 1),
      children: toNumber(payload.children, 0),
      message: (payload.message || "").trim(),
    };

    const validationErrors = validateReservationInput(reservationInput);
    if (validationErrors.length) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // 1) Reservation is always persisted first.
    const reservation = await createReservation(reservationInput);
    await appendNotificationLog({
      reservationId: reservation.id,
      channel: "system",
      kind: "system",
      recipient: "internal",
      payloadPreview: `Reservation saved: ${reservation.id}`,
      status: "sent",
      responseTimeMs: 0,
      providerResponse: "reservation persisted",
    });

    const settings = await readAdminSettings();

    const results: Array<{ channel: "whatsapp" | "email"; ok: boolean; logId?: string }> = [];

    // 2) WhatsApp notification to admin
    const adminWhatsAppMessage = formatAdminWhatsAppMessage(reservation);
    const waResult = await sendWhatsAppMessage(
      settings,
      settings.adminWhatsApp || "+40769277629",
      adminWhatsAppMessage
    );
    const waLog = await logNotificationResult({
      reservationId: reservation.id,
      channel: "whatsapp",
      kind: "admin",
      recipient: settings.adminWhatsApp || "+40769277629",
      payloadPreview: adminWhatsAppMessage,
      ok: waResult.ok,
      responseTimeMs: waResult.responseTimeMs,
      errorMessage: waResult.errorMessage,
      providerResponse: waResult.providerResponse,
    });
    results.push({ channel: "whatsapp", ok: waResult.ok, logId: waLog.id });

    // Optional admin email to keep previous behavior
    if (settings.adminEmail) {
      const adminEmailSubject = `Rezervare noua ${reservation.id}`;
      const adminEmailHtml = formatAdminEmailHtml(reservation);
      const adminEmailResult = await sendEmailMessage(
        settings,
        settings.adminEmail,
        adminEmailSubject,
        adminEmailHtml
      );

      await logNotificationResult({
        reservationId: reservation.id,
        channel: "email",
        kind: "admin",
        recipient: settings.adminEmail,
        subject: adminEmailSubject,
        payloadPreview: adminEmailHtml,
        ok: adminEmailResult.ok,
        responseTimeMs: adminEmailResult.responseTimeMs,
        errorMessage: adminEmailResult.errorMessage,
        providerResponse: adminEmailResult.providerResponse,
      });
    }

    // 3) Confirmation email to client
    const clientEmailSubject = CLIENT_CONFIRMATION_SUBJECT;
    const clientEmailHtml = formatClientEmailHtml(reservation);
    const clientEmailResult = await sendEmailMessage(
      settings,
      reservation.email,
      clientEmailSubject,
      clientEmailHtml
    );
    const clientEmailLog = await logNotificationResult({
      reservationId: reservation.id,
      channel: "email",
      kind: "client",
      recipient: reservation.email,
      subject: clientEmailSubject,
      payloadPreview: clientEmailHtml,
      ok: clientEmailResult.ok,
      responseTimeMs: clientEmailResult.responseTimeMs,
      errorMessage: clientEmailResult.errorMessage,
      providerResponse: clientEmailResult.providerResponse,
    });
    results.push({ channel: "email", ok: clientEmailResult.ok, logId: clientEmailLog.id });

    const allOk = results.every((item) => item.ok);
    const anyOk = results.some((item) => item.ok);
    await updateReservationNotificationStatus(
      reservation.id,
      allOk ? "sent" : anyOk ? "partial" : "pending"
    );

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      reservationCreatedAt: reservation.createdAt,
      notifications: {
        whatsappAdmin: waResult.ok,
        emailClient: clientEmailResult.ok,
      },
      warning:
        allOk
          ? null
          : "Rezervarea a fost salvata, dar una sau mai multe notificari au esuat. Le poti retrimite din Admin > Notificari.",
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "A aparut o eroare la procesarea rezervarii." },
      { status: 500 }
    );
  }
}
