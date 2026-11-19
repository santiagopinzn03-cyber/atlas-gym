create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  muscle_group text not null,
  weight_kg numeric(6, 2) not null default 0,
  reps integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  day_key text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, day_key)
);

create index if not exists workout_sets_user_created_idx
  on public.workout_sets (user_id, created_at desc);

do $$
begin
  alter table public.workout_sets
    add constraint workout_sets_weight_check check (weight_kg >= 0 and weight_kg <= 500);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.workout_sets
    add constraint workout_sets_reps_check check (reps between 1 and 100);
exception when duplicate_object then null;
end $$;

alter table public.workout_sets enable row level security;
alter table public.workout_notes enable row level security;

drop policy if exists sets_select_own on public.workout_sets;
drop policy if exists sets_insert_own on public.workout_sets;
drop policy if exists sets_delete_own on public.workout_sets;
drop policy if exists notes_upsert_own on public.workout_notes;
drop policy if exists notes_select_own on public.workout_notes;
drop policy if exists notes_insert_own on public.workout_notes;
drop policy if exists notes_update_own on public.workout_notes;
drop policy if exists notes_delete_own on public.workout_notes;

create policy sets_select_own on public.workout_sets
  for select to authenticated using (auth.uid() = user_id);

create policy sets_insert_own on public.workout_sets
  for insert to authenticated with check (auth.uid() = user_id);

create policy sets_delete_own on public.workout_sets
  for delete to authenticated using (auth.uid() = user_id);

create policy notes_select_own on public.workout_notes
  for select to authenticated using (auth.uid() = user_id);

create policy notes_insert_own on public.workout_notes
  for insert to authenticated with check (auth.uid() = user_id);

create policy notes_update_own on public.workout_notes
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy notes_delete_own on public.workout_notes
  for delete to authenticated using (auth.uid() = user_id);
