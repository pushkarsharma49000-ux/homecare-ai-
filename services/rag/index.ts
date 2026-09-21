import { RAGQuery, RAGResult } from '@/types/ai-support';

export interface RAGService {
  query(request: RAGQuery): Promise<RAGResult>;
  getContextSummary(sessionId: string): Promise<string[]>;
}

export class PlaceholderRAGService implements RAGService {
  async query(request: RAGQuery): Promise<RAGResult> {
    return {
      id: `rag-result-${Date.now()}`,
      queryId: request.id,
      content:
        'RAG is not implemented in this phase. This service will be connected to appliance knowledge, troubleshooting docs, and policy content in a later stage.',
      source: 'placeholder-rag-service',
      confidence: 0,
      title: 'RAG placeholder',
      excerpt: 'Future retrieval layer for troubleshooting and service guidance.',
      status: 'not_implemented',
    };
  }

  async getContextSummary(_sessionId: string): Promise<string[]> {
    return ['Customer and appliance context is preserved for future retrieval.'];
  }
}

export const ragService = new PlaceholderRAGService();
