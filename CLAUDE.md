# La Otra Comunidad — notas de traspaso

Juego web privado para 7 amigos (Arturo, Porru, Adrián, Carlos, Fer, Edo, Rodri): cada uno avanza con sus pasos reales por el camino de Frodo, siempre detrás de él, y descubre la historia de cada tramo al llegar. Lo lleva Henar.

## Dónde está cada cosa
- `src.html` → fuente de la página, con huecos `__KEY__`, `__MAN__`, `__DATA__`, `__LOGO__`.
- `data.js` → textos de los 8 tramos (`T`) e iconos-emblema de los personajes del libro (`ICON`).
- `manifest.json` → rutas de las imágenes y posición/velocidad de cada capa de fondo.
- `public/index.html` → página generada (se rellena desde `src.html`). Es lo que se publica.
- `public/assets/` → fondos por capas (`tramos/tN_capa.webp`), dibujos (`pj/`), logo e icono.
- `supabase/la-otra-comunidad.sql` → tablas `loc_*` (ejecutado en el proyecto «golf» el 28/10/2026).
- `supabase/la-otra-comunidad-cuentas.sql` → cuentas con correo (Supabase Auth, las mismas de Stadada), `user_id` y `clave_atajo` en `loc_jugadores`, funciones `loc_libres/loc_reclamar/loc_yo/loc_leidas/loc_leer/loc_subir`; cierra las de código. Ejecutar después del anterior.
- `build.py` → genera `public/index.html`; `--demo x.html` genera el prototipo de claude.ai (datos inventados).
- `supabase/clave_publica.txt` → la clave pública `sb_publishable_…` (la misma de Stadada).
- Publicación: Cloudflare Workers (`wrangler.toml`, carpeta `public`).

## Reglas
- Supabase: solo la clave pública `sb_publishable_…`. Nunca service_role. Todo pasa por las funciones `loc_*` (RLS cerrado en las tablas).
- No tocar las tablas de Stadada. Todo lo de este juego lleva prefijo `loc_`.
- Cuentas con correo y contraseña (pedido de Henar: nada de códigos de acceso). Al crear la cuenta se elige uno de los 7 hobbits libres (`loc_reclamar`, una vez por cuenta). La `clave_atajo` solo la usa el atajo del iPhone; se copia desde Comunidad.
- Personajes del libro: solo en texto (bocadillos con emblema). No dibujar a Frodo, Gandalf, Bombadil ni otros personajes de Tolkien. Los hobbits del grupo son originales.
- Textos de historia: resúmenes propios, nunca citas copiadas del libro.
- Henar quiere que Claude cuestione las ideas con honestidad, sin halagos.
- Push solo cuando Henar lo pida.

## Estado (Versión 3, 28/10/2026)
- Fase 1: capítulos 1-5, Bolsón Cerrado → Cricava, 115 km, 8 tramos. 1 km = 1.350 pasos.
- Entrada: entrar / crear cuenta (con hobbit) / recuperar contraseña. Escena a pantalla completa, el hobbit siempre anda; arriba sitio, km y lo que falta; abajo pasos de hoy, Sincronizar y botones Libro Rojo, Comunidad, Zurrón.
- Libro Rojo: la página de cada tramo se destapa por frases según el avance dentro del tramo.
- Zurrón: un objeto por sitio alcanzado (`ITEMS`, inventados, sin uso aún).
- Tiempo real de Madrid con Open-Meteo (lluvia → capucha, noche → farol, ≥26° → sin capa).
- Sincronizar en iPhone abre el atajo «La Otra Comunidad» (`shortcuts://run-shortcut`), que lee Salud y llama a `loc_subir(p_clave, p_dias)` con líneas `AAAA-MM-DD,pasos`.
- Solo Arturo tiene dibujos de andar (4 estados: normal, lluvia, noche, calor); el resto camina con el de Arturo hasta tener los suyos.
- Pendiente: minijuegos (zurrón, quieto bajo el árbol, setas, balsa), recompensas, Android, avisos al cambiar de tramo.
