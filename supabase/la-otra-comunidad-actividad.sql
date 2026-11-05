-- La Otra Comunidad · panel «Quién usa la app» del Máster (05/11/2026). Ejecutar una vez en Supabase (proyecto «golf»).
-- Se puede ejecutar antes o después de la-otra-comunidad-hoguera.sql: crea lo que necesite si falta.
create table if not exists public.loc_aperturas (
  jugador_id smallint not null references public.loc_jugadores(id) on delete cascade,
  fecha      date not null,
  primary key (jugador_id, fecha)
);
alter table public.loc_aperturas enable row level security;
alter table public.loc_jugadores add column if not exists abierto timestamptz;

-- Solo el Máster (loc_config 'master'). Una fila por jugador.
-- abierto: última vez que abrió el juego (exacto, desde que está la hoguera). sesion: última renovación de su sesión (aproximado, sirve para antes).
create or replace function public.loc_actividad()
returns table (nombre text, cuenta boolean, abierto timestamptz, sesion timestamptz, ultimo_dia date, ultima_sync timestamptz, pasos_7 bigint, dias_14 bigint)
language plpgsql security definer set search_path = public, auth as $$
declare v_yo text; v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  select j.nombre into v_yo from loc_jugadores j where j.user_id = auth.uid();
  if v_yo is null or v_yo <> (select valor from loc_config where clave = 'master') then
    raise exception 'Solo el Máster puede ver esto' using errcode = '42501';
  end if;
  return query
  select j.nombre::text,
         j.user_id is not null,
         j.abierto,
         (select max(coalesce(s.updated_at, s.created_at)) from auth.sessions s where s.user_id = j.user_id),
         (select max(p.fecha) from loc_pasos_dia p where p.jugador_id = j.id),
         (select max(p.actualizado) from loc_pasos_dia p where p.jugador_id = j.id),
         (select coalesce(sum(p.pasos), 0) from loc_pasos_dia p where p.jugador_id = j.id and p.fecha > v_hoy - 7)::bigint,
         (select count(*) from loc_aperturas a where a.jugador_id = j.id and a.fecha > v_hoy - 14)
  from loc_jugadores j
  order by j.nombre;
end;
$$;
revoke all on function public.loc_actividad() from public, anon;
grant execute on function public.loc_actividad() to authenticated;

-- Comprobación: debe decir que la función existe.
select 'loc_actividad lista' as ok where exists (select 1 from pg_proc where proname = 'loc_actividad');
