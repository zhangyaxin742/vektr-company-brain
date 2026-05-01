create table if not exists public.pipeline_jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  parent_job_id uuid references public.pipeline_jobs(id) on delete set null,
  triggered_by_user_id uuid references auth.users(id) on delete set null,
  job_type text not null check (job_type in ('demo_load', 'upload_ingest', 'graphrag_index')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'partial')),
  source text not null check (source in ('public_demo', 'authenticated_upload', 'system')),
  dedupe_key text,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

drop trigger if exists pipeline_jobs_set_updated_at on public.pipeline_jobs;
create trigger pipeline_jobs_set_updated_at
before update on public.pipeline_jobs
for each row
execute function private.set_updated_at();

create index if not exists pipeline_jobs_org_created_at_idx
  on public.pipeline_jobs (org_id, created_at desc);
create index if not exists pipeline_jobs_status_created_at_idx
  on public.pipeline_jobs (status, created_at desc);
create unique index if not exists pipeline_jobs_active_dedupe_key_idx
  on public.pipeline_jobs (dedupe_key)
  where dedupe_key is not null and status in ('queued', 'running');

alter table public.pipeline_jobs enable row level security;

create policy "pipeline_jobs_select_member"
on public.pipeline_jobs
for select
to authenticated
using ((select private.is_org_member(org_id)));

create policy "pipeline_jobs_insert_admin"
on public.pipeline_jobs
for insert
to authenticated
with check ((select private.is_org_admin(org_id)));

create policy "pipeline_jobs_update_admin"
on public.pipeline_jobs
for update
to authenticated
using ((select private.is_org_admin(org_id)))
with check ((select private.is_org_admin(org_id)));

create policy "pipeline_jobs_delete_admin"
on public.pipeline_jobs
for delete
to authenticated
using ((select private.is_org_admin(org_id)));

revoke all on public.pipeline_jobs from anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/json', 'text/markdown', 'text/plain']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
