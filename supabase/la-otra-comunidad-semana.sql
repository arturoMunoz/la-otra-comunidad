-- La Otra Comunidad · pasos de los últimos 7 días de cada uno (para el pergamino de pasos).
-- Ejecutar una vez en Supabase (SQL Editor). Solo lee; no toca datos.
create or replace function public.loc_semana()
returns table (nombre text, fecha date, pasos int)
language sql stable security definer set search_path = public as $$
  select j.nombre, p.fecha, p.pasos
  from loc_jugadores j
  join loc_pasos_dia p on p.jugador_id = j.id
  where not p.revisar
    and p.fecha > (now() at time zone 'Europe/Madrid')::date - 7
    and exists (select 1 from loc_jugadores yo where yo.user_id = auth.uid())
  order by 1, 2;
$$;
revoke all on function public.loc_semana() from public, anon;
grant execute on function public.loc_semana() to authenticated;
