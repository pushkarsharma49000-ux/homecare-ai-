import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Wrench,
  User,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  RequestStatusBadge,
  PriorityBadge,
} from '@/components/ui/StatusBadge';
import { getServiceRequestById } from '@/lib/services/service-requests';

interface Props {
  params: {
    id: string;
  };
}

export default async function ServiceRequestDetailPage({ params }: Props) {
  const sr = await getServiceRequestById(params.id);

  if (!sr) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/service-requests">
            <Button variant="outline" size="sm" className="h-8 px-2.5">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Requests</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-blue-600">{sr.id}</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm font-bold text-slate-900">{sr.appliance}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RequestStatusBadge status={sr.status} />
          <PriorityBadge priority={sr.priority} />
        </div>
      </div>

      {/* Main Request Header Summary (Section 21) */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600">{sr.id}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">{sr.appliance}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{sr.issue}</h1>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Brand & Model: <span className="font-semibold text-slate-800">{sr.brand} — {sr.model}</span>
                </p>
              </div>
            </div>

            {/* Customer & Location Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-w-[300px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Customer & Service Location</span>
              <div className="mt-1">
                <Link
                  href={`/customers/${sr.customerId}`}
                  className="font-bold text-slate-900 hover:text-blue-600 hover:underline text-sm block"
                >
                  {sr.customerName}
                </Link>
                <p className="font-mono text-xs text-slate-500 mt-0.5">{sr.customerPhone}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{sr.customerAddress}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Priority</span>
              <div className="mt-1">
                <PriorityBadge priority={sr.priority} />
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Status</span>
              <div className="mt-1">
                <RequestStatusBadge status={sr.status} />
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Technician</span>
              <span className="font-semibold text-slate-800 text-sm mt-1 block">
                {sr.assignedTechnician || 'Pending Assignment'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Appointment</span>
              <span className="font-semibold text-slate-800 text-sm mt-1 block">
                {sr.scheduledDate || 'Awaiting Scheduling'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: AI Summary, Recommended Action & Source (Section 21) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Summary & Recommended Action */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI SUMMARY (Section 21) */}
          <Card className="shadow-sm border-blue-100 bg-gradient-to-r from-blue-50/20 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-100 text-blue-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm">AI Summary</CardTitle>
              </div>
              <Badge variant="default" className="text-[10px]">Natural Voice Diagnostic</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-subtle font-medium">
                "{sr.aiSummary}"
              </p>
            </CardContent>
          </Card>

          {/* RECOMMENDED ACTION (Section 21) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm">Recommended Action</CardTitle>
              </div>
              <Badge variant="success" className="text-[10px]">Prescribed by AI Policy</Badge>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-slate-800">
                <p className="text-sm font-bold text-emerald-900">{sr.recommendedAction}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Required parts checklist, OEM safety protocol, and calibration tolerances pre-loaded into technician mobile terminal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SOURCE & ORIGINATING CALL (Section 21) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm">Originating Source</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                    AI Voice Call Interaction
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {sr.callId || 'Direct Inbound'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Inbound Toll-Free (+91)</span>
                  </div>
                </div>

                {sr.callId && (
                  <Link href={`/calls/${sr.callId}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <span>Inspect Call Transcript</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: PROGRESSION TIMELINE (Section 21) */}
        <Card className="lg:col-span-5 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-sm">Service Request Timeline</CardTitle>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{sr.created}</span>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="relative pl-6 border-l-2 border-blue-200 space-y-6 my-1">
              {sr.timeline.map((event, idx) => {
                const isCompleted = event.status === 'completed';
                const isCurrent = event.status === 'current';
                return (
                  <div key={event.id} className="relative">
                    <span
                      className={`w-3.5 h-3.5 rounded-full absolute -left-[31px] top-0.5 ring-4 ring-white ${
                        isCompleted
                          ? 'bg-emerald-600'
                          : isCurrent
                          ? 'bg-blue-600 animate-pulse'
                          : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold ${
                          isCompleted
                            ? 'text-slate-900'
                            : isCurrent
                            ? 'text-blue-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {event.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{event.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
