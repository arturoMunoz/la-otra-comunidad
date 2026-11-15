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

## Pack Vado 5 — botón de ataque por héroe y efectos de habilidades (15/11)
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos, Rohan contra Isengard, estilo League of Legends: Wild Rift / Brawl Stars, oscuro y medieval). Necesito dos cosas. PNG con fondo transparente, sin texto, sin marcas de agua.

A) 4 botones de ATAQUE BÁSICO, redondos 512x512, el botón grande que se pulsa para pegar, con marco de metal y oro gastado igual para los cuatro y el arma de cada héroe dentro, grande y clara:
   1. Jinete de Rohan: lanza de la Marca con banderín verde y el caballo blanco.
   2. Enano de Erebor: hacha de guerra enana de doble filo con runas.
   3. Arquero de Lórien: arco élfico de Lothlórien con una flecha montada, hojas doradas.
   4. Hobbit de la Comarca: honda de cuero con una piedra, hojas de la Comarca.

B) EFECTOS DE HABILIDADES en hojas de animación (sprite sheets) de 1024x1024 con 4x4 fotogramas cada una (16 fotogramas de 256x256, de izquierda a derecha y de arriba abajo, del principio al final del efecto), sobre fondo transparente, brillantes y legibles desde arriba como en el Wild Rift:
   1. tajo_arco: un tajo en media luna blanco-dorado (golpe de espada/hacha visto desde arriba).
   2. tajo_fuego: el mismo tajo con llamas naranjas (el hachazo del enano).
   3. onda_choque: anillo de onda expansiva visto desde arriba (golpe contra el suelo).
   4. grietas: el suelo agrietándose con luz naranja dentro (la Furia de Durin), vista cenital.
   5. polvo: nube de polvo y tierra que se levanta (cargas y saltos).
   6. escudo: burbuja/anillo de energía azul alrededor de un héroe, vista cenital (Escudo de Edoras).
   7. piedra: aura de roca y polvo gris alrededor de un héroe (Piedra de la Montaña).
   8. hojas: remolino de hojas doradas de Lórien (Paso élfico, Ráfaga).
   9. humo: bocanada de humo gris que oculta (el hobbit desapareciendo).
   10. suerte: destellos dorados y un trébol de luz (Suerte de Bolsón).
   11. estrellas: estrellitas girando en círculo (aturdido).
   12. estela_flecha: estela de luz verde para flechas y piedras lanzadas.

Pásamelo todo en un .zip llamado Pack_Vado_5.zip, con un nombre claro por archivo.
```

## Pack Vado 6 — selección de héroe, supersúbditos, encantamientos y botones de objetivo (15/11)
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos: Rohan contra Isengard junto al Vado del Isen, estilo League of Legends: Wild Rift, oscuro y medieval). Necesito cuatro cosas. Sin texto, sin marcas de agua.

A) RETRATOS GRANDES para la pantalla de elegir héroe (como el «splash» del Wild Rift): 4 imágenes verticales 768x1024, cuerpo entero en pose de batalla, fondo de su tierra:
   1. Jinete de Rohan con lanza y escudo verde con el caballo blanco, de fondo las llanuras de Rohan y Edoras.
   2. Enano de Erebor con hacha de doble filo y armadura de runas, de fondo la Montaña Solitaria.
   3. Arquero de Lórien con arco élfico y capa gris-verde, de fondo los mallorn dorados de Lothlórien.
   4. Hobbit de la Comarca con honda y espada corta, de fondo las colinas y agujeros redondos de la Comarca.
   (Son héroes originales del juego, no personajes concretos del libro.)

B) SUPERSÚBDITOS en 3D (.glb con el MISMO esqueleto y los mismos clips que «ballestero2» y «uruk» del Abismo: quieto, correr, atacar, morir): un guerrero de Rohan acorazado y enorme con mazo y escudo de la Marca, y un Uruk-hai de asalto de Isengard con armadura negra, la Mano Blanca pintada y una gran hacha. Más grandes y anchos que los súbditos normales.

C) 4 ICONOS redondos 256x256 de ENCANTAMIENTOS DE BOTAS (marco de metal y oro igual que los de habilidades), PNG transparente:
   1. Estasis: un héroe convertido en estatua de oro dentro de un reloj de arena.
   2. Gárgola: una gárgola de piedra de Isengard con la piel agrietada.
   3. Azogue: una gota de plata líquida con alas, rompiendo una cadena.
   4. Medallón: un medallón élfico de Lórien emitiendo un escudo de luz.

D) 2 BOTONES pequeños redondos 128x128 para junto al ataque, mismo marco: uno con una TORRE de piedra de Rohan (atacar torre) y otro con un pequeño orco con casco (atacar súbditos).

Pásamelo en un .zip llamado Pack_Vado_6.zip, con un nombre claro por archivo.
```

