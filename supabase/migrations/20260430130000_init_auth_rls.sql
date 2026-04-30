create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;

create schema if not exists private;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  source_type text not null check (
    source_type in ('slack_json', 'email_json', 'markdown', 'text', 'pdf', 'demo_seed')
  ),
  source_date timestamptz,
  storage_path text,
  raw_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chunks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  trigger text not null,
  inputs_required jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  approval_gates jsonb not null default '[]'::jsonb,
  allowed_actions jsonb not null default '[]'::jsonb,
  forbidden_actions jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  confidence numeric(4, 3) not null default 0 check (confidence >= 0 and confidence <= 1),
  source_chunk_ids uuid[] not null default '{}'::uuid[],
  source_entity_ids text[] not null default '{}'::text[],
  version text not null default 'v1',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug, version)
);

create table if not exists public.health_flags (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  type text not null check (
    type in (
      'conflict',
      'missing_owner',
      'stale_skill',
      'low_confidence',
      'unapproved_skill',
      'customer_risk'
    )
  ),
  title text not null check (char_length(trim(title)) > 0),
  description text not null,
  related_entity_ids text[] not null default '{}'::text[],
  evidence_chunk_ids uuid[] not null default '{}'::uuid[],
  status text not null default 'open' check (status in ('open', 'dismissed', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ask_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null check (char_length(trim(question)) > 0),
  answer jsonb not null default '{}'::jsonb,
  citation_chunk_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now()
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.enforce_chunk_org_consistency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  document_org_id uuid;
begin
  select d.org_id
  into document_org_id
  from public.documents as d
  where d.id = new.document_id;

  if document_org_id is null then
    raise exception 'Document % does not exist.', new.document_id;
  end if;

  if document_org_id <> new.org_id then
    raise exception 'Chunk org_id must match document org_id.';
  end if;

  return new;
end;
$$;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function private.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row
execute function private.set_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
before update on public.skills
for each row
execute function private.set_updated_at();

drop trigger if exists health_flags_set_updated_at on public.health_flags;
create trigger health_flags_set_updated_at
before update on public.health_flags
for each row
execute function private.set_updated_at();

drop trigger if exists chunks_enforce_org_consistency on public.chunks;
create trigger chunks_enforce_org_consistency
before insert or update on public.chunks
for each row
execute function private.enforce_chunk_org_consistency();

create index if not exists memberships_user_org_idx
  on public.memberships (user_id, org_id);
create index if not exists documents_org_created_at_idx
  on public.documents (org_id, created_at desc);
create index if not exists chunks_org_document_idx
  on public.chunks (org_id, document_id);
create index if not exists skills_org_status_updated_at_idx
  on public.skills (org_id, status, updated_at desc);
create index if not exists health_flags_org_status_severity_created_at_idx
  on public.health_flags (org_id, status, severity, created_at desc);
create index if not exists ask_logs_org_user_created_at_idx
  on public.ask_logs (org_id, user_id, created_at desc);

do $$
begin
  begin
    execute '
      create index if not exists chunks_embedding_hnsw_idx
      on public.chunks
      using hnsw (embedding vector_cosine_ops)
      where embedding is not null
    ';
  exception
    when undefined_object or feature_not_supported or invalid_parameter_value then
      execute '
        create index if not exists chunks_embedding_ivfflat_idx
        on public.chunks
        using ivfflat (embedding vector_cosine_ops)
        with (lists = 100)
        where embedding is not null
      ';
  end;
end
$$;

create or replace function private.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships as membership
    where membership.org_id = target_org_id
      and membership.user_id = auth.uid()
  );
$$;

create or replace function private.is_org_admin(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships as membership
    where membership.org_id = target_org_id
      and membership.user_id = auth.uid()
      and membership.role in ('owner', 'admin')
  );
$$;

create or replace function private.is_org_owner(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships as membership
    where membership.org_id = target_org_id
      and membership.user_id = auth.uid()
      and membership.role = 'owner'
  );
$$;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.skills enable row level security;
alter table public.health_flags enable row level security;
alter table public.ask_logs enable row level security;

create policy "organizations_select_member"
on public.organizations
for select
to authenticated
using ((select private.is_org_member(id)));

create policy "organizations_update_admin"
on public.organizations
for update
to authenticated
using ((select private.is_org_admin(id)))
with check ((select private.is_org_admin(id)));

create policy "memberships_select_member"
on public.memberships
for select
to authenticated
using ((select private.is_org_member(org_id)));

create policy "memberships_insert_admin"
on public.memberships
for insert
to authenticated
with check ((select private.is_org_admin(org_id)));

create policy "memberships_update_admin"
on public.memberships
for update
to authenticated
using ((select private.is_org_admin(org_id)))
with check ((select private.is_org_admin(org_id)));

create policy "memberships_delete_owner"
on public.memberships
for delete
to authenticated
using ((select private.is_org_owner(org_id)));

create policy "documents_select_member"
on public.documents
for select
to authenticated
using ((select private.is_org_member(org_id)));

create policy "documents_insert_admin"
on public.documents
for insert
to authenticated
with check ((select private.is_org_admin(org_id)));

create policy "documents_update_admin"
on public.documents
for update
to authenticated
using ((select private.is_org_admin(org_id)))
with check ((select private.is_org_admin(org_id)));

create policy "documents_delete_admin"
on public.documents
for delete
to authenticated
using ((select private.is_org_admin(org_id)));

create policy "chunks_select_member"
on public.chunks
for select
to authenticated
using ((select private.is_org_member(org_id)));

create policy "chunks_insert_admin"
on public.chunks
for insert
to authenticated
with check ((select private.is_org_admin(org_id)));

create policy "chunks_update_admin"
on public.chunks
for update
to authenticated
using ((select private.is_org_admin(org_id)))
with check ((select private.is_org_admin(org_id)));

create policy "chunks_delete_admin"
on public.chunks
for delete
to authenticated
using ((select private.is_org_admin(org_id)));

create policy "skills_select_member"
on public.skills
for select
to authenticated
using ((select private.is_org_member(org_id)));

create policy "skills_insert_admin"
on public.skills
for insert
to authenticated
with check ((select private.is_org_admin(org_id)));

create policy "skills_update_admin"
on public.skills
for update
to authenticated
using ((select private.is_org_admin(org_id)))
with check ((select private.is_org_admin(org_id)));

create policy "skills_delete_admin"
on public.skills
for delete
to authenticated
using ((select private.is_org_admin(org_id)));

create policy "health_flags_select_member"
on public.health_flags
for select
to authenticated
using ((select private.is_org_member(org_id)));

create policy "health_flags_insert_admin"
on public.health_flags
for insert
to authenticated
with check ((select private.is_org_admin(org_id)));

create policy "health_flags_update_admin"
on public.health_flags
for update
to authenticated
using ((select private.is_org_admin(org_id)))
with check ((select private.is_org_admin(org_id)));

create policy "health_flags_delete_admin"
on public.health_flags
for delete
to authenticated
using ((select private.is_org_admin(org_id)));

create policy "ask_logs_select_member_or_owner"
on public.ask_logs
for select
to authenticated
using (
  user_id = auth.uid()
  or (select private.is_org_admin(org_id))
);

create policy "ask_logs_insert_self"
on public.ask_logs
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (select private.is_org_member(org_id))
);

create or replace function public.match_chunks(
  target_org_id uuid,
  query_embedding vector(1536),
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

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.enforce_chunk_org_consistency() from public, anon, authenticated;
revoke all on function private.is_org_member(uuid) from public, anon, authenticated;
revoke all on function private.is_org_admin(uuid) from public, anon, authenticated;
revoke all on function private.is_org_owner(uuid) from public, anon, authenticated;
revoke all on function public.match_chunks(uuid, vector, integer, double precision) from public, anon;
grant execute on function public.match_chunks(uuid, vector, integer, double precision) to authenticated;
