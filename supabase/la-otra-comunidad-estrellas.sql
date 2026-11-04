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
select j.nombre, e.juego, e.estrellas from loc_estrellas e join loc_jugadores j on j.id = e.jugador_id order by 1, 2;
