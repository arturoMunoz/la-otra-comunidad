-- La Otra Comunidad · TODO LO PENDIENTE EN UN SOLO SQL (05/11/2026)
-- Pegar entero en Supabase > SQL Editor (proyecto «golf») y pulsar Run. Se puede ejecutar más de una vez sin romper nada.

-- ===== 1/3 · loc_semana (pergamino de pasos) =====
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

-- ===== 2/3 · estrellas de los minijuegos en la cuenta =====
-- La Otra Comunidad · estrellas de los minijuegos guardadas en la cuenta (04/11/2026)
-- Hasta ahora el mejor resultado de cada minijuego solo se guardaba en el móvil.
-- Con esto se guarda en la cuenta: cambiar de móvil o borrar datos ya no pierde los premios.
-- Ejecutar UNA vez en el proyecto «golf» (SQL Editor). No toca nada de Stadada.

-- 1. Tabla: el mejor resultado de cada jugador en cada minijuego.
create table if not exists public.loc_estrellas (
  jugador_id  smallint not null references public.loc_jugadores(id) on delete cascade,
  juego       text     not null,
  estrellas   smallint not null check (estrellas between 0 and 3),
  actualizado timestamptz not null default now(),
  primary key (jugador_id, juego)
);
alter table public.loc_estrellas enable row level security;  -- cerrada: solo se entra por las funciones

-- 2. Mis estrellas.
create or replace function public.loc_estrellas()
returns table (juego text, estrellas smallint)
language sql stable security definer set search_path = public as $$
  select e.juego, e.estrellas from loc_estrellas e join loc_jugadores j on j.id = e.jugador_id
  where j.user_id = auth.uid() order by 1;
$$;

-- 3. Guardar un resultado. Solo sube: si ya tenías más estrellas, se quedan las de antes.
create or replace function public.loc_estrella(p_juego text, p_estrellas smallint)
returns smallint
language plpgsql security definer set search_path = public as $$
declare v_id smallint; v_st smallint;
begin
  select j.id into v_id from loc_jugadores j where j.user_id = auth.uid();
  if v_id is null then raise exception 'Sin hobbit en esta cuenta' using errcode = '28000'; end if;
  if p_juego !~ '^[a-z_]{2,20}$' or p_estrellas not between 0 and 3 then
    raise exception 'Resultado no válido' using errcode = '22023';
  end if;
  insert into loc_estrellas (jugador_id, juego, estrellas) values (v_id, p_juego, p_estrellas)
  on conflict (jugador_id, juego)
  do update set estrellas = greatest(loc_estrellas.estrellas, excluded.estrellas), actualizado = now()
  returning estrellas into v_st;
  return v_st;
end;
$$;

-- 4. Permisos: solo con cuenta.
revoke all on function public.loc_estrellas(), public.loc_estrella(text, smallint) from public, anon;
grant execute on function public.loc_estrellas(), public.loc_estrella(text, smallint) to authenticated;

-- Comprobación: debe salir la tabla vacía (o con lo que ya se haya jugado), sin error.

-- ===== 3/3 · temporada: reto, duelo, hoguera, fardos, ropa de los demás y Máster =====
-- La Otra Comunidad · «temporada»: reto semanal, duelo, hoguera, fardos, ropa de los demás y Máster del Maia (05/11/2026)
-- Ejecutar UNA vez en el proyecto «golf» (SQL Editor). Todo lleva prefijo loc_; no toca nada de Stadada.
-- Requiere haber ejecutado antes la-otra-comunidad-registrados.sql (loc_comunidad con «registrado»).

-- 0. Quién es el Máster (por nombre de hobbit). Cambiar aquí si algún día es otro.
insert into public.loc_config (clave, valor) values ('master', 'Arturo') on conflict (clave) do nothing;

-- 1. Lo que lleva puesto cada uno (para verlo vestido en la Comunidad).
alter table public.loc_jugadores add column if not exists equipo text[] not null default '{}';

