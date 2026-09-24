import { NextResponse } from 'next/server';
import { resolveCustomerForUser } from '@/lib/customers/resolve';
import { getServerSupabase } from '@/lib/supabase/server';

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

async function authenticatedCustomer(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user) return null;
  const customer = await resolveCustomerForUser(supabase, auth.user);
  return customer ? { supabase, customer } : null;
}

export async function GET(request: Request) {
  try {
    const context = await authenticatedCustomer(request);
    if (!context) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const { data, error } = await context.supabase.from('appliances').select('id, appliance_type, brand, model, status, warranty_end_date').eq('customer_id', context.customer.id).order('created_at');
    if (error) throw error;
    return NextResponse.json({ appliances: data ?? [] });
  } catch (error) {
    console.error('[my-appliances] load failed', { code: typeof error === 'object' && error && 'code' in error ? error.code : undefined, message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Unable to load your appliances.' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await authenticatedCustomer(request);
    if (!context) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const applianceType = text(body.applianceType).toLowerCase().replace(/[\s-]+/g, '_');
    const brand = text(body.brand); const model = text(body.model);
    if (!applianceType || !brand || !model || applianceType.length > 100 || brand.length > 100 || model.length > 150) return NextResponse.json({ error: 'Appliance type, brand, and model are required.' }, { status: 400 });
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await context.supabase.from('appliances').insert({ customer_id: context.customer.id, appliance_type: applianceType, brand, model, serial_number: `UNVERIFIED-${crypto.randomUUID()}`, status: 'active', purchase_date: today, warranty_start_date: today, warranty_end_date: today }).select('id, appliance_type, brand, model, status, warranty_end_date').single();
    if (error) throw error;
    return NextResponse.json({ appliance: data }, { status: 201 });
  } catch (error) {
    console.error('[my-appliances] create failed', { code: typeof error === 'object' && error && 'code' in error ? error.code : undefined, message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Unable to save your appliance.' }, { status: 409 });
  }
}
