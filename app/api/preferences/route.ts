import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences, saveUserPreferences } from '@/lib/services/market-data';

export async function GET(request: NextRequest) {
  try {
    const prefs = await getUserPreferences();
    return NextResponse.json({
      success: true,
      data: prefs || {},
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await saveUserPreferences(body);

    if (!result.success) {
      throw result.error;
    }

    const prefs = await getUserPreferences();
    return NextResponse.json({
      success: true,
      data: prefs,
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
