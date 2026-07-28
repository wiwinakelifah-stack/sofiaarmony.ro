import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";
import { updateReservationReviewFlag } from "@/lib/content-db";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const status = request.nextUrl.searchParams.get("status");
    const params: unknown[] = [];
    let whereClause = "";

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereClause = "WHERE status = ?";
      params.push(status);
    }

    const reviews = await dbQuery(
      `SELECT id, reservation_id, user_name, user_email, rating, comment, status, published_at, created_at, updated_at
       FROM reviews ${whereClause} ORDER BY created_at DESC`,
      params
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/admin/reviews failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca review-urile." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      id: number;
      userName?: string;
      rating?: number;
      comment?: string;
      status?: "pending" | "approved" | "rejected";
      action?: "approve" | "reject";
    };

    const currentRows = await dbQuery<Array<{ reservation_id: string | null }>>(
      "SELECT reservation_id FROM reviews WHERE id = ? LIMIT 1",
      [body.id]
    );
    const reservationId = currentRows[0]?.reservation_id || null;

    const nextStatus =
      body.action === "approve"
        ? "approved"
        : body.action === "reject"
          ? "rejected"
          : body.status;

    if (!nextStatus) {
      return NextResponse.json({ error: "Status invalid." }, { status: 400 });
    }

    await dbExecute(
      `UPDATE reviews SET
       user_name = COALESCE(?, user_name),
       rating = COALESCE(?, rating),
       comment = COALESCE(?, comment),
       status = ?,
       published_at = CASE WHEN ? = 'approved' THEN COALESCE(published_at, NOW()) ELSE published_at END
       WHERE id = ?`,
      [
        body.userName || null,
        typeof body.rating === "number" ? body.rating : null,
        body.comment || null,
        nextStatus,
        nextStatus,
        body.id,
      ]
    );

    if (reservationId) {
      await updateReservationReviewFlag(reservationId, nextStatus === "approved");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/reviews failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza review-ul." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "ID invalid." }, { status: 400 });
    }

    const currentRows = await dbQuery<Array<{ reservation_id: string | null }>>(
      "SELECT reservation_id FROM reviews WHERE id = ? LIMIT 1",
      [id]
    );

    await dbExecute("DELETE FROM reviews WHERE id = ?", [id]);

    const reservationId = currentRows[0]?.reservation_id || null;
    if (reservationId) {
      await updateReservationReviewFlag(reservationId, false);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/reviews failed:", error);
    return NextResponse.json({ error: "Nu am putut sterge review-ul." }, { status: 500 });
  }
}
