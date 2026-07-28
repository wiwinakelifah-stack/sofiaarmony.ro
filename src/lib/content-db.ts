import { ensureDbReady } from "@/lib/db-bootstrap";
import { dbExecute, dbQuery, dbRaw } from "@/lib/db";

export type Locale = "ro" | "en";

export type PublicRoom = {
  id: number;
  name: string;
  description: string;
  maxGuests: number;
  sizeSqm: number;
  pricePerNight: number;
  mainImageUrl: string;
  amenities: string[];
  view: string;
  badge: string | null;
  sortOrder: number;
  images: Array<{
    id: number;
    imageUrl: string;
    title: string | null;
    description: string | null;
    sortOrder: number;
  }>;
};

export type PublicReview = {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  publishedAt: string;
};

export type PublicGalleryImage = {
  id: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  title: string;
  description: string;
  sortOrder: number;
};

export async function getPublicRooms(locale: Locale): Promise<PublicRoom[]> {
  await ensureDbReady();

  const rows = await dbQuery<
    Array<{
      id: number;
      name_ro: string;
      name_en: string;
      description_ro: string;
      description_en: string;
      max_guests: number;
      size_sqm: number;
      price_per_night: number;
      main_image_url: string;
      amenities_ro: string;
      amenities_en: string;
      view_ro: string;
      view_en: string;
      badge_ro: string | null;
      badge_en: string | null;
      sort_order: number;
    }>
  >(
    `SELECT * FROM rooms WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`
  );

  const roomIds = rows.map((row) => row.id);
  const images = roomIds.length
    ? await dbQuery<
        Array<{
          id: number;
          room_id: number;
          image_url: string;
          title: string | null;
          description: string | null;
          sort_order: number;
        }>
      >(
        `SELECT id, room_id, image_url, title, description, sort_order
         FROM room_images
         WHERE is_active = 1 AND room_id IN (${roomIds.map(() => "?").join(",")})
         ORDER BY sort_order ASC, id ASC`,
        roomIds
      )
    : [];

  const imageMap = new Map<number, PublicRoom["images"]>();
  for (const image of images) {
    const current = imageMap.get(image.room_id) || [];
    current.push({
      id: image.id,
      imageUrl: image.image_url,
      title: image.title,
      description: image.description,
      sortOrder: image.sort_order,
    });
    imageMap.set(image.room_id, current);
  }

  return rows.map((row) => ({
    id: row.id,
    name: locale === "en" ? row.name_en : row.name_ro,
    description: locale === "en" ? row.description_en : row.description_ro,
    maxGuests: row.max_guests,
    sizeSqm: row.size_sqm,
    pricePerNight: Number(row.price_per_night),
    mainImageUrl: row.main_image_url,
    amenities: (locale === "en" ? row.amenities_en : row.amenities_ro)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    view: locale === "en" ? row.view_en : row.view_ro,
    badge: locale === "en" ? row.badge_en : row.badge_ro,
    sortOrder: row.sort_order,
    images: imageMap.get(row.id) || [],
  }));
}

export async function getPublicGallery(locale: Locale): Promise<PublicGalleryImage[]> {
  await ensureDbReady();

  const rows = await dbQuery<
    Array<{
      id: number;
      image_url: string;
      thumbnail_url: string | null;
      title_ro: string | null;
      title_en: string | null;
      description_ro: string | null;
      description_en: string | null;
      sort_order: number;
    }>
  >(
    `SELECT id, image_url, thumbnail_url, title_ro, title_en, description_ro, description_en, sort_order
     FROM gallery_images
     WHERE is_active = 1
     ORDER BY sort_order ASC, id ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    title: (locale === "en" ? row.title_en : row.title_ro) || "",
    description: (locale === "en" ? row.description_en : row.description_ro) || "",
    sortOrder: row.sort_order,
  }));
}

export async function getPublicReviews(): Promise<PublicReview[]> {
  await ensureDbReady();

  const rows = await dbQuery<
    Array<{
      id: number;
      user_name: string;
      rating: number;
      comment: string;
      published_at: Date | string;
    }>
  >(
    `SELECT id, user_name, rating, comment, published_at
     FROM reviews
     WHERE status = 'approved'
     ORDER BY published_at DESC, id DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    publishedAt: new Date(row.published_at).toISOString(),
  }));
}

