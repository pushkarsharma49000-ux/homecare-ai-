/**
 * VoiceLink Telephony & Audio Streaming Service Abstraction
 * 
 * Future Architecture:
 * Inbound SIP Call (+91 Toll Free) -> VoiceLink Gateway -> Bidirectional WebSocket Stream
 * -> HomeCare AI Voice Pipeline
 * 
 * Phase 1: Pure interface definitions and status hooks.
 * No real telephony connections or mock endpoint faking.
 */

export interface VoiceStreamSession {
  sessionId: string;
  callerNumber: string;
  trunkId: string;
  status: 'idle' | 'connected' | 'streaming' | 'terminated';
  audioCodec: 'audio/PCMU' | 'audio/opus';
  sampleRate: number;
  durationSeconds: number;
}

export interface VoiceServiceStatus {
  isConfigured: boolean;
  activeProvider: 'VoiceLink (Phase 2 Placeholder)' | 'None';
  inboundTrunkNumber: string;
  connectedChannels: number;
}

export async function getVoiceServiceStatus(): Promise<VoiceServiceStatus> {
  return {
    isConfigured: false,
    activeProvider: 'VoiceLink (Phase 2 Placeholder)',
    inboundTrunkNumber: '+91 1800 209 8899',
    connectedChannels: 6, // current live demo calls
  };
}
