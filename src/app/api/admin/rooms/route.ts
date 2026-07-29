import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

type RoomPayload = {
  slug?: string;
  nameRo: string;
  nameEn: string;
  descriptionRo: string;
  descriptionEn: string;
  maxGuests: number;
  sizeSqm: number;
  pricePerNight: number;
  availableUnits: number;
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
    const checkIn = request.nextUrl.searchParams.get("checkIn") || new Date().toISOString().slice(0, 10);
    const checkOut = request.nextUrl.searchParams.get("checkOut") || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const rooms = await dbQuery(
      `SELECT id, slug, name_ro, name_en, description_ro, description_en, max_guests, size_sqm,
       price_per_night, available_units, main_image_url, amenities_ro, amenities_en, view_ro, view_en,
       badge_ro, badge_en, is_active, sort_order, created_at, updated_at
       FROM rooms ORDER BY sort_order ASC, id ASC`
    );

    const occupancyRows = await dbQuery<Array<{ room_slug: string; total: number }>>(
      `SELECT room_slug, COUNT(*) AS total
       FROM reservations
       WHERE status IN ('pending','confirmed')
         AND check_in < ?
         AND check_out > ?
       GROUP BY room_slug`,
      [checkOut, checkIn]
    );
    const occupancyMap = new Map(occupancyRows.map((row) => [row.room_slug, Number(row.total || 0)]));

    const roomsWithAvailability = (rooms as Array<Record<string, unknown>>).map((room) => {
      const slug = String(room.slug || "");
      const availableUnits = Number(room.available_units || 0);
      const occupiedUnits = Number(occupancyMap.get(slug) || 0);
      return {
        ...room,
        occupied_units: occupiedUnits,
        available_units_for_period: Math.max(0, availableUnits - occupiedUnits),
      };
    });

    return NextResponse.json({
      rooms: roomsWithAvailability,
      period: { checkIn, checkOut },
    });
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
    const slug = (body.slug || slugify(body.nameEn || body.nameRo)).trim();

    await dbExecute(
      `INSERT INTO rooms
      (slug, name_ro, name_en, description_ro, description_en, max_guests, size_sqm, price_per_night,
       available_units, main_image_url, amenities_ro, amenities_en, view_ro, view_en, badge_ro, badge_en, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        body.nameRo,
        body.nameEn,
        body.descriptionRo,
        body.descriptionEn,
        body.maxGuests,
        body.sizeSqm,
        body.pricePerNight,
        body.availableUnits,
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
    const slug = (body.slug || slugify(body.nameEn || body.nameRo)).trim();

    await dbExecute(
      `UPDATE rooms SET
       slug = ?, name_ro = ?, name_en = ?, description_ro = ?, description_en = ?, max_guests = ?, size_sqm = ?,
       price_per_night = ?, available_units = ?, main_image_url = ?, amenities_ro = ?, amenities_en = ?, view_ro = ?, view_en = ?,
       badge_ro = ?, badge_en = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        slug,
        body.nameRo,
        body.nameEn,
        body.descriptionRo,
        body.descriptionEn,
        body.maxGuests,
        body.sizeSqm,
        body.pricePerNight,
        body.availableUnits,
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
