import type {
  ConversationContext,
  ConversationMessage,
  ConversationSession,
  ConversationStage,
} from '@/types/ai-support';
import type { VoiceTranscriptEvent } from '@/services/voice/types';

export interface ConversationEvent {
  type:
    | 'STAGE_CHANGED'
    | 'USER_TRANSCRIPT_RECEIVED'
    | 'ASSISTANT_TRANSCRIPT_RECEIVED'
    | 'CONTEXT_UPDATED';
  stage: ConversationStage;
  timestamp: string;
  transcript?: string;
}

export interface ConversationService {
  createSession(customerId?: string, applianceId?: string, context?: Partial<ConversationContext>): Promise<ConversationSession>;
  addMessage(sessionId: string, message: ConversationMessage): Promise<ConversationMessage>;
  getSession(sessionId: string): Promise<ConversationSession | null>;
  getSuggestedActions(sessionId: string): Promise<string[]>;
}

export interface ConversationOrchestratorOptions {
  context: ConversationContext;
  onEvent?: (event: ConversationEvent) => void;
}

const now = () => new Date().toISOString();

export function createConversationContext(overrides: Partial<ConversationContext> = {}): ConversationContext {
  return {
    customer: { name: null, customerId: null, ...overrides.customer },
    appliance: {
      applianceId: null,
      brand: null,
      model: null,
      category: null,
      warrantyStatus: null,
      ...overrides.appliance,
    },
    issue: { category: null, description: null, symptoms: [], ...overrides.issue },
    diagnosis: { suspectedIssue: null, confidence: null, ...overrides.diagnosis },
    recommendedAction: { type: null, description: null, requiresTechnician: null, ...overrides.recommendedAction },
    stage: overrides.stage ?? 'GREETING',
    isDemoContext: overrides.isDemoContext ?? false,
  };
}

export function createConversationSession(
  sessionId: string,
  customerId?: string,
  applianceId?: string,
  context?: Partial<ConversationContext>
): ConversationSession {
  const createdAt = now();
  const supportContext = createConversationContext({
    ...context,
    customer: {
      name: context?.customer?.name ?? null,
      customerId: customerId ?? context?.customer?.customerId ?? null,
    },
    appliance: {
      applianceId: applianceId ?? context?.appliance?.applianceId ?? null,
      brand: context?.appliance?.brand ?? null,
      model: context?.appliance?.model ?? null,
      category: context?.appliance?.category ?? null,
      warrantyStatus: context?.appliance?.warrantyStatus ?? null,
    },
  });

  return {
    id: sessionId,
    customerId,
    applianceId,
    state: 'ACTIVE',
    status: 'open',
    createdAt,
    updatedAt: createdAt,
    messages: [],
    context: { customerId, applianceId },
    supportContext,
  };
}

export class ConversationOrchestrator {
  private context: ConversationContext;
  private listeners = new Set<(event: ConversationEvent) => void>();

  constructor(options: ConversationOrchestratorOptions) {
    this.context = createConversationContext(options.context);
    if (options.onEvent) this.listeners.add(options.onEvent);
  }

  getContext(): ConversationContext {
    return structuredClone(this.context);
  }

  getStage(): ConversationStage {
    return this.context.stage;
  }

  subscribe(listener: (event: ConversationEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  buildSystemContext(): string {
    const context = JSON.stringify(this.context);
    return `CURRENT STRUCTURED SUPPORT CONTEXT (unknown values are null; do not invent replacements):\n${context}`;
  }

  handleTranscript(event: VoiceTranscriptEvent): ConversationContext {
    if (!event.text.trim()) return this.getContext();
    const previousStage = this.context.stage;
    if (event.kind.startsWith('USER_')) this.advanceForUserTranscript(event.text);
    if (event.kind.startsWith('ASSISTANT_')) this.advanceForAssistantTranscript();
    if (previousStage !== this.context.stage) {
      this.emit({ type: 'STAGE_CHANGED', stage: this.context.stage, timestamp: now(), transcript: event.text });
    }
    this.emit({
      type: event.kind.startsWith('USER_') ? 'USER_TRANSCRIPT_RECEIVED' : 'ASSISTANT_TRANSCRIPT_RECEIVED',
      stage: this.context.stage,
      timestamp: now(),
      transcript: event.text,
    });
    return this.getContext();
  }

  updateContext(patch: Partial<ConversationContext>): ConversationContext {
    this.context = createConversationContext({
      ...this.context,
      ...patch,
      customer: { ...this.context.customer, ...patch.customer },
      appliance: { ...this.context.appliance, ...patch.appliance },
      issue: { ...this.context.issue, ...patch.issue },
      diagnosis: { ...this.context.diagnosis, ...patch.diagnosis },
      recommendedAction: { ...this.context.recommendedAction, ...patch.recommendedAction },
    });
    this.emit({ type: 'CONTEXT_UPDATED', stage: this.context.stage, timestamp: now() });
    return this.getContext();
  }

  private advanceForUserTranscript(text: string): void {
    if (!this.context.appliance.category) {
      this.context.stage = 'IDENTIFYING_APPLIANCE';
      return;
    }
    if (!this.context.issue.description) {
      this.context.issue.description = text;
      this.context.issue.symptoms = [text];
      this.context.stage = 'UNDERSTANDING_ISSUE';
      return;
    }
    if (this.context.stage === 'UNDERSTANDING_ISSUE') this.context.stage = 'DIAGNOSING';
    else if (this.context.stage === 'DIAGNOSING') this.context.stage = 'TROUBLESHOOTING';
  }

  private advanceForAssistantTranscript(): void {
    if (this.context.stage === 'GREETING') this.context.stage = 'IDENTIFYING_APPLIANCE';
    else if (this.context.stage === 'UNDERSTANDING_ISSUE') this.context.stage = 'DIAGNOSING';
  }

  private emit(event: ConversationEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

export class PlaceholderConversationService implements ConversationService {
  async createSession(customerId?: string, applianceId?: string, context?: Partial<ConversationContext>): Promise<ConversationSession> {
    return createConversationSession(`conversation-${Date.now()}`, customerId, applianceId, context);
  }

  async addMessage(_sessionId: string, message: ConversationMessage): Promise<ConversationMessage> {
    return { ...message, metadata: { ...message.metadata, source: 'conversation-orchestrator' } };
  }

  async getSession(_sessionId: string): Promise<ConversationSession | null> {
    return null;
  }

  async getSuggestedActions(_sessionId: string): Promise<string[]> {
    return ['Check warranty coverage', 'Review safe troubleshooting guidance', 'Prepare for technician service'];
  }
}

export const conversationService = new PlaceholderConversationService();
