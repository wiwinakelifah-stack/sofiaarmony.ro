import fs from 'fs/promises';
import path from 'path';

export interface AdminSettings {
  adminWhatsApp: string;
  adminEmail: string;
  emailUser: string;
  emailPassword: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  smtpFromName: string;
  smtpFromEmail: string;
  whatsappCloudApiToken: string;
  whatsappCloudApiPhoneNumberId: string;
  whatsappCloudApiVersion: string;
}

const ADMIN_SETTINGS_FILE = path.join(process.cwd(), 'data', 'admin-settings.json');

export function getDefaultAdminSettings(): AdminSettings {
  return {
    adminWhatsApp: process.env.ADMIN_WHATSAPP || '+40769277629',
    adminEmail: process.env.ADMIN_EMAIL || '',
    emailUser: process.env.EMAIL_USER || '',
    emailPassword: process.env.EMAIL_PASSWORD || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    smtpFromName: process.env.SMTP_FROM_NAME || 'Sofia Armony',
    smtpFromEmail: process.env.SMTP_FROM_EMAIL || '',
    whatsappCloudApiToken: process.env.WHATSAPP_CLOUD_API_TOKEN || '',
    whatsappCloudApiPhoneNumberId: process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID || '',
    whatsappCloudApiVersion: process.env.WHATSAPP_CLOUD_API_VERSION || 'v20.0',
  };
}

export async function ensureDataDir() {
  await fs.mkdir(path.dirname(ADMIN_SETTINGS_FILE), { recursive: true });
}

export async function readAdminSettings(): Promise<AdminSettings> {
  await ensureDataDir();

  try {
    const fileContents = await fs.readFile(ADMIN_SETTINGS_FILE, 'utf-8');
    const parsedSettings = JSON.parse(fileContents) as Partial<AdminSettings>;

    return {
      ...getDefaultAdminSettings(),
      ...parsedSettings,
    };
  } catch {
    return getDefaultAdminSettings();
  }
}

export async function saveAdminSettings(settings: AdminSettings) {
  await ensureDataDir();
  await fs.writeFile(ADMIN_SETTINGS_FILE, JSON.stringify(settings, null, 2));
}