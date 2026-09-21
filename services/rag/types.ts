import type { RAGQuery, RAGResult } from '@/types/ai-support';

export const RAG_EMBEDDING_MODEL = 'gemini-embedding-001';
export const RAG_EMBEDDING_DIMENSION = 768;

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimension: number;
}

export interface ChunkInput {
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
}

export interface IngestionResult {
  documentId: string;
  chunkCount: number;
  embeddingCount: number;
  embeddingModel: string;
  status: 'completed' | 'failed';
}

export interface KnowledgeChunkMatch {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  documentTitle: string;
  applianceType: string | null;
  category: string | null;
  sourceUrl: string | null;
  metadata: Record<string, unknown> | null;
}

export interface RAGQueryService {
  query(request: RAGQuery): Promise<RAGResult[]>;
}
