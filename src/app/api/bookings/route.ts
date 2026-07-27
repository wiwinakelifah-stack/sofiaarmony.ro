import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// For now, we'll use environment variables for Twilio credentials
// You'll need to set these in .env.local
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, checkIn, checkOut, room, guests, message } = body;

    // Store booking in a simple JSON file (or database)
    // For production, use a real database
    const bookingData = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      checkIn,
      checkOut,
      room,
      guests,
      message,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Send WhatsApp to admin
    if (ADMIN_WHATSAPP && TWILIO_ACCOUNT_SID) {
      await sendWhatsApp(
        ADMIN_WHATSAPP,
        `📩 New Booking Request\nFrom: ${name}\nEmail: ${email}\nPhone: ${phone}\nCheck-in: ${checkIn}\nGuests: ${guests}\nRoom: ${room}`
      );
    }

    // Send WhatsApp/SMS to customer
    if (phone && TWILIO_ACCOUNT_SID) {
      await sendWhatsApp(
        phone,
        `✅ Sofia Armony\n\nHi ${name}, we received your booking request. We'll confirm within 2 hours.\n\nCheck-in: ${checkIn}\nGuests: ${guests}\nRoom: ${room}`
      );
    }

    // Send email to admin
    if (ADMIN_EMAIL) {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Booking Request from ${name}`,
        html: `
          <h2>New Booking Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Room:</strong> ${room}</p>
          <p><strong>Guests:</strong> ${guests}</p>
          <p><strong>Message:</strong> ${message || 'N/A'}</p>
        `
      });
    }

    // Send confirmation email to customer
    await sendEmail({
      to: email,
      subject: 'Booking Confirmation - Sofia Armony',
      html: `
        <h2>Booking Request Received</h2>
        <p>Hi ${name},</p>
        <p>Thank you for your booking request. We will confirm your reservation within 2 hours.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Check-in:</strong> ${checkIn}</li>
          <li><strong>Check-out:</strong> ${checkOut}</li>
          <li><strong>Room:</strong> ${room}</li>
          <li><strong>Guests:</strong> ${guests}</li>
        </ul>
        <p>Best regards,<br>Sofia Armony Team</p>
      `
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully',
      bookingId: bookingData.id
    });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    );
  }
}

async function sendWhatsApp(to: string, message: string) {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
      console.log('Twilio not configured, skipping WhatsApp');
      return;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${TWILIO_PHONE}`,
          To: `whatsapp:${to}`,
          Body: message,
        }).toString(),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('WhatsApp error:', error);
  }
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    // Using Gmail or your SMTP provider
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email error:', error);
  }
}
