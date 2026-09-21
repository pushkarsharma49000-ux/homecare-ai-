import { ConversationMessage, ConversationSession } from '@/types/ai-support';

export interface ConversationService {
  createSession(customerId?: string, applianceId?: string): Promise<ConversationSession>;
  addMessage(sessionId: string, message: ConversationMessage): Promise<ConversationMessage>;
  getSession(sessionId: string): Promise<ConversationSession | null>;
  getSuggestedActions(sessionId: string): Promise<string[]>;
}

export function createConversationSession(
  sessionId: string,
  customerId?: string,
  applianceId?: string
): ConversationSession {
  const now = new Date().toISOString();

  return {
    id: sessionId,
    customerId,
    applianceId,
    state: 'ACTIVE',
    status: 'open',
    createdAt: now,
    updatedAt: now,
    messages: [],
    context: {
      customerId,
      applianceId,
    },
  };
}

export class PlaceholderConversationService implements ConversationService {
  async createSession(customerId?: string, applianceId?: string): Promise<ConversationSession> {
    const sessionId = `conversation-${Date.now()}`;
    return createConversationSession(sessionId, customerId, applianceId);
  }

  async addMessage(_sessionId: string, message: ConversationMessage): Promise<ConversationMessage> {
    return {
      ...message,
      metadata: {
        ...message.metadata,
        source: 'placeholder-service',
      },
    };
  }

  async getSession(_sessionId: string): Promise<ConversationSession | null> {
    return null;
  }

  async getSuggestedActions(_sessionId: string): Promise<string[]> {
    return [
      'Check warranty',
      'Review troubleshooting steps',
      'Schedule service visit',
      'Escalate to a specialist',
    ];
  }
}

export const conversationService = new PlaceholderConversationService();
