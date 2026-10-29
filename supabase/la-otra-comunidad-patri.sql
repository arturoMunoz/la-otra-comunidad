-- La Otra Comunidad · nueva jugadora: Patri. Se puede ejecutar más de una vez.
insert into public.loc_jugadores (nombre, hobbit)
values ('Patri', 'patri')
on conflict (nombre) do nothing;
select nombre, hobbit, user_id is null as libre from public.loc_jugadores order by nombre;
