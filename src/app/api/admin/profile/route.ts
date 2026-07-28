import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

type UserRow = {
  id: number;
  email: string;
  role: "super_admin" | "admin" | "editor";
  is_active: number;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();

    const users = await dbQuery<UserRow[]>(
      "SELECT id, email, role, is_active, password_hash, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [auth.user.userId]
    );

    const current = users[0];
    if (!current || current.is_active !== 1) {
      return NextResponse.json({ error: "Utilizator invalid." }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: current.id,
        email: current.email,
        role: current.role,
        isActive: current.is_active === 1,
        createdAt: current.created_at,
        updatedAt: current.updated_at,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/profile failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca profilul." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();

    const body = (await request.json()) as {
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const users = await dbQuery<UserRow[]>(
      "SELECT id, email, role, is_active, password_hash, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [auth.user.userId]
    );

    const current = users[0];
    if (!current || current.is_active !== 1) {
      return NextResponse.json({ error: "Utilizator invalid." }, { status: 404 });
    }

    const normalizedEmail = (body.email || current.email).trim().toLowerCase();
    const wantsEmailChange = normalizedEmail !== current.email;
    const wantsPasswordChange = Boolean(body.newPassword && body.newPassword.trim().length > 0);

    if (wantsEmailChange || wantsPasswordChange) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "Parola curenta este obligatorie." }, { status: 400 });
      }

      const currentHash = sha256(body.currentPassword);
      if (currentHash !== current.password_hash) {
        return NextResponse.json({ error: "Parola curenta este incorecta." }, { status: 400 });
      }
    }

    if (wantsPasswordChange && String(body.newPassword).trim().length < 8) {
      return NextResponse.json({ error: "Parola noua trebuie sa aiba minim 8 caractere." }, { status: 400 });
    }

    await dbExecute(
      `UPDATE users SET
       email = ?,
       password_hash = COALESCE(?, password_hash)
       WHERE id = ?`,
      [
        normalizedEmail,
        wantsPasswordChange ? sha256(String(body.newPassword)) : null,
        current.id,
      ]
    );

    const updatedUsers = await dbQuery<UserRow[]>(
      "SELECT id, email, role, is_active, password_hash, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [current.id]
    );

    const updated = updatedUsers[0];

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        isActive: updated.is_active === 1,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
      message:
        wantsEmailChange && wantsPasswordChange
          ? "Profil actualizat: email si parola."
          : wantsEmailChange
            ? "Email actualizat cu succes."
            : wantsPasswordChange
              ? "Parola actualizata cu succes."
              : "Profil actualizat.",
    });
  } catch (error) {
    console.error("PUT /api/admin/profile failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza profilul." }, { status: 500 });
  }
}
