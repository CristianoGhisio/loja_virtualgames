import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    let settings = await prisma.storeSettings.findFirst();
    
    // Create default settings if they don't exist yet
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {}
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json({ error: 'Failed to fetch store settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await request.json();
    
    const settings = await prisma.storeSettings.findFirst();
    
    if (!settings) {
      const newSettings = await prisma.storeSettings.create({
        data: body
      });
      return NextResponse.json(newSettings);
    }
    
    const updatedSettings = await prisma.storeSettings.update({
      where: { id: settings.id },
      data: body
    });
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json({ error: 'Failed to update store settings' }, { status: 500 });
  }
}
