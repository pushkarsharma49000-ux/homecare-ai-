import { getServerSupabase } from '@/lib/supabase/server';
import { chunkDocument } from '@/lib/rag/chunking';
import type { IngestionResult } from '@/lib/rag/types';
import type { EmbeddingProvider } from '@/lib/rag/embeddings/provider';
import type { DbKnowledgeDocument } from '@/types/supabase';

export type IngestionErrorCode = 'INVALID_DOCUMENT_ID' | 'DOCUMENT_NOT_FOUND' | 'DOCUMENT_INACTIVE' | 'EMPTY_CONTENT' | 'EMBEDDING_FAILED' | 'DATABASE_FAILED';

export class KnowledgeIngestionError extends Error {
  constructor(public readonly code: IngestionErrorCode, message: string) {
    super(message);
    this.name = 'KnowledgeIngestionError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidDocumentId(documentId: string): boolean {
  return UUID_PATTERN.test(documentId);
}

export async function ingestKnowledgeDocument(documentId: string, embeddingProvider: EmbeddingProvider): Promise<IngestionResult> {
  if (!isValidDocumentId(documentId)) throw new KnowledgeIngestionError('INVALID_DOCUMENT_ID', 'documentId must be a valid UUID.');

  const supabase = getServerSupabase();
  const { data: document, error: documentError } = await supabase
    .from('knowledge_documents')
    .select('id, title, category, appliance_type, description, content, source_url, status')
    .eq('id', documentId)
    .maybeSingle<Pick<DbKnowledgeDocument, 'id' | 'title' | 'category' | 'appliance_type' | 'description' | 'content' | 'source_url' | 'status'>>();

  if (documentError) throw new KnowledgeIngestionError('DATABASE_FAILED', 'Knowledge document could not be loaded.');
  if (!document) throw new KnowledgeIngestionError('DOCUMENT_NOT_FOUND', 'Knowledge document was not found.');
  if (document.status !== 'active') {
  throw new KnowledgeIngestionError(
    'DOCUMENT_INACTIVE',
    'Only active knowledge documents can be ingested.'
  );
}
  if (!document.content?.trim()) throw new KnowledgeIngestionError('EMPTY_CONTENT', 'Knowledge document has no content to ingest.');

  const chunks = chunkDocument(document.content);
  if (!chunks.length) throw new KnowledgeIngestionError('EMPTY_CONTENT', 'Knowledge document has no usable content to ingest.');
  let embeddings;
  try {
    embeddings = await embeddingProvider.embedTexts(chunks.map((chunk) => chunk.content), { purpose: 'document' });
  } catch {
    throw new KnowledgeIngestionError('EMBEDDING_FAILED', 'Knowledge document embeddings could not be generated.');
  }
  if (embeddings.length !== chunks.length || embeddings.some((embedding) => embedding.dimension !== embeddingProvider.dimension || embedding.embedding.length !== embeddingProvider.dimension)) {
    throw new KnowledgeIngestionError('EMBEDDING_FAILED', 'Generated embeddings failed the configured dimension check.');
  }

  const rows = chunks.map((chunk, index) => ({
    document_id: documentId,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    token_count: chunk.tokenCount,
    embedding: embeddings[index].embedding,
    embedding_model: embeddings[index].model,
    metadata: {
      title: document.title,
      category: document.category,
      appliance_type: document.appliance_type,
      source_url: document.source_url,
    },
  }));
  const { error: upsertError } = await supabase
    .from('knowledge_chunks')
    .upsert(rows, { onConflict: 'document_id,chunk_index' });
  if (upsertError) throw new KnowledgeIngestionError('DATABASE_FAILED', 'Knowledge chunks could not be stored.');

  const { error: staleChunkError } = await supabase
    .from('knowledge_chunks')
    .delete()
    .eq('document_id', documentId)
    .gte('chunk_index', rows.length);
  if (staleChunkError) throw new KnowledgeIngestionError('DATABASE_FAILED', 'Stale knowledge chunks could not be reconciled.');

  return {
    documentId,
    chunkCount: chunks.length,
    chunksCreated: rows.length,
    embeddingCount: embeddings.length,
    embeddingDimensions: embeddingProvider.dimension,
    embeddingModel: embeddingProvider.model,
    status: 'completed',
  };
}