create or replace function public.loc_equipo_guardar(p_equipo text[])
returns void language sql security definer set search_path = public as $$
  update loc_jugadores set equipo = coalesce(p_equipo[1:20], '{}') where user_id = auth.uid();
$$;

create or replace function public.loc_equipos()
returns table (nombre text, equipo text[])
language sql stable security definer set search_path = public as $$
  select j.nombre, j.equipo from loc_jugadores j
  where exists (select 1 from loc_jugadores yo where yo.user_id = auth.uid());
$$;

-- 2. Pasos por semana (lunes a domingo, hora de Madrid) de los registrados: reto semanal, duelo y trofeos.
create or replace function public.loc_pasos_semanas()
returns table (semana date, nombre text, pasos bigint)
language sql stable security definer set search_path = public as $$
  select date_trunc('week', p.fecha)::date, j.nombre, sum(p.pasos)::bigint
  from loc_jugadores j join loc_pasos_dia p on p.jugador_id = j.id
  where not p.revisar and j.user_id is not null
    and p.fecha >= (now() at time zone 'Europe/Madrid')::date - 7 * 26
    and exists (select 1 from loc_jugadores yo where yo.user_id = auth.uid())
  group by 1, 2 order by 1, 2;
$$;

-- 3. Mis pasos de los últimos 120 días (la hoguera).
create or replace function public.loc_mis_dias()
returns table (fecha date, pasos int)
language sql stable security definer set search_path = public as $$
  select p.fecha, p.pasos from loc_pasos_dia p join loc_jugadores j on j.id = p.jugador_id
  where j.user_id = auth.uid() and not p.revisar
    and p.fecha >= (now() at time zone 'Europe/Madrid')::date - 120
  order by 1;
$$;

-- 4. Fardos: paquetes cerrados que se abren al andar (o al momento, si los regala el Máster).
create table if not exists public.loc_paquetes (
  jugador_id smallint not null references public.loc_jugadores(id) on delete cascade,
  id         text not null,
  contenido  text not null,
  km_abre    numeric not null default 0,
  de         text not null default 'camino',
  abierto    boolean not null default false,
  creado     timestamptz not null default now(),
  primary key (jugador_id, id)
);
alter table public.loc_paquetes enable row level security;

create or replace function public.loc_paquete_dar(p_id text, p_contenido text, p_km_abre numeric)
returns void language sql security definer set search_path = public as $$
  insert into loc_paquetes (jugador_id, id, contenido, km_abre)
  select j.id, left(p_id, 40), left(p_contenido, 40), greatest(0, least(p_km_abre, 5000))
  from loc_jugadores j where j.user_id = auth.uid()
  on conflict do nothing;
$$;

create or replace function public.loc_mis_paquetes()
returns table (id text, contenido text, km_abre numeric, de text, abierto boolean)
language sql stable security definer set search_path = public as $$
  select q.id, q.contenido, q.km_abre, q.de, q.abierto
  from loc_paquetes q join loc_jugadores j on j.id = q.jugador_id
  where j.user_id = auth.uid() order by q.creado;
$$;

create or replace function public.loc_paquete_abrir(p_id text)
returns void language sql security definer set search_path = public as $$
  update loc_paquetes q set abierto = true
  from loc_jugadores j where j.id = q.jugador_id and j.user_id = auth.uid() and q.id = p_id;
$$;

-- 5. Máster del Maia: mensajes y sucesos que manda Arturo a todos (o a uno).
--    efecto = multiplicador de los pasos de ese día (1 = nada; viento 1.5, tormenta 0.75). Se nota en los km de la Comunidad.
create table if not exists public.loc_master (
  id      bigint generated always as identity primary key,
  creado  timestamptz not null default now(),
  tipo    text not null,
  texto   text not null default '',
  dia     date not null default (now() at time zone 'Europe/Madrid')::date,
  efecto  numeric not null default 1 check (efecto between 0.5 and 2),
  para    text,
  regalo  text
);
alter table public.loc_master enable row level security;

