import crypto from "crypto";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";

export const ADMIN_SESSION_COOKIE = "sa_admin_session";

type AdminRole = "super_admin" | "admin" | "editor";

type SessionPayload = {
  userId: number;
  email: string;
  role: AdminRole;
  exp: number;
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "sofia-armony-local-admin-secret";
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function sign(payloadBase64: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadBase64)
    .digest("hex");
}

function encodeSession(payload: SessionPayload) {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadBase64}.${sign(payloadBase64)}`;
}

function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;

  const expected = sign(payloadBase64);
  if (expected !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8")) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function loginAdmin(email: string, password: string) {
  await ensureDbReady();

  const rows = await dbQuery<
    Array<{
      id: number;
      email: string;
      role: AdminRole;
      password_hash: string;
      is_active: number;
    }>
  >(
    "SELECT id, email, role, password_hash, is_active FROM users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );

  const user = rows[0];
  if (!user || user.is_active !== 1) {
    return null;
  }

  if (sha256(password) !== user.password_hash) {
    return null;
  }

  const exp = Date.now() + 1000 * 60 * 60 * 12;
  return {
    token: encodeSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp,
    }),
    role: user.role,
    email: user.email,
    exp,
  };
}

export async function getCurrentAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return decodeSession(token);
}

export async function getCurrentAdminFromCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return decodeSession(token);
}

export async function requireAdminRole(request: NextRequest, role: AdminRole) {
  const user = await getCurrentAdminFromRequest(request);
  if (!user) return { ok: false as const, status: 401, message: "Neautorizat." };

  if (role === "super_admin" && user.role !== "super_admin") {
    return { ok: false as const, status: 403, message: "Doar Super Admin are acces." };
  }

  return { ok: true as const, user };
}
