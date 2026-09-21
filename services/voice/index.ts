'use client';

import {
  ConversationVoiceEvent,
  ConversationVoiceEventType,
  MicrophonePermissionState,
  VoiceEvent,
  VoiceEventType,
  VoiceSession,
  VoiceState,
  VoiceServiceStatus,
} from '@/types/ai-support';
import type { VoiceAudioInput, VoiceAudioOutput, VoiceConnectionState, VoiceProvider, VoiceProviderEvent, VoiceTranscriptEvent } from '@/services/voice/types';

export interface VoiceService {
  createSession(conversationSessionId?: string): Promise<VoiceSession>;
  updateState(sessionId: string, nextState: VoiceState): Promise<VoiceSession>;
  getLatestState(sessionId: string): Promise<VoiceState>;
  requestMicrophone(): Promise<MicrophonePermissionState>;
  startListening(): Promise<VoiceServiceStatus>;
  stopListening(): Promise<VoiceServiceStatus>;
  startSpeaking(): Promise<VoiceServiceStatus>;
  stopSpeaking(): Promise<VoiceServiceStatus>;
  cancelSpeech(): Promise<void>;
  interruptAssistant(): Promise<void>;
  clearAudioBuffer(): void;
  disconnect(): Promise<void>;
  getStatus(): VoiceServiceStatus;
  subscribe(listener: (event: VoiceEvent) => void): () => void;
  subscribeConversation(listener: (event: ConversationVoiceEvent) => void): () => void;
  subscribeAmplitude(listener: (amplitude: number) => void): () => void;
  subscribeAudioInput(listener: (input: VoiceAudioInput) => void): () => void;
  subscribeTranscript(listener: (event: VoiceTranscriptEvent) => void): () => void;
  subscribeStatus(listener: () => void): () => void;
  attachProvider(provider: VoiceProvider): void;
  connectProvider(): Promise<void>;
  enqueueAudioOutput(output: VoiceAudioOutput): Promise<void>;
}

export interface VoiceTransitionResult {
  nextState: VoiceState;
  event: VoiceEvent;
}

const getAudioContextConstructor = () => {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
};

const browserSupported = () =>
  typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && Boolean(getAudioContextConstructor());

