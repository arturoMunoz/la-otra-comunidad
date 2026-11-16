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

## Pack Vado 10 — rehacer dos bestias que no han quedado bien (15/11)
**Dónde: WORK** (modelos 3D animados).
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos, estilo Wild Rift, low-poly como KayKit/Quaternius). Del Pack 9, dos modelos no sirven y hay que rehacerlos, con el mismo formato (.glb, metros, +Y arriba, frente +Z, clips quieto/andar/atacar/morir, CON NORMALES y colores sobrios):
   1. HUORN: el «Walking Tree» de los monstruos monos parece una bola con ojos. Necesito un árbol antiguo y oscuro de los bosques de Fangorn que camina sobre sus raíces, tronco retorcido, ramas como brazos y copa pequeña, 3,5 m de alto, sin cara de dibujos animados. Si no hay uno CC0 animado, monta uno con el esqueleto de un humanoide de Quaternius o KayKit.
   2. DRACO: el triceratops no parece un draco. Necesito un draco sin alas de las Montañas Grises: reptil largo y bajo, cuello y cola largos, cabeza con cuernos hacia atrás y escamas, 4,5 m de largo. Puede salir del «Dragon» de Quaternius (Ultimate Monsters) quitándole las alas, o del cocodrilo/lagarto de Animated Animals con cuernos añadidos.
Pásamelo en un .zip llamado Pack_Vado_10.zip con LICENCIAS.txt.
```

## Pack Vado 11 — que las peleas se sientan como en el Wild Rift (15/11)
**Dónde: ART** (chat normal; solo imágenes).
```
Seguimos con «El Vado del Isen» (El Señor de los Anillos, Rohan contra Isengard junto al Vado del Isen, estilo League of Legends: Wild Rift, oscuro y medieval). Todo PNG con fondo transparente, sin texto, sin marcas de agua.

A) EFECTOS en hojas de animación de 1024x1024 con 4x4 fotogramas (16 de 256x256, de izquierda a derecha y de arriba abajo, del principio al final), brillantes y legibles desde arriba como en el Wild Rift:
   1. impacto_espada: chispazo blanco-dorado de un golpe de espada de Rohan (el golpe normal, rápido y seco).
   2. impacto_critico: el mismo, más grande, con estallido rojo-dorado (golpe crítico).
   3. muerte_subdito: el soldado cae y se deshace en polvo y ceniza (orco de Isengard o soldado de Rohan).
   4. subir_nivel: columna de luz dorada que sube desde el suelo con runas élficas girando (como el «level up» del Wild Rift).
   5. volver_base: círculo azul de runas de Edoras en el suelo que se llena de luz (la vuelta a la fuente), visto desde arriba, para repetirlo en bucle.
   6. oro: un puñado de monedas de oro de la Marca que saltan y brillan (al rematar a un súbdito).
B) INTERFAZ de partida, mismo marco de metal y oro gastado que los iconos de habilidades:
   1. marco_retrato: retrato redondo 512x512 hueco en el centro con un anillo para el nivel abajo (la esquina de arriba a la izquierda del Wild Rift).
   2. aro_habilidad: aro de botón de habilidad 256x256 hueco en el centro, en dos versiones (normal y «lista», con brillo dorado).
   3. cartel_baja: cartel horizontal 1024x256 con DOS huecos redondos para retratos (el que mata a la izquierda, el que cae a la derecha) y una espada cruzada en medio; en versión azul (mi equipo) y roja (enemigo).
   4. cartel_victoria y cartel_derrota: adornos horizontales 1024x384 (estandarte del caballo blanco de Rohan dorado / estandarte de Rohan roto y quemado) con espacio libre en el centro para escribir yo la palabra.
C) MENÚ PRINCIPAL (que parezca el del Wild Rift pero de Rohan):
   1. boton_jugar: botón grande 1200x300, placa de oro y madera tallada de Meduseld (Edoras) con caballos de Rohan en las esquinas, centro liso y oscuro para el texto; dos versiones: normal y pulsado (más hundido y con brillo).
   2. boton_secundario: igual de estilo pero más sencillo y oscuro, 900x240 (para «Crear sala», «Unirse», «Volver»).
   3. carta_duelo y carta_batalla: tarjetas 600x360 con ilustración de fondo y la parte de abajo oscura para el texto: el duelo en un puente de piedra sobre el Abismo de Helm al atardecer; la batalla en el Vado del Isen con el río, las islas y Orthanc al fondo. Una tercera versión de marco dorado brillante para la elegida (solo el marco, hueco).
   4. boton_redondo: botón redondo 256x256 de hierro y oro, hueco en el centro (volver, ajustes).

