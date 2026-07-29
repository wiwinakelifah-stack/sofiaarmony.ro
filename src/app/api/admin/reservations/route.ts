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
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      roomSlug?: string;
      checkIn?: string;
      checkOut?: string;
      adults?: number;
      children?: number;
      message?: string;
    };

    if (!body.id) {
      return NextResponse.json({ error: "ID lipsa." }, { status: 400 });
    }

    const currentRows = await dbQuery<
      Array<{
        id: string;
        status: "pending" | "confirmed" | "cancelled" | "completed";
        room_slug: string;
        room_name: string;
        room_price_per_night: number | null;
        check_in: string;
        check_out: string;
        adults: number;
        children: number;
      }>
    >(
      `SELECT id, status, room_slug, room_name, room_price_per_night, check_in, check_out, adults, children
       FROM reservations
       WHERE id = ?
       LIMIT 1`,
      [body.id]
    );

    const current = currentRows[0];
    if (!current) {
      return NextResponse.json({ error: "Rezervarea nu a fost gasita." }, { status: 404 });
    }

    const nextStatus = body.status || current.status;
    const nextCheckIn = (body.checkIn || current.check_in || "").trim();
    const nextCheckOut = (body.checkOut || current.check_out || "").trim();
    const nextAdults =
      typeof body.adults === "number" && Number.isFinite(body.adults)
        ? Math.max(1, Number(body.adults))
        : Number(current.adults || 1);
    const nextChildren =
      typeof body.children === "number" && Number.isFinite(body.children)
        ? Math.max(0, Number(body.children))
        : Number(current.children || 0);
    const nextGuestCount = Math.max(1, nextAdults + nextChildren);

    if (nextCheckIn && nextCheckOut && nextCheckIn >= nextCheckOut) {
      return NextResponse.json(
        { error: "Check-Out trebuie sa fie dupa Check-In." },
        { status: 400 }
      );
    }

    let roomSlug = (body.roomSlug || current.room_slug || "").trim();
    let roomName = current.room_name || "";
    let roomPricePerNight = current.room_price_per_night;

    if (body.roomSlug) {
      const roomRows = await dbQuery<
        Array<{ slug: string; name_ro: string; price_per_night: number }>
      >(
        `SELECT slug, name_ro, price_per_night
         FROM rooms
         WHERE slug = ? AND is_active = 1
         LIMIT 1`,
        [body.roomSlug]
      );

      const selectedRoom = roomRows[0];
      if (!selectedRoom) {
        return NextResponse.json({ error: "Camera selectata nu este disponibila." }, { status: 400 });
      }

      roomSlug = selectedRoom.slug;
      roomName = selectedRoom.name_ro;
      roomPricePerNight = Number(selectedRoom.price_per_night);
    }

    if (["pending", "confirmed"].includes(nextStatus)) {
      const roomRows = await dbQuery<Array<{ available_units: number }>>(
        `SELECT available_units FROM rooms WHERE slug = ? LIMIT 1`,
        [roomSlug]
      );
      const roomUnits = Number(roomRows[0]?.available_units || 0);
      if (roomUnits < 1) {
        return NextResponse.json(
          { error: "Tipul de camera selectat nu are stoc disponibil." },
          { status: 409 }
        );
      }

      const overlapRows = await dbQuery<Array<{ total: number }>>(
        `SELECT COUNT(*) AS total
         FROM reservations
         WHERE id <> ?
           AND room_slug = ?
           AND status IN ('pending','confirmed')
           AND check_in < ?
           AND check_out > ?`,
        [body.id, roomSlug, nextCheckOut, nextCheckIn]
      );
      const occupiedUnits = Number(overlapRows[0]?.total || 0);

      if (occupiedUnits >= roomUnits) {
        return NextResponse.json(
          { error: "Nu mai exista camere disponibile pentru intervalul selectat." },
          { status: 409 }
        );
      }
    }

    await dbExecute(
      `UPDATE reservations SET
       first_name = COALESCE(?, first_name),
       last_name = COALESCE(?, last_name),
       email = COALESCE(?, email),
       phone = COALESCE(?, phone),
       room = COALESCE(?, room),
       room_slug = COALESCE(?, room_slug),
       room_name = COALESCE(?, room_name),
       room_price_per_night = COALESCE(?, room_price_per_night),
       check_in = COALESCE(?, check_in),
       check_out = COALESCE(?, check_out),
       adults = COALESCE(?, adults),
       children = COALESCE(?, children),
       guest_count = COALESCE(?, guest_count),
       message = COALESCE(?, message),
       status = COALESCE(?, status),
       notification_status = COALESCE(?, notification_status)
       WHERE id = ?`,
      [
        body.firstName || null,
        body.lastName || null,
        body.email || null,
        body.phone || null,
        roomName || null,
        roomSlug || null,
        roomName || null,
        roomPricePerNight ?? null,
        body.checkIn || null,
        body.checkOut || null,
        typeof body.adults === "number" ? nextAdults : null,
        typeof body.children === "number" ? nextChildren : null,
        typeof body.adults === "number" || typeof body.children === "number" ? nextGuestCount : null,
        body.message || null,
        body.status || null,
        body.notificationStatus || null,
        body.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/reservations failed:", error);
    return NextResponse.json({ error: "Nu am putut actualiza rezervarea." }, { status: 500 });
  }
}
