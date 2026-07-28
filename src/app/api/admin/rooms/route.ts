import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

type RoomPayload = {
  nameRo: string;
  nameEn: string;
  descriptionRo: string;
  descriptionEn: string;
  maxGuests: number;
  sizeSqm: number;
  pricePerNight: number;
  mainImageUrl: string;
  amenitiesRo: string;
  amenitiesEn: string;
  viewRo: string;
  viewEn: string;
  badgeRo?: string | null;
  badgeEn?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const rooms = await dbQuery(
      `SELECT id, name_ro, name_en, description_ro, description_en, max_guests, size_sqm,
       price_per_night, main_image_url, amenities_ro, amenities_en, view_ro, view_en,
       badge_ro, badge_en, is_active, sort_order, created_at, updated_at
       FROM rooms ORDER BY sort_order ASC, id ASC`
    );
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("GET /api/admin/rooms failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca camerele." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as RoomPayload;

    await dbExecute(
      `INSERT INTO rooms
      (name_ro, name_en, description_ro, description_en, max_guests, size_sqm, price_per_night,
       main_image_url, amenities_ro, amenities_en, view_ro, view_en, badge_ro, badge_en, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.nameRo,
        body.nameEn,
        body.descriptionRo,
        body.descriptionEn,
        body.maxGuests,
        body.sizeSqm,
        body.pricePerNight,
        body.mainImageUrl,
        body.amenitiesRo,
        body.amenitiesEn,
        body.viewRo,
        body.viewEn,
        body.badgeRo || null,
        body.badgeEn || null,
        body.isActive ? 1 : 0,
        body.sortOrder,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/rooms failed:", error);
    return NextResponse.json({ error: "Nu am putut crea camera." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as RoomPayload & { id: number };

    await dbExecute(
      `UPDATE rooms SET
       name_ro = ?, name_en = ?, description_ro = ?, description_en = ?, max_guests = ?, size_sqm = ?,
       price_per_night = ?, main_image_url = ?, amenities_ro = ?, amenities_en = ?, view_ro = ?, view_en = ?,
       badge_ro = ?, badge_en = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        body.nameRo,
        body.nameEn,
        body.descriptionRo,
        body.descriptionEn,
        body.maxGuests,
        body.sizeSqm,
        body.pricePerNight,
        body.mainImageUrl,
        body.amenitiesRo,
        body.amenitiesEn,
        body.viewRo,
        body.viewEn,
        body.badgeRo || null,
        body.badgeEn || null,
        body.isActive ? 1 : 0,
        body.sortOrder,
        body.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/rooms failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza camera." }, { status: 500 });
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

    await dbExecute("DELETE FROM rooms WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/rooms failed:", error);
    return NextResponse.json({ error: "Nu am putut sterge camera." }, { status: 500 });
  }
}
