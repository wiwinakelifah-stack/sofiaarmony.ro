import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const users = await dbQuery(
      "SELECT id, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC"
    );
    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca utilizatorii." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      email: string;
      password: string;
      role: "super_admin" | "admin" | "editor";
      isActive?: boolean;
    };

    await dbExecute(
      "INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)",
      [
        body.email.trim().toLowerCase(),
        sha256(body.password),
        body.role,
        body.isActive === false ? 0 : 1,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/users failed:", error);
    return NextResponse.json({ error: "Nu am putut crea utilizatorul." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      id: number;
      role?: "super_admin" | "admin" | "editor";
      isActive?: boolean;
      password?: string;
    };

    await dbExecute(
      `UPDATE users SET role = COALESCE(?, role), is_active = ?,
       password_hash = COALESCE(?, password_hash) WHERE id = ?`,
      [
        body.role || null,
        body.isActive === false ? 0 : 1,
        body.password ? sha256(body.password) : null,
        body.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/users failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza utilizatorul." }, { status: 500 });
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

    await dbExecute("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users failed:", error);
    return NextResponse.json({ error: "Nu am putut sterge utilizatorul." }, { status: 500 });
  }
}