## Pack Vado 7 — reliquia de vida y fondo del menú (15/11)
**Dónde: ART** (chat normal de ChatGPT: son tres imágenes, no hace falta el modo agente).
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos, Rohan contra Isengard, estilo League of Legends: Wild Rift). Sin texto, sin marcas de agua.

A) RELIQUIA DE VIDA (como las del ARAM del Abismo de los Lamentos): hoja de animación 1024x1024 con 4x4 fotogramas de 256x256 sobre fondo transparente: un pan de lembas envuelto en una hoja de mallorn de Lothlórien flotando y girando despacio sobre un pequeño círculo de luz verde, en bucle.
B) FONDO DEL MENÚ, horizontal 1920x1080: el Vado del Isen al anochecer visto desde la orilla de Rohan, el río con piedras para vadear, estandartes de Rohan clavados en la orilla y a lo lejos Orthanc e Isengard con humo; la mitad izquierda más oscura y despejada (ahí va el retrato del héroe).
C) FONDO DE LA PANTALLA DE CARGA (VS), horizontal 1920x1080: mitad izquierda tonos verdes y dorados de Rohan, mitad derecha negro y rojo de Isengard con la Mano Blanca, fundidas en el centro por el río Isen.

Pásamelo en un .zip llamado Pack_Vado_7.zip.
```

## Pack Vado 8 — la espesura como la jungla del LoL: ICONOS (15/11)
**Dónde: ART** (chat normal; solo imágenes).
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos, Rohan contra Isengard junto al Vado del Isen, estilo League of Legends: Wild Rift). Todo PNG con fondo transparente, sin texto, sin marcas de agua, mismo marco redondo de metal y oro gastado que los iconos de habilidades que ya me hiciste.

A) 6 ICONOS DE BENDICIÓN de la espesura, 256x256:
   1. Brasa del troll (bendición roja): un puño de piedra envuelto en brasas y llamas.
   2. Savia del Huorn (bendición azul): una hoja de roble antiguo brillando en azul, raíces que se mueven.
   3. Furia del Uruk: un yelmo uruk-hai con la Mano Blanca y aura azul.
   4. Aliento de fuego (draco de fuego): una garra de draco entre llamas rojas.
   5. Aliento helado (draco frío de las Montañas Grises): un colmillo de hielo azul.
   6. Alma del draco (al cazar 3 dracos): un ojo de draco dorado dentro de un sol de runas.
B) 9 MARCAS DE MINIMAPA, 96x96, siluetas muy claras que se lean pequeñas: huargo, cuervo crebain, troll de piedra, huorn, uruk azul, draco, nutria del río, planta explosiva, flor de visión.
C) 3 ICONOS DE HECHIZOS 256x256: Destello (un destello dorado de luz élfica), Curar (una hoja de athelas brillando), Castigo (un relámpago cayendo sobre una garra de bestia).
D) 3 PLANTAS DE LA ESPESURA vistas desde arriba en 3/4, 512x512, para pintar en el suelo: «seta de humo» (una seta gorda que explota y lanza por los aires), «baya de los Entagüe» (un arbusto con bayas rojas que curan), «flor de elanor» (una flor dorada de Lothlórien que, al pisarla, deja ver alrededor).

Pásamelo en un .zip llamado Pack_Vado_8.zip, con un nombre claro por archivo.
```

## Pack Vado 9 — la espesura como la jungla del LoL: MODELOS 3D (15/11)
**Dónde: WORK** (modo agente: hay que descargar modelos CC0, comprobar sus animaciones y montar los .glb).
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos, Rohan contra Isengard, estilo Wild Rift, low-poly como KayKit/Quaternius). Necesito bestias nuevas para la espesura, en .glb con animaciones (mínimo: quieto, andar o correr, atacar y morir; si el modelo trae otros nombres, dime cuál es cuál en un LEEME). Busca y descarga modelos CC0 (Quaternius «Ultimate Monsters» / «Animated Animals», KayKit, Kenney…) y adáptalos con colores sobrios y oscuros, nada de colores de juguete:
   1. HUORN: un árbol antiguo que camina (el guardián de la bendición azul). Si no hay árbol animado, un golem de madera y raíces.
   2. CREBAIN: un cuervo grande negro de las Tierras Brunas (sale en bandada de 4-5, que vuelen o salten bajo).
   3. DRACO: un draco sin alas, reptil grande con cuernos (lo tiño yo en rojo fuego o azul hielo).
   4. NUTRIA DEL ISEN: un animal pequeño de río que huye (como el cangrejo del río del LoL).
   5. Opcional: un SAPO GIGANTE de las Ciénagas de los Muertos (como el Gromp).
Escala aproximada en metros: huorn 3,5 · crebain 0,8 · draco 3 · nutria 0,7 · sapo 1,6. Un .glb por bestia, con las licencias en un LICENCIAS.txt. Pásamelo en un .zip llamado Pack_Vado_9.zip.
```
