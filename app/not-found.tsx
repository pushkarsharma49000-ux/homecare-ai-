import React from 'react';
import Link from 'next/link';
import { Headset, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
        <Headset className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Record Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        The requested support call, appliance record, customer profile, or service ticket does not exist or has been archived.
      </p>
      <Link href="/">
        <Button size="sm" className="gap-1.5 text-xs mt-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
