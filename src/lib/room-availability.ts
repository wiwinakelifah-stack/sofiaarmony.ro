import { dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";

export type RoomAvailability = {
  id: number;
  slug: string;
  nameRo: string;
  nameEn: string;
  descriptionRo: string;
  descriptionEn: string;
  maxGuests: number;
  sizeSqm: number;
  pricePerNight: number;
  availableUnits: number;
  occupiedUnits: number;
  availableUnitsForPeriod: number;
  mainImageUrl: string;
  amenitiesRo: string;
  amenitiesEn: string;
  viewRo: string;
  viewEn: string;
  badgeRo: string | null;
  badgeEn: string | null;
  sortOrder: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function getRoomAvailability(locale: "ro" | "en", checkIn?: string, checkOut?: string) {
  await ensureDbReady();

  const rooms = await dbQuery<Array<{
    id: number;
    slug: string;
    name_ro: string;
    name_en: string;
    description_ro: string;
    description_en: string;
    max_guests: number;
    size_sqm: number;
    price_per_night: number;
    available_units: number;
    main_image_url: string;
    amenities_ro: string;
    amenities_en: string;
    view_ro: string;
    view_en: string;
    badge_ro: string | null;
    badge_en: string | null;
    sort_order: number;
  }>>(
    `SELECT id, slug, name_ro, name_en, description_ro, description_en, max_guests, size_sqm,
            price_per_night, available_units, main_image_url, amenities_ro, amenities_en,
            view_ro, view_en, badge_ro, badge_en, sort_order
     FROM rooms
     WHERE is_active = 1
     ORDER BY sort_order ASC, id ASC`
  );

  if (!rooms.length) return [];

  const fromDate = checkIn || new Date().toISOString().slice(0, 10);
  const toDate = checkOut || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const roomSlugs = rooms.map((room) => room.slug || slugify(room.name_en || room.name_ro));

  const occupancyRows = roomSlugs.length
    ? await dbQuery<Array<{ room_slug: string; total: number }>>(
        `SELECT room_slug, COUNT(*) AS total
         FROM reservations
         WHERE room_slug IN (${roomSlugs.map(() => "?").join(",")})
           AND status IN ('pending','confirmed')
           AND check_in < ?
           AND check_out > ?
         GROUP BY room_slug`,
        [...roomSlugs, toDate, fromDate]
      )
    : [];

  const occupancyMap = new Map(occupancyRows.map((row) => [row.room_slug, Number(row.total || 0)]));

  return rooms.map((room) => {
    const slug = room.slug || slugify(room.name_en || room.name_ro);
    const occupiedUnits = Number(occupancyMap.get(slug) || 0);
    const availableUnits = Number(room.available_units || 0);
    const availableUnitsForPeriod = Math.max(0, availableUnits - occupiedUnits);

    return {
      id: room.id,
      slug,
      nameRo: room.name_ro,
      nameEn: room.name_en,
      descriptionRo: room.description_ro,
      descriptionEn: room.description_en,
      maxGuests: room.max_guests,
      sizeSqm: room.size_sqm,
      pricePerNight: Number(room.price_per_night),
      availableUnits,
      occupiedUnits,
      availableUnitsForPeriod,
      mainImageUrl: room.main_image_url,
      amenitiesRo: room.amenities_ro,
      amenitiesEn: room.amenities_en,
      viewRo: room.view_ro,
      viewEn: room.view_en,
      badgeRo: room.badge_ro,
      badgeEn: room.badge_en,
      sortOrder: room.sort_order,
    } satisfies RoomAvailability;
  });
}

export async function resolveRequestedRoom(input: {
  roomSlug?: string;
  checkIn: string;
  checkOut: string;
  locale?: "ro" | "en";
}) {
  const rooms = await getRoomAvailability(input.locale || "ro", input.checkIn, input.checkOut);
  const normalizedRequest = (input.roomSlug || "").trim().toLowerCase();
  const selected = normalizedRequest
    ? rooms.find((room) => {
        const roomSlug = room.slug.toLowerCase();
        return roomSlug === normalizedRequest || roomSlug.includes(normalizedRequest) || normalizedRequest.includes(roomSlug);
      })
    : rooms.find((room) => room.availableUnitsForPeriod > 0);

  if (!selected) {
    return { room: null, message: "Nu mai exista camere disponibile pentru perioada selectata." };
  }

  if (selected.availableUnitsForPeriod < 1) {
    return {
      room: null,
      message: `Nu mai exista camere disponibile pentru ${selected.nameRo || selected.nameEn} in intervalul selectat.`,
    };
  }

  return { room: selected, message: null };
}
