import { KnowledgeDocument, KnowledgeCategory } from '@/types';
import { mockKnowledgeDocuments } from '@/lib/mock-data/knowledge-base';

export async function getKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  // Phase 1: Return mock data. In Phase 2: Query Supabase Vector / Embeddings RAG store
  return mockKnowledgeDocuments;
}

export async function getKnowledgeDocumentById(id: string): Promise<KnowledgeDocument | null> {
  const doc = mockKnowledgeDocuments.find((d) => d.id === id);
  return doc || null;
}

export async function searchKnowledgeDocuments(query: string, category?: KnowledgeCategory | 'All'): Promise<KnowledgeDocument[]> {
  let results = [...mockKnowledgeDocuments];

  if (category && category !== 'All') {
    results = results.filter((d) => d.category === category);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.content.toLowerCase().includes(q)
    );
  }

  return results;
}
