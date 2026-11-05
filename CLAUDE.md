# La Otra Comunidad — notas de traspaso

Juego web privado para 9 amigos (Arturo, Porru, Adrián, Carlos, Fer, Edo, Rodri, Patri, Juan Pablo): cada uno avanza con sus pasos reales por el camino de Frodo, siempre detrás de él, y descubre la historia de cada tramo al llegar. Lo lleva Henar.

## Dónde está cada cosa
- `src.html` → fuente de la página, con huecos `__KEY__`, `__MAN__`, `__DATA__`, `__LOGO__`.
- `data.js` → textos de los 8 tramos (`T`) e iconos-emblema de los personajes del libro (`ICON`).
- `manifest.json` → rutas de las imágenes y posición/velocidad de cada capa de fondo.
- `public/index.html` → página generada (se rellena desde `src.html`). Es lo que se publica.
- `public/assets/` → fondos por capas (`tramos/tN_capa.webp`), dibujos (`pj/`), logo e icono.
- `supabase/la-otra-comunidad.sql` → tablas `loc_*` (ejecutado en el proyecto «golf» el 28/10/2026).
- `supabase/la-otra-comunidad-cuentas.sql` → cuentas con correo (Supabase Auth, las mismas de Stadada), `user_id` y `clave_atajo` en `loc_jugadores`, funciones `loc_libres/loc_reclamar/loc_yo/loc_leidas/loc_leer/loc_subir`; cierra las de código. Ejecutado (comprobado el 29/10/2026 con `supabase/comprobar.sql`).
- `build.py` → genera `public/index.html`; `--demo-files carpeta/index.html` genera el prototipo de claude.ai (datos inventados) que se publica con `assets/` como archivos aparte (el `--demo` de un solo archivo ya no cabe en 16 MB).
- Escenas extra dentro de los tramos: `manifest.json` → `escenas` [{km, capas}] (se cortan con un script: cielo / tierra sin cielo / suelo con el camino; los pies van en y=228). Objetos del camino: `props` + `PROP_T` en `src.html`.
- `supabase/clave_publica.txt` → la clave pública `sb_publishable_…` (la misma de Stadada).
- Publicación: Cloudflare Workers (`wrangler.toml`, carpeta `public`).

## Reglas
- Supabase: solo la clave pública `sb_publishable_…`. Nunca service_role. Todo pasa por las funciones `loc_*` (RLS cerrado en las tablas).
- No tocar las tablas de Stadada. Todo lo de este juego lleva prefijo `loc_`.
- Cuentas con correo y contraseña (pedido de Henar: nada de códigos de acceso). Al crear la cuenta se elige uno de los 7 hobbits libres (`loc_reclamar`, una vez por cuenta). La `clave_atajo` solo la usa el atajo del iPhone; se copia desde Comunidad.
- Personajes del libro: solo en texto (bocadillos con emblema). No dibujar a Frodo, Gandalf, Bombadil ni otros personajes de Tolkien. Los hobbits del grupo son originales.
- Textos de historia: resúmenes propios, nunca citas copiadas del libro.
- Arte: Claude NUNCA dibuja ni genera recursos (ni SVG, ni dibujos por código). Todo se pide a ChatGPT con un prompt y Henar/Arturo pasan las imágenes.
- Prompts para ChatGPT: nombrar SIEMPRE el libro y los sitios de Tolkien (El Señor de los Anillos, Bree, el Poney Pisador, el Viejo Hombre-Sauce, las Quebradas de los Túmulos…) para que salga fiel e inspirado; son fans. Las prohibiciones de los prompts son solo técnicas (sin texto, sin marco, formato). Sigue en pie: personajes del libro sin dibujar y textos de historia propios, sin citas copiadas.
- Henar quiere que Claude cuestione las ideas con honestidad, sin halagos.
- Push solo cuando Henar o Arturo lo pidan («súbelo»). En esta cuenta escriben los dos.
- Fondos de escena (pedidos a ChatGPT): SIEMPRE en vertical 1024x1536 con la ficha LOC-FONDO de `docs/prompts-videos.md` (camino recto abajo, cielo arriba, sin personajes). Desde el Acto II, además, CONTINUOS dentro de cada acto: cada imagen sigue a la anterior (se adjunta la anterior y se pide que su borde izquierdo continúe el derecho de la otra), para que el paseo hacia atrás se vea como un solo viaje. Entre actos no hace falta. Recordárselo a Arturo al empezar el Acto II. Propuesta para el Acto II: cada sitio en 3 imágenes (cielo solo / paisaje sobre magenta para recortar / suelo con camino) para recuperar las 3 bandas con parallax; se cortan con `HD=3 ESPEJO=1 ALTO=420 tools/fondo.py` y llevan "hd":3,"espejo":true en manifest (el lienzo va a 3x).
- Personajes y ropa POR CAPAS (decidido 02/11/2026): cuerpo base común + cabeza de cada hobbit + objetos dibujados sobre un maniquí cian. Nada de pegar PNG genéricos encima de cada sprite. Las plantillas y reglas están en `docs/prompts-capas.md`: Claude escribe siempre el prompt concreto de cada objeto nuevo siguiendo esa estructura.
- Minijuegos: SIEMPRE arcade (directos, de reflejos, 20-40 s, se entienden sin explicar) y basados en juegos que históricamente hayan funcionado (Frogger, Spy Hunter, Guitar Hero, Space Invaders, Simon…). Nada de puzles lentos ni laberintos por casillas (pedido de Henar, 04/11/2026).
- Máster del juego (toque de rol/JRPG): solo Arturo. Él también juega, así que lo que haga como Máster tiene que verse en el grupo.

