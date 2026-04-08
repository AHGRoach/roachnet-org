create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  plan text not null default 'local',
  account_state text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  favorite_apps text[] not null default '{}',
  app_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.device_links (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id text not null,
  device_name text not null,
  platform text not null,
  runtime_lane text not null default 'paired',
  roachtail_peer_id text,
  roachtail_status text not null default 'pending',
  roachsync_device_id text,
  roachsync_folder_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  unique (user_id, device_id)
);

create index if not exists device_links_user_id_last_seen_idx
  on public.device_links (user_id, last_seen_at desc);

create table if not exists public.saved_apps (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  app_id text not null,
  title text not null,
  category text,
  source text not null default 'apps.roachnet.org',
  install_intent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_installed_at timestamptz,
  unique (user_id, app_id)
);

create index if not exists saved_apps_user_id_updated_at_idx
  on public.saved_apps (user_id, updated_at desc);

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_display_name text;
begin
  next_display_name :=
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'RoachNet user'
    );

  insert into public.profiles (id, email, display_name, avatar_url, last_seen_at)
  values (
    new.id,
    new.email,
    next_display_name,
    new.raw_user_meta_data ->> 'avatar_url',
    timezone('utc', now())
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
        avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.profiles.avatar_url),
        updated_at = timezone('utc', now());

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.sync_profile_from_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_from_auth_user();

create or replace function public.touch_device_link(
  p_device_id text,
  p_device_name text default null,
  p_platform text default null,
  p_runtime_lane text default 'paired',
  p_roachtail_peer_id text default null,
  p_roachsync_device_id text default null,
  p_roachsync_folder_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.device_links
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  upserted public.device_links;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'auth required';
  end if;

  insert into public.device_links (
    user_id,
    device_id,
    device_name,
    platform,
    runtime_lane,
    roachtail_peer_id,
    roachsync_device_id,
    roachsync_folder_id,
    metadata,
    last_seen_at
  )
  values (
    current_user_id,
    p_device_id,
    coalesce(nullif(p_device_name, ''), 'RoachNet device'),
    coalesce(nullif(p_platform, ''), 'unknown'),
    coalesce(nullif(p_runtime_lane, ''), 'paired'),
    nullif(p_roachtail_peer_id, ''),
    nullif(p_roachsync_device_id, ''),
    nullif(p_roachsync_folder_id, ''),
    coalesce(p_metadata, '{}'::jsonb),
    timezone('utc', now())
  )
  on conflict (user_id, device_id) do update
    set device_name = excluded.device_name,
        platform = excluded.platform,
        runtime_lane = excluded.runtime_lane,
        roachtail_peer_id = coalesce(excluded.roachtail_peer_id, public.device_links.roachtail_peer_id),
        roachsync_device_id = coalesce(excluded.roachsync_device_id, public.device_links.roachsync_device_id),
        roachsync_folder_id = coalesce(excluded.roachsync_folder_id, public.device_links.roachsync_folder_id),
        metadata = public.device_links.metadata || excluded.metadata,
        last_seen_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
  returning * into upserted;

  return upserted;
end;
$$;

grant execute on function public.touch_device_link(text, text, text, text, text, text, text, jsonb) to authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_row_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_row_updated_at();

drop trigger if exists device_links_set_updated_at on public.device_links;
create trigger device_links_set_updated_at
  before update on public.device_links
  for each row execute function public.set_row_updated_at();

drop trigger if exists saved_apps_set_updated_at on public.saved_apps;
create trigger saved_apps_set_updated_at
  before update on public.saved_apps
  for each row execute function public.set_row_updated_at();

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.device_links enable row level security;
alter table public.saved_apps enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "device_links_select_own" on public.device_links;
create policy "device_links_select_own"
  on public.device_links
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "device_links_insert_own" on public.device_links;
create policy "device_links_insert_own"
  on public.device_links
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "device_links_update_own" on public.device_links;
create policy "device_links_update_own"
  on public.device_links
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "device_links_delete_own" on public.device_links;
create policy "device_links_delete_own"
  on public.device_links
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "saved_apps_select_own" on public.saved_apps;
create policy "saved_apps_select_own"
  on public.saved_apps
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "saved_apps_insert_own" on public.saved_apps;
create policy "saved_apps_insert_own"
  on public.saved_apps
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "saved_apps_update_own" on public.saved_apps;
create policy "saved_apps_update_own"
  on public.saved_apps
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "saved_apps_delete_own" on public.saved_apps;
create policy "saved_apps_delete_own"
  on public.saved_apps
  for delete
  to authenticated
  using (auth.uid() = user_id);
