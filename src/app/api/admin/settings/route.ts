import { NextRequest, NextResponse } from 'next/server';
import { readAdminSettings, saveAdminSettings } from '@/lib/admin-settings';

export async function GET() {
  try {
    const settings = await readAdminSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error loading admin settings:', error);
    return NextResponse.json({ error: 'Failed to load admin settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = {
      adminWhatsApp: body.adminWhatsApp || '',
      adminEmail: body.adminEmail || '',
      emailUser: body.emailUser || '',
      emailPassword: body.emailPassword || '',
      whatsappCloudApiToken: body.whatsappCloudApiToken || '',
      whatsappCloudApiPhoneNumberId: body.whatsappCloudApiPhoneNumberId || '',
      whatsappCloudApiVersion: body.whatsappCloudApiVersion || 'v20.0',
    };

    await saveAdminSettings(settings);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error saving admin settings:', error);
    return NextResponse.json({ error: 'Failed to save admin settings' }, { status: 500 });
  }
}