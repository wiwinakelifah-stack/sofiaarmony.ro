import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');
const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(path.dirname(REVIEWS_FILE), { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    const body = await request.json();
    const { bookingId, name, email, rating, comment, verifyCode } = body;

    // Verify the booking exists and matches the email
    let bookings = [];
    try {
      const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf-8');
      bookings = JSON.parse(bookingsData);
    } catch (error) {
      console.log('No bookings file yet');
    }

    const booking = bookings.find(
      (b: any) => b.id === bookingId && b.email === email
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or email does not match' },
        { status: 403 }
      );
    }

    // Create review
    const review = {
      id: Date.now().toString(),
      bookingId,
      name,
      email,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verified: true
    };

    // Save review
    let reviews = [];
    try {
      const reviewsData = await fs.readFile(REVIEWS_FILE, 'utf-8');
      reviews = JSON.parse(reviewsData);
    } catch (error) {
      console.log('No reviews file yet');
    }

    reviews.push(review);
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));

    // Mark booking as reviewed
    const updatedBookings = bookings.map((b: any) =>
      b.id === bookingId ? { ...b, hasReview: true } : b
    );
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(updatedBookings, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review
    });

  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    let reviews = [];
    try {
      const reviewsData = await fs.readFile(REVIEWS_FILE, 'utf-8');
      reviews = JSON.parse(reviewsData);
    } catch (error) {
      console.log('No reviews yet');
    }

    return NextResponse.json({
      reviews: reviews.slice(-10) // Return latest 10 reviews
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