D) ARMERÍA (la tienda, como la del Wild Rift):
   1. iconos de pestaña 256x256, mismo marco: «Recomendado» (estrella dorada sobre un escudo de Rohan), «Ataque» (espada y hacha cruzadas), «Defensa» (escudo redondo de Rohan), «Movilidad» (bota con espuela y viento), «Encantamientos» (runa brillante sobre una bota).
   2. fondo_armeria: 1600x900, el interior de la armería de Meduseld en Edoras (armeros de madera tallada, escudos colgados, luz cálida de braseros), oscuro y desenfocado para poner encima la tienda.
Pásamelo todo en un .zip llamado Pack_Vado_11.zip, con un nombre claro por archivo.
```

## Pack Vado 12 — héroes bonitos al estilo Supercell (15/11)
ChatGPT no modela bien personajes 3D con esqueleto. El camino que funciona: ChatGPT dibuja la ficha (ART) → Meshy la convierte en 3D, la rigea y la anima (lo hace Henar o Arturo en meshy.ai, en el navegador) → Claude la mete en el juego.

**Paso 1 · ART** (una imagen por héroe; empezar por uno para probar):
```
Personaje para un juego de móvil al estilo de Brawl Stars y Clash Royale (Supercell): proporciones chibi gordotas (cabeza grande, manos y pies grandes, cuerpo corto), colores vivos y limpios, formas simples y redondeadas, materiales mates estilo dibujo animado.
Personaje: [JINETE DE ROHAN: guerrero de los Rohirrim de El Señor de los Anillos, yelmo con crin de caballo, cota de escamas, capa verde con el caballo blanco de Rohan, espada y escudo redondo]
[ENANO DE EREBOR: enano de la Montaña Solitaria, barba trenzada pelirroja enorme, armadura de placas con runas, hacha de dos manos]
[ARQUERO DE LÓRIEN: elfo de Lothlórien, pelo rubio largo, capa gris-verde élfica con broche de hoja, arco largo, carcaj]
[HOBBIT DE LA COMARCA: hobbit de Hobbiton, pies grandes y peludos descalzos, chaleco amarillo, pañuelo, honda y bolsa de piedras]
Requisitos técnicos para pasarlo a 3D: UN solo personaje, de cuerpo entero, de frente, en pose A (brazos separados del cuerpo unos 30°, piernas un poco abiertas), las armas sujetas en la mano sin tapar el cuerpo, fondo blanco liso, luz plana sin sombras, sin texto, imagen 1024x1024.
```
**Paso 2 · en meshy.ai** (no es ChatGPT): «Image to 3D» con la imagen → «Animate» (el rigging y las animaciones de su biblioteca son gratis) → exportar .glb con estas animaciones: quieto, correr, atacar, atacar_2, golpe_cargado (habilidad), recibir_golpe, aturdido, morir. Ponerle a cada clip ese nombre si deja; si no, me lo mandas tal cual y los renombro yo.
**Paso 3**: me pasas el .glb y la imagen. Si el primero queda bien, se hacen los otros tres y después los súbditos de Rohan e Isengard.
Ojo: el plan gratis de Meshy da pocos créditos al mes (una generación completa son unos 30); para los 4 héroes y los súbditos probablemente haga falta un mes de pago.

## Pack Vado 14 — el mapa con las Dos Torres y el Ojo (16/11)
**Dónde: WORK** (modelos 3D). Adjuntar `public/batalla/modelos/vado_torres.glb` y `vado_nexos.glb` como referencia de tamaño y de nombres.
```
Juego de móvil «La Brecha» (El Señor de los Anillos: Rohan contra Isengard junto al Vado del Isen; mecánicas de League of Legends: Wild Rift, estilo low-poly colorido tipo Supercell/KayKit). Te adjunto vado_torres.glb y vado_nexos.glb: los nuevos tienen que sustituirlos con EXACTAMENTE los mismos nombres de objeto, el mismo tamaño aproximado y el mismo formato (.glb, 1 unidad = 1 metro, +Y arriba, frente +Z, el pie de cada objeto en y=0, con normales, sin texturas externas, colores en los materiales, menos de 400 KB por archivo).
1. vado_torres.glb — LAS DOS TORRES, en tres estados cada una (_1 entera, _2 dañada con grietas y piedras caídas, _3 en ruinas solo con la base):
   · torre_isengard_1/2/3: una Orthanc en pequeño, la torre negra de Isengard de El Señor de los Anillos: roca negra pulida de una sola pieza, cuatro aristas que suben y se abren arriba en cuatro cuernos afilados, ventanas con luz anaranjada, y en la base escaleras y la Mano Blanca de Saruman. Unos 7 m.
   · torre_rohan_1/2/3: la Torre del Cuerno de Cuernavilla (el Abismo de Helm): torre redonda de piedra clara con almenas, tejadillo de madera, estandarte verde con el caballo blanco de Rohan, braseros. Unos 7 m.
