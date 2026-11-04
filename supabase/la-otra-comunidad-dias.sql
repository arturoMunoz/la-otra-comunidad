-- La Otra Comunidad · subir varios días de golpe (los últimos 7 o 30) con el NOMBRE o la clave larga.
-- La usan el APK de Android (cada hora, en segundo plano) y el atajo del iPhone.
-- p_dias: líneas con una fecha AAAA-MM-DD y un número de pasos (tolera "AAAA-MM-DD,1.234", espacios, ";"…).
-- Cada día sustituye al que hubiera (nunca suma). Versión tolerante, ejecutada el 03/11/2026.
create or replace function public.loc_pasos_dias(p_clave text, p_dias text)
returns table (dias_guardados int, pasos_totales bigint)
language plpgsql security definer set search_path = public as $$
declare v_clave text; v_linea text; v_fecha text; v_num text; v_lim text := '';
begin
  select j.clave_atajo::text into v_clave from loc_jugadores j
   where j.clave_atajo::text = btrim(p_clave)
      or translate(lower(j.nombre),'áéíóúü','aeiouu') = translate(lower(btrim(p_clave)),'áéíóúü','aeiouu')
   limit 1;
  if v_clave is null then raise exception 'No conozco a «%». Pon tu nombre tal cual sale en el juego.', p_clave using errcode = '28000'; end if;
  foreach v_linea in array regexp_split_to_array(coalesce(p_dias,''), '[\n;]+') loop
    v_fecha := substring(v_linea from '\d{4}-\d{2}-\d{2}');
    v_num := substring(replace(substring(v_linea from '\d{4}-\d{2}-\d{2}(.*)$'), '.', '') from '\d+');
    if v_fecha is not null and v_num is not null then v_lim := v_lim || v_fecha || ',' || v_num || E'\n'; end if;
  end loop;
  return query select * from public.loc_subir(v_clave, v_lim);
end;
$$;
grant execute on function public.loc_pasos_dias(text, text) to anon, authenticated;
