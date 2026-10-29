-- =====================================================================
--  La Otra Comunidad · el atajo también acepta el NOMBRE del jugador en p_clave
--  (por ejemplo "Patri"), además de la clave larga. Así todos comparten el mismo
--  atajo y cada uno solo cambia el nombre. Se puede ejecutar más de una vez.
-- =====================================================================
create or replace function public.loc_pasos_hoy(p_clave text, p_pasos text)
returns table (dias_guardados int, pasos_totales bigint)
language plpgsql security definer set search_path = public as $$
declare v_n numeric; v_hoy text; v_clave text;
begin
  v_n := nullif(regexp_replace(replace(regexp_replace(coalesce(p_pasos,''), '\.(\d{3})(?!\d)', '\1', 'g'), ',', '.'), '[^0-9.]', '', 'g'), '')::numeric;
  v_hoy := to_char(now() at time zone 'Europe/Madrid', 'YYYY-MM-DD');
  -- si no es una clave larga, se busca por nombre (sin mayúsculas ni tildes)
  select j.clave_atajo::text into v_clave from loc_jugadores j
   where j.clave_atajo::text = btrim(p_clave)
      or translate(lower(j.nombre),'áéíóúü','aeiouu') = translate(lower(btrim(p_clave)),'áéíóúü','aeiouu')
   limit 1;
  if v_clave is null then raise exception 'No conozco a «%». Pon tu nombre tal cual sale en el juego.', p_clave using errcode = '28000'; end if;
  return query select * from public.loc_subir(v_clave, v_hoy || ',' || coalesce(round(v_n), 0)::text);
end;
$$;
grant execute on function public.loc_pasos_hoy(text, text) to anon, authenticated;
