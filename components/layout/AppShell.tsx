'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isPublic = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/reset-password' || pathname.startsWith('/auth/');
  if (isPublic) return <main className="min-h-screen bg-slate-50">{children}</main>;
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f4ee]">
      {/* Desktop Persistent Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f7f4ee]">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
