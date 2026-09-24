'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUp, Mic, MessageSquareText, ShieldCheck, CalendarCheck2, MicOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BrowserVoiceService, voiceStateLabels } from '@/services/voice';
import { GeminiLiveProvider } from '@/services/voice/providers/gemini-live';
import type { VoiceTranscriptEvent } from '@/services/voice/types';
import type { VoiceServiceStatus, VoiceState } from '@/types/ai-support';
import { ConversationOrchestrator, createConversationContext } from '@/services/conversation';
import type { ConversationStage } from '@/types/ai-support';

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Hi there. I can help with troubleshooting, appointment scheduling, and service tracking for your appliance.',
  },
];

export default function AISupportPage() {
  const searchParams = useSearchParams();
  const selectedAppliance = searchParams.get('appliance')?.replace(/[^a-z_]/g, '') || '';
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [voiceStatus, setVoiceStatus] = useState<VoiceServiceStatus>({
    microphonePermission: 'unknown',
    audioSession: 'idle',
    browserSupported: true,
  });
  const [amplitude, setAmplitude] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [assistantTranscript, setAssistantTranscript] = useState('');
  const [conversationStage, setConversationStage] = useState<ConversationStage>('GREETING');
  const [isSending, setIsSending] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [supportContext, setSupportContext] = useState<{ customerName: string | null; applianceType: string | null; applianceName: string | null }>({ customerName: null, applianceType: selectedAppliance || null, applianceName: null });
  const voiceServiceRef = useRef<BrowserVoiceService>();
  const providerRef = useRef<GeminiLiveProvider>();
  const orchestratorRef = useRef<ConversationOrchestrator>();

  if (!voiceServiceRef.current) voiceServiceRef.current = new BrowserVoiceService();
  if (!providerRef.current) providerRef.current = new GeminiLiveProvider();
  if (!orchestratorRef.current) {
    orchestratorRef.current = new ConversationOrchestrator({
      context: createConversationContext({
        customer: { name: null, customerId: null },
        appliance: { applianceId: null, brand: null, model: null, category: null, warrantyStatus: null },
        isDemoContext: false,
      }),
      onEvent: (event) => setConversationStage(event.stage),
    });
  }
  const voiceService = voiceServiceRef.current;
  const provider = providerRef.current;
  const orchestrator = orchestratorRef.current;

  useEffect(() => {
    const updateStatus = () => setVoiceStatus(voiceService.getStatus());
    const unsubscribeVoice = voiceService.subscribe((event) => {
      setVoiceState(event.state);
      updateStatus();
    });
    const unsubscribeAmplitude = voiceService.subscribeAmplitude(setAmplitude);
    const unsubscribeTranscript = voiceService.subscribeTranscript((event: VoiceTranscriptEvent) => {
      if (event.kind.startsWith('USER_')) setUserTranscript(event.text);
      if (event.kind.startsWith('ASSISTANT_')) setAssistantTranscript(event.text);
      setConversationStage(orchestrator.handleTranscript(event).stage);
    });
    const unsubscribeStatus = voiceService.subscribeStatus(updateStatus);
    voiceService.attachProvider(provider);
    updateStatus();

    return () => {
      unsubscribeVoice();
      unsubscribeAmplitude();
      unsubscribeTranscript();
      unsubscribeStatus();
      void voiceService.disconnect();
    };
  }, [orchestrator, provider, voiceService]);

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(`/api/support/context?applianceType=${encodeURIComponent(selectedAppliance)}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!response.ok) return;
      const context = await response.json() as { customer: { id: string; name: string } | null; appliance: { id: string; appliance_type: string; brand: string; model: string; warranty_end_date: string } | null };
      setSupportContext({ customerName: context.customer?.name ?? null, applianceType: selectedAppliance || (context.appliance?.appliance_type ?? null), applianceName: context.appliance ? `${context.appliance.brand} ${context.appliance.model}` : null });
      if (context.customer || context.appliance || selectedAppliance) orchestrator.updateContext({
        customer: { customerId: context.customer?.id ?? null, name: context.customer?.name ?? null },
        appliance: selectedAppliance ? { applianceId: null, category: selectedAppliance, brand: null, model: null, warrantyStatus: null } : context.appliance ? { applianceId: context.appliance.id, category: context.appliance.appliance_type, brand: context.appliance.brand, model: context.appliance.model, warrantyStatus: context.appliance.warranty_end_date } : undefined,
        isDemoContext: false,
      });
    })();
  }, [orchestrator, selectedAppliance]);

  const statusTone = useMemo(() => {
    switch (voiceState) {
      case 'LISTENING':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'AI_SPEAKING':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'INTERRUPTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  }, [voiceState]);

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', content: trimmed }]);
    setInput('');
    setVoiceState('PROCESSING');
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to use AI Support.');
      const context = orchestrator.getContext();
      const response = await fetch('/api/support/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ message: trimmed, applianceType: context.appliance.category, category: context.issue.category }),
      });
      const result = await response.json() as { answer?: string; error?: string; sources?: { title?: string }[] };
      if (!response.ok || !result.answer) throw new Error(result.error ?? 'Unable to respond right now.');
      orchestrator.handleTranscript({ kind: 'USER_TRANSCRIPT_FINAL', text: trimmed });
      orchestrator.handleTranscript({ kind: 'ASSISTANT_TRANSCRIPT_FINAL', text: result.answer });
      setSources((result.sources ?? []).map((source) => source.title).filter((title): title is string => Boolean(title)));
      const answer = result.answer;
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: answer }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: error instanceof Error ? error.message : 'Unable to respond right now.' }]);
    } finally { setIsSending(false); setVoiceState('IDLE'); }
  };

  const handleVoiceAction = async () => {
    if (voiceStatus.audioSession === 'listening') {
      await voiceService.stopListening();
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      await voiceService.connectProvider({ systemContext: orchestrator.buildSystemContext(), accessToken: session?.access_token });
      await voiceService.startListening();
    }
    setVoiceStatus(voiceService.getStatus());
  };

  const microphoneLabel = !voiceStatus.browserSupported
    ? 'Microphone unavailable'
    : voiceStatus.microphonePermission === 'denied'
    ? 'Permission required'
    : voiceStatus.audioSession === 'listening'
    ? voiceStateLabels[voiceState]
    : 'Start voice support';

  const statusMessage = voiceStatus.errorMessage ??
    (voiceStatus.audioSession === 'listening'
      ? 'Audio stays local in this browser session.'
      : 'Microphone access is required to use voice support.');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#9a7440] font-semibold">HomeCare AI</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2b2721]">{selectedAppliance ? `${selectedAppliance.replaceAll('_', ' ')} support` : 'How can we help?'}</h1><p className="mt-2 text-sm text-[#756d62]">Tell me what’s happening and we’ll guide you through the next step.</p>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${statusTone}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          {voiceStatus.audioSession === 'error' || !voiceStatus.browserSupported
            ? microphoneLabel
            : voiceStateLabels[voiceState]}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="min-h-[620px] border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>AI Support Conversation</CardTitle>
                <p className="text-xs text-slate-500">Issue → Diagnosis → Recommendation → Appointment</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === 'assistant' ? 'flex justify-start' : 'flex justify-end'}
                >
                  <div
                    className={
                      message.role === 'assistant'
                        ? 'max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm border border-slate-200'
                        : 'max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white shadow-sm'
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {userTranscript && <p className="text-xs italic text-slate-500">You: {userTranscript}</p>}
              {assistantTranscript && <p className="text-xs italic text-blue-700">AI: {assistantTranscript}</p>}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about your issue, diagnosis steps, or service options..."
                  className="min-h-[88px] w-full resize-none border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleVoiceAction}
                    disabled={!voiceStatus.browserSupported || voiceStatus.microphonePermission === 'denied'}
                    className="gap-2"
                  >
                    {voiceStatus.audioSession === 'listening' ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {microphoneLabel}
                  </Button>
                </div>

                <Button type="button" variant="primary" size="sm" onClick={() => void handleSendMessage()} disabled={isSending} className="gap-2">
                  {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
                  {isSending ? 'Searching' : 'Send'}
                </Button>
              </div>
              {sources.length > 0 && <p className="mt-2 text-[11px] text-slate-500">Grounded in: {sources.join(', ')}</p>}

              <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5" aria-live="polite">
                <div className="flex h-8 items-center gap-1" aria-label="Local microphone activity">
                  {[0.55, 0.8, 1, 0.72, 0.48].map((scale, index) => (
                    <span
                      key={index}
                      className="w-1 rounded-full bg-blue-500 transition-[height,opacity] duration-75"
                      style={{ height: `${Math.max(4, 8 + amplitude * 22 * scale)}px`, opacity: amplitude > 0.02 ? 0.45 + amplitude * 0.55 : 0.3 }}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">{statusMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Customer</p>
                <p className="mt-1 font-medium text-slate-800">{supportContext.customerName ?? 'Your account'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Appliance</p>
                <p className="mt-1 font-medium text-slate-800 capitalize">{(supportContext.applianceType ?? 'Select an appliance').replaceAll('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Registered appliance</p>
                <p className="mt-1 font-medium text-slate-800">{supportContext.applianceName ?? 'Not registered yet'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Suggested actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 px-3 py-2">Check warranty coverage</div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">Review troubleshooting guidance</div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">Book technician visit</div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">Track service request</div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
