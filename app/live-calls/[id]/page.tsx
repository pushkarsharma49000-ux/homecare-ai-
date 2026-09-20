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

      {/* TOP CALL CONTEXT BAR (Section 13) */}
      <Card className="bg-slate-900 text-white shadow-md border-0">
        <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              {call.customerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-white">{call.customerName}</h3>
                <span className="text-xs font-mono text-slate-400">{call.customerPhone}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium">
                  {call.appliance}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-medium">Inbound Diagnostic Call</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">AI State</span>
              <AIStateBadge state={call.aiState} />
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Sentiment</span>
              <SentimentBadge sentiment={call.sentiment} />
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Priority</span>
              <PriorityBadge priority={call.priority} />
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs bg-rose-600 hover:bg-rose-700"
            >
              <Headset className="w-3.5 h-3.5" />
              <span>Take Over Call</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* MAIN TWO-COLUMN WORKSPACE */}
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
            {call.transcript.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">Connecting audio stream / waiting for speaker input...</p>
              </div>
            ) : (
              call.transcript.map((msg) => {
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
              })
            )}

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
                    {call.currentAction || 'Diagnosing customer inquiry...'}
                  </p>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  The AI Agent has confirmed diagnostic criteria and is preparing service ticket recommendations.
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
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Identified Intent</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{call.intent}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Reported Problem</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{call.issue}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Registered Appliance Match</span>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200/70 mt-1 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{call.appliance}</span>
                    <span className="text-[11px] text-slate-500 block font-mono">Serial: Active</span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Autonomous Next Step</span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  Schedule technician visit slot for physical inspection and issue resolution.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
