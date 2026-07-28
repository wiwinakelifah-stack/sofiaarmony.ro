import { readAdminSettings } from "@/lib/admin-settings";
import {
  appendNotificationLog,
  findNotificationLogById,
  getLatestLogByChannel,
  readNotificationLogs,
} from "@/lib/notification-logs";
import {
  CLIENT_CONFIRMATION_SUBJECT,
  formatAdminEmailHtml,
  formatAdminWhatsAppMessage,
  formatClientEmailHtml,
} from "@/lib/notification-templates";
import {
  isEmailConfigured,
  isWhatsAppConfigured,
  sendEmailMessage,
  sendWhatsAppMessage,
  verifyEmailConnection,
} from "@/lib/notification-service";
import {
  findReservationById,
  getRecentReservations,
  type Reservation,
} from "@/lib/reservations";

function toPreview(text: string) {
  return text.slice(0, 1200);
}

function formatTestWhatsAppMessage() {
  return `🔔 TEST NOTIFICARE - SOFIA ARMONY\n\nAcesta este un mesaj de test trimis din panoul Admin > Notificari.\n\nDaca vezi acest mesaj, integrarea WhatsApp Cloud API functioneaza corect.`;
}

function formatTestEmailHtml() {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f2ec;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e7e2d7;border-radius:14px;overflow:hidden;">
        <div style="padding:24px;background:linear-gradient(135deg,#8b6f47,#b79567);color:#fff;text-align:center;">
          <h1 style="margin:0;font-size:26px;">Sofia Armony</h1>
          <p style="margin:8px 0 0;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;">Notificare test</p>
        </div>
        <div style="padding:24px;color:#1f2937;line-height:1.6;">
          <p style="margin:0 0 10px;">Acesta este un e-mail de test trimis din panoul de administrare.</p>
          <p style="margin:0;">Daca ai primit acest mesaj, configuratia SMTP este functionala.</p>
        </div>
      </div>
    </div>
  `;
}

async function logResult(input: {
  reservationId?: string | null;
  channel: "whatsapp" | "email";
  kind: "admin" | "client" | "test" | "system";
  recipient: string;
  subject?: string;
  payloadPreview: string;
  ok: boolean;
  responseTimeMs: number;
  errorMessage?: string;
  providerResponse?: string;
  retryOfLogId?: string;
}) {
  return appendNotificationLog({
    reservationId: input.reservationId,
    channel: input.channel,
    kind: input.kind,
    recipient: input.recipient,
    subject: input.subject,
    payloadPreview: toPreview(input.payloadPreview),
    status: input.ok ? "sent" : "failed",
    responseTimeMs: input.responseTimeMs,
    errorMessage: input.errorMessage,
    providerResponse: input.providerResponse,
    retryOfLogId: input.retryOfLogId,
  });
}

export async function getNotificationsOverview() {
  const settings = await readAdminSettings();
  const logs = await readNotificationLogs();
  const recentReservations = await getRecentReservations(12);

  const recentLogs = logs.slice(-30).reverse();
  const failedLogs = recentLogs.filter((log) => log.status === "failed");

  const latestWhatsapp = await getLatestLogByChannel("whatsapp");
  const latestEmail = await getLatestLogByChannel("email");

  const smtpCheck = await verifyEmailConnection(settings);

  return {
    settings,
    status: {
      whatsappConfigured: isWhatsAppConfigured(settings),
      emailConfigured: isEmailConfigured(settings),
      smtpConnectionOk: smtpCheck.ok,
      smtpConnectionMessage: smtpCheck.ok
        ? "Conexiune SMTP valida"
        : smtpCheck.errorMessage || "Conexiune SMTP indisponibila",
    },
    latest: {
      whatsapp: latestWhatsapp,
      email: latestEmail,
    },
    recentReservations,
    failedLogs,
    recentLogs,
  };
}

export async function sendTestWhatsApp() {
  const settings = await readAdminSettings();
  const recipient = settings.adminWhatsApp || "+40769277629";
  const message = formatTestWhatsAppMessage();

  const result = await sendWhatsAppMessage(settings, recipient, message);

  const log = await logResult({
    reservationId: null,
    channel: "whatsapp",
    kind: "test",
    recipient,
    payloadPreview: message,
    ok: result.ok,
    responseTimeMs: result.responseTimeMs,
    errorMessage: result.errorMessage,
    providerResponse: result.providerResponse,
  });

  return { result, log };
}

export async function sendTestEmail(to: string) {
  const settings = await readAdminSettings();
  const subject = "[TEST] Notificare Email - Sofia Armony";
  const html = formatTestEmailHtml();

  const result = await sendEmailMessage(settings, to, subject, html);

  const log = await logResult({
    reservationId: null,
    channel: "email",
    kind: "test",
    recipient: to,
    subject,
    payloadPreview: html,
    ok: result.ok,
    responseTimeMs: result.responseTimeMs,
    errorMessage: result.errorMessage,
    providerResponse: result.providerResponse,
  });

  return { result, log };
}

async function resendForLog(logId: string, reservation: Reservation | null) {
  const settings = await readAdminSettings();
  const source = await findNotificationLogById(logId);

  if (!source) {
    return { ok: false, message: "Logul selectat nu exista." } as const;
  }

  if (!reservation) {
    return { ok: false, message: "Rezervarea asociata nu mai exista." } as const;
  }

  if (source.channel === "whatsapp") {
    const message = formatAdminWhatsAppMessage(reservation);
    const result = await sendWhatsAppMessage(settings, source.recipient, message);

    const log = await logResult({
      reservationId: reservation.id,
      channel: "whatsapp",
      kind: source.kind,
      recipient: source.recipient,
      payloadPreview: message,
      ok: result.ok,
      responseTimeMs: result.responseTimeMs,
      errorMessage: result.errorMessage,
      providerResponse: result.providerResponse,
      retryOfLogId: source.id,
    });

    return { ok: result.ok, message: result.errorMessage || "OK", log } as const;
  }

  const isClientEmail = source.kind === "client";
  const subject = isClientEmail
    ? CLIENT_CONFIRMATION_SUBJECT
    : `Rezervare noua ${reservation.id}`;
  const html = isClientEmail
    ? formatClientEmailHtml(reservation)
    : formatAdminEmailHtml(reservation);

  const result = await sendEmailMessage(settings, source.recipient, subject, html);

  const log = await logResult({
    reservationId: reservation.id,
    channel: "email",
    kind: source.kind,
    recipient: source.recipient,
    subject,
    payloadPreview: html,
    ok: result.ok,
    responseTimeMs: result.responseTimeMs,
    errorMessage: result.errorMessage,
    providerResponse: result.providerResponse,
    retryOfLogId: source.id,
  });

  return { ok: result.ok, message: result.errorMessage || "OK", log } as const;
}

export async function retryFailedNotification(logId: string) {
  const source = await findNotificationLogById(logId);
  if (!source) {
    return { ok: false, message: "Logul selectat nu exista." };
  }

  if (!source.reservationId) {
    return {
      ok: false,
      message: "Acest log nu este legat de o rezervare, deci nu poate fi retrimis automat.",
    };
  }

  const reservation = await findReservationById(source.reservationId);
  return resendForLog(logId, reservation);
}
