import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { getAvailableSlots } from '@/services/appointment/availability';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase();
  const { data } = await supabase.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  try { return NextResponse.json({ slots: await getAvailableSlots(supabase) }); }
  catch (error) { console.error('[appointment] availability failed', { stage: 'APPOINTMENT_AVAILABILITY', message: error instanceof Error ? error.message : 'Unknown error' }); return NextResponse.json({ error: 'Appointment availability is temporarily unavailable.' }, { status: 502 }); }
}
