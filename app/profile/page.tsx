'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type Customer = { id: string; name: string; email: string };
export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  useEffect(() => { void (async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session) return; const response = await fetch('/api/customer/profile', { headers: { Authorization: `Bearer ${session.access_token}` } }); const body = await response.json() as { customer?: Customer }; setCustomer(body.customer ?? null); })(); }, []);
  return <div className="mx-auto max-w-2xl space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">HomeCare AI</p><h1 className="mt-2 text-3xl font-bold">Profile</h1></div><Card><CardHeader><CardTitle>Your account</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-slate-500">Name</p><p className="font-medium">{customer?.name ?? 'Loading…'}</p></div><div><p className="text-slate-500">Email</p><p className="font-medium">{customer?.email ?? 'Loading…'}</p></div></CardContent></Card></div>;
}
