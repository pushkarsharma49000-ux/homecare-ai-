'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Headset, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';

type Mode = 'login' | 'signup' | 'forgot';

async function ensureCustomer(accessToken: string) {
  await fetch('/api/customer/onboarding', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
}

export function AuthExperience({ initialMode = 'login' }: { initialMode?: Mode }) {
  const router = useRouter(); const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const next = searchParams.get('next')?.startsWith('/') ? searchParams.get('next')! : '/ai-support';

  useEffect(() => { void supabase.auth.getSession().then(async ({ data }) => { if (data.session) { await ensureCustomer(data.session.access_token); router.replace(next); } }); }, [next, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(null); setMessage(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError('Enter a valid email address.');
    if (mode === 'signup' && name.trim().length < 2) return setError('Enter your name.');
    if (mode === 'signup' && password.length < 8) return setError('Use a password with at least 8 characters.');
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
        if (resetError) throw resetError;
        setMessage('If this email has an account, a password-reset link has been sent.');
      } else if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email: normalizedEmail, password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
        if (signUpError) throw signUpError;
        if (data.session) { await ensureCustomer(data.session.access_token); router.replace('/my-appliances'); return; }
        setMessage('Check your email to confirm your account, then sign in.'); setMode('login');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (signInError || !data.session) throw signInError ?? new Error('Sign in failed.');
        await ensureCustomer(data.session.access_token); router.replace(next);
      }
    } catch { setError(mode === 'forgot' ? 'Unable to send a reset link right now.' : 'Unable to continue. Check your details and try again.'); }
    finally { setLoading(false); }
  };

  const signup = mode === 'signup';
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-10 text-white"><div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]"><section><div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-sm text-blue-200"><Headset className="h-4 w-4" /> HomeCare AI</div><h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">AI-powered appliance support and service booking.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Get trusted troubleshooting, arrange technician service, and manage your appointments in one secure customer account.</p></section><section className="rounded-3xl border border-white/10 bg-white p-7 text-slate-900 shadow-2xl shadow-black/30"><div className="mb-6 flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => { setMode('login'); setError(null); setMessage(null); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Login</button><button type="button" onClick={() => { setMode('signup'); setError(null); setMessage(null); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${signup ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Create Account</button></div><h2 className="text-2xl font-bold">{mode === 'forgot' ? 'Reset your password' : signup ? 'Create your account' : 'Welcome back'}</h2><p className="mt-1 text-sm text-slate-500">{mode === 'forgot' ? 'We’ll send a secure reset link.' : signup ? 'Start with your appliance support account.' : 'Sign in to continue to HomeCare AI.'}</p><form onSubmit={submit} className="mt-6 space-y-4">{signup && <label className="block text-sm font-medium">Name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" /></label>}<label className="block text-sm font-medium">Email<div className="relative mt-1.5"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 outline-none focus:border-blue-500" /></div></label>{mode !== 'forgot' && <label className="block text-sm font-medium">Password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} required className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 outline-none focus:border-blue-500" /></div></label>}{signup && <label className="block text-sm font-medium">Confirm password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" /></label>}{error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}{message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}<Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>{loading ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : signup ? 'Create account' : 'Sign in'}</Button></form>{mode !== 'forgot' && <button type="button" onClick={() => { setMode('forgot'); setError(null); setMessage(null); }} className="mt-4 text-sm font-medium text-blue-700">Forgot password?</button>} {mode === 'forgot' && <button type="button" onClick={() => setMode('login')} className="mt-4 text-sm font-medium text-blue-700">Back to login</button>}</section></div></div>;
}
