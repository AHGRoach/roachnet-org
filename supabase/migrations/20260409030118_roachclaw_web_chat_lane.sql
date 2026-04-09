create table if not exists public.chat_threads (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New chat',
  summary text,
  lane text not null default 'roachclaw-web',
  source text not null default 'roachnet.org/roachclaw',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_message_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_threads_user_id_last_message_idx
  on public.chat_threads (user_id, last_message_at desc, created_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  provider text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_messages_thread_id_created_at_idx
  on public.chat_messages (thread_id, created_at asc);

create index if not exists chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at desc);

create or replace function public.touch_chat_thread_last_message()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.chat_threads
  set last_message_at = new.created_at,
      updated_at = timezone('utc', now())
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists chat_threads_set_updated_at on public.chat_threads;
create trigger chat_threads_set_updated_at
  before update on public.chat_threads
  for each row execute function public.set_row_updated_at();

drop trigger if exists chat_messages_touch_thread on public.chat_messages;
create trigger chat_messages_touch_thread
  after insert on public.chat_messages
  for each row execute function public.touch_chat_thread_last_message();

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "chat_threads_select_own" on public.chat_threads;
create policy "chat_threads_select_own"
  on public.chat_threads
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "chat_threads_insert_own" on public.chat_threads;
create policy "chat_threads_insert_own"
  on public.chat_threads
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "chat_threads_update_own" on public.chat_threads;
create policy "chat_threads_update_own"
  on public.chat_threads
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "chat_threads_delete_own" on public.chat_threads;
create policy "chat_threads_delete_own"
  on public.chat_threads
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
  on public.chat_messages
  for select
  to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.chat_threads
      where public.chat_threads.id = public.chat_messages.thread_id
        and public.chat_threads.user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
  on public.chat_messages
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.chat_threads
      where public.chat_threads.id = public.chat_messages.thread_id
        and public.chat_threads.user_id = auth.uid()
    )
  );
