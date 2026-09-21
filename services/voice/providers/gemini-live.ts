'use client';

import { GoogleGenAI, Modality } from '@google/genai/web';
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

  async connect(options?: VoiceProviderConnectOptions): Promise<void> {
    if (this.connection === 'connected' || this.connection === 'connecting') return;
    this.setConnection('connecting');

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

  private setConnection(state: VoiceConnectionState): void {
    this.connection = state;
    this.emit({ type: 'connection', state });
  }

  private emit(event: VoiceProviderEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
