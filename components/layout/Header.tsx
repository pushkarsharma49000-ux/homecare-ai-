'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Headset, UserRound, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase/client';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [date, setDate] = useState(''); const router = useRouter();
  useEffect(() => { setDate(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).format(new Date())); void (async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session) return; setEmail(session.user.email ?? ''); const response = await fetch('/api/customer/profile', { headers: { Authorization: `Bearer ${session.access_token}` } }); const body = await response.json().catch(() => ({})) as { customer?: { name?: string } }; setName(body.customer?.name ?? session.user.email?.split('@')[0] ?? 'Customer'); })(); }, []);
  const signOut = async () => { await supabase.auth.signOut(); router.replace('/login'); router.refresh(); };

  return (
    <>
      <header className="h-[72px] bg-[#fffdf9]/95 border-b border-[#e5dbcd] px-4 sm:px-7 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/home" className="hidden items-center gap-2 text-sm font-semibold text-[#2b2721] sm:flex"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#29251f] text-[#e7c994]"><Headset className="h-4 w-4" /></span> HomeCare AI</Link>
        </div>

        {/* Right Info Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#4b443a]">{date || '—'}</p><p className="text-[10px] text-[#8b8175]">Asia/Kolkata</p>
          </div>
          <div className="relative"><button onClick={() => setMenuOpen((open) => !open)} className="flex items-center gap-2 rounded-full p-1 text-left hover:bg-[#f2ece3]" aria-label="Open account menu"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8d8bf] text-sm font-semibold text-[#614a2b]">{(name || email || 'C').slice(0, 2).toUpperCase()}</span><span className="hidden sm:block"><span className="block max-w-28 truncate text-xs font-semibold text-[#39342d]">{name || 'Customer'}</span><span className="block max-w-28 truncate text-[10px] text-[#82786c]">{email}</span></span><ChevronDown className="h-4 w-4 text-[#82786c]" /></button>{menuOpen && <div className="absolute right-0 top-12 w-44 rounded-2xl border border-[#e4d9ca] bg-white p-2 shadow-xl"><Link href="/profile" className="block rounded-xl px-3 py-2 text-sm hover:bg-[#f6f1e9]">Profile</Link><Link href="/my-appliances" className="block rounded-xl px-3 py-2 text-sm hover:bg-[#f6f1e9]">My Appliances</Link><Link href="/my-service-requests" className="block rounded-xl px-3 py-2 text-sm hover:bg-[#f6f1e9]">My Requests</Link><button onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f6f1e9]"><LogOut className="h-4 w-4" /> Sign Out</button></div>}</div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