export function transitionVoiceState(currentState: VoiceState, eventType: VoiceEventType): VoiceTransitionResult {
  const transitions: Record<VoiceState, Partial<Record<VoiceEventType, VoiceState>>> = {
    IDLE: { START_LISTENING: 'LISTENING' },
    LISTENING: {
      USER_SPEECH_STARTED: 'USER_SPEAKING',
      USER_AUDIO_DETECTED: 'USER_SPEAKING',
      STOP_LISTENING: 'IDLE',
      RESET: 'IDLE',
    },
    USER_SPEAKING: {
      USER_SPEECH_ENDED: 'PROCESSING',
      PROCESSING_STARTED: 'PROCESSING',
      INTERRUPT: 'INTERRUPTED',
    },
    PROCESSING: {
      AI_RESPONSE_STARTED: 'AI_SPEAKING',
      RESET: 'LISTENING',
    },
    AI_SPEAKING: {
      USER_SPEECH_DETECTED: 'INTERRUPTED',
      INTERRUPT: 'INTERRUPTED',
      AI_RESPONSE_STOPPED: 'LISTENING',
    },
    INTERRUPTED: {
      CANCEL_TTS: 'USER_SPEAKING',
      RESET: 'LISTENING',
      START_LISTENING: 'LISTENING',
    },
  };

  const nextState = transitions[currentState]?.[eventType] ?? currentState;
  return {
    nextState,
    event: {
      id: `voice-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: eventType,
      state: nextState,
      timestamp: new Date().toISOString(),
      reason: nextState === 'INTERRUPTED' ? 'Customer speech detected while AI was speaking.' : undefined,
    },
  };
}

export const voiceStateLabels: Record<VoiceState, string> = {
  IDLE: 'Ready to start',
  LISTENING: 'Listening',
  USER_SPEAKING: 'You are speaking',
  PROCESSING: 'Processing',
  AI_SPEAKING: 'AI speaking',
  INTERRUPTED: 'Interrupted',
};

const conversationEventForVoiceEvent: Partial<Record<VoiceEventType, ConversationVoiceEventType>> = {
  USER_SPEECH_STARTED: 'USER_SPEECH_STARTED',
  USER_AUDIO_DETECTED: 'USER_SPEECH_STARTED',
  USER_SPEECH_ENDED: 'USER_SPEECH_ENDED',
  USER_SPEECH_DETECTED: 'USER_INTERRUPTED_ASSISTANT',
  PROCESSING_STARTED: 'PROCESSING_STARTED',
  AI_RESPONSE_STARTED: 'ASSISTANT_SPEECH_STARTED',
  AI_RESPONSE_STOPPED: 'ASSISTANT_SPEECH_CANCELLED',
  CANCEL_TTS: 'ASSISTANT_SPEECH_CANCELLED',
};

export class BrowserVoiceService implements VoiceService {
  private sessions = new Map<string, VoiceSession>();
  private currentState: VoiceState = 'IDLE';
  private permission: MicrophonePermissionState = 'unknown';
  private audioSession: VoiceServiceStatus['audioSession'] = 'idle';
  private errorMessage: string | undefined;
  private mediaStream?: MediaStream;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private source?: MediaStreamAudioSourceNode;
  private processor?: ScriptProcessorNode;
  private captureGain?: GainNode;
  private animationFrame?: number;
  private silenceTimer?: number;
  private speechActive = false;
  private amplitudeListeners = new Set<(amplitude: number) => void>();
  private voiceListeners = new Set<(event: VoiceEvent) => void>();
  private conversationListeners = new Set<(event: ConversationVoiceEvent) => void>();
  private audioInputListeners = new Set<(input: VoiceAudioInput) => void>();
  private transcriptListeners = new Set<(event: VoiceTranscriptEvent) => void>();
  private statusListeners = new Set<() => void>();
  private provider?: VoiceProvider;
  private providerUnsubscribe?: () => void;
  private connectionState: VoiceConnectionState = 'disconnected';
  private playbackSources = new Set<AudioBufferSourceNode>();
  private playbackTime = 0;
  private playbackGeneration = 0;

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
    const existing = this.sessions.get(sessionId) ?? (await this.createSession());
    const updated: VoiceSession = {
      ...existing,
      id: sessionId,
      state: nextState,
      status: nextState === 'INTERRUPTED' ? 'interrupted' : nextState === 'AI_SPEAKING' ? 'streaming' : 'connected',
      isListening: nextState === 'LISTENING' || nextState === 'USER_SPEAKING',
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, updated);
    this.currentState = nextState;
    return updated;
  }

  async getLatestState(): Promise<VoiceState> {
    return this.currentState;
  }

  getStatus(): VoiceServiceStatus {
    return {
      microphonePermission: this.permission,
      audioSession: this.audioSession,
      browserSupported: browserSupported(),
      connectionState: this.connectionState,
      errorMessage: this.errorMessage,
    };
  }

  async requestMicrophone(): Promise<MicrophonePermissionState> {
    if (!browserSupported()) {
      this.permission = 'unsupported';
      this.audioSession = 'error';
      this.errorMessage = 'Your browser does not support voice support.';
      return this.permission;
    }

    this.audioSession = 'requesting';
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.permission = 'granted';
      await this.setupAudioGraph();
      this.audioSession = 'ready';
      this.errorMessage = undefined;
    } catch (error) {
      this.mediaStream?.getTracks().forEach((track) => track.stop());
      this.mediaStream = undefined;
      this.permission = error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'prompt';
      this.audioSession = 'error';
      this.errorMessage =
        this.permission === 'denied'
          ? 'Microphone access is required to use voice support.'
          : 'Your microphone could not be accessed. Please check your browser permissions.';
    }
    return this.permission;
  }

  async startListening(): Promise<VoiceServiceStatus> {
    if (this.permission !== 'granted') await this.requestMicrophone();
    if (this.permission !== 'granted') return this.getStatus();
    await this.connectProvider();
    await this.audioContext?.resume();
    this.audioSession = 'listening';
    this.applyVoiceEvent('START_LISTENING');
    this.startAmplitudeLoop();
    return this.getStatus();
  }

  async stopListening(): Promise<VoiceServiceStatus> {
    this.stopAmplitudeLoop();
    this.audioSession = this.mediaStream ? 'ready' : 'idle';
    this.applyVoiceEvent('STOP_LISTENING');
    return this.getStatus();
  }

  async startSpeaking(): Promise<VoiceServiceStatus> {
    this.applyVoiceEvent('AI_RESPONSE_STARTED');
    return this.getStatus();
  }

  async stopSpeaking(): Promise<VoiceServiceStatus> {
    await this.cancelSpeech();
    this.applyVoiceEvent('AI_RESPONSE_STOPPED');
    return this.getStatus();
  }

  async cancelSpeech(): Promise<void> {
    this.clearAudioBuffer();
    this.provider?.interrupt();
    if (this.currentState === 'AI_SPEAKING') this.applyVoiceEvent('USER_SPEECH_DETECTED');
    if (this.currentState === 'INTERRUPTED') this.applyVoiceEvent('CANCEL_TTS');
  }

  async interruptAssistant(): Promise<void> {
    await this.cancelSpeech();
  }

  clearAudioBuffer(): void {
    this.playbackGeneration += 1;
    this.playbackTime = 0;
    this.playbackSources.forEach((source) => source.stop());
    this.playbackSources.clear();
  }

  async disconnect(): Promise<void> {
    this.audioSession = 'closed';
    this.stopAmplitudeLoop();
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = undefined;
    this.source?.disconnect();
    this.processor?.disconnect();
    this.captureGain?.disconnect();
    this.analyser?.disconnect();
    if (this.audioContext && this.audioContext.state !== 'closed') await this.audioContext.close();
    this.source = undefined;
    this.analyser = undefined;
    this.audioContext = undefined;
    this.providerUnsubscribe?.();
    this.providerUnsubscribe = undefined;
    this.provider?.close();
    this.provider = undefined;
    this.connectionState = 'disconnected';
    this.permission = 'unknown';
    this.currentState = 'IDLE';
  }

  subscribe(listener: (event: VoiceEvent) => void): () => void {
    this.voiceListeners.add(listener);
    return () => this.voiceListeners.delete(listener);
  }

  subscribeConversation(listener: (event: ConversationVoiceEvent) => void): () => void {
    this.conversationListeners.add(listener);
    return () => this.conversationListeners.delete(listener);
  }

  subscribeAmplitude(listener: (amplitude: number) => void): () => void {
    this.amplitudeListeners.add(listener);
    return () => this.amplitudeListeners.delete(listener);
  }

  subscribeAudioInput(listener: (input: VoiceAudioInput) => void): () => void {
    this.audioInputListeners.add(listener);
    return () => this.audioInputListeners.delete(listener);
  }

  subscribeTranscript(listener: (event: VoiceTranscriptEvent) => void): () => void {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  subscribeStatus(listener: () => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  attachProvider(provider: VoiceProvider): void {
    this.providerUnsubscribe?.();
    this.provider = provider;
    this.providerUnsubscribe = provider.subscribe((event) => this.handleProviderEvent(event));
  }

  async connectProvider(): Promise<void> {
    if (!this.provider || this.connectionState === 'connected' || this.connectionState === 'connecting') return;
    await this.provider.connect();
  }

  async enqueueAudioOutput(output: VoiceAudioOutput): Promise<void> {
    if (!this.audioContext || output.mimeType !== 'audio/pcm' || output.channels !== 1) return;
    try {
      const sampleCount = output.data.byteLength / 2;
      const buffer = this.audioContext.createBuffer(1, sampleCount, output.sampleRate);
      const channel = buffer.getChannelData(0);
      const pcm = new DataView(output.data);
      for (let index = 0; index < sampleCount; index += 1) channel[index] = pcm.getInt16(index * 2, true) / 32768;
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      const startAt = Math.max(this.audioContext.currentTime, this.playbackTime);
      source.start(startAt);
      this.playbackTime = startAt + buffer.duration;
      this.playbackSources.add(source);
      source.onended = () => {
        this.playbackSources.delete(source);
        if (this.playbackSources.size === 0 && this.currentState === 'AI_SPEAKING') this.applyVoiceEvent('AI_RESPONSE_STOPPED');
      };
    } catch {
      this.errorMessage = 'Voice audio could not be played.';
      this.applyVoiceEvent('AI_RESPONSE_STOPPED');
    }
  }

  private async setupAudioGraph(): Promise<void> {
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor || !this.mediaStream) throw new Error('Audio is not supported.');
    this.audioContext = new AudioContextConstructor();
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;
    this.source.connect(this.analyser);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.captureGain = this.audioContext.createGain();
    this.captureGain.gain.value = 0;
    this.processor.onaudioprocess = (event) => this.handleAudioInput(event.inputBuffer.getChannelData(0));
    this.source.connect(this.processor);
    this.processor.connect(this.captureGain);
    this.captureGain.connect(this.audioContext.destination);
    this.mediaStream.getTracks().forEach((track) => {
      track.addEventListener('ended', this.handleStreamEnded);
    });
  }

  private handleStreamEnded = (): void => {
    if (this.audioSession === 'closed') return;
    this.stopAmplitudeLoop();
    this.audioSession = 'error';
    this.errorMessage = 'Your microphone could not be accessed. Please check your browser permissions.';
  };

  private handleAudioInput(samples: Float32Array): void {
    if (this.audioSession !== 'listening' || !this.provider) return;
    const input: VoiceAudioInput = {
      data: this.resampleToPcm16(samples, this.audioContext?.sampleRate ?? 48000, 16000),
      sampleRate: 16000,
      channels: 1,
      mimeType: 'audio/pcm',
    };
    this.audioInputListeners.forEach((listener) => listener(input));
    this.provider.sendAudio(input);
  }

  private resampleToPcm16(samples: Float32Array, sourceRate: number, targetRate: number): ArrayBuffer {
    const ratio = sourceRate / targetRate;
    const outputLength = Math.max(1, Math.round(samples.length / ratio));
    const output = new ArrayBuffer(outputLength * 2);
    const view = new DataView(output);
    for (let index = 0; index < outputLength; index += 1) {
      const sourceIndex = Math.min(samples.length - 1, Math.floor(index * ratio));
      const sample = Math.max(-1, Math.min(1, samples[sourceIndex]));
      view.setInt16(index * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
    }
    return output;
  }

  private handleProviderEvent(event: VoiceProviderEvent): void {
    if (event.type === 'connection') {
      this.connectionState = event.state;
      this.notifyStatus();
      return;
    }
    if (event.type === 'audio') {
      if (this.currentState === 'PROCESSING') this.applyVoiceEvent('AI_RESPONSE_STARTED');
      void this.enqueueAudioOutput(event.output);
      return;
    }
    if (event.type === 'transcript') {
      this.transcriptListeners.forEach((listener) => listener(event.transcript));
      return;
    }
    if (event.type === 'interruption') {
      this.clearAudioBuffer();
      if (this.currentState === 'AI_SPEAKING') {
        this.applyVoiceEvent('USER_SPEECH_DETECTED');
        this.applyVoiceEvent('CANCEL_TTS');
      }
      return;
    }
    if (event.type === 'error') {
      this.connectionState = 'error';
      this.errorMessage = event.error.message;
      this.notifyStatus();
      return;
    }
    if (event.type === 'closed') {
      this.connectionState = 'disconnected';
      this.notifyStatus();
    }
  }

  private notifyStatus(): void {
    this.statusListeners.forEach((listener) => listener());
  }

  private startAmplitudeLoop(): void {
    if (this.animationFrame || !this.analyser) return;
    const data = new Uint8Array(this.analyser.fftSize);
    const sample = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);
      const amplitude = Math.sqrt(data.reduce((sum, value) => sum + (value - 128) ** 2, 0) / data.length) / 128;
      this.amplitudeListeners.forEach((listener) => listener(Math.min(1, amplitude * 3)));
      const speaking = amplitude > 0.035;
      if (speaking && !this.speechActive) this.handleSpeechStart();
      if (!speaking && this.speechActive && !this.silenceTimer) {
        this.silenceTimer = window.setTimeout(() => this.handleSpeechEnd(), 650);
      }
      if (speaking && this.silenceTimer) {
        window.clearTimeout(this.silenceTimer);
        this.silenceTimer = undefined;
      }
      this.animationFrame = window.requestAnimationFrame(sample);
    };
    this.animationFrame = window.requestAnimationFrame(sample);
  }

  private stopAmplitudeLoop(): void {
    if (this.animationFrame) window.cancelAnimationFrame(this.animationFrame);
    if (this.silenceTimer) window.clearTimeout(this.silenceTimer);
    this.animationFrame = undefined;
    this.silenceTimer = undefined;
    this.speechActive = false;
    this.amplitudeListeners.forEach((listener) => listener(0));
  }

  private handleSpeechStart(): void {
    this.speechActive = true;
    if (this.currentState === 'AI_SPEAKING') {
      this.applyVoiceEvent('USER_SPEECH_DETECTED');
      void this.interruptAssistant();
      return;
    }
    this.applyVoiceEvent('USER_SPEECH_STARTED');
  }

  private handleSpeechEnd(): void {
    this.speechActive = false;
    this.silenceTimer = undefined;
    if (this.currentState === 'USER_SPEAKING') {
      this.applyVoiceEvent('USER_SPEECH_ENDED');
      this.applyVoiceEvent('PROCESSING_STARTED');
    }
  }

  private applyVoiceEvent(eventType: VoiceEventType): VoiceEvent {
    const result = transitionVoiceState(this.currentState, eventType);
    this.currentState = result.nextState;
    this.voiceListeners.forEach((listener) => listener(result.event));
    const conversationType = conversationEventForVoiceEvent[eventType];
    if (conversationType) {
      const event: ConversationVoiceEvent = {
        id: `conversation-voice-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: conversationType,
        timestamp: result.event.timestamp,
        voiceState: result.nextState,
      };
      this.conversationListeners.forEach((listener) => listener(event));
    }
    return result.event;
  }
}

export function createBrowserVoiceService(): BrowserVoiceService {
  return new BrowserVoiceService();
}

export const voiceService = createBrowserVoiceService();