2. vado_nexos.glb — los estandartes de cada base:
   · nexo_rohan: el estandarte de Edoras sobre un estrado de madera tallada con caballos (como el tejado de oro de Meduseld), mástil alto y la tela verde con el caballo blanco.
   · nexo_isengard: el estandarte de la Mano Blanca sobre un estrado de hierro negro con engranajes y cadenas de las forjas de Isengard.
3. palantir.glb (nuevo, va junto al estandarte de Isengard): el palantír de Orthanc, una esfera de cristal oscuro de 1,2 m sobre un pedestal de hierro negro con garras, y dentro el Ojo: un óvalo de fuego con la pupila vertical, como objeto separado llamado «ojo» con material emisivo naranja-rojo, para hacerlo latir y mirar a los jugadores por código. Unos 2,5 m en total.
Pásamelo en Pack_Vado_14.zip con LICENCIAS.txt.
```
Por qué el palantír y no Barad-dûr de fondo: con la cámara desde arriba del juego, una torre lejana no se vería nunca; el palantír está dentro del mapa y además es fiel al libro (Saruman habla con Sauron por el palantír de Orthanc). Ojo con la regla del proyecto: el Ojo es Sauron, y la regla dice que no se dibujan personajes del libro; aquí es solo un ojo de fuego dentro de una piedra. Si preferís no saltaros la regla, se quita el punto 3.

## Pack Vado 15 — icono y pantalla de carga de la app de La Brecha (16/11)
**Dónde: ART**.
```
Juego de móvil «La Brecha» (El Señor de los Anillos: Rohan contra Isengard junto al Vado del Isen; aspecto como los juegos de Supercell: colores vivos, formas claras, metal y oro gastado). Necesito la imagen de la app para Android. Sin texto, sin marcas de agua.
1. icono_app: 1024x1024, cuadrado, fondo de color (no transparente): el escudo redondo de Rohan con el caballo blanco, partido en diagonal por una grieta de luz dorada (la brecha), y detrás la Mano Blanca de Isengard en sombra. Que se lea bien en pequeño (48 px): pocas formas y grandes, contorno grueso, nada pegado a los bordes (deja un 15 % de margen porque Android lo recorta en círculo).
2. carga_app: 1920x1080 horizontal, pantalla de carga: la muralla del Abismo de Helm al atardecer con una brecha abierta en el muro, humo y antorchas, estandartes verdes de Rohan a un lado y la Mano Blanca al otro; el centro más oscuro y despejado para poner encima el título y la barra de carga.
Pásamelo en Pack_Vado_15.zip.
```

## Pack Vado 12b — héroes rehechos por ChatGPT (16/11, sustituye al paso de Meshy: «todo lo tiene que hacer el ChatGPT»)
**Dónde: WORK.** Adjuntar `public/abismo/modelos/rohan_kk.glb` + `tools/vado/pack13/fichas/E_01_ficha_jinete_de_Rohan.png` (empezar por uno; si sale bien, lo mismo con enano/elfo/hobbit y su ficha).
Ver el prompt en la respuesta del 16/11 (copiado abajo).

## Pack Vado 16 — almenara (16/11)
**Dónde: ART**.
```
Juego de móvil «La Brecha» (El Señor de los Anillos: Rohan contra Isengard junto al Vado del Isen; aspecto de Supercell: colores vivos, formas claras, metal y oro gastado). Necesito el icono del botón «Almenara»: una de las almenaras de Gondor/Rohan de El Señor de los Anillos en pequeño, un montón de leña con fuego encendido sobre un pie de piedra, vista de frente, dentro de un medallón redondo de bronce con borde dorado (mismo estilo que los botones de habilidades del juego). 512x512, fondo transparente, sin texto. Y una segunda versión igual pero apagada (leña sin fuego, colores grises) para cuando no quedan cargas.
Pásamelo en Pack_Vado_16.zip (almenara.png, almenara_apagada.png).
```

## Pack Vado 18 — 4 héroes nuevos (16/11, pedido de Arturo: mago, orco, uruk y una criatura de las cuevas; cada uno calcado de un campeón del LoL)
Ver el chat del 16/11. ART = retratos grandes, iconos de habilidades y botón de ataque; WORK = modelos 3D con el mismo esqueleto y clips de los KayKit.

## Pack Vado 19 · ART (16/11) — marcas de apuntado propias de cada héroe (como los indicadores del Wild Rift)
```
Juego de móvil «La Brecha» (El Señor de los Anillos: Rohan contra Isengard junto al Vado del Isen; aspecto de League of Legends: Wild Rift). Te adjunto las marcas de apuntado que usamos ahora (ind_flecha, ind_cono, ind_area, ind_alcance): son blancas y genéricas. Quiero que cada héroe tenga las suyas, con su material y su color, como en el Wild Rift cada campeón tiene su propio indicador. Vista cenital (se pintan planas en el suelo), sobre fondo TRANSPARENTE (PNG RGBA), semitransparentes por dentro y con el borde más marcado, sin texto, sin sombras, sin perspectiva. Respeta EXACTAMENTE la forma y el encuadre de las adjuntas: la flecha apunta a la derecha y ocupa todo el ancho; el cono abre hacia arriba con la punta en el centro de la parte de abajo; el círculo centrado ocupando todo. 512x512 cada una (la flecha 1024x256). Todo en Pack_Vado_19_ART.zip.
Héroes y estilo:
- rohan (Jinete de Rohan): verde y oro de Rohan, con caballos y crines estilizados en el borde. Q flecha (embestida), E círculo (grito), R flecha ancha (carga de los Rohirrim, con huellas de cascos).
- enano (Enano de Erebor): piedra y runas enanas color fuego. Q cono (hachazo), E círculo (salto), R círculo (Furia de Durin, grietas).
- elfo (Arquero de Lórien): plata y hojas de mallorn, verde claro. Q flecha (flecha de Lórien), E flecha corta (paso élfico), R círculo (lluvia de flechas).
- hobbit (Hobbit de la Comarca): madera y cuerda, tonos tierra y verde de la Comarca. Q flecha (piedra de honda), E cono (puñado de piedras).
- gandalf (Gandalf el Gris): luz blanca y dorada, runas élficas brillantes. Q flecha (luz que ata), E círculo (esfera de luz), R flecha muy larga y ancha (¡No puedes pasar!).
- orco (Orco de Mordor): hierro oxidado, rojo brasa, Ojo de Sauron estilizado. W cono (golpe que aplasta), E flecha con eslabones de cadena (cadena de Mordor), R círculo pequeño (guillotina).
- Para cada héroe, además, ind_<id>_alcance: el aro de alcance a su estilo.
Nombres: ind_<id>_<tecla>.png (ej. ind_gandalf_q.png) e ind_<id>_alcance.png. (<id> = rohan, enano, elfo, hobbit, gandalf, orco)
```


## Pack Vado 22 · ART (16/11): botella de maná fucsia y marco de la barra de vida

```
Juego de móvil «La Brecha» (El Señor de los Anillos: Rohan contra Isengard junto al Vado del Isen). Estilo: Supercell oscuro (Clash Royale / Brawl Stars: formas gordas y redondeadas, contorno oscuro grueso, brillos limpios) con hierro negro forjado y oro viejo de Rohan e Isengard. Tres imágenes sueltas, todas con FONDO TRANSPARENTE de verdad, sin texto, vistas DE FRENTE y centradas:

