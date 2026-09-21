export type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'PROCESSING'
  | 'AI_SPEAKING'
  | 'INTERRUPTED';

export type VoiceEventType =
  | 'START_LISTENING'
  | 'USER_AUDIO_DETECTED'
  | 'USER_SPEECH_DETECTED'
  | 'PROCESSING_STARTED'
  | 'AI_RESPONSE_STARTED'
  | 'AI_RESPONSE_STOPPED'
  | 'INTERRUPT'
  | 'RESET';

export type ConversationRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationSession {
  id: string;
  customerId?: string;
  applianceId?: string;
  state: 'NEW' | 'ACTIVE' | 'WAITING_FOR_INPUT' | 'RESOLVED' | 'ESCALATED';
  status?: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
  context?: Record<string, unknown>;
}

export interface VoiceSession {
  id: string;
  conversationSessionId?: string;
  state: VoiceState;
  status: 'idle' | 'connected' | 'streaming' | 'interrupted';
  source: 'text' | 'voice' | 'hybrid';
  isListening: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  transcript?: string[];
}

export interface VoiceEvent {
  id: string;
  type: VoiceEventType;
  state: VoiceState;
  timestamp: string;
  reason?: string;
  payload?: Record<string, unknown>;
}

export interface RAGQuery {
  id: string;
  query: string;
  sessionId?: string;
  customerId?: string;
  applianceId?: string;
  filters?: Record<string, unknown>;
}

export interface RAGResult {
  id: string;
  queryId: string;
  content: string;
  source: string;
  confidence: number;
  title?: string;
  excerpt?: string;
  documentId?: string;
  status: 'ready' | 'not_implemented' | 'error';
}

export interface AppointmentSlot {
  id: string;
  technicianId: string;
  technicianName: string;
  start: string;
  end: string;
  timezone: string;
  status: 'available' | 'booked' | 'unavailable';
}

export interface Appointment {
  id: string;
  customerId?: string;
  serviceRequestId?: string;
  applianceId?: string;
  slot: AppointmentSlot;
  status: 'pending' | 'booked' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipient: string;
  channel: 'email' | 'sms' | 'calendar' | 'in_app';
  subject: string;
  body: string;
  status: 'queued' | 'sent' | 'failed' | 'not_implemented';
  createdAt: string;
}

export interface ActionRequest {
  id: string;
  type: string;
  description: string;
  customerId?: string;
  applianceId?: string;
  serviceRequestId?: string;
  payload?: Record<string, unknown>;
}

export interface ActionResult {
  id: string;
  requestId: string;
  success: boolean;
  status: 'accepted' | 'completed' | 'failed' | 'not_implemented';
  message: string;
  data?: Record<string, unknown>;
}
