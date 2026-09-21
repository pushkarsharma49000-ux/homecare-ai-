import { getServerSupabase } from '@/lib/supabase/server';
import { chunkDocument } from '@/services/rag/chunking';
import type { IngestionResult } from '@/services/rag/types';
import type { EmbeddingProvider } from '@/services/rag/embeddings/provider';
import type { DbKnowledgeDocument } from '@/types/supabase';

export async function ingestKnowledgeDocument(documentId: string, embeddingProvider: EmbeddingProvider): Promise<IngestionResult> {
  const supabase = getServerSupabase();
  const { data: document, error: documentError } = await supabase
    .from('knowledge_documents')
    .select('id, title, category, appliance_type, description, content, source_url, status')
    .eq('id', documentId)
    .maybeSingle<Pick<DbKnowledgeDocument, 'id' | 'title' | 'category' | 'appliance_type' | 'description' | 'content' | 'source_url' | 'status'>>();

  if (documentError) throw new Error('Knowledge document could not be loaded.');
  if (!document?.content?.trim()) throw new Error('Knowledge document has no content to ingest.');

  const chunks = chunkDocument(document.content);
  if (!chunks.length) throw new Error('Knowledge document produced no chunks.');
  const embeddings = await embeddingProvider.embedTexts(chunks.map((chunk) => chunk.content), { purpose: 'document' });

  const { error: deleteError } = await supabase.from('knowledge_chunks').delete().eq('document_id', documentId);
  if (deleteError) throw new Error('Existing knowledge chunks could not be reconciled.');

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
  const { error: insertError } = await supabase.from('knowledge_chunks').insert(rows);
  if (insertError) throw new Error('Knowledge chunks could not be stored.');

  return {
    documentId,
    chunkCount: chunks.length,
    embeddingCount: embeddings.length,
    embeddingModel: embeddingProvider.model,
    status: 'completed',
  };
}
