export type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'PROCESSING'
  | 'AI_SPEAKING'
  | 'INTERRUPTED';

export type VoiceEventType =
  | 'START_LISTENING'
  | 'STOP_LISTENING'
  | 'USER_SPEECH_STARTED'
  | 'USER_SPEECH_ENDED'
  | 'USER_AUDIO_DETECTED'
  | 'USER_SPEECH_DETECTED'
  | 'PROCESSING_STARTED'
  | 'AI_RESPONSE_STARTED'
  | 'AI_RESPONSE_STOPPED'
  | 'CANCEL_TTS'
  | 'INTERRUPT'
  | 'RESET';

export type ConversationVoiceEventType =
  | 'USER_SPEECH_STARTED'
  | 'USER_SPEECH_ENDED'
  | 'USER_INTERRUPTED_ASSISTANT'
  | 'PROCESSING_STARTED'
  | 'ASSISTANT_SPEECH_STARTED'
  | 'ASSISTANT_SPEECH_CANCELLED';

export type MicrophonePermissionState = 'unknown' | 'prompt' | 'granted' | 'denied' | 'unsupported';

export type AudioSessionState = 'idle' | 'requesting' | 'ready' | 'listening' | 'error' | 'closed';

export type ConversationStage =
  | 'GREETING'
  | 'IDENTIFYING_APPLIANCE'
  | 'UNDERSTANDING_ISSUE'
  | 'DIAGNOSING'
  | 'TROUBLESHOOTING'
  | 'RECOMMENDING_ACTION'
  | 'READY_FOR_SERVICE'
  | 'COMPLETED';

export interface CustomerContext {
  name: string | null;
  customerId: string | null;
}

export interface ApplianceContext {
  applianceId: string | null;
  brand: string | null;
  model: string | null;
  category: string | null;
  warrantyStatus: string | null;
}

export interface IssueContext {
  category: string | null;
  description: string | null;
  symptoms: string[];
}

export interface DiagnosisContext {
  suspectedIssue: string | null;
  confidence: number | null;
}

export interface RecommendedAction {
  type: 'TROUBLESHOOT' | 'MONITOR' | 'TECHNICIAN_SERVICE' | 'SAFETY_ESCALATION' | null;
  description: string | null;
  requiresTechnician: boolean | null;
}

export interface ConversationContext {
  customer: CustomerContext;
  appliance: ApplianceContext;
  issue: IssueContext;
  diagnosis: DiagnosisContext;
  recommendedAction: RecommendedAction;
  stage: ConversationStage;
  isDemoContext?: boolean;
}

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
  supportContext?: ConversationContext;
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

export interface VoiceServiceStatus {
  microphonePermission: MicrophonePermissionState;
  audioSession: AudioSessionState;
  browserSupported: boolean;
  connectionState?: 'disconnected' | 'connecting' | 'connected' | 'closing' | 'error';
  errorMessage?: string;
}

export interface ConversationVoiceEvent {
  id: string;
  type: ConversationVoiceEventType;
  timestamp: string;
  voiceState: VoiceState;
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
  applianceType?: string;
  brand?: string;
  model?: string;
  category?: string;
  topK?: number;
  similarityThreshold?: number;
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
  chunkId?: string;
  similarity?: number;
  documentTitle?: string;
  applianceType?: string | null;
  category?: string | null;
  sourceUrl?: string | null;
  metadata?: Record<string, unknown> | null;
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
