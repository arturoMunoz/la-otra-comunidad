# Acto II · De Cricava a Bree (km 115 → 210, 95 km, caps. 6-9)

Plan acordado el 04/11/2026. Fondos CONTINUOS (cada imagen sigue a la anterior) con STYLE LOCK y las referencias `tools/fondos/v_colinas.png` + `v_bosque.png`.

## Tramos
| km | Sitio | Cap. | Qué pasa (resumen propio) | Minijuego (sin instrucciones) | Zurrón |
|---|---|---|---|---|---|
| 115 | La Cerca | 6 | Salen de Cricava antes del alba y cruzan el túnel bajo el gran seto. | — | Farol de Cricava |
| 125 | Bosque Viejo | 6 | Los senderos se cierran y los árboles los empujan siempre hacia el mismo sitio. | El bosque cambia los caminos (laberinto) | Rama torcida |
| 140 | El Tornasauce | 6 | Un sopor dorado junto al río; el Viejo Sauce atrapa a dos de ellos. | No dormirse bajo el sauce | Hoja de sauce |
| 150 | Casa de Tom Bombadil | 7 | Una canción los saca del apuro; dos noches de refugio, lluvia y cuentos. | Seguir la canción (ritmo) | Lirio de agua |
| 165 | Las colinas | 8 | Día de sol sobre las lomas de hierba; una piedra alta en la cima. | — | Pan y miel |
| 175 | Quebradas de los Túmulos | 8 | La niebla los separa; frío, oscuridad y un rescate dentro de un túmulo. | Encontrar a los otros en la niebla | Daga de Oesternesse |
| 200 | Camino del Este | 8 | Vuelven al camino al atardecer con los ponis recuperados. | — | Herradura de poni |
| 210 | Bree | 9 | Las puertas de Bree, la posada del Poney Pisador y un desconocido que lo observa todo desde un rincón. | — | Jarra de la posada |

Final del acto: entreacto II → III (Bree → Cima de los Vientos), vídeo como el del Acto I.
Ropa que se desbloquea en este acto: capa gris élfica y pantalón mostaza (ya están en `OBJ`, `km:1e9`, faltan sus km y su dibujo en maniquí).
Personajes del libro (Tom, Baya de Oro, el tumulario, Trancos, Mantecona): solo en texto y bocadillos, nunca dibujados.

## Fondos que hay que pedir (en orden, en el MISMO chat de ChatGPT)
1. Cricava al alba → el gran seto con el túnel
2. Entrada del Bosque Viejo
3. Claro del bosque (colina pelada en medio de los árboles)
4. Valle del Tornasauce con el sauce enorme
5. Salida del bosque → colina verde con la casa de Tom (solo luces, sin gente)
6. Las colinas al sol con una piedra alta
7. Túmulos en la niebla
8. Salida de las Quebradas → Camino del Este al atardecer
9. Bree de noche con lluvia, puerta y la posada

## Montado (04/11/2026)
- En el juego son 7 tramos: 115, 125, 140, 150, 165, 175 y 200 (Camino del Este y Bree, acaba en 210). Bree es una escena en el km 206 dentro del último tramo.
- Fondos: a2_cerca, a2_bosque, a2_sauce, a2_tom, a2_colinas, a2_tumulos, a2_camino + escenas a2_claro (km 133) y a2_bree (km 206).
- Zurrón: farol_cricava, rama, sauce, lirio, miel, daga, jarra (sin dibujo aún: sale «?»). La herradura se quitó.
- Fin del acto: `finActo2()` (km 210) → `verEntreacto(2)`.
- Minijuegos: los programa ChatGPT con el contrato `jugar(el, cerrar)` (ver prompt LOC-MINI v1 en el chat del 04/11).
