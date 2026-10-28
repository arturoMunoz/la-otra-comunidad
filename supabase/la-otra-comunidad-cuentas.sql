-- =====================================================================
--  La Otra Comunidad · paso a cuentas con correo (Supabase Auth)
--  Ejecutar DESPUÉS de la-otra-comunidad.sql, en el proyecto "golf".
--  Las cuentas son las mismas de Stadada: quien ya tenga cuenta allí
--  entra con el mismo correo y contraseña.
--  Se puede ejecutar más de una vez.
-- =====================================================================

-- 1. Cada jugador queda ligado a una cuenta, y tiene una clave privada
--    solo para el atajo del iPhone (el atajo no puede iniciar sesión).
alter table public.loc_jugadores add column if not exists user_id uuid unique references auth.users(id) on delete set null;
alter table public.loc_jugadores add column if not exists clave_atajo uuid not null default gen_random_uuid() unique;
alter table public.loc_jugadores alter column codigo drop not null;

-- 2. Se cierran las funciones antiguas que entraban con código.
do $$ begin
  revoke execute on function public.loc_entrar(text) from anon, authenticated;
  revoke execute on function public.loc_subir_pasos(text, text) from anon, authenticated;
  revoke execute on function public.loc_marcar_historia(text, smallint) from anon, authenticated;
  revoke execute on function public.loc_mis_historias(text) from anon, authenticated;
exception when undefined_function then null; end $$;

-- 3. Hobbits que aún no tienen dueño (para elegir el tuyo al crear la cuenta).
create or replace function public.loc_libres()
returns table (nombre text, hobbit text)
language sql stable security definer set search_path = public as $$
  select j.nombre, j.hobbit from loc_jugadores j where j.user_id is null order by j.nombre;
$$;

-- 4. Quedarte con tu hobbit (una sola vez por cuenta).
create or replace function public.loc_reclamar(p_nombre text)
returns table (id smallint, nombre text, hobbit text)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Hay que entrar con tu cuenta' using errcode = '28000'; end if;
  if exists (select 1 from loc_jugadores where user_id = auth.uid()) then
    return query select j.id, j.nombre, j.hobbit from loc_jugadores j where j.user_id = auth.uid(); return;
  end if;
  update loc_jugadores set user_id = auth.uid() where loc_jugadores.nombre = p_nombre and user_id is null;
  if not found then raise exception 'Ese hobbit ya tiene dueño' using errcode = 'P0001'; end if;
  return query select j.id, j.nombre, j.hobbit from loc_jugadores j where j.user_id = auth.uid();
end;
$$;

-- 5. Quién soy (y mi clave del atajo).
create or replace function public.loc_yo()
returns table (id smallint, nombre text, hobbit text, clave_atajo uuid)
language sql stable security definer set search_path = public as $$
  select j.id, j.nombre, j.hobbit, j.clave_atajo from loc_jugadores j where j.user_id = auth.uid();
$$;

-- 6. Historias leídas, con la cuenta.
create or replace function public.loc_leidas()
returns setof smallint
language sql stable security definer set search_path = public as $$
  select h.tramo from loc_historias h join loc_jugadores j on j.id = h.jugador_id
  where j.user_id = auth.uid() order by 1;
$$;

create or replace function public.loc_leer(p_tramo smallint)
returns void
language sql security definer set search_path = public as $$
  insert into loc_historias (jugador_id, tramo)
  select j.id, p_tramo from loc_jugadores j where j.user_id = auth.uid()
  on conflict do nothing;
$$;

-- 7. Subir pasos desde el atajo, con la clave del atajo.
--    p_dias: una línea por día "AAAA-MM-DD,pasos". Cada día se sobrescribe.
create or replace function public.loc_subir(p_clave text, p_dias text)
returns table (dias_guardados int, pasos_totales bigint)
language plpgsql security definer set search_path = public as $$
declare
  v_id smallint; v_inicio date; v_linea text; v_fecha date; v_pasos int; v_n int := 0;
begin
  begin
    select j.id into v_id from loc_jugadores j where j.clave_atajo = btrim(p_clave)::uuid;
  exception when others then v_id := null; end;
  if v_id is null then raise exception 'Clave del atajo no válida' using errcode = '28000'; end if;
  select valor::date into v_inicio from loc_config where clave = 'fecha_inicio';

  foreach v_linea in array regexp_split_to_array(coalesce(p_dias, ''), '[\n;]+') loop
    v_linea := btrim(v_linea);
    continue when v_linea = '';
    begin
      v_fecha := split_part(v_linea, ',', 1)::date;
      v_pasos := round(replace(split_part(v_linea, ',', 2), '.', '')::numeric)::int;
    exception when others then continue; end;
    continue when v_fecha < v_inicio or v_fecha > current_date + 1 or v_pasos < 0;
    v_pasos := least(v_pasos, 150000);
    insert into loc_pasos_dia (jugador_id, fecha, pasos, revisar, actualizado)
    values (v_id, v_fecha, v_pasos, v_pasos > 60000, now())
    on conflict (jugador_id, fecha)
    do update set pasos = excluded.pasos, revisar = excluded.revisar, actualizado = now();
    v_n := v_n + 1;
  end loop;

  return query select v_n, coalesce(sum(p.pasos), 0)::bigint
    from loc_pasos_dia p where p.jugador_id = v_id and not p.revisar;
end;
$$;

-- 8. Permisos: la Comunidad y lo tuyo, solo con cuenta. El atajo entra con su clave.
revoke all on function public.loc_libres(), public.loc_reclamar(text), public.loc_yo(),
  public.loc_leidas(), public.loc_leer(smallint), public.loc_subir(text, text), public.loc_comunidad() from public, anon;
grant execute on function public.loc_libres(), public.loc_reclamar(text), public.loc_yo(),
  public.loc_leidas(), public.loc_leer(smallint), public.loc_comunidad() to authenticated;
grant execute on function public.loc_libres(), public.loc_subir(text, text) to anon;

select nombre, case when user_id is null then 'sin cuenta' else 'con cuenta' end as estado
from public.loc_jugadores order by nombre;
