'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Tv,
  ClipboardList,
  UserRound,
  Headset,
  Mic,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase/client';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'default' | 'live' | 'secondary' | 'warning';
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/home', icon: Mic },
  { label: 'AI Support', href: '/ai-support', icon: Headset },
  { label: 'My Appliances', href: '/my-appliances', icon: Tv },
  { label: 'My Service Requests', href: '/my-requests', icon: ClipboardList },
  { label: 'Profile', href: '/profile', icon: UserRound },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setUserEmail(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNavigate?.();
    router.replace('/login');
    router.refresh();
  };

  return (
    <aside
      className={cn(
        'w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 h-screen border-r border-slate-800 select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-800/80">
        <Link
          href="/home"
          onClick={onNavigate}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
            <Headset className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">HomeCare</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
              AI Support Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Website AI Support Status */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Website AI Support
          </span>
          <span className="text-emerald-400 font-medium">Live</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">Browser voice + chat</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Customer account
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                    item.badgeVariant === 'live'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                      : isActive
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Supported Appliances Badge / Footer */}
      <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-800/60 border border-slate-800 text-[11px]">
        <div className="flex items-center gap-1.5 text-blue-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Appliance Support</span>
        </div>
        <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
          AC • Washing Machine • Refrigerator • TV • Water Purifier
        </p>
      </div>

      {/* User Profile Section */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-white">
            PN
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-white truncate">{userEmail || 'Customer'}</p>
            <p className="text-[10px] text-slate-400 truncate">Your HomeCare account</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span title="Authenticated access">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </span>
          {userEmail && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
