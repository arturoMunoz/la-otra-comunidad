-- La Otra Comunidad · avisos al móvil (05/11/2026). Ejecutar una vez en Supabase (proyecto «golf»).
-- iPhone/navegador: Web Push (los manda el Worker de Cloudflare). Android: la app los recoge cada 15 min.
-- Se puede ejecutar antes o después de los SQL de la hoguera y de la actividad.

-- Lo que necesita de la hoguera, por si no está.
create table if not exists public.loc_aperturas (
  jugador_id smallint not null references public.loc_jugadores(id) on delete cascade,
  fecha      date not null,
  primary key (jugador_id, fecha)
);
alter table public.loc_aperturas enable row level security;
alter table public.loc_jugadores add column if not exists abierto timestamptz;
alter table public.loc_jugadores add column if not exists aviso_tramo smallint;

-- Un aviso por jugador. clave evita repetir los automáticos (p. ej. 'fardo-x', 'tramo-9', 'hog-2026-11-05').
create table if not exists public.loc_avisos (
  id         bigint generated always as identity primary key,
  jugador_id smallint not null references public.loc_jugadores(id) on delete cascade,
  titulo     text not null,
  texto      text not null default '',
  clave      text,
  creado     timestamptz not null default now(),
  web        boolean not null default false,
  android    boolean not null default false,
  unique (jugador_id, clave)
);
-- Móviles suscritos a Web Push.
create table if not exists public.loc_push (
  endpoint   text primary key,
  jugador_id smallint not null references public.loc_jugadores(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  creado     timestamptz not null default now()
);
alter table public.loc_avisos enable row level security;
alter table public.loc_push enable row level security;
revoke all on public.loc_avisos, public.loc_push from anon, authenticated;

-- Huella del secreto que guarda el Worker (el secreto en sí NO está aquí).
insert into public.loc_config (clave, valor) values ('push_hash', 'ff535ea7050883600f103548c41e0c7f4e6ccd2c79c21ab6506e62d0c9212d74')
on conflict (clave) do update set valor = excluded.valor;

create or replace function public.loc_push_ok(p_secreto text) returns boolean
language sql stable security definer set search_path = public as $$
  select encode(sha256(convert_to(coalesce(p_secreto, ''), 'UTF8')), 'hex') = (select valor from loc_config where clave = 'push_hash');
$$;

-- Guardar / quitar la suscripción de este móvil (con cuenta).
create or replace function public.loc_push_guardar(p_endpoint text, p_p256dh text, p_auth text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_id smallint;
begin
  select j.id into v_id from loc_jugadores j where j.user_id = auth.uid();
  if v_id is null or coalesce(p_endpoint, '') !~ '^https://' then return false; end if;
  insert into loc_push (endpoint, jugador_id, p256dh, auth) values (p_endpoint, v_id, p_p256dh, p_auth)
  on conflict (endpoint) do update set jugador_id = excluded.jugador_id, p256dh = excluded.p256dh, auth = excluded.auth;
  return true;
end;
$$;
create or replace function public.loc_push_quitar(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from loc_push where endpoint = p_endpoint and jugador_id = (select id from loc_jugadores where user_id = auth.uid());
$$;

-- El Máster manda un aviso al móvil (a todos o a uno).
create or replace function public.loc_aviso_enviar(p_titulo text, p_texto text, p_para text)
returns int language plpgsql security definer set search_path = public as $$
declare v_yo text; v_n int;
begin
  select j.nombre into v_yo from loc_jugadores j where j.user_id = auth.uid();
  if v_yo is null or v_yo <> (select valor from loc_config where clave = 'master') then
    raise exception 'Solo el Máster puede mandar avisos' using errcode = '42501';
  end if;
  insert into loc_avisos (jugador_id, titulo, texto)
  select j.id, left(coalesce(nullif(p_titulo, ''), 'La Otra Comunidad'), 80), left(coalesce(p_texto, ''), 300)
  from loc_jugadores j where j.user_id is not null and (nullif(p_para, '') is null or j.nombre = p_para);
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- km y sitio (1-14) de cada jugador con cuenta.
create or replace function public.loc_km_jugadores()
returns table (id smallint, km numeric, idx int)
language sql stable security definer set search_path = public as $$
  select j.id, c.km,
         (select count(*) from unnest(array[5,15,35,55,75,90,110,115,125,140,150,165,175,200]) k where k <= c.km)::int
  from loc_comunidad() c join loc_jugadores j on j.nombre = c.nombre
  where j.user_id is not null;
$$;

-- Avisos automáticos del juego. Se llama sola desde las funciones de reparto; no repite nada (clave única).
create or replace function public.loc_avisos_auto()
returns void language plpgsql security definer set search_path = public as $$
declare v_hoy date := (now() at time zone 'Europe/Madrid')::date;
        v_hora int := extract(hour from now() at time zone 'Europe/Madrid');
begin
  -- Sitio nuevo (la primera vez solo apunta dónde está cada uno, sin avisar de lo ya andado).
  insert into loc_avisos (jugador_id, titulo, texto, clave)
  select k.id, 'Has llegado a ' || (array['Camino de Delagua','Colinas Verdes','Bosque Cerrado','Atajo campo a través','La granja',
           'Calzada hacia el río','Balsadera y Cricava','La Cerca','Bosque Viejo','El Tornasauce','Casa de Tom Bombadil','Las colinas',
           'Quebradas de los Túmulos','Camino del Este y Bree'])[k.idx],
         'Abre el juego para descubrir lo que pasa allí.', 'tramo-' || k.idx
  from loc_km_jugadores() k join loc_jugadores j on j.id = k.id
  where j.aviso_tramo is not null and k.idx > j.aviso_tramo and k.idx >= 1
  on conflict do nothing;
  update loc_jugadores j set aviso_tramo = k.idx from loc_km_jugadores() k
  where k.id = j.id and (j.aviso_tramo is null or k.idx > j.aviso_tramo);

  -- Fardo que ya se puede abrir (los regalos del Máster ya llevan su propio aviso).
  insert into loc_avisos (jugador_id, titulo, texto, clave)
  select p.jugador_id, 'Tu fardo ya se puede abrir', 'Ábrelo en el Zurrón: dentro hay ropa nueva.', 'fardo-' || p.id
  from loc_paquetes p join loc_km_jugadores() k on k.id = p.jugador_id
  where not p.abierto and p.de <> 'master' and p.km_abre <= k.km
  on conflict do nothing;

  -- Hoguera: a partir de las 20:00, a quien la abrió ayer y hoy todavía no.
  if v_hora >= 20 then
    insert into loc_avisos (jugador_id, titulo, texto, clave)
    select a.jugador_id, 'Tu hoguera se apaga', 'Hoy aún no has abierto el juego. Ábrelo antes de medianoche para no perder tu racha.', 'hog-' || v_hoy
    from loc_aperturas a
    where a.fecha = v_hoy - 1 and not exists (select 1 from loc_aperturas b where b.jugador_id = a.jugador_id and b.fecha = v_hoy)
    on conflict do nothing;
  end if;

  delete from loc_avisos where creado < now() - interval '30 days';
end;
$$;

-- Para el Worker (con el secreto): avisos pendientes de mandar por Web Push, y los marca como mandados.
create or replace function public.loc_push_pendientes(p_secreto text)
returns table (aviso bigint, titulo text, texto text, endpoint text, p256dh text, auth text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not loc_push_ok(p_secreto) then raise exception 'No' using errcode = '42501'; end if;
  perform loc_avisos_auto();
  update loc_avisos set web = true where not web and creado < now() - interval '2 days';
  return query
  with p as (update loc_avisos a set web = true where not a.web returning a.id, a.jugador_id, a.titulo, a.texto)
  select p.id, p.titulo, p.texto, s.endpoint, s.p256dh, s.auth from p join loc_push s on s.jugador_id = p.jugador_id;
end;
$$;
create or replace function public.loc_push_baja(p_secreto text, p_endpoint text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not loc_push_ok(p_secreto) then raise exception 'No' using errcode = '42501'; end if;
  delete from loc_push where endpoint = p_endpoint;
end;
$$;

-- Para la app de Android (cada 15 min, con el nombre o la clave del atajo, como los pasos).
create or replace function public.loc_avisos_android(p_clave text)
returns table (id bigint, titulo text, texto text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare v_id smallint;
begin
  select j.id into v_id from loc_jugadores j
   where j.clave_atajo::text = btrim(p_clave)
      or translate(lower(j.nombre),'áéíóúü','aeiouu') = translate(lower(btrim(p_clave)),'áéíóúü','aeiouu')
   limit 1;
  if v_id is null then return; end if;
  perform loc_avisos_auto();
  return query
  update loc_avisos a set android = true
  where a.jugador_id = v_id and not a.android and a.creado > now() - interval '2 days'
  returning a.id, a.titulo, a.texto;
end;
$$;

revoke all on function public.loc_push_ok(text), public.loc_push_guardar(text, text, text), public.loc_push_quitar(text),
  public.loc_aviso_enviar(text, text, text), public.loc_avisos_auto(), public.loc_km_jugadores(), public.loc_push_pendientes(text),
  public.loc_push_baja(text, text), public.loc_avisos_android(text) from public, anon, authenticated;
grant execute on function public.loc_push_guardar(text, text, text), public.loc_push_quitar(text), public.loc_aviso_enviar(text, text, text) to authenticated;
grant execute on function public.loc_push_pendientes(text), public.loc_push_baja(text, text), public.loc_avisos_android(text) to anon, authenticated;

-- Comprobación: debe salir «avisos listos» y cuántos jugadores tienen ya su sitio apuntado (0 la primera vez).
select 'avisos listos' as ok, (select count(*) from public.loc_avisos) as avisos;
