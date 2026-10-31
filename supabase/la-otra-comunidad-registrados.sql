-- La Otra Comunidad · loc_comunidad dice quién se ha registrado (tiene cuenta), para las caras a los lados del camino.
-- Ejecutar una vez en Supabase (SQL Editor). Solo cambia la función; no toca datos.
drop function if exists public.loc_comunidad();
create function public.loc_comunidad()
returns table (nombre text, hobbit text, pasos_totales bigint, km numeric, pasos_hoy int, registrado boolean)
language sql stable security definer set search_path = public as $$
  select j.nombre, j.hobbit,
         coalesce(sum(p.pasos) filter (where not p.revisar), 0)::bigint,
         round(coalesce(sum(p.pasos) filter (where not p.revisar), 0)
               / (select valor::numeric from loc_config where clave = 'pasos_por_km'), 1),
         coalesce(max(p.pasos) filter (where p.fecha = (now() at time zone 'Europe/Madrid')::date), 0)::int,
         (j.user_id is not null)
  from loc_jugadores j
  left join loc_pasos_dia p on p.jugador_id = j.id
  group by j.id, j.nombre, j.hobbit, j.user_id
  order by 3 desc;
$$;
revoke all on function public.loc_comunidad() from public, anon;
grant execute on function public.loc_comunidad() to authenticated;
