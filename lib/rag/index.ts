import { getServerSupabase } from '@/lib/supabase/server';
import type { RAGQuery, RAGResult } from '@/types/ai-support';
import type { RAGQueryService, KnowledgeChunkMatch } from '@/lib/rag/types';
import type { EmbeddingProvider } from '@/lib/rag/embeddings/provider';

export interface RAGService extends RAGQueryService {
  getContextSummary(sessionId: string): Promise<string[]>;
}

export class SupabaseRAGService implements RAGService {
  constructor(private readonly embeddingProvider: EmbeddingProvider) {}

  async query(request: RAGQuery): Promise<RAGResult[]> {
    if (!request.query.trim()) return [];
    const queryEmbedding = await this.embeddingProvider.embedText(request.query, { purpose: 'query' });
    const supabase = getServerSupabase();
    const { data, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding.embedding,
      match_threshold: request.similarityThreshold ?? 0.7,
      match_count: Math.min(Math.max(request.topK ?? 8, 1), 50),
      filter_appliance_type: request.applianceType ?? null,
      filter_category: request.category ?? null,
    });
    if (error) throw new Error('Knowledge retrieval failed.');

    return ((data ?? []) as KnowledgeChunkMatch[]).map((match) => ({
      id: `rag-result-${match.chunkId}`,
      queryId: request.id,
      chunkId: match.chunkId,
      documentId: match.documentId,
      content: match.content,
      similarity: match.similarity,
      confidence: match.similarity,
      source: match.sourceUrl || match.documentTitle,
      title: match.documentTitle,
      documentTitle: match.documentTitle,
      excerpt: match.content.slice(0, 240),
      applianceType: match.applianceType,
      category: match.category,
      sourceUrl: match.sourceUrl,
      metadata: match.metadata,
      status: 'ready',
    }));
  }

  async getContextSummary(_sessionId: string): Promise<string[]> {
    return [];
  }
}

