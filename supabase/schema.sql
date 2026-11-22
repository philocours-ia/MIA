-- MIA — baseline schema snapshot
-- Applied to Supabase project MIA. For future versioned changes, create
-- migrations with the Supabase CLI before applying them to production.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text not null default 'fr'
    check (preferred_language in ('fr', 'mg', 'fr_mg')),
  role text not null default 'user'
    check (role in ('owner', 'admin', 'editor', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nouvelle conversation',
  language text not null default 'fr'
    check (language in ('fr', 'mg', 'fr_mg')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 30000),
  source_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint messages_conversation_owner_fk
    foreign key (conversation_id, user_id)
    references public.conversations(id, user_id) on delete cascade
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  original_filename text not null,
  storage_path text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes between 1 and 20971520),
  sha256 text,
  category text not null default 'other'
    check (category in (
      'legislation_regulations', 'municipal_administration', 'budget',
      'public_accounting', 'civil_status', 'administrative_procedures',
      'official_templates', 'other'
    )),
  knowledge_layer text not null default 'general_reference'
    check (knowledge_layer in ('legal_official', 'municipal_practice', 'general_reference')),
  verification_status text not null default 'pending_review'
    check (verification_status in ('pending_review', 'validated', 'historical', 'conflicting', 'rejected')),
  issuing_authority text,
  reference_number text,
  issued_on date,
  jurisdiction text,
  commune_name text,
  language text check (language in ('fr', 'mg', 'fr_mg')),
  notes text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, storage_path)
);

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  document_type text not null,
  commune_name text,
  language text not null default 'fr'
    check (language in ('fr', 'mg', 'fr_mg')),
  status text not null default 'draft'
    check (status in ('draft', 'review_required', 'ready_for_human_validation', 'archived')),
  body text not null default '',
  structured_data jsonb not null default '{}'::jsonb,
  source_refs jsonb not null default '[]'::jsonb,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx on public.conversations (user_id, updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index if not exists messages_user_created_idx on public.messages (user_id, created_at desc);
create index if not exists messages_conversation_user_idx on public.messages (conversation_id, user_id);
create index if not exists documents_user_created_idx on public.documents (user_id, created_at desc);
create index if not exists documents_user_category_idx on public.documents (user_id, category, verification_status);
create index if not exists documents_reviewed_by_idx on public.documents (reviewed_by);
create index if not exists drafts_user_updated_idx on public.drafts (user_id, updated_at desc);
create index if not exists activity_logs_user_created_idx on public.activity_logs (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'profiles_set_updated_at' and tgrelid = 'public.profiles'::regclass) then
    create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'conversations_set_updated_at' and tgrelid = 'public.conversations'::regclass) then
    create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'documents_set_updated_at' and tgrelid = 'public.documents'::regclass) then
    create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'drafts_set_updated_at' and tgrelid = 'public.drafts'::regclass) then
    create trigger drafts_set_updated_at before update on public.drafts for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.drafts enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "conversations_select_own" on public.conversations;
create policy "conversations_select_own" on public.conversations for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "conversations_insert_own" on public.conversations;
create policy "conversations_insert_own" on public.conversations for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "conversations_update_own" on public.conversations;
create policy "conversations_update_own" on public.conversations for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "conversations_delete_own" on public.conversations;
create policy "conversations_delete_own" on public.conversations for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own" on public.messages for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "messages_insert_user_own" on public.messages;
create policy "messages_insert_user_own" on public.messages for insert to authenticated with check (user_id = (select auth.uid()) and role = 'user');

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own" on public.documents for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "drafts_select_own" on public.drafts;
create policy "drafts_select_own" on public.drafts for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "drafts_insert_own" on public.drafts;
create policy "drafts_insert_own" on public.drafts for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "drafts_update_own" on public.drafts;
create policy "drafts_update_own" on public.drafts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "drafts_delete_own" on public.drafts;
create policy "drafts_delete_own" on public.drafts for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "activity_logs_select_own" on public.activity_logs;
create policy "activity_logs_select_own" on public.activity_logs for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "activity_logs_insert_own" on public.activity_logs;
create policy "activity_logs_insert_own" on public.activity_logs for insert to authenticated with check (user_id = (select auth.uid()));

revoke all on public.profiles, public.conversations, public.messages, public.documents, public.drafts, public.activity_logs from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
-- Role is intentionally omitted from client write grants.
grant insert (id, display_name, preferred_language) on public.profiles to authenticated;
grant update (id, display_name, preferred_language) on public.profiles to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, user_id, role, content, source_refs) on public.messages to authenticated;
grant select on public.documents to authenticated;
grant insert (user_id, title, original_filename, storage_path, mime_type, file_size_bytes, sha256, category, knowledge_layer, issuing_authority, reference_number, issued_on, jurisdiction, commune_name, language, notes, tags, metadata) on public.documents to authenticated;
grant update (title, category, knowledge_layer, issuing_authority, reference_number, issued_on, jurisdiction, commune_name, language, notes, tags, metadata) on public.documents to authenticated;
grant delete on public.documents to authenticated;
grant select, insert, update, delete on public.drafts to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant usage, select on sequence public.activity_logs_id_seq to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mia-documents', 'mia-documents', false, 20971520,
  array['application/pdf','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','text/plain']::text[]
)
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "mia_docs_select_own" on storage.objects;
create policy "mia_docs_select_own" on storage.objects for select to authenticated using (bucket_id='mia-documents' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "mia_docs_insert_own" on storage.objects;
create policy "mia_docs_insert_own" on storage.objects for insert to authenticated with check (bucket_id='mia-documents' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "mia_docs_update_own" on storage.objects;
create policy "mia_docs_update_own" on storage.objects for update to authenticated using (bucket_id='mia-documents' and (storage.foldername(name))[1]=(select auth.uid()::text)) with check (bucket_id='mia-documents' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "mia_docs_delete_own" on storage.objects;
create policy "mia_docs_delete_own" on storage.objects for delete to authenticated using (bucket_id='mia-documents' and (storage.foldername(name))[1]=(select auth.uid()::text));


-- Shared, source-attributed legal and administrative knowledge library.
create table if not exists public.knowledge_sources (
  id text primary key,
  title text not null,
  source_type text not null
    check (source_type in ('law','decree','manual','accounting_reference')),
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

create index if not exists knowledge_chunks_source_idx
  on public.knowledge_chunks(source_id, chunk_index);
create index if not exists knowledge_chunks_search_idx
  on public.knowledge_chunks using gin(search_vector);
create index if not exists knowledge_sources_type_idx
  on public.knowledge_sources(source_type, verification_status);

alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;

drop policy if exists "knowledge_sources_read_authenticated" on public.knowledge_sources;
create policy "knowledge_sources_read_authenticated"
  on public.knowledge_sources for select to authenticated using (true);
drop policy if exists "knowledge_sources_owner_write" on public.knowledge_sources;
create policy "knowledge_sources_owner_write"
  on public.knowledge_sources for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  ));

drop policy if exists "knowledge_chunks_read_authenticated" on public.knowledge_chunks;
create policy "knowledge_chunks_read_authenticated"
  on public.knowledge_chunks for select to authenticated using (true);
drop policy if exists "knowledge_chunks_owner_write" on public.knowledge_chunks;
create policy "knowledge_chunks_owner_write"
  on public.knowledge_chunks for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  ));

grant select, insert, update, delete on public.knowledge_sources to authenticated;
grant select, insert, update, delete on public.knowledge_chunks to authenticated;
