# Prompts para ChatGPT · El Vado del Isen

## Pack Vado 1 — escenario 3D (descargas CC0)

```
Estoy haciendo un juego móvil en Three.js inspirado en El Señor de los Anillos: «El Vado del Isen», un duelo de héroes tipo League of Legends / Brawl Stars en los Vados del Isen, entre Rohan (sur) e Isengard (norte), con un río poco hondo que cruza el mapa y una espesura a cada lado del camino. Cámara cenital-inclinada a unos 30 m de altura, estilo low-poly colorido pero oscuro (anochecer, fuego, niebla).

Busca y DESCARGA modelos GRATUITOS con licencia CC0 (Kenney: Nature Kit, Castle Kit, Fantasy Town; Quaternius: Stylized Nature, Ultimate Nature, Medieval Village; KayKit: Forest Nature, Dungeon, Medieval Hexagon). Elige lo que mejor encaje con el Westfold de Rohan y los bosques al pie de las Montañas Nubladas, y repinta/oscurece colores si hace falta para que no parezca de juguete.

Necesito, cada cosa como nodo separado con su nombre:
1. Árboles: 4 pinos/abetos, 3 robles o hayas, 2 árboles muertos retorcidos (lado de Isengard, como los tocones que deja Saruman).
2. 6 rocas (pequeñas a grandes), 4 arbustos, 3 matas de juncos y hierba alta para la orilla, 6 piedras planas de vadear para el río.
3. Torre de defensa de Rohan (piedra y madera, techo de paja o madera, unos 7 m) y torre de Isengard (piedra negra y hierro, pinchos, unos 7 m). Tres estados por torre si puedes: entera, dañada, derruida (nodos torre_rohan_1/2/3, torre_isengard_1/2/3).
4. Estandarte-base de cada bando (el «nexo»): un gran estandarte con un pequeño círculo de piedras y antorchas, unos 6 m (nexo_rohan, nexo_isengard).
5. Cubiles de la espesura: huesos, calaveras de animal, ramas rotas, un tronco hueco y una hoguera apagada (cubil_huargo) y una cueva/peña con huesos grandes (cubil_troll).
6. Una fuente de curación para cada base (un pozo o círculo de piedra con agua), fuente_rohan y fuente_isengard.

Formato: un .glb por grupo (vado_arboles.glb, vado_rocas.glb, vado_torres.glb, vado_nexos.glb, vado_cubiles.glb, vado_fuentes.glb), 1 unidad = 1 metro, origen en la base del objeto, Y hacia arriba, texturas embebidas, menos de 4 MB por archivo. Incluye un LICENCIAS.txt con autor, paquete y enlace de cada modelo. Pásamelo todo en un .zip llamado Pack_Vado_1.zip.
```

## Pack Vado 2 — interfaz (imágenes)

```
Para el mismo juego (El Vado del Isen, El Señor de los Anillos, Rohan contra Isengard), necesito la interfaz pintada. Estilo: el de un juego de móvil tipo Brawl Stars / Clash Royale pero oscuro y medieval: metal envejecido, cuero, oro gastado, verde de Rohan y rojo-negro de Isengard. PNG con fondo transparente, sin texto escrito, sin marcas de agua.

1. Minimapa: pintura cenital del mapa en proporción 1:2 (vertical, 512x1024): un camino de barro recto de arriba abajo por el centro, un río poco hondo cruzándolo por la mitad (los Vados del Isen), espesura de bosque oscuro a ambos lados separada del camino por empalizadas con 5 huecos, base de Rohan abajo (hierba verde, tiendas) y de Isengard arriba (tierra quemada, tocones). Vista desde arriba, plana, sin perspectiva, sin edificios en relieve.
2. Indicadores de habilidad en el suelo, blancos con brillo suave, para teñirlos por código: una flecha larga (512x128), un cono de 90° (512x512), un círculo de área con borde marcado (512x512), un círculo de alcance fino (512x512).
3. 16 iconos de habilidad redondos (256x256, mismo marco para todos), 4 por héroe:
   Jinete de Rohan: estocada de lanza, escudo de Edoras, grito de la Marca (cuerno), carga de los Rohirrim.
   Enano de Erebor: hachazo en abanico, piel de piedra, salto con martillo, furia de Durin (el suelo se abre).
   Arquero de Lórien: flecha larga que atraviesa, ráfaga de flechas, paso élfico (salto con estela de hojas), lluvia de flechas.
   Hobbit de la Comarca: piedra certera, desaparecer (capa y humo), puñado de piedras, suerte del hobbit (un trébol y un anillo de luz, sin el Anillo Único).
   Pásalos como una hoja 4x4 de 1024x1024.
4. 2 iconos de bendición (128x128): «Fuerza del troll» (puño de piedra) y «Aullido del alfa» (cabeza de huargo aullando).
5. Botones redondos (256x256): volver a la base (una fogata con flecha), zoom de cámara (un catalejo), armería (un yunque con espada), ataque básico (dos espadas cruzadas).
6. Marcas para el minimapa (64x64): cubil de huargo, cubil del troll, torre de Rohan, torre de Isengard.

Pásamelo en un .zip llamado Pack_Vado_2.zip con cada imagen por separado y nombres claros.
```