1. mana_vacia.png (768x1024): un frasquito de cristal VACÍO, panzudo, con tapón de corcho y herrajes de hierro negro y oro (un nudo de Rohan en el cuello). Cristal oscuro casi transparente con un reflejo blanco a la izquierda. Ocupa casi toda la altura.

2. mana_llena.png (768x1024): EL MISMO frasco exacto, mismo tamaño, misma posición y mismo encuadre (tienen que encajar uno encima del otro), pero LLENO hasta el cuello de un líquido ROSA FUCSIA espeso y brillante, como miel luminosa: remolinos más claros, burbujas lentas, destellos y un resplandor fucsia que sale del cristal. Recuerda a la luz de la redoma de Galadriel, pero en fucsia.

3. vida_marco.png (1024x192): marco horizontal para una barra de vida: hierro negro forjado con filo de oro viejo, remaches y una cabeza de caballo de Rohan pequeña en cada extremo. El HUECO del centro (donde va la barra) completamente transparente y recto, de unos 880x90 px.
```


## Pack Vado 24 · héroe «Gollum» = Rastrero de las Ciénagas (arte ORIGINAL; ChatGPT rechazó dibujar a Gollum)

### ART
```
Juego de móvil «La Brecha» (fantasía de la Tierra Media: Rohan contra Isengard junto al Vado del Isen; estilo League of Legends: Wild Rift con toque Supercell oscuro). Héroe nuevo y ORIGINAL: el RASTRERO DE LAS CIÉNAGAS, una criatura de pantano inventada: cuerpo enjuto y encorvado de color verde musgo con manchas de líquen, barba y hombros cubiertos de algas colgantes, dos ojos grandes de farol verde que brillan, orejas puntiagudas como hojas de nenúfar, un anzuelo de hueso en una mano y una cuerda trenzada de juncos al cinto. Se mueve agazapado. Mismo estilo exacto que los archivos que adjunto (splash_orco, r_orco, at_orco y h_orco_q). Todo con FONDO TRANSPARENTE de verdad salvo el retrato grande, sin texto:

