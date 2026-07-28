import nodemailer from "nodemailer";
import type { AdminSettings } from "@/lib/admin-settings";

export interface NotificationResult {
  ok: boolean;
  responseTimeMs: number;
  providerResponse?: string;
  errorMessage?: string;
}

export function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, "");
}

export function isWhatsAppConfigured(settings: AdminSettings) {
  return Boolean(
    settings.whatsappCloudApiToken && settings.whatsappCloudApiPhoneNumberId
  );
}

export function isEmailConfigured(settings: AdminSettings) {
  const hasCustomSmtp =
    settings.smtpHost &&
    settings.smtpPort &&
    settings.smtpUser &&
    settings.smtpPassword;

  const hasGmailFallback = settings.emailUser && settings.emailPassword;
  return Boolean(hasCustomSmtp || hasGmailFallback);
}

export async function sendWhatsAppMessage(
  settings: AdminSettings,
  to: string,
  message: string
): Promise<NotificationResult> {
  const startedAt = Date.now();

  if (!isWhatsAppConfigured(settings)) {
    return {
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      errorMessage: "Configuratia WhatsApp Cloud API este incompleta.",
    };
  }

  const normalizedTo = normalizePhoneNumber(to);
  if (!normalizedTo) {
    return {
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      errorMessage: "Numarul de telefon este invalid.",
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${settings.whatsappCloudApiVersion}/${settings.whatsappCloudApiPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.whatsappCloudApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalizedTo,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    );

    const responseText = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        responseTimeMs: Date.now() - startedAt,
        errorMessage: `WhatsApp API a raspuns cu ${response.status}.`,
        providerResponse: responseText,
      };
    }

    return {
      ok: true,
      responseTimeMs: Date.now() - startedAt,
      providerResponse: responseText,
    };
  } catch (error) {
    return {
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      errorMessage: error instanceof Error ? error.message : "Eroare necunoscuta la WhatsApp.",
    };
  }
}

function buildTransport(settings: AdminSettings) {
  if (settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPassword) {
    return nodemailer.createTransport({
      host: settings.smtpHost,
      port: Number(settings.smtpPort),
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: settings.emailUser,
      pass: settings.emailPassword,
    },
  });
}

export function buildFromAddress(settings: AdminSettings) {
  const senderName = settings.smtpFromName || "Sofia Armony";
  const senderEmail = settings.smtpFromEmail || settings.smtpUser || settings.emailUser;
  return `${senderName} <${senderEmail}>`;
}

export async function verifyEmailConnection(settings: AdminSettings): Promise<NotificationResult> {
  const startedAt = Date.now();

  if (!isEmailConfigured(settings)) {
    return {
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      errorMessage: "Configuratia SMTP este incompleta.",
    };
  }

  try {
    const transport = buildTransport(settings);
    await transport.verify();
    return {
      ok: true,
      responseTimeMs: Date.now() - startedAt,
      providerResponse: "SMTP verify OK",
    };
  } catch (error) {
    return {
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      errorMessage: error instanceof Error ? error.message : "SMTP verify failed",
    };
  }
}

export async function sendEmailMessage(
  settings: AdminSettings,
  to: string,
  subject: string,
  html: string
): Promise<NotificationResult> {
  const startedAt = Date.now();

  if (!isEmailConfigured(settings)) {
    return {
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      errorMessage: "Configuratia SMTP este incompleta.",
    };
  }

  try {
    const transport = buildTransport(settings);
    const info = await transport.sendMail({
      from: buildFromAddress(settings),
      to,
      subject,
      html,
    });

    return {
      ok: true,
      responseTimeMs: Date.now() - startedAt,
      providerResponse: info.response || info.messageId,
    };
  } catch (error) {
    return {
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      errorMessage: error instanceof Error ? error.message : "Eroare necunoscuta SMTP.",
    };
  }
}
