import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Radio,
  Clock,
  Sparkles,
  Bot,
  User,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Headset,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  AIStateBadge,
  PriorityBadge,
  SentimentBadge,
} from '@/components/ui/StatusBadge';
import { getCallById, getLiveCalls } from '@/lib/services/calls';

interface Props {
  params: {
    id: string;
  };
}

export default async function LiveCallDetailPage({ params }: Props) {
  const call = await getCallById(params.id);
  const liveCalls = await getLiveCalls();

  if (!call) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Navigation and Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/live-calls">
            <Button variant="outline" size="sm" className="h-8 px-2.5">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Monitor</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-500">{call.id}</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm font-bold text-slate-900">{call.customerName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="live" className="text-xs px-3 py-1">
            <Radio className="w-3 h-3 animate-pulse" />
            Live Audio Stream
          </Badge>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{call.duration}</span>
          </div>
        </div>
      </div>

      {/* Real-time Call Metadata Summary (Section 13) */}
      <Card className="border-blue-200/80 bg-gradient-to-r from-blue-50/40 via-white to-white">
        <div className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Caller Info */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                {call.customerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{call.customerName}</h2>
                  <Link
                    href={`/customers/${call.customerId}`}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Customer 360 →
                  </Link>
                </div>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {call.customerPhone} (Inbound Call)
                </p>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 px-3 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Appliance</span>
                <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                  {call.appliance}
                </span>
              </div>

              <div className="p-2.5 px-3 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">AI State</span>
                <div className="mt-0.5">
                  <AIStateBadge state={call.aiState} />
                </div>
              </div>

              <div className="p-2.5 px-3 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">AI Confidence</span>
                <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                  {call.aiConfidence}% Certainty
                </span>
              </div>

              <div className="p-2.5 px-3 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Priority</span>
                <div className="mt-0.5">
                  <PriorityBadge priority={call.priority} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Live Transcript vs AI Understanding & Current Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Transcript (Section 13) */}
        <Card className="lg:col-span-7 flex flex-col h-[580px]">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <CardTitle className="text-sm">Live Audio Transcript</CardTitle>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Real-time voice stream</span>
            </div>
          </CardHeader>

          {/* Transcript Message Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {call.transcript.map((msg) => {
              const isAI = msg.speaker === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-start flex-row-reverse'}`}
                >
                  {/* Speaker Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                      isAI
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[80%] ${isAI ? 'text-left' : 'text-right'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {isAI ? 'HomeCare AI Voice' : call.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAI
                          ? 'bg-blue-50/80 border border-blue-100 text-slate-800 rounded-tl-none'
                          : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tr-none text-left'
                      }`}
                    >
                      <p>"{msg.message}"</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated Live Audio Wave / Listening Indicator */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-400 text-[11px] italic">
                AI Voice Agent is currently {call.aiState.toLowerCase()}...
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="truncate">Sample rate: 16 kHz • Latency: 420 ms • Codec: OPUS</span>
            <span className="font-semibold text-slate-700">VoiceLink Session</span>
          </div>
        </Card>

        {/* Right Column: AI Understanding & Current Action (Section 13) */}
        <div className="lg:col-span-5 space-y-5">
          {/* CURRENT ACTION CARD (Section 13) */}
          <Card className="border-l-4 border-l-blue-600 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  CURRENT ACTION
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                  Executing Action
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/70">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {call.currentAction || 'Creating Service Request...'}
                  </p>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  The AI Agent has confirmed diagnostic criteria and is preparing service ticket SR-10482 in the Action Engine.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI UNDERSTANDING CARD (Section 13) */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm">AI Understanding</CardTitle>
              </div>
              <Badge variant="success" className="text-[11px]">{call.aiConfidence}% Match</Badge>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Intent</span>
                <span className="font-semibold text-slate-900">{call.analysis.intent}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Appliance</span>
                <span className="font-semibold text-slate-900">{call.analysis.appliance}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Classified Issue</span>
                <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
                  {call.analysis.issue}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Detected Sentiment</span>
                <SentimentBadge sentiment={call.sentiment} />
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Priority Rating</span>
                <PriorityBadge priority={call.priority} />
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500 font-medium">Confidence Score</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{call.aiConfidence}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Other Active Channels Widget */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 border-b border-slate-100">
              <CardTitle className="text-xs uppercase text-slate-500">Other Active Calls ({liveCalls.length - 1})</CardTitle>
            </CardHeader>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {liveCalls
                .filter((c) => c.id !== call.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/live-calls/${c.id}`}
                    className="p-2.5 px-4 flex items-center justify-between hover:bg-slate-50 text-xs transition-colors block"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{c.customerName}</p>
                      <p className="text-[11px] text-slate-500">{c.appliance} • {c.issue}</p>
                    </div>
                    <span className="font-mono text-slate-500 text-[11px]">{c.duration}</span>
                  </Link>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
