import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences, saveUserPreferences } from '@/lib/services/market-data';

export async function GET(request: NextRequest) {
  try {
    const prefs = await getUserPreferences();
    
    // Don't expose sensitive tokens in response
    return NextResponse.json({
      success: true,
      data: {
        user_id: prefs?.zerodha_user_id || null,
        is_configured: !!(prefs?.zerodha_access_token),
        scan_interval_minutes: prefs?.scan_interval_minutes || 5,
      },
    });
  } catch (error) {
    console.error('Error checking Zerodha config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zerodha_user_id, zerodha_api_key, zerodha_access_token, scan_interval_minutes } = body;

    if (!zerodha_user_id || !zerodha_api_key || !zerodha_access_token) {
      return NextResponse.json(
        { success: false, error: 'Missing required credentials' },
        { status: 400 }
      );
    }

    // Validate credentials by making a test API call
    // In production, you would actually call Zerodha's API to verify
    
    const result = await saveUserPreferences({
      zerodha_user_id,
      zerodha_api_key,
      zerodha_access_token,
      scan_interval_minutes: scan_interval_minutes || 5,
    });

    if (!result.success) {
      throw result.error;
    }

    return NextResponse.json({
      success: true,
      message: 'Zerodha credentials configured successfully',
    });
  } catch (error) {
    console.error('Error configuring Zerodha:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to configure Zerodha credentials' },
      { status: 500 }
    );
  }
}
