'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(null); if (password.length < 8) return setError('Use at least 8 characters.'); if (password !== confirm) return setError('Passwords do not match.'); setLoading(true); const { error: updateError } = await supabase.auth.updateUser({ password }); setLoading(false); if (updateError) return setError('Unable to update your password. Request a new reset link.'); router.replace('/ai-support'); };
  return <main className="grid min-h-screen place-items-center bg-slate-950 p-6"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-7"><h1 className="text-2xl font-bold">Set a new password</h1><label className="mt-5 block text-sm font-medium">New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5 w-full rounded-xl border p-2.5" /></label><label className="mt-4 block text-sm font-medium">Confirm password<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1.5 w-full rounded-xl border p-2.5" /></label>{error && <p className="mt-4 text-sm text-rose-700">{error}</p>}<Button type="submit" className="mt-5 w-full justify-center" disabled={loading}>{loading ? 'Saving…' : 'Save password'}</Button></form></main>;
}
