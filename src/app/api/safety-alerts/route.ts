import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET handler to fetch safety alerts
export async function GET() {
  // Return mock data for now
  return NextResponse.json([
    {
      id: 1,
      title: 'High Crowd Density Warning',
      description: 'Extremely high crowd density detected at Jamaraat Bridge. Consider delaying your visit or use alternative route through Gate 25.',
      location_name: 'Jamaraat Bridge',
      coordinates: { lng: 39.873485, lat: 21.42365 },
      severity: 'danger',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    },
    {
      id: 2,
      title: 'Heat Advisory',
      description: 'Temperatures expected to reach 42°C today. Stay hydrated and seek shade when possible. Water stations available at all major points.',
      location_name: 'All Hajj Sites',
      coordinates: { lng: 39.826174, lat: 21.422487 },
      severity: 'warning',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: 3,
      title: 'Medical Center Location',
      description: 'Medical assistance is available at the newly opened facility near Mina entrance. Follow green signs for directions.',
      location_name: 'Mina',
      coordinates: { lng: 39.892966, lat: 21.413249 },
      severity: 'info',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 259200000).toISOString(),
    },
    {
      id: 4,
      title: 'Scheduled Cleaning',
      description: 'Scheduled cleaning in sections C3-C7 of Masjid al-Haram from 2:00-3:30 AM. Please plan accordingly.',
      location_name: 'Masjid al-Haram',
      coordinates: { lng: 39.826174, lat: 21.422487 },
      severity: 'info',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 43200000).toISOString(),
    },
    {
      id: 5,
      title: 'Lost & Found Center',
      description: 'Lost and found center has been relocated to the south entrance of Arafat. If you lost an item, please check there.',
      location_name: 'Arafat',
      coordinates: { lng: 39.984687, lat: 21.355461 },
      severity: 'info',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 172800000).toISOString(),
    },
  ]);
}

// POST handler to create a new safety alert
export async function POST(request: Request) {
  // Return error if supabaseAdmin is not available
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service role key not configured' },
      { status: 500 }
    );
  }

  try {
    // Get request body
    const body = await request.json();
    
    // Validate request body
    if (!body.title || !body.description || !body.location_name || !body.coordinates || !body.severity || !body.expires_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new safety alert
    const { data, error } = await supabaseAdmin
      .from('safety_alerts')
      .insert({
        title: body.title,
        description: body.description,
        location_name: body.location_name,
        coordinates: body.coordinates,
        severity: body.severity,
        created_at: new Date().toISOString(),
        expires_at: body.expires_at
      })
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating safety alert:', error);
    return NextResponse.json(
      { error: 'Error creating safety alert' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a safety alert
export async function DELETE(request: Request) {
  // Return error if supabaseAdmin is not available
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service role key not configured' },
      { status: 500 }
    );
  }

  try {
    // Get alert ID from URL search params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing alert ID' },
        { status: 400 }
      );
    }

    // Delete the alert
    const { error } = await supabaseAdmin
      .from('safety_alerts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting safety alert:', error);
    return NextResponse.json(
      { error: 'Error deleting safety alert' },
      { status: 500 }
    );
  }
} 