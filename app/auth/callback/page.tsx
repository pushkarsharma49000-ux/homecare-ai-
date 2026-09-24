'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter(); const searchParams = useSearchParams(); const [error, setError] = useState(false);
  useEffect(() => { void (async () => {
    const code = searchParams.get('code');
    if (code) { const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code); if (exchangeError) { setError(true); return; } }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError(true); return; }
    await fetch('/api/customer/onboarding', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } });
    router.replace(searchParams.get('next') === '/reset-password' ? '/reset-password' : '/home');
  })(); }, [router, searchParams]);
  return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-xl font-semibold">{error ? 'This link is no longer valid.' : 'Preparing your secure account…'}</h1>{error && <a href="/login" className="mt-3 inline-block text-blue-300">Return to login</a>}</div></main>;
}
