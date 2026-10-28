# La Otra Comunidad — notas de traspaso

Juego web privado para 7 amigos (Arturo, Porru, Adrián, Carlos, Fer, Edo, Rodri): cada uno avanza con sus pasos reales por el camino de Frodo, siempre detrás de él, y descubre la historia de cada tramo al llegar. Lo lleva Henar.

## Dónde está cada cosa
- `src.html` → fuente de la página, con huecos `__KEY__`, `__MAN__`, `__DATA__`, `__LOGO__`.
- `data.js` → textos de los 8 tramos (`T`) e iconos-emblema de los personajes del libro (`ICON`).
- `manifest.json` → rutas de las imágenes y posición/velocidad de cada capa de fondo.
- `public/index.html` → página generada (se rellena desde `src.html`). Es lo que se publica.
- `public/assets/` → fondos por capas (`tramos/tN_capa.webp`), dibujos (`pj/`), logo e icono.
- `supabase/la-otra-comunidad.sql` → tablas `loc_*` y funciones. Ya ejecutado en el proyecto Supabase «golf» (el mismo de Stadada) el 28/10/2026.
- Publicación: Cloudflare Workers (`wrangler.toml`, carpeta `public`).

## Reglas
- Supabase: solo la clave pública `sb_publishable_…`. Nunca service_role. Todo pasa por las funciones `loc_*` (RLS cerrado en las tablas).
- No tocar las tablas de Stadada. Todo lo de este juego lleva prefijo `loc_`.
- Códigos de jugador de 6 cifras, en `loc_jugadores`. No escribirlos en ningún archivo.
- Personajes del libro: solo en texto (bocadillos con emblema). No dibujar a Frodo, Gandalf, Bombadil ni otros personajes de Tolkien. Los hobbits del grupo son originales.
- Textos de historia: resúmenes propios, nunca citas copiadas del libro.
- Henar quiere que Claude cuestione las ideas con honestidad, sin halagos.
- Push solo cuando Henar lo pida.

## Estado (Versión 1, 28/10/2026)
- Fase 1: capítulos 1-5, Bolsón Cerrado → Cricava, 115 km, 8 tramos. 1 km = 1.350 pasos.
- Entrada con código → pantalla de juego (escena, km, pasos de hoy, Sincronizar, diario, Comunidad en el camino) → hojas: Libro Rojo, Comunidad, Zurrón (vacío), Ajustes.
- Sincronizar en iPhone abre el atajo «La Otra Comunidad» (`shortcuts://run-shortcut`), que lee Salud y llama a `loc_subir_pasos(p_codigo, p_dias)` con líneas `AAAA-MM-DD,pasos`.
- Solo Arturo tiene dibujos de andar (4 estados: normal, lluvia, noche, calor); el resto camina con el de Arturo hasta tener los suyos.
- Clima: a mano en Ajustes (pendiente: tiempo real por ciudad).
- Pendiente: minijuegos (zurrón, quieto bajo el árbol, setas, balsa), recompensas, Android, avisos al cambiar de tramo.
