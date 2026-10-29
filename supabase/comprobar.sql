-- La Otra Comunidad · ¿qué hay ya en Supabase? (solo mira, no cambia nada)
select 'tabla loc_jugadores'       as que, to_regclass('public.loc_jugadores') is not null as hecho
union all select 'tabla loc_pasos_dia',  to_regclass('public.loc_pasos_dia') is not null
union all select 'tabla loc_config',     to_regclass('public.loc_config') is not null
union all select 'columna user_id (cuentas)', exists(select 1 from information_schema.columns where table_name='loc_jugadores' and column_name='user_id')
union all select 'columna clave_atajo (cuentas)', exists(select 1 from information_schema.columns where table_name='loc_jugadores' and column_name='clave_atajo')
union all select 'función loc_libres (cuentas)', to_regproc('public.loc_libres') is not null
union all select 'función loc_subir (atajo)',   exists(select 1 from pg_proc where proname='loc_subir')
union all select 'función loc_comunidad',      exists(select 1 from pg_proc where proname='loc_comunidad')
union all select 'hay 7 hobbits', (select count(*)=7 from public.loc_jugadores)
union all select 'Fer sin dueño todavía', (select user_id is null from public.loc_jugadores where nombre='Fer');
