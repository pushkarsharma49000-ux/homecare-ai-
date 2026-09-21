/**
 * Browser-based voice service abstraction.
 *
 * Future architecture:
 * Browser -> WebRTC audio -> VAD / turn detection -> Streaming STT -> Conversation orchestrator
 * -> RAG -> Streaming TTS -> Browser audio output
 *
 * Phase 1: typed placeholders for browser voice sessions and state transitions only.
 * No real audio processing or external provider calls are implemented.
 */

export interface VoiceStreamSession {
  sessionId: string;
  userId?: string;
  status: 'idle' | 'connected' | 'streaming' | 'interrupted';
  audioCodec: 'audio/opus' | 'audio/webm';
  sampleRate: number;
  durationSeconds: number;
}

export interface VoiceServiceStatus {
  isConfigured: boolean;
  activeProvider: 'Browser Voice (Phase 1 Placeholder)' | 'None';
  deviceReady: boolean;
  connectedChannels: number;
}

export async function getVoiceServiceStatus(): Promise<VoiceServiceStatus> {
  return {
    isConfigured: false,
    activeProvider: 'Browser Voice (Phase 1 Placeholder)',
    deviceReady: false,
    connectedChannels: 0,
  };
}
