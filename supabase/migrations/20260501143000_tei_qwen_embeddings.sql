drop function if exists public.match_chunks(uuid, vector, integer, double precision);

alter table public.chunks
  alter column embedding type vector(1024);

create or replace function public.match_chunks(
  target_org_id uuid,
  query_embedding vector(1024),
  match_count integer default 8,
  match_threshold double precision default null
)
returns table (
  id uuid,
  org_id uuid,
  document_id uuid,
  document_title text,
  document_source_type text,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    chunk.id,
    chunk.org_id,
    chunk.document_id,
    document.title as document_title,
    document.source_type as document_source_type,
    chunk.content,
    chunk.metadata,
    1 - (chunk.embedding <=> query_embedding) as similarity
  from public.chunks as chunk
  inner join public.documents as document
    on document.id = chunk.document_id
  where chunk.org_id = target_org_id
    and chunk.embedding is not null
    and (
      match_threshold is null
      or 1 - (chunk.embedding <=> query_embedding) >= match_threshold
    )
  order by chunk.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

revoke all on function public.match_chunks(uuid, vector, integer, double precision) from public, anon;
grant execute on function public.match_chunks(uuid, vector, integer, double precision) to authenticated;
