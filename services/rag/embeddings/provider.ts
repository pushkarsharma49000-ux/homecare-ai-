import type { EmbeddingResult } from '@/services/rag/types';

export type EmbeddingPurpose = 'document' | 'query';

export interface EmbeddingOptions {
  purpose: EmbeddingPurpose;
  title?: string;
}

export interface EmbeddingProvider {
  readonly model: string;
  readonly dimension: number;
  embedText(text: string, options: EmbeddingOptions): Promise<EmbeddingResult>;
  embedTexts(texts: string[], options: EmbeddingOptions): Promise<EmbeddingResult[]>;
}
