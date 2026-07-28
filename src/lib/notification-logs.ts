import fs from "fs/promises";
import path from "path";

export type NotificationChannel = "whatsapp" | "email" | "system";
export type NotificationStatus = "sent" | "failed";

export interface NotificationLog {
  id: string;
  reservationId: string | null;
  channel: NotificationChannel;
  kind: "admin" | "client" | "test" | "system";
  recipient: string;
  subject?: string;
  payloadPreview: string;
  status: NotificationStatus;
  responseTimeMs: number;
  errorMessage: string | null;
  providerResponse: string | null;
  createdAt: string;
  retryOfLogId?: string;
}

export interface CreateNotificationLogInput {
  reservationId?: string | null;
  channel: NotificationChannel;
  kind: "admin" | "client" | "test" | "system";
  recipient: string;
  subject?: string;
  payloadPreview: string;
  status: NotificationStatus;
  responseTimeMs: number;
  errorMessage?: string | null;
  providerResponse?: string | null;
  retryOfLogId?: string;
}

const NOTIFICATION_LOGS_FILE = path.join(process.cwd(), "data", "notification-logs.json");

async function ensureStorageDir() {
  await fs.mkdir(path.dirname(NOTIFICATION_LOGS_FILE), { recursive: true });
}

export async function readNotificationLogs(): Promise<NotificationLog[]> {
  await ensureStorageDir();
  try {
    const data = await fs.readFile(NOTIFICATION_LOGS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as NotificationLog[]) : [];
  } catch {
    return [];
  }
}

export async function appendNotificationLog(input: CreateNotificationLogInput) {
  const logs = await readNotificationLogs();
  const log: NotificationLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    reservationId: input.reservationId ?? null,
    channel: input.channel,
    kind: input.kind,
    recipient: input.recipient,
    subject: input.subject,
    payloadPreview: input.payloadPreview,
    status: input.status,
    responseTimeMs: input.responseTimeMs,
    errorMessage: input.errorMessage ?? null,
    providerResponse: input.providerResponse ?? null,
    createdAt: new Date().toISOString(),
    retryOfLogId: input.retryOfLogId,
  };

  logs.push(log);
  await fs.writeFile(NOTIFICATION_LOGS_FILE, JSON.stringify(logs, null, 2));
  return log;
}

export async function getLatestLogByChannel(channel: NotificationChannel) {
  const logs = await readNotificationLogs();
  const filtered = logs.filter((log) => log.channel === channel);
  return filtered.length ? filtered[filtered.length - 1] : null;
}

export async function findNotificationLogById(logId: string) {
  const logs = await readNotificationLogs();
  return logs.find((log) => log.id === logId) || null;
}
