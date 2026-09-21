import type { VoiceState } from '@/types/ai-support';

export type VoiceConnectionState = 'disconnected' | 'connecting' | 'connected' | 'closing' | 'error';

export interface VoiceAudioInput {
  data: ArrayBuffer;
  sampleRate: number;
  channels: number;
  mimeType: 'audio/pcm';
}

export interface VoiceAudioOutput {
  data: ArrayBuffer;
  sampleRate: number;
  channels: number;
  mimeType: 'audio/pcm';
}

export type VoiceTranscriptKind = 'USER_TRANSCRIPT_PARTIAL' | 'USER_TRANSCRIPT_FINAL' | 'ASSISTANT_TRANSCRIPT_PARTIAL' | 'ASSISTANT_TRANSCRIPT_FINAL';

export interface VoiceTranscriptEvent {
  kind: VoiceTranscriptKind;
  text: string;
}

export interface VoiceSessionError {
  code: 'CONNECTION_FAILED' | 'SESSION_CLOSED' | 'MALFORMED_AUDIO' | 'PLAYBACK_FAILED' | 'UNKNOWN';
  message: string;
}

export type VoiceProviderEvent =
  | { type: 'connection'; state: VoiceConnectionState }
  | { type: 'audio'; output: VoiceAudioOutput }
  | { type: 'transcript'; transcript: VoiceTranscriptEvent }
  | { type: 'interruption' }
  | { type: 'error'; error: VoiceSessionError }
  | { type: 'closed' };

export interface VoiceProvider {
  connect(): Promise<void>;
  sendAudio(input: VoiceAudioInput): void;
  interrupt(): void;
  close(): void;
  subscribe(listener: (event: VoiceProviderEvent) => void): () => void;
}

export interface VoicePlayback {
  enqueue(output: VoiceAudioOutput): Promise<void>;
  stop(): void;
  clear(): void;
}

export interface VoiceProviderState {
  connection: VoiceConnectionState;
  voiceState: VoiceState;
}
