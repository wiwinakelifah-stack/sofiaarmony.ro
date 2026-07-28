import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/content-db";
import { requireAdminRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole(request, "admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const dashboard = await getDashboardData();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("GET /api/admin/dashboard failed:", error);
    return NextResponse.json({ error: "Nu am putut incarca dashboard-ul." }, { status: 500 });
  }
}
