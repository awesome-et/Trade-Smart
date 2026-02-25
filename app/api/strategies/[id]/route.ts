import { NextRequest, NextResponse } from 'next/server'
import { createServerSideClient } from '@/lib/auth-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSideClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: strategy, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !strategy) {
      return NextResponse.json(
        { success: false, error: 'Strategy not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: strategy })
  } catch (error) {
    console.error('Error fetching strategy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch strategy' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSideClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, status, parameters } = body

    // Get current strategy
    const { data: currentStrategy, error: fetchError } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentStrategy) {
      return NextResponse.json(
        { success: false, error: 'Strategy not found' },
        { status: 404 }
      )
    }

    // Update strategy
    const { data: updatedStrategy, error: updateError } = await supabase
      .from('strategies')
      .update({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(parameters && { parameters }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, data: updatedStrategy })
  } catch (error) {
    console.error('Error updating strategy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update strategy' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSideClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify strategy exists
    const { data: strategy, error: fetchError } = await supabase
      .from('strategies')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError || !strategy) {
      return NextResponse.json(
        { success: false, error: 'Strategy not found' },
        { status: 404 }
      )
    }

    // Delete strategy (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('strategies')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Strategy deleted successfully',
      deletedId: params.id 
    })
  } catch (error) {
    console.error('Error deleting strategy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete strategy' },
      { status: 500 }
    )
  }
}
