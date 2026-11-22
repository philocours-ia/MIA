-- MIA: role-based access foundation for profiles.
-- The first owner is assigned separately after verifying the account identity.
alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'admin', 'editor', 'user'));

revoke insert, update on table public.profiles from authenticated;
revoke insert (created_at, display_name, id, preferred_language, updated_at)
  on table public.profiles from authenticated;
revoke update (created_at, display_name, id, preferred_language, updated_at)
  on table public.profiles from authenticated;

grant insert (id, display_name, preferred_language)
  on table public.profiles to authenticated;
grant update (id, display_name, preferred_language)
  on table public.profiles to authenticated;
