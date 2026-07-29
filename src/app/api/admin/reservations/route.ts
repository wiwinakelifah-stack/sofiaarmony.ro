import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const reservations = await dbQuery(
      `SELECT id, first_name, last_name, email, phone, room, room_name, room_price_per_night, guest_count, check_in, check_out, adults, children,
       message, status, notification_status, has_review, created_at
       FROM reservations ORDER BY created_at DESC LIMIT 200`
    );
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("GET /api/admin/reservations failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca rezervarile." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      id: string;
      status?: "pending" | "confirmed" | "cancelled" | "completed";
      notificationStatus?: "pending" | "partial" | "sent";
    };

    if (!body.id) {
      return NextResponse.json({ error: "ID lipsa." }, { status: 400 });
    }

    await dbExecute(
      `UPDATE reservations SET
       status = COALESCE(?, status),
       notification_status = COALESCE(?, notification_status)
       WHERE id = ?`,
      [body.status || null, body.notificationStatus || null, body.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/reservations failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza rezervarea." }, { status: 500 });
  }
}