export async function getHomeStats() {
  await ensureDbReady();

  const [rooms] = await Promise.all([
    dbQuery<Array<{ value: number }>>(
      "SELECT COUNT(*) AS value FROM rooms WHERE is_active = 1"
    ),
  ]);

  const reservationsRows = await dbQuery<Array<{ value: number }>>(
    "SELECT COUNT(*) AS value FROM reservations WHERE status = 'confirmed'"
  );
  const reservationsConfirmed = Number(reservationsRows[0]?.value || 0);

  const fallbackReservationsRows = await dbQuery<Array<{ value: number }>>(
    "SELECT COUNT(*) AS value FROM reservations"
  );
  const fallbackReservations = Number(fallbackReservationsRows[0]?.value || 0);

  const ratingRows = await dbQuery<Array<{ value: number | null }>>(
    "SELECT AVG(rating) AS value FROM reviews WHERE status = 'approved'"
  );

  const avgRatingRaw = ratingRows[0]?.value;
  const avgRating = avgRatingRaw == null ? 0 : Number(avgRatingRaw);

  return {
    activeRooms: Number(rooms[0]?.value || 0),
    happyGuests: reservationsConfirmed > 0 ? reservationsConfirmed : fallbackReservations,
    averageRating: avgRating,
  };
}

export async function mirrorReservationToDb(input: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  notificationStatus: "pending" | "partial" | "sent";
  createdAt: string;
  hasReview?: boolean;
}) {
  await ensureDbReady();

  await dbExecute(
    `INSERT INTO reservations
      (id, first_name, last_name, email, phone, room, check_in, check_out, adults, children, message, status, notification_status, has_review, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      last_name = VALUES(last_name),
      email = VALUES(email),
      phone = VALUES(phone),
      room = VALUES(room),
      check_in = VALUES(check_in),
      check_out = VALUES(check_out),
      adults = VALUES(adults),
      children = VALUES(children),
      message = VALUES(message),
      status = VALUES(status),
      notification_status = VALUES(notification_status),
      has_review = VALUES(has_review)
    `,
    [
      input.id,
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.room,
      input.checkIn,
      input.checkOut,
      input.adults,
      input.children,
      input.message,
      input.status,
      input.notificationStatus,
      input.hasReview ? 1 : 0,
      input.createdAt,
    ]
  );
}

export async function updateReservationReviewFlag(reservationId: string, hasReview: boolean) {
  await ensureDbReady();
  await dbExecute("UPDATE reservations SET has_review = ? WHERE id = ?", [
    hasReview ? 1 : 0,
    reservationId,
  ]);
}

export async function getDashboardData() {
  await ensureDbReady();

  const [rooms, reservations, reviews, users, dbSizeRows, recentReservations, recentReviews, recentGallery] =
    await Promise.all([
      dbQuery<Array<{ total: number }>>("SELECT COUNT(*) AS total FROM rooms"),
      dbQuery<Array<{ total: number }>>("SELECT COUNT(*) AS total FROM reservations"),
      dbQuery<Array<{ total: number }>>("SELECT COUNT(*) AS total FROM reviews"),
      dbQuery<Array<{ total: number }>>("SELECT COUNT(*) AS total FROM users"),
      dbQuery<Array<{ size_mb: number }>>(
        `SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
         FROM information_schema.tables WHERE table_schema = DATABASE()`
      ),
      dbQuery<
        Array<{
          id: string;
          first_name: string;
          last_name: string;
          room: string;
          status: string;
          created_at: Date | string;
        }>
      >(
        "SELECT id, first_name, last_name, room, status, created_at FROM reservations ORDER BY created_at DESC LIMIT 8"
      ),
      dbQuery<
        Array<{
          id: number;
          user_name: string;
          rating: number;
          status: string;
          created_at: Date | string;
        }>
      >(
        "SELECT id, user_name, rating, status, created_at FROM reviews ORDER BY created_at DESC LIMIT 8"
      ),
      dbQuery<
        Array<{
          id: number;
          title_ro: string | null;
          created_at: Date | string;
        }>
      >(
        "SELECT id, title_ro, created_at FROM gallery_images ORDER BY created_at DESC LIMIT 8"
      ),
    ]);

  return {
    counters: {
      rooms: Number(rooms[0]?.total || 0),
      reservations: Number(reservations[0]?.total || 0),
      reviews: Number(reviews[0]?.total || 0),
      users: Number(users[0]?.total || 0),
      dbSizeMb: Number(dbSizeRows[0]?.size_mb || 0),
    },
    recentReservations: recentReservations.map((item) => ({
      id: item.id,
      guestName: `${item.first_name} ${item.last_name}`.trim(),
      room: item.room,
      status: item.status,
      createdAt: new Date(item.created_at).toISOString(),
    })),
    recentReviews: recentReviews.map((item) => ({
      id: item.id,
      userName: item.user_name,
      rating: item.rating,
      status: item.status,
      createdAt: new Date(item.created_at).toISOString(),
    })),
    recentGallery: recentGallery.map((item) => ({
      id: item.id,
      title: item.title_ro || `Imagine #${item.id}`,
      createdAt: new Date(item.created_at).toISOString(),
    })),
  };
}

