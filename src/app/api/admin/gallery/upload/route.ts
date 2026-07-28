import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";

const GALLERY_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");
const GALLERY_THUMB_DIR = path.join(process.cwd(), "public", "uploads", "gallery", "thumbs");

async function ensureUploadDirs() {
  await fs.mkdir(GALLERY_UPLOAD_DIR, { recursive: true });
  await fs.mkdir(GALLERY_THUMB_DIR, { recursive: true });
}

function safeBaseName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureUploadDirs();

    const formData = await request.formData();
    const allFiles = formData.getAll("files").filter((item) => item instanceof File) as File[];

    if (!allFiles.length) {
      return NextResponse.json({ error: "Nu ai trimis fisiere." }, { status: 400 });
    }

    const uploaded = [] as Array<{
      imageUrl: string;
      thumbnailUrl: string;
      fileName: string;
      width: number;
      height: number;
      size: number;
    }>;

    for (const file of allFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const input = Buffer.from(arrayBuffer);
      const base = safeBaseName(file.name);
      const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const fileName = `${base}-${stamp}.webp`;
      const thumbName = `${base}-${stamp}-thumb.webp`;
      const targetPath = path.join(GALLERY_UPLOAD_DIR, fileName);
      const thumbPath = path.join(GALLERY_THUMB_DIR, thumbName);

      const image = sharp(input, { failOn: "none" }).rotate();
      const meta = await image.metadata();

      // Convert to WebP with compression for consistent storage and better transfer size.
      const webpBuffer = await image.webp({ quality: 82 }).toBuffer();
      await fs.writeFile(targetPath, webpBuffer);

      const thumbBuffer = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width: 520, withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer();
      await fs.writeFile(thumbPath, thumbBuffer);

      uploaded.push({
        imageUrl: `/uploads/gallery/${fileName}`,
        thumbnailUrl: `/uploads/gallery/thumbs/${thumbName}`,
        fileName,
        width: meta.width || 0,
        height: meta.height || 0,
        size: webpBuffer.length,
      });
    }

    return NextResponse.json({ success: true, uploaded });
  } catch (error) {
    console.error("POST /api/admin/gallery/upload failed:", error);
    return NextResponse.json({ error: "Upload esuat." }, { status: 500 });
  }
}
