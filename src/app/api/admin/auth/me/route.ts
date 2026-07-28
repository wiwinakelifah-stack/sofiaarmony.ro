import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentAdminFromRequest(request);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.userId,
      email: user.email,
      role: user.role,
    },
  });
}
