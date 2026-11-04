# Premios de los minijuegos (04/11/2026)

Cada minijuego da 3 cosas, una por estrella, ligadas a su capítulo. Cuenta el mejor resultado (`mjBest`, guardado en el móvil).
- ★ objeto de bolsillo (hueco «Bolsillo», solo icono, no se pinta sobre el hobbit).
- ★★ ropa teñida (capa o pantalón): no necesita dibujo; iconos sacados tiñendo `capa_gris`/`pant_gris`.
- ★★★ objeto de cabeza o cara: dibujo sobre maniquí (`prompts-capas.md`, plantilla 4).
Código: bloque «PREMIOS DE LOS MINIJUEGOS» al final de `minijuegos.js` (`PREMIOS`, `premiosHtml`). Fichas con rareza en `OBJ`.
Sin dibujo, el icono sale «?». Al llegar: icono en `assets/eq/<clave>.webp` + `manifest.equipo.<clave>`; los de cabeza, ajustar `w/dx/dy`.

| Minijuego (tramo, cap.) | ★ bolsillo | ★★ ropa | ★★★ cabeza/cara |
|---|---|---|---|
| Hacer el zurrón (0, cap. 3) | llave · Llave de Bolsón Cerrado | pant_pardo · Pantalón pardo de Hobbiton | pipa · Pipa de brezo (cara) |
| Quieto bajo el árbol (2, cap. 3) | bellota · Bellota del escondite | capa_hiedra · Capa verde hiedra | sombrero_musgo · Sombrero verde musgo |
| Setas a escondidas (5, cap. 4) | seta · Seta gorda de la Ciénaga | pant_pana · Pantalón de pana de la granja | sombrero_paja · Sombrero de paja de la Ciénaga |
| La balsa (7, cap. 5) | pertiga · Pértiga de la balsadera | capa_rio · Capa azul del Brandivino | gorra_gamos · Gorra de barquero de Los Gamos |
| Bosque Viejo (9, cap. 6, minijuego por hacer) | pina · Piña del Bosque Viejo | capa_corteza · Capa color corteza | corona_hiedra · Corona de hiedra |
| No dormirse bajo el sauce (10, cap. 6) | yesca · Yesca y pedernal | pant_sauce · Pantalón verde sauce | pluma_azul · Pluma azul (pelo) |
| Seguir la canción (11, cap. 7) | nata · Cuenco de nata amarilla | pant_mostaza · Pantalón mostaza | corona_lirios · Corona de lirios de agua |
| Encontrar a los otros en la niebla (13, cap. 8) | moneda · Moneda del túmulo | capa_gris · Capa gris élfica | diadema · Diadema de oro del túmulo |

## Prompt A · iconos de bolsillo (chat nuevo; adjuntar 2-3 objetos del zurrón, p. ej. obj_daga y obj_miel)
```
=== LOC-STYLE v1 ===
Game: "La Otra Comunidad", based on The Lord of the Rings (J.R.R. Tolkien). 16-bit pixel art, JRPG style, crisp pixels, no anti-aliasing blur, no text.
Same style, outline and palette as the attached inventory icons.
Background: flat pure magenta #FF00FF everywhere (no checkerboard, no scenery, no frames).
=== TASK: 8 INVENTORY ICONS ===
One image, a grid of 4 columns x 2 rows, one object per cell, centered, all at the same scale, generous magenta space between them. No characters.
1) The old iron key of Bag End's round green door in Hobbiton, big round bow, worn teeth.
2) An acorn with one oak leaf, from the tree in the Shire where the hobbits hid from the Black Rider.
3) A big fat field mushroom from Farmer Maggot's fields in the Marish, earth still on the stem.
4) A short wooden ferry pole of the Bucklebury Ferry on the Brandywine, wet at the tip.
5) A dark mossy pine cone from the Old Forest.
6) Sam's fire kit: a flint, a small steel striker and a little leather pouch of tinder.
7) A wooden bowl of thick yellow cream from the supper table in Tom Bombadil's house.
8) An ancient gold coin from the treasure of the Barrow-downs, with a worn king's face.
```

## Prompt B · objetos de cabeza (en el MISMO chat del cuerpo base; adjuntar el cuerpo base). Dos imágenes.
```
Now one single image with FOUR frames in a row, evenly spaced on one black ground line. Each frame is the base body standing (idle frame 1) as a FLAT PURE CYAN #00FFFF silhouette (no shading, no outline, no face), facing RIGHT, same size as the base body sheet. Items from The Lord of the Rings, faithful to the books. On each head, in full detail, a different item, leaving 1-2 pixels above the scalp for hair:
1) A short hobbit briar pipe held in the mouth, bowl pointing forward, no smoke (pipe-weed from Longbottom in the Shire).
2) A wide-brimmed soft felt hat, moss green, slightly floppy, a hobbit hat for hiding in the hedges of the Shire.
3) A wide-brimmed farmer's straw hat from the Marish, like Farmer Maggot's farm, frayed edge, a band of brown cloth.
4) A dark blue knitted ferryman's cap from Buckland by the Brandywine, folded brim.
```
```
Same again, FOUR new items on the same cyan mannequin heads:
1) A crown of dark ivy leaves woven in a ring, from the Old Forest.
2) One long bright blue feather tucked behind the ear, like the feather in Tom Bombadil's hat.
3) A crown of white and pale yellow water-lilies with green pads, from the Withywindle, Goldberry's flowers.
4) A thin circlet of ancient gold with a small pale jewel at the front, from the treasure of the Barrow-downs.
```
