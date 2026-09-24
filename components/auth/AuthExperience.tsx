'use client';

import { Suspense, type FormEvent, useEffect, useState } from 'react';
import { Headset, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';

type Mode = 'login' | 'signup' | 'forgot';

async function ensureCustomer(accessToken: string) {
  await fetch('/api/customer/onboarding', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
}

function AuthExperienceContent({ initialMode = 'login' }: { initialMode?: Mode }) {
  const router = useRouter(); const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const next = searchParams.get('next')?.startsWith('/') ? searchParams.get('next')! : '/home';

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
        if (data.session) { await ensureCustomer(data.session.access_token); router.replace('/home'); return; }
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
  return <div className="min-h-screen bg-[#26231e] px-5 py-8 text-white"><div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-[#eee7da] shadow-2xl lg:grid-cols-[1.1fr_.9fr]"><section className="relative overflow-hidden bg-gradient-to-br from-[#26231e] via-[#383128] to-[#6d573b] p-8 sm:p-14"><div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border border-[#d5b47c]/30" /><div className="relative"><div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#ecd7b0]"><Headset className="h-4 w-4" /> HOMECARE AI</div><h1 className="mt-12 max-w-xl text-4xl font-semibold leading-tight sm:text-6xl">Intelligent care for every appliance in your home.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#e2d7c7]">AI-powered troubleshooting, effortless service booking, and smarter appliance care — all in one place.</p><div className="mt-12 grid gap-4 text-sm text-[#f0e7db]"><p>01&nbsp;&nbsp; 24/7 AI Assistance</p><p>02&nbsp;&nbsp; Verified Service Support</p><p>03&nbsp;&nbsp; Effortless Appointment Booking</p></div></div></section><section className="flex items-center bg-[#fffdf9] p-7 text-[#29251f] sm:p-12"><div className="w-full"><div className="mb-7 flex rounded-full bg-[#f1ece3] p-1"><button type="button" onClick={() => { setMode('login'); setError(null); setMessage(null); }} className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white shadow-sm' : 'text-[#786f63]'}`}>Login</button><button type="button" onClick={() => { setMode('signup'); setError(null); setMessage(null); }} className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${signup ? 'bg-white shadow-sm' : 'text-[#786f63]'}`}>Create Account</button></div><h2 className="text-3xl font-semibold">{mode === 'forgot' ? 'Reset your password' : signup ? 'Create your account' : 'Welcome back'}</h2><p className="mt-2 text-sm text-[#746b60]">{mode === 'forgot' ? 'We’ll send a secure reset link.' : signup ? 'Your home, thoughtfully looked after.' : 'Sign in to your HomeCare account.'}</p><form onSubmit={submit} className="mt-7 space-y-4">{signup && <label className="block text-sm font-medium">Name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="mt-1.5 w-full rounded-xl border border-[#ded5c8] bg-[#fffdf9] px-3 py-3 outline-none focus:border-[#a67c45]" /></label>}<label className="block text-sm font-medium">Email<div className="relative mt-1.5"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#9a8f80]" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="w-full rounded-xl border border-[#ded5c8] bg-[#fffdf9] py-3 pl-9 pr-3 outline-none focus:border-[#a67c45]" /></div></label>{mode !== 'forgot' && <label className="block text-sm font-medium">Password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-[#9a8f80]" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} required className="w-full rounded-xl border border-[#ded5c8] bg-[#fffdf9] py-3 pl-9 pr-3 outline-none focus:border-[#a67c45]" /></div></label>}{signup && <label className="block text-sm font-medium">Confirm password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required className="mt-1.5 w-full rounded-xl border border-[#ded5c8] bg-[#fffdf9] px-3 py-3 outline-none focus:border-[#a67c45]" /></label>}{error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}{message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}<Button type="submit" className="w-full justify-center" size="lg" disabled={loading}>{loading ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : signup ? 'Create account' : 'Sign in'}</Button></form>{mode !== 'forgot' && <button type="button" onClick={() => { setMode('forgot'); setError(null); setMessage(null); }} className="mt-5 text-sm font-medium text-[#86653b]">Forgot password?</button>} {mode === 'forgot' && <button type="button" onClick={() => setMode('login')} className="mt-5 text-sm font-medium text-[#86653b]">Back to login</button>}</div></section></div></div>;
}

export function AuthExperience({ initialMode = 'login' }: { initialMode?: Mode }) {
  return <Suspense fallback={<div className="min-h-screen bg-[#26231e]" />}><AuthExperienceContent initialMode={initialMode} /></Suspense>;
}
