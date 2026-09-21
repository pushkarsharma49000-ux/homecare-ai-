import { VoiceEvent, VoiceEventType, VoiceSession, VoiceState } from '@/types/ai-support';

export interface VoiceService {
  createSession(conversationSessionId?: string): Promise<VoiceSession>;
  updateState(sessionId: string, nextState: VoiceState): Promise<VoiceSession>;
  handleInterrupt(sessionId: string): Promise<VoiceEvent>;
  getLatestState(sessionId: string): Promise<VoiceState>;
}

export interface VoiceTransitionResult {
  nextState: VoiceState;
  event: VoiceEvent;
}

export function transitionVoiceState(
  currentState: VoiceState,
  eventType: VoiceEventType
): VoiceTransitionResult {
  const timestamp = new Date().toISOString();

  const transitions: Record<VoiceState, Partial<Record<VoiceEventType, VoiceState>>> = {
    IDLE: {
      START_LISTENING: 'LISTENING',
    },
    LISTENING: {
      USER_AUDIO_DETECTED: 'USER_SPEAKING',
      RESET: 'IDLE',
    },
    USER_SPEAKING: {
      PROCESSING_STARTED: 'PROCESSING',
      INTERRUPT: 'INTERRUPTED',
    },
    PROCESSING: {
      AI_RESPONSE_STARTED: 'AI_SPEAKING',
      RESET: 'LISTENING',
    },
    AI_SPEAKING: {
      USER_SPEECH_DETECTED: 'INTERRUPTED',
      AI_RESPONSE_STOPPED: 'LISTENING',
      INTERRUPT: 'INTERRUPTED',
    },
    INTERRUPTED: {
      RESET: 'LISTENING',
      START_LISTENING: 'LISTENING',
    },
  };

  const nextState = transitions[currentState]?.[eventType] ?? currentState;

  return {
    nextState,
    event: {
      id: `voice-event-${Date.now()}`,
      type: eventType,
      state: nextState,
      timestamp,
      reason: nextState === 'INTERRUPTED' ? 'Customer speech detected while AI was speaking.' : undefined,
    },
  };
}

export const voiceStateLabels: Record<VoiceState, string> = {
  IDLE: 'Idle',
  LISTENING: 'Listening',
  USER_SPEAKING: 'Customer speaking',
  PROCESSING: 'Processing',
  AI_SPEAKING: 'AI speaking',
  INTERRUPTED: 'Interrupted',
};

export class PlaceholderVoiceService implements VoiceService {
  private sessions = new Map<string, VoiceSession>();

  async createSession(conversationSessionId?: string): Promise<VoiceSession> {
    const now = new Date().toISOString();
    const session: VoiceSession = {
      id: `voice-session-${Date.now()}`,
      conversationSessionId,
      state: 'IDLE',
      status: 'idle',
      source: 'voice',
      isListening: false,
      isMuted: false,
      createdAt: now,
      updatedAt: now,
      transcript: [],
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async updateState(sessionId: string, nextState: VoiceState): Promise<VoiceSession> {
    const session = this.sessions.get(sessionId) ?? {
      id: sessionId,
      state: 'IDLE',
      status: 'idle',
      source: 'voice',
      isListening: false,
      isMuted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated: VoiceSession = {
      ...session,
      state: nextState,
      status: nextState === 'INTERRUPTED' ? 'interrupted' : nextState === 'AI_SPEAKING' ? 'streaming' : 'connected',
      isListening: nextState === 'LISTENING' || nextState === 'USER_SPEAKING',
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, updated);
    return updated;
  }

  async handleInterrupt(sessionId: string): Promise<VoiceEvent> {
    const result = transitionVoiceState('AI_SPEAKING', 'USER_SPEECH_DETECTED');
    await this.updateState(sessionId, result.nextState);
    return result.event;
  }

  async getLatestState(sessionId: string): Promise<VoiceState> {
    return this.sessions.get(sessionId)?.state ?? 'IDLE';
  }
}

export const voiceService = new PlaceholderVoiceService();
