import { createGeminiEmbeddingProvider } from '@/services/rag/embeddings';
import { SupabaseRAGService } from '@/services/rag';

export const ragService = new SupabaseRAGService(createGeminiEmbeddingProvider());