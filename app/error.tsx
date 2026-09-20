'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        An error occurred while loading this view: {error.message || 'Unknown operational error.'}
      </p>
      <Button size="sm" onClick={() => reset()} className="gap-1.5 text-xs mt-2">
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
