'use client';

import { GoogleGenAI, Modality, Type } from '@google/genai/web';
import type { LiveServerMessage, Session } from '@google/genai/web';
import type {
  VoiceAudioInput,
  VoiceAudioOutput,
  VoiceConnectionState,
  VoiceProvider,
  VoiceProviderConnectOptions,
  VoiceProviderEvent,
} from '@/services/voice/types';

const PCM_SAMPLE_RATE = 24000;
const PCM_CHANNELS = 1;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    for (let index = 0; index < chunk.length; index += 1) binary += String.fromCharCode(chunk[index]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

export class GeminiLiveProvider implements VoiceProvider {
  private session?: Session;
  private model?: string;
  private listeners = new Set<(event: VoiceProviderEvent) => void>();
  private connection: VoiceConnectionState = 'disconnected';
  private accessToken?: string;

  async connect(options?: VoiceProviderConnectOptions): Promise<void> {
    if (this.connection === 'connected' || this.connection === 'connecting') return;
    this.setConnection('connecting');
    this.accessToken = options?.accessToken;

    try {
      const response = await fetch('/api/voice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemContext: options?.systemContext }),
      });
      if (!response.ok) throw new Error('Voice session could not be created.');
      const { token, model } = (await response.json()) as { token?: string; model?: string };
      if (!token || !model) throw new Error('Voice session configuration is incomplete.');

      this.model = model;
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });
      this.session = await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: [{
            name: 'searchKnowledge',
            description: 'Search verified HomeCare troubleshooting knowledge before giving appliance-specific guidance.',
            parameters: { type: Type.OBJECT, properties: {
              query: { type: Type.STRING, description: 'Technical troubleshooting question' },
              applianceType: { type: Type.STRING, description: 'Appliance type, if known' },
              category: { type: Type.STRING, description: 'Knowledge category, if known' },
            }, required: ['query'] },
          }, {
            name: 'createServiceRequest',
            description: 'Create a real technician service request only after the customer explicitly authorizes technician service. Never say it was created unless this tool returns success.',
            parameters: { type: Type.OBJECT, properties: {
              applianceId: { type: Type.STRING, description: 'Current appliance ID from structured context' },
              applianceType: { type: Type.STRING, description: 'Identified appliance type, for example washing_machine' },
              brand: { type: Type.STRING, description: 'Appliance brand if known' },
              model: { type: Type.STRING, description: 'Appliance model if known' },
              issue: { type: Type.STRING, description: 'Customer reported issue' },
              diagnosisSummary: { type: Type.STRING, description: 'Brief diagnosis summary' },
              troubleshootingPerformed: { type: Type.STRING, description: 'Safe checks the customer has completed' },
              severity: { type: Type.STRING, description: 'Low, Medium, High, or Critical' },
            }, required: ['applianceType', 'issue'] },
          }, {
            name: 'getAppointmentAvailability',
            description: 'Retrieve actual currently available appointment slots after a real service request exists. Do not imply a slot is booked.',
            parameters: { type: Type.OBJECT, properties: {} },
          }, {
            name: 'bookAppointment',
            description: 'Book a real appointment only after the customer explicitly confirms the exact offered slot. Never say booked unless this tool returns success.',
            parameters: { type: Type.OBJECT, properties: {
              serviceRequestId: { type: Type.STRING, description: 'ID returned by createServiceRequest' },
              start: { type: Type.STRING, description: 'Exact ISO slot start returned by getAppointmentAvailability' },
              end: { type: Type.STRING, description: 'Exact ISO slot end returned by getAppointmentAvailability' },
            }, required: ['serviceRequestId', 'start', 'end'] },
          }] }],
        },
        callbacks: {
          onopen: () => this.setConnection('connected'),
          onmessage: (message) => this.handleMessage(message),
          onerror: () => this.emit({ type: 'error', error: { code: 'CONNECTION_FAILED', message: 'Voice support could not connect.' } }),
          onclose: () => {
            this.session = undefined;
            this.setConnection('disconnected');
            this.emit({ type: 'closed' });
          },
        },
      });
    } catch {
      this.setConnection('error');
      this.emit({ type: 'error', error: { code: 'CONNECTION_FAILED', message: 'Voice support could not connect.' } });
    }
  }

  sendAudio(input: VoiceAudioInput): void {
    if (!this.session || input.mimeType !== 'audio/pcm' || input.channels !== 1) return;
    try {
      this.session.sendRealtimeInput({
        audio: {
          data: arrayBufferToBase64(input.data),
          mimeType: `audio/pcm;rate=${input.sampleRate}`,
        },
      });
    } catch {
      this.emit({ type: 'error', error: { code: 'MALFORMED_AUDIO', message: 'Voice audio could not be sent.' } });
    }
  }

  interrupt(): void {
    // Gemini Live treats new realtime user audio as an interruption. Clearing local playback is handled by VoiceService.
    if (this.session) this.session.sendRealtimeInput({ activityStart: {} });
    this.emit({ type: 'interruption' });
  }

  close(): void {
    this.setConnection('closing');
    this.session?.close();
    this.session = undefined;
    this.setConnection('disconnected');
  }

  subscribe(listener: (event: VoiceProviderEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private handleMessage(message: LiveServerMessage): void {
    const toolCall = message.toolCall;
    if (toolCall?.functionCalls?.length) {
      console.info('[gemini-tool] received', { tools: toolCall.functionCalls.map((call) => call.name ?? 'unknown') });
      void this.answerToolCalls(toolCall.functionCalls);
    }
    const content = message.serverContent;
    if (!content) return;

    if (content.interrupted) {
      this.emit({ type: 'interruption' });
    }

    const inputPartial = content.interimInputTranscription?.text;
    const inputFinal = content.inputTranscription?.text;
    const outputPartial = content.outputTranscription?.text;
    if (inputPartial) this.emit({ type: 'transcript', transcript: { kind: 'USER_TRANSCRIPT_PARTIAL', text: inputPartial } });
    if (inputFinal) this.emit({ type: 'transcript', transcript: { kind: 'USER_TRANSCRIPT_FINAL', text: inputFinal } });
    if (outputPartial) this.emit({ type: 'transcript', transcript: { kind: 'ASSISTANT_TRANSCRIPT_PARTIAL', text: outputPartial } });
    if (content.outputTranscription?.text && content.turnComplete) {
      this.emit({ type: 'transcript', transcript: { kind: 'ASSISTANT_TRANSCRIPT_FINAL', text: content.outputTranscription.text } });
    }

    if (message.data) {
      this.emit({
        type: 'audio',
        output: { data: base64ToArrayBuffer(message.data), sampleRate: PCM_SAMPLE_RATE, channels: PCM_CHANNELS, mimeType: 'audio/pcm' },
      });
    }
  }

  private async answerToolCalls(calls: { id?: string; name?: string; args?: Record<string, unknown> }[]): Promise<void> {
    if (!this.session) {
      console.error('[gemini-tool] execution skipped', { reason: 'live_session_unavailable', tools: calls.map((call) => call.name ?? 'unknown') });
      return;
    }
    const functionResponses = await Promise.all(calls.map(async (call) => {
      const tool = call.name ?? 'unknown';
      if (!this.accessToken) {
        console.error('[gemini-tool] execution skipped', { tool, reason: 'authenticated_session_unavailable' });
        return { id: call.id, name: call.name, response: { success: false, error: 'Authentication is required to complete this action.' } };
      }
      try {
        const endpoint = call.name === 'searchKnowledge' ? '/api/rag/search' : call.name === 'createServiceRequest' ? '/api/service-requests' : call.name === 'getAppointmentAvailability' ? '/api/appointments/availability' : call.name === 'bookAppointment' ? '/api/appointments' : null;
        if (!endpoint) {
          console.error('[gemini-tool] execution skipped', { tool, reason: 'unknown_tool' });
          return { id: call.id, name: call.name, response: { success: false, error: 'Unknown action.' } };
        }
        console.info('[gemini-tool] executing', { tool, endpoint });
        const response = await fetch(endpoint, {
          method: call.name === 'getAppointmentAvailability' ? 'GET' : 'POST',
          headers: { ...(call.name === 'getAppointmentAvailability' ? {} : { 'Content-Type': 'application/json' }), Authorization: `Bearer ${this.accessToken}` },
          ...(call.name === 'getAppointmentAvailability' ? {} : { body: JSON.stringify(call.args ?? {}) }),
        });
        const body = await response.json() as Record<string, unknown>;
        console.info('[gemini-tool] API completed', { tool, status: response.status });
        if (!response.ok) return { id: call.id, name: call.name, response: { success: false, error: typeof body.error === 'string' ? body.error : 'Action could not be completed.' } };
        if (call.name === 'searchKnowledge') return { id: call.id, name: call.name, response: { success: true, results: body.results ?? [] } };
        return { id: call.id, name: call.name, response: { success: true, ...body } };
      } catch (error) {
        console.error('[gemini-tool] execution failed', { tool, reason: error instanceof Error ? error.message : 'unknown_error' });
        return { id: call.id, name: call.name, response: { success: false, error: 'Action could not be completed.' } };
      }
    }));
    try {
      this.session.sendToolResponse({ functionResponses });
      console.info('[gemini-tool] response returned', { tools: calls.map((call) => call.name ?? 'unknown') });
    } catch (error) {
      console.error('[gemini-tool] response failed', { reason: error instanceof Error ? error.message : 'unknown_error', tools: calls.map((call) => call.name ?? 'unknown') });
    }
  }

  private setConnection(state: VoiceConnectionState): void {
    this.connection = state;
    this.emit({ type: 'connection', state });
  }

  private emit(event: VoiceProviderEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
