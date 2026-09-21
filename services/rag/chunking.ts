import type { ChunkInput } from '@/services/rag/types';

export interface ChunkingOptions {
  targetTokens?: number;
  overlapTokens?: number;
}

const DEFAULT_TARGET_TOKENS = 650;
const DEFAULT_OVERLAP_TOKENS = 90;

function approximateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.3));
}

function splitIntoWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function chunkDocument(content: string, options: ChunkingOptions = {}): ChunkInput[] {
  const configuredTarget = Number(process.env.RAG_CHUNK_TARGET_TOKENS);
  const configuredOverlap = Number(process.env.RAG_CHUNK_OVERLAP_TOKENS);
  const targetTokens = Math.max(100, options.targetTokens ?? (Number.isFinite(configuredTarget) && configuredTarget > 0 ? configuredTarget : DEFAULT_TARGET_TOKENS));
  const overlapTokens = Math.max(0, Math.min(targetTokens - 1, options.overlapTokens ?? (Number.isFinite(configuredOverlap) && configuredOverlap >= 0 ? configuredOverlap : DEFAULT_OVERLAP_TOKENS)));
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const chunks: ChunkInput[] = [];
  let current: string[] = [];

  const flush = () => {
    if (!current.length) return;
    const text = current.join(' ').trim();
    chunks.push({ chunkIndex: chunks.length, content: text, tokenCount: approximateTokenCount(text) });
    const overlapWords = Math.floor(overlapTokens / 1.3);
    current = overlapWords > 0 ? current.slice(-overlapWords) : [];
  };

  for (const paragraph of paragraphs.length ? paragraphs : [content]) {
    const words = splitIntoWords(paragraph);
    if (!words.length) continue;
    if (approximateTokenCount([...current, ...words].join(' ')) <= targetTokens) {
      current.push(...words);
      continue;
    }
    flush();
    while (words.length > targetTokens) {
      const take = Math.max(1, Math.floor(targetTokens / 1.3));
      current = words.splice(0, take);
      flush();
    }
    current.push(...words);
  }
  flush();
  return chunks;
}
