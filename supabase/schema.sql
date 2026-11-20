create table if not exists public.series_registro (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  ejercicio_id text not null,
  nombre_ejercicio text not null,
  grupo_muscular text not null,
  peso_kg numeric(6, 2) not null default 0,
  repeticiones integer not null default 0,
  creado_en timestamptz not null default now()
);

drop table if exists public.notas_entrenamiento cascade;

create table public.notas_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ejercicio_id text not null,
  nombre_ejercicio text not null default '',
  content text not null default '',
  creado_en timestamptz not null default now()
);

create table if not exists public.ejercicios_personalizados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  muscle_group text not null,
  name text not null,
  equipment text not null default 'Sin equipo',
  created_at timestamptz not null default now()
);

alter table public.series_registro
  add column if not exists usuario_id uuid references auth.users (id) on delete cascade,
  add column if not exists nombre_ejercicio text not null default '',
  add column if not exists grupo_muscular text not null default '',
  add column if not exists creado_en timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'series_registro'
      and column_name = 'created_at'
  ) then
    execute 'update public.series_registro set creado_en = created_at where creado_en is null';
  end if;
end $$;

update public.series_registro set creado_en = now() where creado_en is null;

alter table public.series_registro
  alter column creado_en set default now(),
  alter column creado_en set not null,
  alter column usuario_id set default auth.uid();

create index if not exists series_registro_usuario_creado_idx
  on public.series_registro (usuario_id, creado_en desc);

create index if not exists ejercicios_personalizados_usuario_creado_idx
  on public.ejercicios_personalizados (user_id, created_at desc);

do $$
begin
  alter table public.series_registro
    add constraint series_registro_peso_check check (peso_kg >= 0 and peso_kg <= 500);
exception when duplicate_object then null;
end $$;

alter table public.series_registro
  drop constraint if exists series_registro_repeticiones_check;

do $$
begin
  alter table public.series_registro
    add constraint series_registro_repeticiones_check check (repeticiones between 0 and 100);
exception when duplicate_object then null;
end $$;

create index if not exists notas_entrenamiento_usuario_ejercicio_creado_idx
  on public.notas_entrenamiento (user_id, ejercicio_id, creado_en desc);

alter table public.series_registro enable row level security;
alter table public.notas_entrenamiento enable row level security;
alter table public.ejercicios_personalizados enable row level security;

drop policy if exists series_registro_select_propias on public.series_registro;
drop policy if exists series_registro_insert_propias on public.series_registro;
drop policy if exists series_registro_delete_propias on public.series_registro;
drop policy if exists notas_entrenamiento_select_propias on public.notas_entrenamiento;
drop policy if exists notas_entrenamiento_insert_propias on public.notas_entrenamiento;
drop policy if exists notas_entrenamiento_update_propias on public.notas_entrenamiento;
drop policy if exists notas_entrenamiento_delete_propias on public.notas_entrenamiento;
drop policy if exists ejercicios_personalizados_select_propios on public.ejercicios_personalizados;
drop policy if exists ejercicios_personalizados_insert_propios on public.ejercicios_personalizados;
drop policy if exists ejercicios_personalizados_delete_propios on public.ejercicios_personalizados;

create policy series_registro_select_propias on public.series_registro
  for select to authenticated using (auth.uid() = usuario_id);

create policy series_registro_insert_propias on public.series_registro
  for insert to authenticated with check (auth.uid() = usuario_id);

create policy series_registro_delete_propias on public.series_registro
  for delete to authenticated using (auth.uid() = usuario_id);

create policy notas_entrenamiento_select_propias on public.notas_entrenamiento
  for select to authenticated using (auth.uid() = user_id);

create policy notas_entrenamiento_insert_propias on public.notas_entrenamiento
  for insert to authenticated with check (auth.uid() = user_id);

create policy notas_entrenamiento_update_propias on public.notas_entrenamiento
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy notas_entrenamiento_delete_propias on public.notas_entrenamiento
  for delete to authenticated using (auth.uid() = user_id);

create policy ejercicios_personalizados_select_propios on public.ejercicios_personalizados
  for select to authenticated using (auth.uid() = user_id);

create policy ejercicios_personalizados_insert_propios on public.ejercicios_personalizados
  for insert to authenticated with check (auth.uid() = user_id);

create policy ejercicios_personalizados_delete_propios on public.ejercicios_personalizados
  for delete to authenticated using (auth.uid() = user_id);

grant all on table public.notas_entrenamiento to authenticated;

notify pgrst, 'reload schema';
