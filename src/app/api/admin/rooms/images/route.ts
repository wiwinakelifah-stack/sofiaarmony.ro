import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const roomId = Number(request.nextUrl.searchParams.get("roomId"));
    if (!Number.isFinite(roomId)) {
      return NextResponse.json({ error: "roomId invalid." }, { status: 400 });
    }

    const images = await dbQuery(
      `SELECT id, room_id, image_url, title, description, sort_order, is_active, created_at
       FROM room_images WHERE room_id = ? ORDER BY sort_order ASC, id ASC`,
      [roomId]
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error("GET /api/admin/rooms/images failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca imaginile." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      roomId: number;
      imageUrl: string;
      title?: string;
      description?: string;
      sortOrder?: number;
      isActive?: boolean;
    };

    await dbExecute(
      `INSERT INTO room_images (room_id, image_url, title, description, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        body.roomId,
        body.imageUrl,
        body.title || null,
        body.description || null,
        body.sortOrder || 0,
        body.isActive === false ? 0 : 1,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/rooms/images failed:", error);
    return NextResponse.json({ error: "Nu am putut adauga imaginea." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      id: number;
      imageUrl?: string;
      title?: string;
      description?: string;
      sortOrder?: number;
      isActive?: boolean;
    };

    await dbExecute(
      `UPDATE room_images SET
       image_url = COALESCE(?, image_url),
       title = ?, description = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [
        body.imageUrl || null,
        body.title || null,
        body.description || null,
        body.sortOrder || 0,
        body.isActive === false ? 0 : 1,
        body.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/rooms/images failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza imaginea." }, { status: 500 });
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

    await dbExecute("DELETE FROM room_images WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/rooms/images failed:", error);
    return NextResponse.json({ error: "Nu am putut sterge imaginea." }, { status: 500 });
  }
}
