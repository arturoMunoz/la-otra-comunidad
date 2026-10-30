# Prompts de vídeos (para ChatGPT)

Formato de todos: imágenes verticales para móvil (ChatGPT las da en 2:3, 1024x1536; se recortan a lo alto del móvil, por eso lo importante va en el centro) que Claude monta en vídeo con movimiento lento + texto narrado (resumen propio, nunca cita del libro).
Personajes del libro: nunca con cara ni detalle, solo siluetas lejanas o luces. Solo nuestros hobbits pueden salir cerca.

## Ficha fija (va delante de cada imagen)
```
=== LOC-SCENE v1 ===
Game: "La Otra Comunidad". 16-bit pixel art, JRPG style, crisp pixels, rich colors, painterly pixel lighting, no text, no letters, no logos, no borders.
Tall portrait image for a PHONE screen held upright (use the tallest portrait size you can, 1024x1536).
Keep everything important (characters, light, focal point) inside the central area; leave extra calm sky at the top and calm ground at the bottom, because the image will be cropped to fit tall phones (9:19.5) and a slow zoom will be applied.
Nothing important near the left and right edges. Full-bleed, no frame.
Same world and style as the attached reference scene of the game.
Characters from the book (Frodo, Gandalf, Elrond, elves, riders, Tom Bombadil) are NEVER shown with faces or details: only far silhouettes, lights or shapes.
The only characters allowed in close view are our original hobbits (attached sprite sheet), always small in the scene, seen from behind or side.
```

## Entreacto I → II (al llegar a Cricava, km 115)
1. `=== IMAGE 1: CROSSING THE RIVER AT NIGHT === A small wooden ferry raft crossing a wide dark river under the stars, a lantern on a pole. On the far bank behind, a tall black silhouette of a rider stands still in the fog, watching. Cold blue light.`
2. `=== IMAGE 2: THE HOUSE AT CRICKHOLLOW === A low round hobbit house half hidden behind a green hedge at night, round windows with warm orange light, smoke from the chimney, a small gate. Peaceful and safe.`
3. `=== IMAGE 3: THE SECRET IS OUT === Inside a cozy hobbit room by the fireplace: our hobbits (from the attached sheet) seen from behind, sitting around a table with mugs, bread and an old map. Warm firelight, long shadows on the round walls.`
4. `=== IMAGE 4: PACKING AT DAWN === A stone yard at blue dawn: five small ponies loaded with packs and blankets, backpacks on the ground, breath fog in the cold air. No faces visible.`
5. `=== IMAGE 5: THE HEDGE AND THE OLD FOREST === A huge dark hedge wall with a small tunnel gate, and behind it the edge of an ancient, twisted forest with grey mist between the trunks. Our tiny hobbits seen from behind, at the gate. Ominous green-grey light.`
6. `=== IMAGE 6: TITLE CARD BACKGROUND === Wide view of the road ahead: a narrow path vanishing into the old forest under a pale morning sky, empty space at the top of the image (for a title to be added later). No text.`

Narración (unos 60 s):
1. La balsa cruzó el río justo a tiempo. Al otro lado, una sombra negra se quedó mirando.
2. En Cricava esperaba una casa caliente, lejos de todo, como si nada pasara.
3. Pero sus amigos ya lo sabían todo: el Anillo, el peligro, el viaje. Y no pensaban dejarlo solo.
4. Antes del alba cargaron los ponis. Por el camino no podían ir: los jinetes vigilaban.
5. Quedaba una sola salida: el Bosque Viejo, donde los árboles no olvidan.
6. Fin del Acto I. Empieza el Acto II: hacia Bree.

## Rivendel (km 740, final del Acto III)
1. `=== IMAGE 1: THE FORD === A wide river ford at dusk between steep wooded hills. On the far bank, a single white light. Behind, on the near bank, nine dark riders as tall black silhouettes in the mist. The river is calm. Cold blue and purple light.`
2. `=== IMAGE 2: THE FLOOD === The same ford: the river rises into a huge wave whose white crests look like galloping horses, sweeping away the dark silhouettes. Spray, moonlight, motion.`
3. `=== IMAGE 3: THE HIDDEN VALLEY === A deep narrow valley seen from the edge of a cliff at dawn: waterfalls, pine forest, and far below an elegant house of pale stone with many terraces, warm lights in the windows. Golden mist.`
4. `=== IMAGE 4: ARRIVAL === Our small hobbits (from the attached sheet), seen from behind, tired, walking down a stone path with bridges toward the house. Autumn trees, falling leaves.`
5. `=== IMAGE 5: THE HALL OF FIRE === A great hall with a long fire in the center, pillars carved like trees, tall windows with stars. Far shapes of seated figures, only silhouettes against the fire. Warm red and gold light.`
6. `=== IMAGE 6: REST === A small bedroom with an open window over the valley at morning; a bed with white sheets, a backpack and a walking stick resting against the wall. Sunlight and peace.`

Narración (unos 70 s):
1. Al borde del agua, la luz de un amigo esperaba al otro lado. Detrás, los Nueve.
2. Entonces el río despertó. Sus olas corrieron como caballos blancos y se llevaron la sombra por delante.
3. Más allá de las montañas, escondida en un valle profundo, se alzaba la última casa acogedora al este del mar.
4. Llegasteis cansados, con los pies doloridos y el zurrón vacío. Pero llegasteis.
5. Aquella noche hubo fuego, canciones y viejas historias. Frodo había llegado vivo a Rivendel.
6. Descansad. El camino sigue, y lo más difícil aún está por andar.

## Fondos del camino (formato bueno: vertical, llena la pantalla del móvil)
```
=== LOC-FONDO v2 ===
Game: "La Otra Comunidad". 16-bit pixel art, JRPG style, crisp pixels, rich colors, same style as the attached game scene. No text, no letters, no frame.
PORTRAIT image 1024x1536 (taller than wide): it fills a whole phone screen held upright, with no zoom.
Side view, like a 2D side-scrolling game background (seen from the side, not from above).
STRUCTURE (very important):
- Top 40%: sky (clouds, stars, mist, or tree canopy). The game's buttons go over this part, so nothing important here.
- From 40% to 88%: the landscape of this place (hills, trees, buildings, water), getting closer towards the bottom.
- Bottom 12%: a flat dirt path running straight from the left edge to the right edge, with grass along it. The characters walk on this path, about 95% down the image.
The left and right edges must match so the image can repeat side by side.
NO people, NO animals, NO characters at all.
```
Al cortarla: `ALTO=420 python3 tools/fondo.py IMG NOMBRE FILA_PIES`.
