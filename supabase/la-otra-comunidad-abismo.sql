-- La Otra Comunidad · El Abismo de Helm: partidas y clasificación de la Comunidad (13/11/2026)
-- Guarda cada partida del juego de defensa y da la clasificación de los 9 (mejor de siempre y mejor de la semana).
-- Ejecutar UNA vez en el proyecto «golf» (SQL Editor). No toca nada de Stadada. Sin esto, el juego sigue
-- funcionando igual, solo que sin clasificación.

-- 1. Tabla: una fila por partida terminada.
create table if not exists public.loc_abismo (
  id          bigserial primary key,
  jugador_id  smallint not null references public.loc_jugadores(id) on delete cascade,
  puntos      integer  not null check (puntos between 0 and 500000),
  bajas       integer  not null check (bajas between 0 and 5000),
  oleada      smallint not null check (oleada between 0 and 9),
  gana        boolean  not null,
  estrellas   smallint not null check (estrellas between 0 and 3),
  heroe       text     not null check (heroe ~ '^[a-z_]{2,20}$'),
  segundos    integer  not null check (segundos between 0 and 7200),
  creado      timestamptz not null default now()
);
create index if not exists loc_abismo_jugador on public.loc_abismo (jugador_id, puntos desc);
alter table public.loc_abismo enable row level security;  -- cerrada: solo se entra por las funciones

-- 2. Guardar una partida. Devuelve tu mejor marca y tu puesto en la Comunidad.
create or replace function public.loc_abismo_guardar(p_puntos integer, p_bajas integer, p_oleada integer, p_gana boolean,
  p_estrellas integer, p_heroe text, p_segundos integer)
returns json
language plpgsql security definer set search_path = public as $$
declare v_id smallint; v_mejor integer; v_puesto integer;
begin
  select j.id into v_id from loc_jugadores j where j.user_id = auth.uid();
  if v_id is null then raise exception 'Sin hobbit en esta cuenta' using errcode = '28000'; end if;
  -- como mucho una partida cada 60 s por jugador (una partida dura varios minutos)
  if exists (select 1 from loc_abismo a where a.jugador_id = v_id and a.creado > now() - interval '60 seconds') then
    raise exception 'Demasiado seguido' using errcode = '22023';
  end if;
  insert into loc_abismo (jugador_id, puntos, bajas, oleada, gana, estrellas, heroe, segundos)
  values (v_id, p_puntos, p_bajas, p_oleada, p_gana, p_estrellas, p_heroe, p_segundos);
  select max(a.puntos) into v_mejor from loc_abismo a where a.jugador_id = v_id;
  select 1 + count(*) into v_puesto from (select a.jugador_id, max(a.puntos) m from loc_abismo a group by 1) t where t.m > v_mejor;
  return json_build_object('mejor', v_mejor, 'puesto', v_puesto);
end;
$$;

-- 3. Clasificación: el mejor de cada uno (de siempre y de esta semana, lunes a domingo en Madrid).
create or replace function public.loc_abismo_ranking()
returns table (nombre text, mejor integer, semana integer, estrellas smallint, partidas integer, yo boolean)
language sql stable security definer set search_path = public as $$
  select j.nombre::text,
         max(a.puntos)::int,
         coalesce(max(a.puntos) filter (where a.creado >= date_trunc('week', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid'), 0)::int,
         max(a.estrellas)::smallint,
         count(*)::int,
         (j.user_id = auth.uid())
  from loc_abismo a join loc_jugadores j on j.id = a.jugador_id
  group by j.id, j.nombre, j.user_id
  order by 2 desc;
$$;

-- 4. Permisos: solo con cuenta.
revoke all on function public.loc_abismo_guardar(integer, integer, integer, boolean, integer, text, integer), public.loc_abismo_ranking() from public, anon;
grant execute on function public.loc_abismo_guardar(integer, integer, integer, boolean, integer, text, integer), public.loc_abismo_ranking() to authenticated;

-- Comprobación: debe salir vacío (o con las partidas ya jugadas), sin error.
select * from loc_abismo_ranking();
