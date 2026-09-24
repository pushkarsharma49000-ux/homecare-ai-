import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { createGeminiEmbeddingProvider } from '@/lib/rag/embeddings';
import { SupabaseRAGService } from '@/lib/rag';

export const runtime = 'nodejs';

interface SearchRequest {
  query?: unknown;
  applianceType?: unknown;
  category?: unknown;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : null;

  if (!accessToken) {
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  try {
    const supabase = getServerSupabase();
    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    }

    let body: SearchRequest;
    try {
      body = (await request.json()) as SearchRequest;
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const query = optionalString(body.query);
    if (!query) {
      return NextResponse.json({ error: 'query is required.' }, { status: 400 });
    }

    const ragService = new SupabaseRAGService(createGeminiEmbeddingProvider());
    const results = await ragService.query({
      id: `rag-query-${Date.now()}`,
      query,
      applianceType: optionalString(body.applianceType),
      category: optionalString(body.category),
      topK: 8,
      similarityThreshold: 0.7,
    });

    return NextResponse.json({
      query,
      results: results.map((result) => ({
        id: result.chunkId ?? result.id,
        documentId: result.documentId,
        content: result.content,
        score: result.similarity ?? result.confidence,
        metadata: result.metadata ?? {},
      })),
      count: results.length,
    });
  } catch {
    return NextResponse.json({ error: 'Knowledge search failed.' }, { status: 502 });
  }
}
