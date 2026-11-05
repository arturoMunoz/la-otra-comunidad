-- Quién está usando La Otra Comunidad. Solo lee, no cambia nada. Pegar en Supabase → SQL Editor (proyecto «golf»).
-- cuenta: si tiene cuenta creada y su último inicio de sesión.
-- pasos: último día con pasos recibidos, cuándo llegó la última sincronización y pasos de los últimos 7 días.
select j.nombre,
       case when j.user_id is null then 'sin cuenta' else 'con cuenta' end as cuenta,
       to_char(u.last_sign_in_at at time zone 'Europe/Madrid','DD/MM HH24:MI') as ultimo_login,
       max(p.fecha) as ultimo_dia_con_pasos,
       to_char(max(p.actualizado) at time zone 'Europe/Madrid','DD/MM HH24:MI') as ultima_sincronizacion,
       coalesce(sum(p.pasos) filter (where p.fecha > current_date - 7),0) as pasos_7_dias
from public.loc_jugadores j
left join auth.users u on u.id = j.user_id
left join public.loc_pasos_dia p on p.jugador_id = j.id
group by j.nombre, j.user_id, u.last_sign_in_at
order by max(p.actualizado) desc nulls last;


-- YA MISMO (sin ejecutar nada antes): última actividad de cada sesión. La app renueva su sesión al abrirse
-- si lleva más de una hora cerrada, así que es una aproximación buena (con margen de ~1 hora) de la última vez que la abrió.
select j.nombre,
       to_char(max(coalesce(s.updated_at, s.created_at)) at time zone 'Europe/Madrid','DD/MM HH24:MI') as ultima_actividad
from public.loc_jugadores j
left join auth.sessions s on s.user_id = j.user_id
group by j.nombre
order by max(coalesce(s.updated_at, s.created_at)) desc nulls last;

-- EXACTO (después de ejecutar la-otra-comunidad-hoguera.sql): hora de la última apertura y días abierto en las 2 últimas semanas.
-- select j.nombre, to_char(j.abierto at time zone 'Europe/Madrid','DD/MM HH24:MI') as ultima_apertura,
--        (select count(*) from public.loc_aperturas a where a.jugador_id = j.id and a.fecha > current_date - 14) as dias_abierto_14
-- from public.loc_jugadores j order by j.abierto desc nulls last;