## Cómo se trabaja (para una sesión nueva)
- Construir: `python3 build.py` (web, con `?v=` en los assets). Prototipo: `python3 build.py --demo-files <scratchpad>/demo/index.html`, copiar `public/assets` a `<scratchpad>/demo/assets` y publicar en el Artifact https://claude.ai/artifact/Fcc57y5NctqsYtqfbvwjNs (slug 76589623-d12f-4cae-b733-9f416d2a3b5c; el antiguo 3QbVGnRiGz3LkGq8Xz2M3U ya no se puede tocar desde sesiones nuevas) con el mapa `files` (solo hace falta pasar los archivos nuevos o cambiados).
- Probar: servidor `python3 -m http.server 8766` en la carpeta demo (lanzado en segundo plano) + Playwright; en el prototipo `me` se pone con `localStorage loc.demoMe`, km con `loc.demoSteps`/`loc.km`.
- Fondos: `ESPEJO=1 Q=84 HD=3 ALTO=420 python3 tools/fondo.py tools/fondos/X.png NOMBRE FILA_PIES` (FILA_PIES ≈ 1380-1415 en las de 1024x1536). Capas en manifest con "hd":3,"espejo":true, y=-192 / y=210.
- Recortes sobre magenta: con scipy (máscara r,b>150 g<120, componentes, quitar borde rosa). Originales de ChatGPT en `tools/fondos`, `tools/ui`, `tools/mapa`.
- Subir: `git fetch && git merge origin/main && git push origin main`; mirar el check «Workers Builds: la-otra-comunidad» con `gh api repos/arturoMunoz/la-otra-comunidad/commits/<sha>/check-runs`.
- Manifest: `json.dumps(d, ensure_ascii=False, indent=0)` para no reformatearlo.
- Minijuegos nuevos: ChatGPT con `docs/kit-minijuegos.html` (código real + ejemplo jugarArbol); devuelve `jugarNOMBRE(el,cerrar)` + `MINI.NOMBRE={titulo,tramo,jugar}`. Comprobar SIEMPRE el `tramo` (índice 0-based de `T`) y que no use `//`. Pedirle código compacto.

## Estado (04/11/2026)
- 15 tramos en `T` (data.js). Acto I: índices 0-7, km 0-115 (Cricava). Acto II: 8 La Cerca 115, 9 Bosque Viejo 125, 10 Tornasauce 140, 11 Casa de Tom 150, 12 Las colinas 165, 13 Túmulos 175, 14 Camino del Este y Bree 200 (acaba en 210). `TOTAL_KM=210`, `FIN_ACTO1=115`, `FIN_NOMBRE='Bree'`, `ends` en src.html.
- Fin de acto: `finActo()` a los 115 → vídeo `verEntreacto(1)` (rótulo «Acto II» con `M.ui.rotulo`); `finActo2()` a los 210 → `verEntreacto(2)` (vídeo aún no hecho).
- Fondos Acto II: a2_cerca, a2_bosque, a2_sauce, a2_tom, a2_colinas, a2_tumulos, a2_camino + escenas a2_claro (km 133) y a2_bree (km 206). Plan y notas en `docs/acto2.md`.
- Mapa: `assets/mapa3.webp` (1024x3456, 3 trozos de ChatGPT unidos, original en `tools/mapa/`). `M.mapa.idx=true`: cada sitio de `lugares` lleva el índice de su punto en `ruta`, y `rutaPunto` avanza por el camino pintado. Sin línea de ruta propia (solo lo andado en dorado).
- Minijuegos: Acto I zurron, arbol, setas, balsa. Acto II sauce (10), cancion (11), niebla (13) REHECHO 04/11 como «La mano en el túmulo», arcade tipo Whac-A-Mole: 3 compañeros reales del grupo (people + hobbitFoto) arriba, manos de sombra que reptan hacia ellos y se cortan tocándolas, 30 s hasta el alba; imágenes M.mj.tumulo_fondo/tumulo_mano (la mano recortada quitando el rosa del magenta y girada para apuntar arriba). bosque (9, ChatGPT 04/11, 2ª versión: arcade de esquivar tipo Spy Hunter, 3 carriles, árboles que bajan y uno que se aparta en el último momento, 3 vidas con `ui.i_hoja`, 30 s y llega el claro; fondo en espejo para que no se vea la costura).
- Los minijuegos SALTAN SOLOS la primera vez que llegas a su sitio (`bindMini` envuelto al final de minijuegos.js, marca `mjAuto.<id>`); revisado el 04/11 que los 8 se abren. `setKm` ajusta el km al objetivo si está a <0,002 (antes se quedaba a 0,0002 y no «llegaba» al tramo).
- Zurrón Acto II: farol_cricava, rama, sauce, lirio, miel, daga, jarra (`M.objetos`).
- Menú principal con botones de hierro forjado (`largo_forja`). Pergamino de pasos con los últimos 7 días y la semana de la Comunidad (`loc_semana`).
- Pasos: iPhone atajo (7 días) y APK Android (30 días) → `loc_pasos_dias` (versión tolerante en `supabase/la-otra-comunidad-dias.sql`).

