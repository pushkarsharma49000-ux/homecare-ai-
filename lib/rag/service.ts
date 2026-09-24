import { createGeminiEmbeddingProvider } from '@/lib/rag/embeddings';
import { SupabaseRAGService } from '@/lib/rag';

export const ragService = new SupabaseRAGService(createGeminiEmbeddingProvider());