export async function listDbTables() {
  await ensureDbReady();

  const tables = await dbQuery<Array<{ table_name: string }>>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name ASC`
  );

  const entries: Array<{ table: string; rows: number }> = [];

  for (const table of tables) {
    const result = await dbQuery<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total FROM \`${table.table_name}\``
    );
    entries.push({ table: table.table_name, rows: Number(result[0]?.total || 0) });
  }

  return entries;
}

export async function getDbRecords(options: {
  table: string;
  limit: number;
  offset: number;
  search?: string;
}) {
  await ensureDbReady();

  const { table, limit, offset, search } = options;

  const columns = await dbQuery<Array<{ Field: string; Key: string }>>(
    `SHOW COLUMNS FROM \`${table}\``
  );

  const searchableColumns = columns
    .filter((col) => col.Key !== "PRI")
    .map((col) => `CAST(\`${col.Field}\` AS CHAR)`);

  let whereClause = "";
  const params: unknown[] = [];

  if (search && searchableColumns.length) {
    whereClause = `WHERE ${searchableColumns.map((col) => `${col} LIKE ?`).join(" OR ")}`;
    for (let i = 0; i < searchableColumns.length; i += 1) {
      params.push(`%${search}%`);
    }
  }

  const totalRows = await dbQuery<Array<{ total: number }>>(
    `SELECT COUNT(*) AS total FROM \`${table}\` ${whereClause}`,
    params
  );

  const records = await dbQuery<Array<Record<string, unknown>>>(
    `SELECT * FROM \`${table}\` ${whereClause} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    columns: columns.map((col) => col.Field),
    total: Number(totalRows[0]?.total || 0),
    rows: records,
  };
}

export async function updateDbRecord(table: string, idField: string, id: string, payload: Record<string, unknown>) {
  await ensureDbReady();

  const keys = Object.keys(payload).filter((key) => key !== idField);
  if (keys.length === 0) return;

  const setClause = keys.map((key) => `\`${key}\` = ?`).join(", ");
  const values = keys.map((key) => {
    const value = payload[key];
    if (
      value == null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value instanceof Date ||
      value instanceof Buffer
    ) {
      return value;
    }

    return JSON.stringify(value);
  });

  await dbExecute(
    `UPDATE \`${table}\` SET ${setClause} WHERE \`${idField}\` = ?`,
    [...values, id] as Array<string | number | boolean | Date | Buffer | null>
  );
}

export async function deleteDbRecord(table: string, idField: string, id: string) {
  await ensureDbReady();
  await dbExecute(`DELETE FROM \`${table}\` WHERE \`${idField}\` = ?`, [id]);
}

export async function optimizeTable(table: string) {
  await ensureDbReady();
  await dbRaw(`OPTIMIZE TABLE \`${table}\``);
}

export async function exportTableCsv(table: string) {
  await ensureDbReady();
  const rows = await dbQuery<Array<Record<string, unknown>>>(`SELECT * FROM \`${table}\``);
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(",")];

  for (const row of rows) {
    const values = headers.map((header) => {
      const value = row[header];
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

export async function exportSqlDump() {
  await ensureDbReady();
  const tables = await dbQuery<Array<{ table_name: string }>>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name ASC`
  );

  const chunks: string[] = [];

  for (const item of tables) {
    const table = item.table_name;
    const createRows = await dbQuery<Array<{ "Create Table": string }>>(
      `SHOW CREATE TABLE \`${table}\``
    );
    const createSql = createRows[0]?.["Create Table"] || "";
    if (createSql) {
      chunks.push(`DROP TABLE IF EXISTS \`${table}\`;`);
      chunks.push(`${createSql};`);
    }

    const rows = await dbQuery<Array<Record<string, unknown>>>(`SELECT * FROM \`${table}\``);
    if (rows.length) {
      const cols = Object.keys(rows[0]).map((col) => `\`${col}\``).join(", ");
      for (const row of rows) {
        const vals = Object.values(row).map((value) => {
          if (value == null) return "NULL";
          if (typeof value === "number") return String(value);
          return `'${String(value).replace(/'/g, "''")}'`;
        });
        chunks.push(`INSERT INTO \`${table}\` (${cols}) VALUES (${vals.join(", ")});`);
      }
    }
  }

  return chunks.join("\n");
}