1. splash_gollum.png (1024x1536): cuerpo entero, agazapado sobre un tronco podrido en una ciénaga con niebla y fuegos fatuos (este SÍ lleva fondo).
2. r_gollum.png (512x512): su cara en medallón redondo, mismo marco que r_orco.
3. at_gollum.png (512x512): botón de ataque básico: el anzuelo de hueso, mismo marco que at_orco.
4. Cuatro iconos de habilidad (512x512 cada uno, mismo marco que h_orco_q):
   h_gollum_q «Mordisco»: la criatura saltando con las garras por delante.
   h_gollum_w «¡Mi tesoro!»: una piedra verde que brilla entre sus dedos.
   h_gollum_e «Cuerda élfica»: la cuerda de juncos lanzada en lazo.
   h_gollum_r «Sombras de Moria»: dos ojos verdes brillando en la niebla oscura.
```

### WORK (después del ART: adjuntar el splash)
```
Juego «La Brecha» (Three.js, móvil). Necesito el modelo 3D de un héroe ORIGINAL, el RASTRERO DE LAS CIÉNAGAS, para que lo mueva el mismo esqueleto que los héroes KayKit Adventurers que ya uso (adjunto hobbit_kk.glb como referencia de huesos, escala y nombres de clips). Te adjunto también su retrato (splash_gollum.png) para que se parezca.

- gollum.glb: low-poly estilo KayKit (formas simples, colores planos): criatura de pantano enjuta y encorvada, verde musgo con manchas de líquen, algas colgando de hombros y barbilla, ojos grandes verdes brillantes (material emisivo), orejas como hojas de nenúfar, anzuelo de hueso en la mano derecha. Altura 1,4 m, mirando a +Z.
- Mismo esqueleto y MISMOS NOMBRES de huesos que hobbit_kk.glb (head, chest, handslot.l, handslot.r…).
- Clips con estos nombres exactos: quieto, andar, correr, atacar, atacar_2, atacar_3, esquivar, celebrar, morir. Movimientos de criatura agazapada.
- Un solo atlas de textura de 1024 o menos. Máximo 2 MB.
- Solo recursos CC0 si usas de otros, con LICENCIAS.txt.
Devuélvelo en un zip con gollum.glb y LICENCIAS.txt.
```
