-- Add a shared, source-attributed knowledge library for legal and administrative references.
create table if not exists public.knowledge_sources (
  id text primary key,
  title text not null,
  source_type text not null check (source_type in ('law','decree','manual','accounting_reference')),
  reference_number text,
  published_on date,
  issuing_authority text not null,
  official_url text not null,
  source_portal text,
  applicability text,
  verification_status text not null default 'official_reference'
    check (verification_status in ('official_reference','amended','scope_limited','historical_reference','needs_review')),
  caution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.knowledge_sources(id) on delete cascade,
  chunk_index integer not null check (chunk_index > 0),
  topic text not null,
  content text not null,
  article_refs text[] not null default '{}',
  page_refs text,
  tags text[] not null default '{}',
  language text not null default 'fr' check (language in ('fr','mg','fr_mg')),
  search_vector tsvector generated always as (
    to_tsvector('simple'::regconfig, coalesce(topic,'') || ' ' || coalesce(content,''))
  ) stored,
  created_at timestamptz not null default now(),
  unique (source_id, chunk_index)
);

create index if not exists knowledge_chunks_source_idx on public.knowledge_chunks(source_id, chunk_index);
create index if not exists knowledge_chunks_search_idx on public.knowledge_chunks using gin(search_vector);
create index if not exists knowledge_sources_type_idx on public.knowledge_sources(source_type, verification_status);

alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;

drop policy if exists "knowledge_sources_read_authenticated" on public.knowledge_sources;
create policy "knowledge_sources_read_authenticated"
  on public.knowledge_sources for select to authenticated using (true);
drop policy if exists "knowledge_sources_owner_write" on public.knowledge_sources;
create policy "knowledge_sources_owner_write"
  on public.knowledge_sources for all to authenticated
  using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin')))
  with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin')));

drop policy if exists "knowledge_chunks_read_authenticated" on public.knowledge_chunks;
create policy "knowledge_chunks_read_authenticated"
  on public.knowledge_chunks for select to authenticated using (true);
drop policy if exists "knowledge_chunks_owner_write" on public.knowledge_chunks;
create policy "knowledge_chunks_owner_write"
  on public.knowledge_chunks for all to authenticated
  using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin')))
  with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin')));

grant select, insert, update, delete on public.knowledge_sources to authenticated;
grant select, insert, update, delete on public.knowledge_chunks to authenticated;
