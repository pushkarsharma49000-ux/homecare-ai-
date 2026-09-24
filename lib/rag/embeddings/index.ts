import { GoogleGenAI } from '@google/genai';
import type { EmbeddingOptions, EmbeddingProvider } from '@/lib/rag/embeddings/provider';
import { RAG_EMBEDDING_DIMENSION, RAG_EMBEDDING_MODEL } from '@/lib/rag/types';
import type { EmbeddingResult } from '@/lib/rag/types';

const DOCUMENT_TASK = 'RETRIEVAL_DOCUMENT';
const QUERY_TASK = 'RETRIEVAL_QUERY';

export function validateEmbeddingDimension(values: readonly number[], expectedDimension: number): void {
  if (values.length !== expectedDimension) {
    throw new Error(`Embedding must contain exactly ${expectedDimension} values.`);
  }
  if (values.some((value) => !Number.isFinite(value))) throw new Error('Embedding contains invalid values.');
}

export function normalizeEmbedding(values: readonly number[], expectedDimension: number): number[] {
  if (!Number.isInteger(expectedDimension) || expectedDimension <= 0) {
    throw new Error('Embedding dimension must be a positive integer.');
  }
  validateEmbeddingDimension(values, expectedDimension);

  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude <= Number.EPSILON) {
    throw new Error('Embedding provider returned a zero vector.');
  }

  const normalized = values.map((value) => value / magnitude);
  if (normalized.some((value) => !Number.isFinite(value))) throw new Error('Embedding normalization failed.');
  return normalized;
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly model: string;
  readonly dimension: number;
  private readonly client: GoogleGenAI;

  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) throw new Error('Embedding provider is not configured.');
    this.model = process.env.GEMINI_EMBEDDING_MODEL || RAG_EMBEDDING_MODEL;
    this.dimension = Number(process.env.GEMINI_EMBEDDING_DIMENSION || RAG_EMBEDDING_DIMENSION);
    if (this.model !== RAG_EMBEDDING_MODEL) throw new Error(`Embedding model must be ${RAG_EMBEDDING_MODEL}.`);
    if (this.dimension !== RAG_EMBEDDING_DIMENSION) throw new Error(`Embedding dimension must be ${RAG_EMBEDDING_DIMENSION} for ${RAG_EMBEDDING_MODEL}.`);
    if (!Number.isInteger(this.dimension) || this.dimension <= 0) throw new Error('Embedding dimension is invalid.');
    this.client = new GoogleGenAI({ apiKey });
  }

  async embedText(text: string, options: EmbeddingOptions): Promise<EmbeddingResult> {
    const response = await this.client.models.embedContent({
      model: this.model,
      contents: text,
      config: {
        taskType: options.purpose === 'query' ? QUERY_TASK : DOCUMENT_TASK,
        title: options?.title,
        outputDimensionality: this.dimension,
      },
    });
    const values = response.embeddings?.[0]?.values;
    const embedding = normalizeEmbedding(values ?? [], this.dimension);
    return { embedding, model: this.model, dimension: embedding.length };
  }

  async embedTexts(texts: string[], options: EmbeddingOptions): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    for (const text of texts) results.push(await this.embedText(text, options));
    return results;
  }
}

export function createGeminiEmbeddingProvider(): GeminiEmbeddingProvider {
  return new GeminiEmbeddingProvider();
}
