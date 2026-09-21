import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { createGeminiEmbeddingProvider } from '@/services/rag/embeddings';
import { ingestKnowledgeDocument, KnowledgeIngestionError } from '@/services/rag/ingestion';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!accessToken) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const supabase = getServerSupabase();
    const { data: userData } = await supabase.auth.getUser(accessToken);
    if (!userData.user) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

    let body: { documentId?: string; document_id?: string };
    try {
      body = (await request.json()) as { documentId?: string; document_id?: string };
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }
    const documentId = body.documentId ?? body.document_id;
    if (!documentId) return NextResponse.json({ error: 'document_id is required.' }, { status: 400 });
    const result = await ingestKnowledgeDocument(documentId, createGeminiEmbeddingProvider());
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof KnowledgeIngestionError) {
      const status = error.code === 'INVALID_DOCUMENT_ID' || error.code === 'EMPTY_CONTENT' ? 400 : error.code === 'DOCUMENT_NOT_FOUND' ? 404 : error.code === 'DOCUMENT_INACTIVE' ? 409 : 502;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: 'Knowledge document ingestion failed.' }, { status: 500 });
  }
}