## Pack Vado 3 — lo que falta para el mapa en «ojo» (14/11)

### A. Interfaz (imágenes, a ChatGPT; adjuntar `tools/vado/boceto_mapa_arturo.jpg`)
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos, Rohan contra Isengard, estilo Wild Rift / Brawl Stars oscuro y medieval: metal envejecido, cuero, oro gastado, verde de Rohan, negro y rojo de Isengard). Te adjunto el boceto del mapa nuevo. PNG con fondo transparente salvo el minimapa, sin texto escrito, sin marcas de agua.

1. Minimapa del mapa nuevo, vista cenital plana, 512x1024 (vertical): la base de Rohan en la esquina de abajo a la izquierda (hierba verde, tiendas con el caballo blanco) y la de Isengard arriba a la derecha (tierra quemada, tocones, la Mano Blanca). Dos caminos de barro salen de una base y llegan a la otra formando un ojo o una hoja: uno sube pegado al borde izquierdo y cruza por arriba; el otro va por abajo y sube pegado al borde derecho. Dentro del ojo, bosque oscuro con claros, y en el centro exacto un claro de piedra donde duerme un gran uruk. Un río poco hondo (los Vados del Isen) cruza el mapa en diagonal por el centro, de arriba a la izquierda hacia abajo a la derecha. Fuera de los caminos, bosque cerrado.
2. Iconos redondos 256x256 con el mismo marco que los de habilidades: «Destello» (un salto de luz plateada, estela de chispas) y «Curar» (una hoja de athelas brillando con luz verde).
3. Iconos de bendición 128x128: «Aullido del alfa» (cabeza de huargo aullando) y «Furia del Uruk» (un yelmo de uruk con la Mano Blanca envuelto en fuego azul).
4. Indicadores de habilidad en el suelo, blancos con brillo suave, para teñirlos por código: flecha larga 512x128, cono de 90° 512x512, círculo de área con borde marcado 512x512, círculo fino de alcance 512x512.
5. Cartel de baja: una franja horizontal 1024x160 de metal y cuero con dos huecos redondos (izquierda y derecha) para retratos y una espada en medio; y una cinta 1024x128 para el grito («¡Primera sangre!»), en dos versiones de color: dorada (para nosotros) y roja (para ellos).

Pásamelo en un .zip llamado Pack_Vado_3.zip.
```

### B. El Uruk Azul (modelo 3D, a ChatGPT; adjuntar `public/abismo/modelos/capitan.glb`)
```
Para el mismo juego necesito el jefe del centro del mapa, el «Uruk Azul»: un capitán uruk-hai de Isengard enorme (como un uruk de Lurtz pero más grande y acorazado), con armadura negra de placas, la Mano Blanca pintada, y vetas y ojos de un azul frío brillante (es el jefe raro del mapa, como el Barón Nashor del League of Legends). Te adjunto capitan.glb: usa EXACTAMENTE su mismo esqueleto, nombres de huesos y animaciones (andar, correr, quieto, atacar, recibir_golpe, morir…), y añade si puedes una animación «pisoton» (golpe al suelo con las dos manos). Estilo low-poly como el adjunto, colores oscuros con el azul como acento emisivo. Un solo .glb (uruk_azul.glb), menos de 3 MB, 1 unidad = 1 metro, unos 4,4 m de alto. Pásamelo en Pack_Vado_4.zip.
```

### C. Voces del anunciador (ElevenLabs, voz «Gala», un mp3 por frase)
¡Primera sangre! · ¡Doble derribo! · ¡Triple derribo! · ¡En racha! · ¡Imparable! · ¡Leyenda de la Marca! · ¡Racha cortada! · ¡Aniquilación! · Torre enemiga destruida · Han destruido una de nuestras torres · ¡El Uruk Azul ha despertado! · Habéis derrotado al Uruk Azul · ¡Las hordas han llegado al vado! · ¡Victoria! · Derrota
