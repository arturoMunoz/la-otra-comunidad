-- =====================================================================
--  La Otra Comunidad · tablas y funciones en el proyecto Supabase "golf"
--  Todo lleva el prefijo loc_ para no mezclarse con Stadada.
--  Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

-- ---------- 1. Tablas ----------

create table if not exists public.loc_config (
  clave  text primary key,
  valor  text not null
);

create table if not exists public.loc_jugadores (
  id      smallint generated always as identity primary key,
  nombre  text not null unique,
  hobbit  text not null,                 -- qué dibujo usa en el juego
  codigo  text not null unique check (codigo ~ '^[0-9]{6}$'),
  creado  timestamptz not null default now()
);

create table if not exists public.loc_pasos_dia (
  jugador_id   smallint not null references public.loc_jugadores(id) on delete cascade,
  fecha        date     not null,
  pasos        integer  not null check (pasos between 0 and 150000),
  revisar      boolean  not null default false,   -- true si el día pasa de 60.000 pasos
  actualizado  timestamptz not null default now(),
  primary key (jugador_id, fecha)
);

create table if not exists public.loc_historias (
  jugador_id  smallint not null references public.loc_jugadores(id) on delete cascade,
  tramo       smallint not null check (tramo between 0 and 200),
  leida       timestamptz not null default now(),
  primary key (jugador_id, tramo)
);

-- Nadie entra a las tablas directamente: solo a través de las funciones de abajo.
alter table public.loc_config     enable row level security;
alter table public.loc_jugadores  enable row level security;
alter table public.loc_pasos_dia  enable row level security;
alter table public.loc_historias  enable row level security;
revoke all on public.loc_config, public.loc_jugadores, public.loc_pasos_dia, public.loc_historias from anon, authenticated;

-- ---------- 2. Configuración ----------

-- Día en que empieza el viaje: solo cuentan los pasos desde esa fecha.
-- Cámbialo cuando decidáis el arranque:
--   update public.loc_config set valor = '2026-11-15' where clave = 'fecha_inicio';
insert into public.loc_config (clave, valor) values
  ('fecha_inicio', to_char(current_date, 'YYYY-MM-DD')),
  ('pasos_por_km', '1350')
on conflict (clave) do nothing;

-- ---------- 3. Jugadores con su código de 6 cifras ----------

insert into public.loc_jugadores (nombre, hobbit, codigo)
select n, h, lpad(floor(random() * 1000000)::int::text, 6, '0')
from (values
  ('Porru','porru'), ('Adrián','adrian'), ('Carlos','carlos'), ('Fer','fer'),
  ('Edo','edo'), ('Rodri','rodri'), ('Arturo','arturo')
) as v(n, h)
on conflict (nombre) do nothing;

-- ---------- 4. Funciones (la única puerta de entrada) ----------

-- Entrar con el código: devuelve quién eres, o nada si el código no existe.
create or replace function public.loc_entrar(p_codigo text)
returns table (id smallint, nombre text, hobbit text)
language sql stable security definer set search_path = public as $$
  select j.id, j.nombre, j.hobbit from loc_jugadores j where j.codigo = p_codigo;
$$;

-- Subir pasos. p_dias es texto con una línea por día: "2026-11-02,8431".
-- Así el atajo del iPhone solo tiene que juntar líneas de texto.
-- Cada día se sobrescribe: sincronizar diez veces el mismo día no duplica nada.
create or replace function public.loc_subir_pasos(p_codigo text, p_dias text)
returns table (dias_guardados int, pasos_totales bigint)
language plpgsql security definer set search_path = public as $$
declare
  v_id     smallint;
  v_inicio date;
  v_linea  text;
  v_fecha  date;
  v_pasos  int;
  v_n      int := 0;
begin
  select j.id into v_id from loc_jugadores j where j.codigo = p_codigo;
  if v_id is null then
    raise exception 'Código no válido' using errcode = '28000';
  end if;
  select valor::date into v_inicio from loc_config where clave = 'fecha_inicio';

  foreach v_linea in array regexp_split_to_array(coalesce(p_dias, ''), '[\n;]+') loop
    v_linea := btrim(v_linea);
    continue when v_linea = '';
    begin
      v_fecha := split_part(v_linea, ',', 1)::date;
      v_pasos := round(replace(split_part(v_linea, ',', 2), '.', '')::numeric)::int;
    exception when others then
      continue;  -- línea mal formada: se ignora
    end;
    continue when v_fecha < v_inicio or v_fecha > current_date + 1 or v_pasos < 0;
    v_pasos := least(v_pasos, 150000);
    insert into loc_pasos_dia (jugador_id, fecha, pasos, revisar, actualizado)
    values (v_id, v_fecha, v_pasos, v_pasos > 60000, now())
    on conflict (jugador_id, fecha)
    do update set pasos = excluded.pasos, revisar = excluded.revisar, actualizado = now();
    v_n := v_n + 1;
  end loop;

  return query
    select v_n, coalesce(sum(p.pasos), 0)::bigint
    from loc_pasos_dia p
    where p.jugador_id = v_id and not p.revisar;
end;
$$;

-- Marcar una historia de tramo como leída.
create or replace function public.loc_marcar_historia(p_codigo text, p_tramo smallint)
returns void
language sql security definer set search_path = public as $$
  insert into loc_historias (jugador_id, tramo)
  select j.id, p_tramo from loc_jugadores j where j.codigo = p_codigo
  on conflict do nothing;
$$;

-- Qué historias ha leído cada uno.
create or replace function public.loc_mis_historias(p_codigo text)
returns setof smallint
language sql stable security definer set search_path = public as $$
  select h.tramo from loc_historias h join loc_jugadores j on j.id = h.jugador_id
  where j.codigo = p_codigo order by 1;
$$;

-- La Comunidad en el camino: posición de todos, sin códigos.
-- Los días marcados para revisar no cuentan hasta que se revisen.
create or replace function public.loc_comunidad()
returns table (nombre text, hobbit text, pasos_totales bigint, km numeric, pasos_hoy int)
language sql stable security definer set search_path = public as $$
  select j.nombre, j.hobbit,
         coalesce(sum(p.pasos) filter (where not p.revisar), 0)::bigint,
         round(coalesce(sum(p.pasos) filter (where not p.revisar), 0)
               / (select valor::numeric from loc_config where clave = 'pasos_por_km'), 1),
         coalesce(max(p.pasos) filter (where p.fecha = current_date), 0)
  from loc_jugadores j
  left join loc_pasos_dia p on p.jugador_id = j.id
  group by j.id, j.nombre, j.hobbit
  order by 3 desc;
$$;

revoke all on function public.loc_entrar(text), public.loc_subir_pasos(text, text),
  public.loc_marcar_historia(text, smallint), public.loc_mis_historias(text),
  public.loc_comunidad() from public;
grant execute on function public.loc_entrar(text), public.loc_subir_pasos(text, text),
  public.loc_marcar_historia(text, smallint), public.loc_mis_historias(text),
  public.loc_comunidad() to anon, authenticated;

-- ---------- 5. Los códigos para repartir ----------
-- Al terminar, Supabase enseña esta tabla: apunta el código de cada uno.
select nombre, codigo from public.loc_jugadores order by nombre;
