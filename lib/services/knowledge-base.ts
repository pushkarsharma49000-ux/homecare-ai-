import { supabase } from '@/lib/supabase/client';
import { KnowledgeDocument, KnowledgeCategory } from '@/types';
import { DbKnowledgeDocument } from '@/types/supabase';
import { mapDbKnowledgeDocToDoc } from './adapters';

export async function getKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  try {
    const { data: docs, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge documents from Supabase:', error.message);
      return [];
    }

    if (!docs || docs.length === 0) {
      return [];
    }

    return docs.map((d: DbKnowledgeDocument) => mapDbKnowledgeDocToDoc(d));
  } catch (err) {
    console.error('Unexpected error in getKnowledgeDocuments:', err);
    return [];
  }
}

export async function getKnowledgeDocumentById(id: string): Promise<KnowledgeDocument | null> {
  try {
    const { data: doc, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching knowledge document by id:', error.message);
      return null;
    }

    return doc ? mapDbKnowledgeDocToDoc(doc) : null;
  } catch (err) {
    console.error('Unexpected error in getKnowledgeDocumentById:', err);
    return null;
  }
}

export async function searchKnowledgeDocuments(
  query: string,
  category?: KnowledgeCategory | 'All'
): Promise<KnowledgeDocument[]> {
  const all = await getKnowledgeDocuments();
  let results = [...all];

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
