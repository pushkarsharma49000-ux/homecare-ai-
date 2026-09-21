import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { createGeminiEmbeddingProvider } from '@/services/rag/embeddings';
import { ingestKnowledgeDocument } from '@/services/rag/ingestion';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!accessToken) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const supabase = getServerSupabase();
    const { data: userData } = await supabase.auth.getUser(accessToken);
    if (!userData.user) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

    const body = (await request.json()) as { documentId?: string };
    if (!body.documentId) return NextResponse.json({ error: 'documentId is required.' }, { status: 400 });
    const result = await ingestKnowledgeDocument(body.documentId, createGeminiEmbeddingProvider());
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Knowledge document ingestion failed.' }, { status: 500 });
  }
}
