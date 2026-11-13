# Acto III · De Bree a la Cima de los Vientos (km 210 → 370, 160 km, caps. 9-11)

Plan propuesto el 13/11/2026 (Fer está a punto de llegar a Bree). El mapa (`mapa3.webp`) ya llega hasta Rivendel: Bree 210, Bosque de Chet 225, Pantanos de Moscagua 250, Cima de los Vientos 370. El Acto IV sería Cima → Rivendel (370 → 740).

## Tramos
| km | Sitio | Cap. | Qué pasa (resumen propio) | Minijuego (arcade) | Zurrón |
|---|---|---|---|---|---|
| 210 | El Poney Pisador | 9-10 | Una posada llena de gente grande, cerveza y ruido. Frodo acaba cantando subido a una mesa, resbala… y desaparece delante de todos. En un rincón, un montaraz con la capucha echada lo ha visto todo. | **La canción del Poney** (Guitar Hero, 2.ª versión con el motor común) | Carta olvidada de Gandalf |
| 218 | La huida de Bree | 11 | Noche de golpes y puertas forzadas; al alba, sin ponis, salen a pie con un único poni flaco y el montaraz como guía. | — | Ronzal del poni Bill |
| 225 | Bosque de Chet | 11 | Dejan el camino y se meten entre los árboles, por senderos que solo conoce Trancos. | — | Hoja de la Cuaderna del Sur |
| 250 | Pantanos de Moscagua | 11 | Días de barro, juncos y nubes de mosquitos que no dejan dormir. | **Los mosquitos de Moscagua** (tipo Fruit Ninja: deslizar el dedo para espantarlos, 30 s) | Vela de junco |
| 300 | Tierras salvajes | 11 | Colinas peladas y viento. De noche, a lo lejos, destellos en lo alto de una cima. | — | Piedra de afilar |
| 340 | La hondonada | 11 | Acampan al pie de la cima, al abrigo de una hondonada. Encienden fuego y esperan. | — | Rama de athelas |
| 365 | Cima de los Vientos | 11 | Las ruinas de la vieja atalaya. Una piedra marcada con una señal. De noche, cinco sombras suben por la ladera. | **Fuego contra las sombras** (tipo Missile Command: sombras que bajan hacia la hoguera, tocar para lanzar teas, 30 s) | Piedra con la runa |

Fin del acto: 370 → `finActo3()` + entreacto III → IV (Cima → Rivendel).
Entreacto II → III: suena al llegar a Bree (210), antes del Poney.
Personajes del libro (Mantecona, Trancos, los Jinetes, Bill Helechal): solo en texto y bocadillos con emblema; nunca dibujados. Trancos necesita emblema propio (pedirlo con el mismo estilo de medallón).

## Pedidos a ChatGPT (en orden)
### 1. Fondos continuos (mismo chat, adjuntando siempre la anterior; la primera continúa `tools/fondos/a2_bree.png`)
Adjuntar además `tools/fondos/v_colinas.png` y `v_bosque.png` como referencia de estilo. Cada uno lleva delante la ficha LOC-FONDO v2 + STYLE LOCK + CONTINUITY (ver `prompts-videos.md`).
1. a3_poney — Bree de noche: la calle empedrada con la gran posada del Poney Pisador.
2. a3_puerta — la puerta este de Bree al alba gris, setos y casas de piedra quedando atrás.
3. a3_chet — Bosque de Chet: bosque otoñal sin camino marcado.
4. a3_moscagua — Pantanos de Moscagua: juncos, charcas, niebla baja.
5. a3_salvaje — Tierras salvajes: lomas peladas, viento, la Cima de los Vientos lejana con destellos.
6. a3_hondonada — hondonada al pie de la cima, fuego de campamento.
7. a3_cima — Cima de los Vientos: ruinas de la atalaya de Amon Sûl, anillo de piedras, de noche.

### 2. Sello del Acto III (bronce/plata/oro): la Cima de los Vientos coronada por las ruinas.
### 3. Iconos del Zurrón (7), mismo estilo que los anteriores.
### 4. Emblema de Trancos (medallón).
### 5. Fondos de minijuego: escenario del Poney (4 carriles), pantano con mosquitos, la hondonada de noche vista desde arriba.
### 6. Entreacto II → III (6 imágenes LOC-SCENE) y entreacto III → IV.
