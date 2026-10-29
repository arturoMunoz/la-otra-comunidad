-- =====================================================================
--  La Otra Comunidad · atajo fácil: manda solo el número de pasos de hoy
--  (sin fechas ni repeticiones en el atajo). Ejecutar después de
--  la-otra-comunidad-cuentas.sql. Se puede ejecutar más de una vez.
-- =====================================================================
create or replace function public.loc_pasos_hoy(p_clave text, p_pasos text)
returns table (dias_guardados int, pasos_totales bigint)
language plpgsql security definer set search_path = public as $$
declare v_n numeric; v_hoy text;
begin
  -- admite "8420", "8420,0", "8.420" o "8420.0"
  v_n := nullif(regexp_replace(replace(regexp_replace(coalesce(p_pasos,''), '\.(\d{3})(?!\d)', '\1', 'g'), ',', '.'), '[^0-9.]', '', 'g'), '')::numeric;
  v_hoy := to_char(now() at time zone 'Europe/Madrid', 'YYYY-MM-DD');
  return query select * from public.loc_subir(p_clave, v_hoy || ',' || coalesce(round(v_n), 0)::text);
end;
$$;
grant execute on function public.loc_pasos_hoy(text, text) to anon, authenticated;
