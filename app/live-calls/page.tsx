import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Clock,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Headset,
  PhoneCall,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  AIStateBadge,
  PriorityBadge,
  SentimentBadge,
} from '@/components/ui/StatusBadge';
import { getLiveCalls } from '@/lib/services/calls';
import { formatDuration } from '@/lib/services/adapters';

export default async function LiveCallsPage() {
  const liveCalls = await getLiveCalls();

  const totalActive = liveCalls.length;
  const aiHandling = liveCalls.filter((c) => c.aiState !== 'Escalated').length;
  const escalated = liveCalls.filter((c) => c.aiState === 'Escalated').length;
  const avgDuration =
    totalActive > 0
      ? formatDuration(
          Math.round(
            liveCalls.reduce((acc, c) => acc + c.durationSeconds, 0) / totalActive
          )
        )
      : '00:00';

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Calls Monitoring Center</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time supervisor cockpit for active inbound calls on +91 toll-free telephony
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="live" className="text-xs px-3 py-1">
            <Radio className="w-3.5 h-3.5" />
            VoiceLink Telephony Connected
          </Badge>
        </div>
      </div>

      {/* Monitoring Metrics (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Inbound Calls</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalActive}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Live on VoiceLink Trunk</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">AI Autonomous Handling</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{aiHandling}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Diagnosing & resolving</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-600">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Escalated to Human</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{escalated}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Urgent supervisor review</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Avg Current Duration</p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{avgDuration}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across active streams</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Live Calls Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div>
            <CardTitle className="text-base">Active Calls Stream</CardTitle>
            <p className="text-xs text-slate-500">Click any call to open real-time transcript and AI reasoning drawer</p>
          </div>
          <Badge variant="secondary">{liveCalls.length} Channels Active</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Appliance</th>
                <th className="px-5 py-3">Intent</th>
                <th className="px-5 py-3">Reported Issue</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">AI State</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Confidence</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {liveCalls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Radio className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700 text-sm">No live calls in progress</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Active calls on public.calls with status = 'in_progress' will appear here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                liveCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{call.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{call.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {call.appliance}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-slate-700 font-medium">{call.intent}</span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-800 font-normal">
                      {call.issue}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 flex items-center gap-1.5 pt-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {call.duration}
                    </td>
                    <td className="px-5 py-3.5">
                      <AIStateBadge state={call.aiState} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={call.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>{call.aiConfidence}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/live-calls/${call.id}`}>
                        <Button size="sm" className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                          <span>Monitor Live</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
