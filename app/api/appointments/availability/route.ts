import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const { data } = await getServerSupabase().auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const slots = [1, 2, 3].map((days, index) => {
    const start = new Date(); start.setDate(start.getDate() + days); start.setHours(index === 1 ? 15 : 10, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { id: `${start.toISOString()}_${end.toISOString()}`, start: start.toISOString(), end: end.toISOString(), timezone: 'Asia/Kolkata', technicianName: 'HomeCare technician' };
  });
  return NextResponse.json({ slots });
}
