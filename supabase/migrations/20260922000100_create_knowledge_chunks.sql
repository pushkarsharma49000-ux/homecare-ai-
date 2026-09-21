-- Phase 2C.1: knowledge chunk storage and cosine similarity retrieval.
-- Review and apply through Supabase migrations; this file is not executed by the app.

create extension if not exists vector with schema extensions;

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  token_count integer,
  embedding extensions.vector(768) not null,
  embedding_model text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_chunks_document_chunk_unique unique (document_id, chunk_index)
);

create index if not exists knowledge_chunks_document_id_idx
  on public.knowledge_chunks (document_id);

create index if not exists knowledge_chunks_embedding_hnsw_idx
  on public.knowledge_chunks using hnsw (embedding extensions.vector_cosine_ops);

alter table public.knowledge_chunks enable row level security;

create policy knowledge_chunks_authenticated_select
  on public.knowledge_chunks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_documents as documents
      where documents.id = knowledge_chunks.document_id
    )
  );

-- match_threshold is cosine similarity in [0, 1]; filters may reduce the
-- returned rows below match_count when fewer filtered chunks qualify.
create or replace function public.match_knowledge_chunks(
  query_embedding extensions.vector(768),
  match_threshold real default 0.70,
  match_count integer default 8,
  filter_appliance_type text default null,
  filter_category text default null
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  similarity real,
  document_title text,
  appliance_type text,
  category text,
  source_url text,
  metadata jsonb
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    chunks.id as chunk_id,
    chunks.document_id,
    chunks.content,
    (1 - (chunks.embedding <=> query_embedding))::real as similarity,
    documents.title as document_title,
    documents.appliance_type,
    documents.category,
    documents.source_url,
    chunks.metadata
  from public.knowledge_chunks as chunks
  join public.knowledge_documents as documents on documents.id = chunks.document_id
  where (1 - (chunks.embedding <=> query_embedding)) >= match_threshold
    and (filter_appliance_type is null or documents.appliance_type = filter_appliance_type)
    and (filter_category is null or documents.category = filter_category)
  order by chunks.embedding <=> query_embedding
  limit greatest(1, least(match_count, 50));
$$;

grant execute on function public.match_knowledge_chunks(
  extensions.vector(768), real, integer, text, text
) to authenticated;
