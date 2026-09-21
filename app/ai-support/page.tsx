'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Mic, MessageSquareText, ShieldCheck, CalendarCheck2, MicOff } from 'lucide-react';
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
  {
    id: 'prompt',
    role: 'user',
    content: 'My washing machine is making a very loud noise.',
  },
];

export default function AISupportPage() {
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
  const voiceServiceRef = useRef<BrowserVoiceService>();
  const providerRef = useRef<GeminiLiveProvider>();
  const orchestratorRef = useRef<ConversationOrchestrator>();

  if (!voiceServiceRef.current) voiceServiceRef.current = new BrowserVoiceService();
  if (!providerRef.current) providerRef.current = new GeminiLiveProvider();
  if (!orchestratorRef.current) {
    orchestratorRef.current = new ConversationOrchestrator({
      context: createConversationContext({
        customer: { name: 'Rahul Sharma', customerId: null },
        appliance: {
          applianceId: null,
          brand: 'Samsung',
          model: '8kg Front Load Washer',
          category: 'Washing Machine',
          warrantyStatus: null,
        },
        isDemoContext: true,
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

  const handleSendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: trimmed },
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'I have your issue and will use appliance context and troubleshooting guidance to help with the next step.',
      },
    ]);

    setInput('');
    setVoiceState('PROCESSING');
  };

  const handleVoiceAction = async () => {
    if (voiceStatus.audioSession === 'listening') {
      await voiceService.stopListening();
    } else {
      await voiceService.connectProvider({ systemContext: orchestrator.buildSystemContext() });
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
          <p className="text-xs uppercase tracking-[0.18em] text-blue-600 font-semibold">HomeCare AI Support</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Customer support, reimagined</h1>
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

                <Button type="button" variant="primary" size="sm" onClick={handleSendMessage} className="gap-2">
                  <ArrowUp className="h-3.5 w-3.5" />
                  Send
                </Button>
              </div>

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
                <p className="mt-1 font-medium text-slate-800">Rahul Sharma</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Appliance</p>
                <p className="mt-1 font-medium text-slate-800">Samsung 8kg Front Load Washer</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Status</p>
                <p className="mt-1 font-medium text-slate-800">Troubleshooting in progress</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Conversation stage</p>
                <p className="mt-1 font-medium text-slate-800">{conversationStage.replaceAll('_', ' ')}</p>
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
