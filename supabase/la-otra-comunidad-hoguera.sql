-- La Otra Comunidad · hoguera: días que cada uno abre el juego (05/11/2026). Ejecutar una vez en Supabase (proyecto «golf»).
create table if not exists public.loc_aperturas (
  jugador_id smallint not null references public.loc_jugadores(id) on delete cascade,
  fecha      date not null,
  primary key (jugador_id, fecha)
);
alter table public.loc_aperturas enable row level security;
-- Hora exacta de la última vez que cada uno abrió el juego (se pisa en cada apertura).
alter table public.loc_jugadores add column if not exists abierto timestamptz;
-- Apunta hoy (y los días que el móvil tenía guardados sin conexión) y devuelve mis días de los últimos 400.
create or replace function public.loc_abrir(p_dias date[] default '{}')
returns table (fecha date)
language plpgsql security definer set search_path = public as $$
declare v_id smallint; v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  select j.id into v_id from loc_jugadores j where j.user_id = auth.uid();
  if v_id is null then return; end if;
  update loc_jugadores set abierto = now() where id = v_id;
  insert into loc_aperturas (jugador_id, fecha)
  select v_id, d from unnest(array_append(coalesce(p_dias,'{}'), v_hoy)) d where d between v_hoy - 400 and v_hoy
  on conflict do nothing;
  return query select a.fecha from loc_aperturas a where a.jugador_id = v_id and a.fecha >= v_hoy - 400 order by 1;
end;
$$;
revoke all on function public.loc_abrir(date[]) from public, anon;
grant execute on function public.loc_abrir(date[]) to authenticated;
select count(*) as dias_apuntados from public.loc_aperturas;
