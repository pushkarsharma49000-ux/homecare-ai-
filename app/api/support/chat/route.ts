import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { createGeminiEmbeddingProvider } from '@/lib/rag/embeddings';
import { SupabaseRAGService } from '@/lib/rag';

export const runtime = 'nodejs';

type Payload = { message?: unknown; applianceType?: unknown; category?: unknown; history?: unknown };
const string = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase();
  const { data } = await supabase.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Payload;
  const message = string(body.message);
  if (!message || message.length > 2000) return NextResponse.json({ error: 'A message of up to 2,000 characters is required.' }, { status: 400 });

  try {
    const results = await new SupabaseRAGService(createGeminiEmbeddingProvider()).query({
      id: `chat-rag-${crypto.randomUUID()}`, query: message,
      applianceType: string(body.applianceType) || undefined, category: string(body.category) || undefined,
      topK: 3, similarityThreshold: 0.7,
    });
    if (!results.length) {
      return NextResponse.json({ answer: 'I do not have sufficient verified troubleshooting information for that yet. For safety, please avoid disassembly or electrical work; I can help arrange a technician visit.', sources: [] });
    }
    const guidance = results.map((result) => result.content).join('\n').slice(0, 2500);
    return NextResponse.json({
      answer: `Based on our verified guidance: ${guidance}\n\nPlease try the first safe check and tell me whether the issue persists. I’ll ask one step at a time.`,
      sources: results.map((result) => ({ title: result.documentTitle ?? result.title, content: result.content, score: result.similarity ?? result.confidence })),
    });
  } catch {
    return NextResponse.json({ error: 'Knowledge search is temporarily unavailable.' }, { status: 502 });
  }
}
