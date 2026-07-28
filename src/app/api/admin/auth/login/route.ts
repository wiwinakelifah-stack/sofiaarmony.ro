import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, loginAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email si parola sunt obligatorii." }, { status: 400 });
    }

    const session = await loginAdmin(email, password);
    if (!session) {
      return NextResponse.json({ error: "Credentiale invalide." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        email: session.email,
        role: session.role,
      },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/auth/login failed:", error);
    return NextResponse.json({ error: "Nu s-a putut efectua autentificarea." }, { status: 500 });
  }
}