create or replace function public.loc_master_enviar(p_tipo text, p_texto text, p_dia date, p_efecto numeric, p_para text, p_regalo text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_yo text; v_id bigint;
begin
  select j.nombre into v_yo from loc_jugadores j where j.user_id = auth.uid();
  if v_yo is null or v_yo <> (select valor from loc_config where clave = 'master') then
    raise exception 'Solo el Máster puede hacer esto' using errcode = '42501';
  end if;
  insert into loc_master (tipo, texto, dia, efecto, para, regalo)
  values (left(p_tipo, 20), left(coalesce(p_texto, ''), 400), coalesce(p_dia, (now() at time zone 'Europe/Madrid')::date),
          greatest(0.5, least(coalesce(p_efecto, 1), 2)), nullif(p_para, ''), nullif(p_regalo, ''))
  returning id into v_id;
  if nullif(p_regalo, '') is not null then
    insert into loc_paquetes (jugador_id, id, contenido, km_abre, de)
    select j.id, 'master-' || v_id, left(p_regalo, 40), 0, 'master'
    from loc_jugadores j where nullif(p_para, '') is null or j.nombre = p_para
    on conflict do nothing;
  end if;
  return v_id;
end;
$$;

create or replace function public.loc_master_mensajes()
returns table (id bigint, creado timestamptz, tipo text, texto text, dia date, efecto numeric, para text, regalo text)
language sql stable security definer set search_path = public as $$
  select m.id, m.creado, m.tipo, m.texto, m.dia, m.efecto, m.para, m.regalo
  from loc_master m
  where exists (select 1 from loc_jugadores yo where yo.user_id = auth.uid())
  order by m.id desc limit 30;
$$;

-- 6. loc_comunidad con los efectos del Máster sumados a los pasos (los pasos reales no se tocan).
drop function if exists public.loc_comunidad();
create function public.loc_comunidad()
returns table (nombre text, hobbit text, pasos_totales bigint, km numeric, pasos_hoy int, registrado boolean)
language sql stable security definer set search_path = public as $$
  with b as (
    select j.id,
      coalesce(sum(p.pasos) filter (where not p.revisar), 0)
      + coalesce(sum(round(p.pasos * (e.efecto - 1))) filter (where not p.revisar and e.efecto is not null), 0) as pasos,
      coalesce(max(p.pasos) filter (where p.fecha = (now() at time zone 'Europe/Madrid')::date), 0) as hoy
    from loc_jugadores j
    left join loc_pasos_dia p on p.jugador_id = j.id
    left join lateral (
      select exp(sum(ln(m.efecto))) as efecto from loc_master m
      where m.dia = p.fecha and m.efecto <> 1 and (m.para is null or m.para = j.nombre)
    ) e on true
    group by j.id
  )
  select j.nombre, j.hobbit, greatest(0, b.pasos)::bigint,
         round(greatest(0, b.pasos) / (select valor::numeric from loc_config where clave = 'pasos_por_km'), 1),
         b.hoy::int, (j.user_id is not null)
  from loc_jugadores j join b on b.id = j.id
  order by 3 desc;
$$;

-- 7. Permisos: todo solo con cuenta.
revoke all on function public.loc_equipo_guardar(text[]), public.loc_equipos(), public.loc_pasos_semanas(), public.loc_mis_dias(),
  public.loc_paquete_dar(text, text, numeric), public.loc_mis_paquetes(), public.loc_paquete_abrir(text),
  public.loc_master_enviar(text, text, date, numeric, text, text), public.loc_master_mensajes(), public.loc_comunidad() from public, anon;
grant execute on function public.loc_equipo_guardar(text[]), public.loc_equipos(), public.loc_pasos_semanas(), public.loc_mis_dias(),
  public.loc_paquete_dar(text, text, numeric), public.loc_mis_paquetes(), public.loc_paquete_abrir(text),
  public.loc_master_enviar(text, text, date, numeric, text, text), public.loc_master_mensajes(), public.loc_comunidad() to authenticated;

-- Comprobación: debe salir la Comunidad con sus km, sin error.
select nombre, km, registrado from public.loc_comunidad();
