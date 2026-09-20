import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  User,
  CheckCircle2,
  Phone,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  SentimentBadge,
  OutcomeBadge,
  PriorityBadge,
  AIStateBadge,
} from '@/components/ui/StatusBadge';
import { getCallById } from '@/lib/services/calls';

interface Props {
  params: {
    id: string;
  };
}

export default async function CallDetailPage({ params }: Props) {
  const call = await getCallById(params.id);

  if (!call) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/calls">
            <Button variant="outline" size="sm" className="h-8 px-2.5">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Calls</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-500">{call.id}</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm font-bold text-slate-900">{call.customerName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OutcomeBadge outcome={call.outcome} />
          {call.isLive && (
            <Badge variant="live" className="text-xs">
              Live Stream
            </Badge>
          )}
        </div>
      </div>

      {/* Top Summary Card (Section 15) */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Customer & Appliance Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {call.customerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">{call.customerName}</h2>
                  <Link
                    href={`/customers/${call.customerId}`}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Customer Profile →
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {call.customerPhone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {call.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Duration: {call.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Key Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Appliance</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{call.appliance}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Intent</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{call.intent}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Sentiment</span>
                <div className="mt-0.5">
                  <SentimentBadge sentiment={call.sentiment} />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Priority</span>
                <div className="mt-0.5">
                  <PriorityBadge priority={call.priority} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* AI SUMMARY (Section 15) */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50/30 to-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm">AI Executive Summary</CardTitle>
          </div>
          <Badge variant="default" className="text-[11px]">
            AI Confidence: {call.aiConfidence}%
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200/70 shadow-subtle">
            "{call.analysis.summary}"
          </p>
        </CardContent>
      </Card>

      {/* Main Grid: Call Transcript & AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CALL TRANSCRIPT (Section 15) */}
        <Card className="lg:col-span-7 flex flex-col h-[560px]">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-sm">Speaker-by-Speaker Transcript</CardTitle>
            </div>
            <span className="text-[11px] text-slate-400">
              {call.transcript.length} turns recorded
            </span>
          </CardHeader>

          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
            {call.transcript.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">No transcript messages recorded for this call.</p>
              </div>
            ) : (
              call.transcript.map((msg) => {
                const isAI = msg.speaker === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-start flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                        isAI
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-white shadow-sm'
                      }`}
                    >
                      {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[80%] ${isAI ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {isAI ? 'HomeCare AI Voice Agent' : call.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          isAI
                            ? 'bg-blue-50 border border-blue-100 text-slate-800 rounded-tl-none'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tr-none text-left shadow-subtle'
                        }`}
                      >
                        <p>"{msg.message}"</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: AI ANALYSIS & ACTIONS TAKEN (Section 15) */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI ANALYSIS CARD */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm">AI Analysis</CardTitle>
              </div>
              <Badge variant="success">{call.aiConfidence}% Certainty</Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Intent</span>
                <span className="font-semibold text-slate-900">{call.analysis.intent}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Appliance</span>
                <span className="font-semibold text-slate-900">{call.analysis.appliance}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Issue</span>
                <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
                  {call.analysis.issue}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Sentiment</span>
                <SentimentBadge sentiment={call.sentiment} />
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Priority</span>
                <PriorityBadge priority={call.priority} />
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-500 font-medium">Confidence Score</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{call.aiConfidence}%</span>
              </div>
            </CardContent>
          </Card>

          {/* ACTIONS TAKEN (Section 15) */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm">Actions Taken</CardTitle>
              </div>
              <Badge variant="secondary">
                {call.actionsTaken.filter((a) => a.completed).length} / {call.actionsTaken.length} Done
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              {call.actionsTaken.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No actions logged for this call.</p>
              ) : (
                <div className="space-y-3">
                  {call.actionsTaken.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/60"
                    >
                      <div className="mt-0.5">
                        {action.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{action.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono">{action.action}</span>
                          <span>•</span>
                          <span>{action.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
