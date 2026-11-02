# Personajes por capas (sistema «muñeco con cuerpo común»)

Decidido con Arturo el 02/11/2026. Todos los hobbits comparten UN cuerpo base (8 de andar + 4 de quieto, misma posición en cada fotograma).
Encima: cabeza de cada hobbit (1 dibujo, se coloca en el cuello en cada fotograma) y objetos.
Cuando haga falta un objeto nuevo, Claude escribe el mensaje concreto con estas plantillas (Arturo solo copia y pega en el MISMO chat de ChatGPT, con el cuerpo base adjunto).

## Reglas para pedir
- Siempre sobre el MANIQUÍ: el cuerpo base pintado de cian liso #00FFFF; el objeto en su color. Se extrae: todo lo que no es cian ni magenta = objeto.
- Ropa que se tiñe (capas, pantalones, chalecos, sombreros, capuchas): en GRIS MEDIO con sombras grises; el juego la tiñe.
- Objetos que se mueven con el cuerpo (capa, pantalón, chaleco, pañuelo, cinto, mochila, espada, escudo): 2 filas, 8 + 4 poses, UNO POR IMAGEN.
- Objetos de cabeza (tiara, corona, sombrero, gafas, pluma, capucha): 1 dibujo (quieto 1); se pueden pedir hasta 4 por imagen (4 maniquíes en fila).
- Si sale el cuerpo en otra postura o tamaño, se repite.

## 1 · Cuerpo base (una vez; adjuntar el andar de Fer)
```
=== LOC-STYLE v1 ===
Game: "La Otra Comunidad". 16-bit pixel art, JRPG style, crisp pixels, no anti-aliasing blur, no text, no shadows on the ground.
Side view, character faces RIGHT.
Background: flat pure magenta #FF00FF everywhere (no checkerboard, no scenery).
Thin solid black horizontal ground lines; every foot that touches the ground sits exactly ON its line.
=== TASK: BASE BODY FOR A LAYERED CHARACTER SYSTEM ===
A generic adult hobbit BASE BODY that clothes, objects and heads will be drawn on top of later. Same size and proportions as the attached walk sheet.
- Body: bare hobbit feet, plain light-grey long-sleeved undershirt, plain light-grey knee-length undershorts. No waistcoat, no cloak, no backpack, no belt, no accessories.
- Head: a simple smooth bald head with ears and NO face details, NO hair (a placeholder).
- Arms hang naturally and swing a little when walking.
LAYOUT: two horizontal rows, each on its own black ground line, frames evenly spaced, the body in EXACTLY the same place in every frame (only the limbs move):
- ROW 1: WALK CYCLE, 8 frames (1 right foot forward contact, 3 passing, 5 left foot forward contact, 7 passing; 2,4,6,8 in-betweens). Body bobs only 1-2 pixels.
- ROW 2: IDLE, 4 frames, standing still, feet planted, arms relaxed; frame 2 chest rises 1 pixel.
```

## 2 · Cabeza de un hobbit (adjuntar cuerpo base + cara/dibujo del hobbit)
```
=== LOC-LAYER v1 ===
Same game style: 16-bit pixel art, JRPG, crisp pixels, no blur, no text. Background flat pure magenta #FF00FF.
Use the attached BASE BODY sheet as the exact template (same scale).
Draw ONE single frame: the base body standing (idle frame 1), with the whole body painted as a FLAT PURE CYAN #00FFFF silhouette (no shading, no outline) like a mannequin.
On its head, in full normal colors, draw the HEAD of <NAME>: <description>.
Use the attached picture of <NAME> as the exact identity (face, hair, beard, glasses, skin tone). Side view facing RIGHT.
The face and hair fit exactly on the mannequin's head, same head size; hair may stick out. Neck and body stay cyan.
```

## 3 · Objeto que se mueve con el cuerpo (el primero del chat lleva el bloque entero; los siguientes, solo «Same sheet again, new item: …»)
```
=== LOC-LAYER v1 ===
Same game style: 16-bit pixel art, JRPG, crisp pixels, no blur, no text. Background flat pure magenta #FF00FF. Black ground lines.
Redraw the attached BASE BODY sheet EXACTLY (same two rows, same 8 walk + 4 idle poses, same positions, same size), but:
- the whole body painted as a FLAT PURE CYAN #00FFFF silhouette (no shading, no outline, no face) like a mannequin,
- and the mannequin WEARING / CARRYING: <ITEM>, drawn in full detail.
The item must follow each pose naturally (it moves with the body and limbs). Nothing else on the mannequin.
```

## 4 · Objetos de cabeza (hasta 4 por imagen)
```
Now one single image with FOUR frames in a row, evenly spaced on one black ground line. Each frame is the base body standing (idle frame 1) as a FLAT PURE CYAN #00FFFF silhouette (no shading, no outline, no face), facing RIGHT, same size as the base body sheet. On each head, in full detail, a different item, leaving 1-2 pixels above the scalp for hair:
1) <ITEM 1>
2) <ITEM 2>
3) <ITEM 3>
4) <ITEM 4>
```

## Objetos ya pedidos / por pedir (Acto I)
- Cuerpo: capa gris (broche de oro), pantalón gris, pañuelo rojo, cantimplora al cinto, mochila.
- Cabeza: tiara élfica, sombrero ancho gris, gafas de erudito, pluma tras la oreja.
