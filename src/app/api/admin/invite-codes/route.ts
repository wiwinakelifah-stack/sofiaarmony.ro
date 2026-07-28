import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

function generateCode() {
  return `INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const codes = await dbQuery(
      `SELECT id, code, role, is_active, expires_at, used_by_user_id, used_at, created_at
       FROM invite_codes ORDER BY created_at DESC`
    );
    return NextResponse.json({ codes });
  } catch (error) {
    console.error("GET /api/admin/invite-codes failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca codurile." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      role: "super_admin" | "admin" | "editor";
      expiresAt?: string | null;
      code?: string;
    };

    const code = body.code?.trim() || generateCode();

    await dbExecute(
      "INSERT INTO invite_codes (code, role, is_active, expires_at) VALUES (?, ?, 1, ?)",
      [code, body.role || "admin", body.expiresAt || null]
    );

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("POST /api/admin/invite-codes failed:", error);
    return NextResponse.json({ error: "Nu am putut crea codul." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      id: number;
      isActive?: boolean;
      role?: "super_admin" | "admin" | "editor";
      expiresAt?: string | null;
    };

    await dbExecute(
      `UPDATE invite_codes SET
       is_active = ?,
       role = COALESCE(?, role),
       expires_at = ?
       WHERE id = ?`,
      [body.isActive === false ? 0 : 1, body.role || null, body.expiresAt || null, body.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/invite-codes failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza codul." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "ID invalid." }, { status: 400 });
    }

    await dbExecute("DELETE FROM invite_codes WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/invite-codes failed:", error);
    return NextResponse.json({ error: "Nu am putut sterge codul." }, { status: 500 });
  }
}
