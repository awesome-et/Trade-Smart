import { NextRequest, NextResponse } from 'next/server'
import { createServerSideClient } from '@/lib/auth-server'
import { 
  getAllStrategies, 
  getActiveStrategies, 
  createStrategy,
  getStrategy 
} from '@/lib/services/strategy-manager'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSideClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active') === 'true';
    const id = searchParams.get('id');

    if (id) {
      const strategy = await getStrategy(id);
      if (!strategy) {
        return NextResponse.json(
          { success: false, error: 'Strategy not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: strategy });
    }

    const strategies = active ? await getActiveStrategies() : await getAllStrategies();
    return NextResponse.json({
      success: true,
      data: strategies,
      count: strategies.length,
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch strategies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSideClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json();
    const { name, description, strategy_type, parameters } = body;

    if (!name || !strategy_type || !parameters) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const strategy = await createStrategy(name, description || '', strategy_type, parameters);
    
    if (!strategy) {
      throw new Error('Failed to create strategy');
    }

    return NextResponse.json(
      { success: true, data: strategy },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create strategy' },
      { status: 500 }
    );
  }
}
