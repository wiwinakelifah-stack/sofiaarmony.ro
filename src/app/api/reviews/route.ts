import { NextRequest, NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db-bootstrap";
import { dbExecute, dbQuery } from "@/lib/db";
import { getPublicReviews, updateReservationReviewFlag } from "@/lib/content-db";

export async function POST(request: NextRequest) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { bookingId, name, email, rating, comment } = body;

    if (!bookingId || !name || !email || !rating || !comment) {
      return NextResponse.json(
        { error: "Campuri obligatorii lipsa." },
        { status: 400 }
      );
    }

    const reservations = await dbQuery<
      Array<{ id: string; email: string; has_review: number }>
    >(
      "SELECT id, email, has_review FROM reservations WHERE id = ? LIMIT 1",
      [bookingId]
    );

    const booking = reservations[0];

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 403 }
      );
    }

    if (booking.email !== String(email).trim()) {
      return NextResponse.json(
        { error: "Email does not match reservation" },
        { status: 403 }
      );
    }

    if (booking.has_review === 1) {
      return NextResponse.json(
        { error: "Review already submitted for this reservation" },
        { status: 409 }
      );
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating invalid" },
        { status: 400 }
      );
    }

    await dbExecute(
      `INSERT INTO reviews (reservation_id, user_name, user_email, rating, comment, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [bookingId, String(name).trim(), String(email).trim(), parsedRating, String(comment).trim()]
    );

    await updateReservationReviewFlag(bookingId, true);

    return NextResponse.json({
      success: true,
      message: "Review trimis cu succes. Va fi publicat dupa aprobare.",
    });

  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reviews = await getPublicReviews();

    return NextResponse.json({
      reviews
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
