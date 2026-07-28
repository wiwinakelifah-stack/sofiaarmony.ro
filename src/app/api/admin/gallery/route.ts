import { NextRequest, NextResponse } from "next/server";
import { dbExecute, dbQuery } from "@/lib/db";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { requireAdminRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const images = await dbQuery(
      `SELECT id, image_url, thumbnail_url, title_ro, title_en, description_ro, description_en,
       is_active, sort_order, created_at, updated_at
       FROM gallery_images ORDER BY sort_order ASC, id ASC`
    );
    return NextResponse.json({ images });
  } catch (error) {
    console.error("GET /api/admin/gallery failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca galeria." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await ensureDbReady();
    const body = (await request.json()) as {
      imageUrl: string;
      thumbnailUrl?: string | null;
      titleRo?: string | null;
      titleEn?: string | null;
      descriptionRo?: string | null;
      descriptionEn?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    };

    await dbExecute(
      `INSERT INTO gallery_images
      (image_url, thumbnail_url, title_ro, title_en, description_ro, description_en, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.imageUrl,
        body.thumbnailUrl || null,
        body.titleRo || null,
        body.titleEn || null,
        body.descriptionRo || null,
        body.descriptionEn || null,
        body.isActive === false ? 0 : 1,
        body.sortOrder || 0,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/gallery failed:", error);
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
      titleRo?: string | null;
      titleEn?: string | null;
      descriptionRo?: string | null;
      descriptionEn?: string | null;
      isActive?: boolean;
      sortOrder?: number;
      imageUrl?: string;
      thumbnailUrl?: string | null;
    };

    await dbExecute(
      `UPDATE gallery_images SET
       image_url = COALESCE(?, image_url),
       thumbnail_url = COALESCE(?, thumbnail_url),
       title_ro = ?, title_en = ?, description_ro = ?, description_en = ?,
       is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        body.imageUrl || null,
        body.thumbnailUrl ?? null,
        body.titleRo || null,
        body.titleEn || null,
        body.descriptionRo || null,
        body.descriptionEn || null,
        body.isActive === false ? 0 : 1,
        body.sortOrder || 0,
        body.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/gallery failed:", error);
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

    await dbExecute("DELETE FROM gallery_images WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/gallery failed:", error);
    return NextResponse.json({ error: "Nu am putut sterge imaginea." }, { status: 500 });
  }
}
