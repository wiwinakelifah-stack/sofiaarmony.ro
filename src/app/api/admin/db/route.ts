import { NextRequest, NextResponse } from "next/server";
import {
  createSqlBackup,
  deleteTableRecord,
  exportDatabaseSql,
  exportTableAsCsv,
  getDatabaseTables,
  getTableRecords,
  listBackups,
  optimizeDatabaseTable,
  restoreSqlBackup,
  restoreSqlPayload,
  updateTableRecord,
} from "@/lib/admin-db";
import { requireAdminRole } from "@/lib/admin-auth";

function pickIdField(table: string) {
  if (table === "reservations") return "id";
  return "id";
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const action = request.nextUrl.searchParams.get("action") || "tables";

  try {
    if (action === "tables") {
      const tables = await getDatabaseTables();
      const backups = await listBackups();
      return NextResponse.json({ tables, backups });
    }

    if (action === "records") {
      const table = request.nextUrl.searchParams.get("table") || "";
      const limit = Number(request.nextUrl.searchParams.get("limit") || "50");
      const offset = Number(request.nextUrl.searchParams.get("offset") || "0");
      const search = request.nextUrl.searchParams.get("search") || undefined;

      if (!table) {
        return NextResponse.json({ error: "Table lipsa." }, { status: 400 });
      }

      const result = await getTableRecords({ table, limit, offset, search });
      return NextResponse.json(result);
    }

    if (action === "export-csv") {
      const table = request.nextUrl.searchParams.get("table") || "";
      if (!table) {
        return NextResponse.json({ error: "Table lipsa." }, { status: 400 });
      }
      const csv = await exportTableAsCsv(table);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=${table}.csv`,
        },
      });
    }

    if (action === "export-sql") {
      const sql = await exportDatabaseSql();
      return new NextResponse(sql, {
        headers: {
          "Content-Type": "application/sql; charset=utf-8",
          "Content-Disposition": "attachment; filename=sofia-db-export.sql",
        },
      });
    }

    return NextResponse.json({ error: "Actiune invalida." }, { status: 400 });
  } catch (error) {
    console.error("GET /api/admin/db failed:", error);
    return NextResponse.json({ error: "Operatiune DB esuata." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = (await request.json()) as
      | { action: "backup" }
      | { action: "restore"; fileName?: string; sql?: string }
      | { action: "optimize"; table: string };

    if (body.action === "backup") {
      const backup = await createSqlBackup();
      return NextResponse.json({ success: true, backup });
    }

    if (body.action === "restore") {
      if (body.fileName) {
        await restoreSqlBackup(body.fileName);
      } else if (body.sql) {
        await restoreSqlPayload(body.sql);
      } else {
        return NextResponse.json({ error: "Lipseste sursa restore." }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (body.action === "optimize") {
      await optimizeDatabaseTable(body.table);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Actiune invalida." }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/db failed:", error);
    return NextResponse.json({ error: "Operatiune DB esuata." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = (await request.json()) as {
      table: string;
      id: string;
      payload: Record<string, unknown>;
    };

    const idField = pickIdField(body.table);
    await updateTableRecord(body.table, idField, body.id, body.payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/db failed:", error);
    return NextResponse.json({ error: "Update DB esuat." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminRole(request, "super_admin");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const table = request.nextUrl.searchParams.get("table") || "";
    const id = request.nextUrl.searchParams.get("id") || "";

    if (!table || !id) {
      return NextResponse.json({ error: "Parametri lipsa." }, { status: 400 });
    }

    const idField = pickIdField(table);
    await deleteTableRecord(table, idField, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/db failed:", error);
    return NextResponse.json({ error: "Delete DB esuat." }, { status: 500 });
  }
}
