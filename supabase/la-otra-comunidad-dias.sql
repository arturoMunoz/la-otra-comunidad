-- La Otra Comunidad · subir varios días de golpe (los últimos 7 o 30) con el NOMBRE o la clave larga.
-- La usan el APK de Android (cada hora, en segundo plano) y el atajo del iPhone.
-- p_dias: líneas "AAAA-MM-DD,pasos" separadas por salto de línea o ";". Cada día sustituye al que hubiera (nunca suma).
-- Ejecutar una vez en Supabase (SQL Editor).
create or replace function public.loc_pasos_dias(p_clave text, p_dias text)
returns table (dias_guardados int, pasos_totales bigint)
language plpgsql security definer set search_path = public as $$
declare v_clave text;
begin
  select j.clave_atajo::text into v_clave from loc_jugadores j
   where j.clave_atajo::text = btrim(p_clave)
      or translate(lower(j.nombre),'áéíóúü','aeiouu') = translate(lower(btrim(p_clave)),'áéíóúü','aeiouu')
   limit 1;
  if v_clave is null then raise exception 'No conozco a «%». Pon tu nombre tal cual sale en el juego.', p_clave using errcode = '28000'; end if;
  return query select * from public.loc_subir(v_clave, p_dias);
end;
$$;
grant execute on function public.loc_pasos_dias(text, text) to anon, authenticated;
