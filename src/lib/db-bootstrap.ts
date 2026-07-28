import crypto from "crypto";
import { dbExecute, dbQuery, dbRaw } from "@/lib/db";

type CountRow = { count: number }[];

let bootstrapPromise: Promise<void> | null = null;

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function ensureDbReady() {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap();
  }

  return bootstrapPromise;
}

async function runBootstrap() {
  await dbRaw(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('super_admin','admin','editor') NOT NULL DEFAULT 'admin',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS invite_codes (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(64) NOT NULL UNIQUE,
      role ENUM('super_admin','admin','editor') NOT NULL DEFAULT 'admin',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      expires_at DATETIME NULL,
      used_by_user_id BIGINT UNSIGNED NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_invite_codes_active (is_active),
      CONSTRAINT fk_invite_user FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS rooms (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name_ro VARCHAR(190) NOT NULL,
      name_en VARCHAR(190) NOT NULL,
      description_ro TEXT NOT NULL,
      description_en TEXT NOT NULL,
      max_guests INT NOT NULL,
      size_sqm INT NOT NULL,
      price_per_night DECIMAL(10,2) NOT NULL,
      main_image_url VARCHAR(1024) NOT NULL,
      amenities_ro TEXT NOT NULL,
      amenities_en TEXT NOT NULL,
      view_ro VARCHAR(190) NOT NULL DEFAULT '',
      view_en VARCHAR(190) NOT NULL DEFAULT '',
      badge_ro VARCHAR(120) NULL,
      badge_en VARCHAR(120) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_rooms_active_order (is_active, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS room_images (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      room_id BIGINT UNSIGNED NOT NULL,
      image_url VARCHAR(1024) NOT NULL,
      title VARCHAR(190) NULL,
      description TEXT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_room_images_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS gallery_images (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      image_url VARCHAR(1024) NOT NULL,
      thumbnail_url VARCHAR(1024) NULL,
      title_ro VARCHAR(190) NULL,
      title_en VARCHAR(190) NULL,
      description_ro TEXT NULL,
      description_en TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_gallery_active_order (is_active, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS reservations (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      first_name VARCHAR(120) NOT NULL,
      last_name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(60) NOT NULL,
      room VARCHAR(190) NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      adults INT NOT NULL,
      children INT NOT NULL DEFAULT 0,
      message TEXT NOT NULL,
      status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
      notification_status ENUM('pending','partial','sent') NOT NULL DEFAULT 'pending',
      has_review TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_reservations_status (status),
      INDEX idx_reservations_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS reviews (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      reservation_id VARCHAR(64) NULL,
      user_name VARCHAR(190) NOT NULL,
      user_email VARCHAR(190) NULL,
      rating INT NOT NULL,
      comment TEXT NOT NULL,
      status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      published_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_reviews_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
      INDEX idx_reviews_status (status),
      INDEX idx_reviews_published (published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS admin_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_email VARCHAR(190) NOT NULL,
      action VARCHAR(190) NOT NULL,
      details TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_logs_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS app_settings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(190) NOT NULL UNIQUE,
      setting_value LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await seedDefaults();
}

async function seedDefaults() {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@sofiaarmony.ro";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "nuimipasa";

  const userCountRows = await dbQuery<CountRow>("SELECT COUNT(*) AS count FROM users");
  const userCount = Number(userCountRows[0]?.count || 0);

  if (userCount === 0) {
    await dbExecute(
      `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, 'super_admin', 1)`,
      [adminEmail, sha256(adminPassword)]
    );
  }

  const roomCountRows = await dbQuery<CountRow>("SELECT COUNT(*) AS count FROM rooms");
  const roomCount = Number(roomCountRows[0]?.count || 0);

  if (roomCount === 0) {
    await dbExecute(
      `INSERT INTO rooms
      (name_ro, name_en, description_ro, description_en, max_guests, size_sqm, price_per_night, main_image_url, amenities_ro, amenities_en, view_ro, view_en, badge_ro, badge_en, is_active, sort_order)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 2),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 3)
      `,
      [
        "Camera Clasica",
        "Classic Room",
        "Eleganta simpla cu mobilier din lemn masiv, pat queen-size si baie privata.",
        "Simple elegance with solid wood furniture, queen-size bed and private bathroom.",
        2,
        22,
        180,
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
        "Wi-Fi,Parcare,Mic dejun",
        "Wi-Fi,Parking,Breakfast",
        "Gradina",
        "Garden",
        null,
        null,
        "Camera Deluxe",
        "Deluxe Room",
        "Spatiu generos, living separat, terasa privata cu vedere spre padure.",
        "Spacious room with separate lounge and private terrace with forest view.",
        2,
        38,
        280,
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
        "Wi-Fi,Parcare,Spa,Terasa",
        "Wi-Fi,Parking,Spa,Terrace",
        "Padure",
        "Forest",
        "Cel mai popular",
        "Most popular",
        "Suite Regala",
        "Royal Suite",
        "Dormitor si living premium, jacuzzi privat si vedere panoramica.",
        "Premium bedroom and lounge, private jacuzzi and panoramic view.",
        4,
        65,
        420,
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
        "Wi-Fi,Parcare,Spa,Semineu,Jacuzzi",
        "Wi-Fi,Parking,Spa,Fireplace,Jacuzzi",
        "Panoramic munti",
        "Mountain panorama",
        "Premium",
        "Premium",
      ]
    );
  }

  const galleryCountRows = await dbQuery<CountRow>(
    "SELECT COUNT(*) AS count FROM gallery_images"
  );
  const galleryCount = Number(galleryCountRows[0]?.count || 0);

  if (galleryCount === 0) {
    await dbExecute(
      `INSERT INTO gallery_images (image_url, thumbnail_url, title_ro, title_en, description_ro, description_en, is_active, sort_order)
      VALUES
      (?, ?, ?, ?, ?, ?, 1, 1),
      (?, ?, ?, ?, ?, ?, 1, 2),
      (?, ?, ?, ?, ?, ?, 1, 3)
      `,
      [
        "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1200&q=80",
        "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=480&q=70",
        "Exterior",
        "Exterior",
        "Intrarea principala",
        "Main entrance",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=480&q=70",
        "Restaurant",
        "Restaurant",
        "Bucatarie locala",
        "Local cuisine",
        "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1200&q=80",
        "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=480&q=70",
        "Spa",
        "Spa",
        "Zona de relaxare",
        "Relaxation area",
      ]
    );
  }
}
