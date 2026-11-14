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
