import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { readAdminSettings } from '@/lib/admin-settings';

export async function POST(request: NextRequest) {
  try {
    const adminSettings = await readAdminSettings();
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
    if (
      adminSettings.adminWhatsApp &&
      adminSettings.whatsappCloudApiToken &&
      adminSettings.whatsappCloudApiPhoneNumberId
    ) {
      await sendWhatsApp(
        adminSettings.adminWhatsApp,
        `📩 New Booking Request\nFrom: ${name}\nEmail: ${email}\nPhone: ${phone}\nCheck-in: ${checkIn}\nGuests: ${guests}\nRoom: ${room}`,
        adminSettings
      );
    }

    // Send WhatsApp to customer
    if (phone && adminSettings.whatsappCloudApiToken && adminSettings.whatsappCloudApiPhoneNumberId) {
      await sendWhatsApp(
        phone,
        `✅ Sofia Armony\n\nHi ${name}, we received your booking request. We'll confirm within 2 hours.\n\nCheck-in: ${checkIn}\nGuests: ${guests}\nRoom: ${room}`,
        adminSettings
      );
    }

    // Send email to admin
    if (adminSettings.adminEmail) {
      await sendEmail({
        to: adminSettings.adminEmail,
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

async function sendWhatsApp(to: string, message: string, adminSettings: { whatsappCloudApiToken: string; whatsappCloudApiPhoneNumberId: string; whatsappCloudApiVersion: string; }) {
  try {
    if (!adminSettings.whatsappCloudApiToken || !adminSettings.whatsappCloudApiPhoneNumberId) {
      console.log('WhatsApp Cloud API not configured, skipping WhatsApp');
      return;
    }

    const normalizedTo = normalizePhoneNumber(to);

    if (!normalizedTo) {
      console.log('Invalid WhatsApp recipient number, skipping message');
      return;
    }

    const response = await fetch(
      `https://graph.facebook.com/${adminSettings.whatsappCloudApiVersion}/${adminSettings.whatsappCloudApiPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminSettings.whatsappCloudApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedTo,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`WhatsApp Cloud API request failed: ${response.status} ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error('WhatsApp error:', error);
  }
}

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, '');
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