## Pendiente (04/11/2026)
- Emblemas de los 9 personajes: HECHO 04/11 (`assets/emb/`, `manifest.emb`, `embHtml(who,icon)` en src.html; original en `tools/ui/emblemas.png`). Los SVG de `ICON` quedan solo de reserva si aparece un personaje nuevo sin emblema: pedirle el suyo a ChatGPT con el mismo estilo de medallón.
- Iconos dibujados por código quitados de la UI: clave del atajo (ahora `ui.i_sync`, oculto en Android) y preguntas del libro (`ui.i_libro`).
- Sellos de los actos (bronce/plata/oro, Acto I puerta de Bolsón Cerrado, Acto II letrero del Poney) y fondos del minijuego del bosque: HECHO 04/11 (`assets/sellos/`, `M.sellos`, `selloHtml(acto,metal)`; originales en tools/ui).
- Vídeo entreacto II → III (Bree → Cima de los Vientos).
- SQL por ejecutar o confirmar: `supabase/la-otra-comunidad-semana.sql` (loc_semana), `la-otra-comunidad-registrados.sql`.
- Porru veía el doble de pasos en iPhone (probable iPhone + reloj): filtro «Fuente» en el atajo; sin confirmar.
- Premios de minijuegos (3 por juego, uno por estrella) montados: ver `docs/premios.md`. Faltan los dibujos (prompts A y B en ese doc). Estrellas en la cuenta: `supabase/la-otra-comunidad-estrellas.sql` (tabla `loc_estrellas`, `loc_estrellas()`/`loc_estrella()`) POR EJECUTAR; el cliente (`estrellasSync` en minijuegos.js) ya lo usa y si no está sigue en el móvil. Capa gris y pantalón mostaza ya se ganan con estrellas (niebla y canción).
- «Seguir la canción» rehecha el 04/11 (ChatGPT, 2 vueltas): 4 carriles con botones de colores tipo Guitar Hero (solo cuentan los toques cerca de los botones), aviso «¡ahora!», ¡Perfecto!/¡Bien!/Fallo, cuenta atrás 3-2-1, notas a la vez y arrastre, ~21 s, 56 puntos. Falta probar con dos pulgares en iPhone.
- Objetos de cabeza del sistema por capas (tiara, sombrero, etc.).
- MÁS VERSIONES DEL TIPO GUITAR HERO (a Henar le ENCANTA, 04/11/2026; copia de referencia en `docs/minijuegos/cancion_guitar_hero.js`, no perderla): antes de la segunda, sacar el motor de `jugarCancion` a una función común con configuración (notas/patrón, tempo, colores, fondo, textos) para que cada versión nueva sea solo datos. Candidatos con sentido en el libro: la canción del Poney Pisador en Bree (Frodo sobre la mesa), canciones de los elfos en Rivendel, la rima para llamar a Tom en los túmulos.

## Estado antiguo (Versión 3, 28/10/2026)
- Fase 1: capítulos 1-5, Bolsón Cerrado → Cricava, 115 km, 8 tramos. 1 km = 1.350 pasos.
- Entrada: entrar / crear cuenta (con hobbit) / recuperar contraseña. Escena a pantalla completa, el hobbit siempre anda; arriba sitio, km y lo que falta; abajo pasos de hoy, Sincronizar y botones Libro Rojo, Comunidad, Zurrón.
- Libro Rojo: la página de cada tramo se destapa por frases según el avance dentro del tramo.
- Zurrón: un objeto por sitio alcanzado (`ITEMS`, inventados, sin uso aún).
- Tiempo real de Madrid con Open-Meteo (lluvia → capucha, noche → farol, ≥26° → sin capa).
- Sincronizar en iPhone: atajo «La Otra Comunidad» (lo lanza también la automatización al abrir WhatsApp). Desde el 03/11/2026 manda los ÚLTIMOS 7 DÍAS a `loc_pasos_dias(p_clave=nombre, p_dias)` (Buscar muestras de Salud últimos 7 días agrupadas por día → Repetir: fecha yyyy-MM-dd + Obtener Valor → Combinar con nuevas líneas). Android (APK): cada hora manda los últimos 30 días al mismo `loc_pasos_dias`. Cada día sustituye, nunca suma.
- Solo Arturo tiene dibujos de andar (4 estados: normal, lluvia, noche, calor); el resto camina con el de Arturo hasta tener los suyos.
- Pendiente: minijuegos (zurrón, quieto bajo el árbol, setas, balsa), recompensas, Android, avisos al cambiar de tramo.
