# La Autopista (nombre provisional) — pedidos a ChatGPT

Versión de La Brecha SIN Tolkien ni marcas (17/11/2026): mismas mecánicas, 6 héroes originales, escenario de autopista.
Se genera desde La Brecha con `python3 tools/vado/hace_autopista.py` → `public/batalla/autopista.html` + `autopista.js`.
Mientras no llegue esto, los héroes usan el arte y los modelos de La Brecha (provisionales).

En estos prompts NO se nombra a ningún libro, película, juego ni marca: todo es original
(ChatGPT se niega a dibujar personajes de terceros). Brask está INSPIRADO en un general de armadura viva de luz,
pero sin nombres ni diseños oficiales. Su luz es BLANCA AZULADA; la de Aurel, DORADA, para que no se confundan.

## Pack Autopista 1 · ART (chat normal de ChatGPT, no gasta tokens)

Adjunta `public/batalla/ui/splash_rohan.webp` como referencia de ESTILO (solo el estilo, no el contenido).

```
Juego de móvil «La Autopista» (héroes originales, sin referencias a libros, películas, juegos ni marcas) · ART
Mismo estilo de ilustración que la imagen adjunta: pintura digital de fantasía, contornos marcados, luz dramática, colores saturados sobre fondo oscuro. Sin texto, sin logos, sin marcos.

RETRATOS GRANDES (768x1024, vertical, de rodillas para arriba, el héroe en el centro; fondo: autopista desierta al anochecer, asfalto agrietado, quitamiedos, farolas, cielo naranja y morado):
1. ap_splash_brask.png «Brask, el Coronel» (tanque): general veterano de unos 55 años, enorme y ancho, pelo gris muy corto, mandíbula cuadrada, mirada dura y cansada. Lleva una armadura completa de placas gruesas y sin costuras, gris pizarra, que parece viva: por las juntas y las grietas sale luz BLANCA AZULADA, y en el pecho tiene engastadas gemas que brillan. Sostiene un espadón gigantesco de hoja ancha y lisa, casi tan alto como él. Vapor de luz saliendo de la armadura. Pose firme, como un muro.
2. ap_splash_aurel.png «Aurel, Caballero de Luz» (soporte): caballero joven y sereno, túnica larga marrón con capucha sobre armadura ligera blanca y plateada. Empuña una espada cuya hoja es un cristal de luz DORADA (guarda en forma de alas, empuñadura de plata). Halo suave de luz dorada alrededor.
3. ap_splash_ata.png «Ata, la Francotiradora» (tirador): mujer de unos 30 años, pelo oscuro recogido en trenza, chaqueta táctica gris con detalles naranja, visor monocular en un ojo, rifle de francotirador largo y genérico apoyado en el hombro. Mirada fría.
4. ap_splash_birdie.png «Birdie, el Golfista» (tirador): golfista joven y chulo, polo de rombos verde y blanco, pantalón beige, gorra blanca, guante en una mano. Palo de golf al hombro y bolsa de palos a la espalda. Una bola de golf brillante botando en su otra mano. Sonrisa de suficiencia.
5. ap_splash_fu.png «Fu, el Ninja» (asesino): ninja completamente calvo, cabeza rapada brillante, traje negro con cinturón y vendas rojas, máscara que tapa nariz y boca, manos vendadas. Lleva una kusarigama (hoz con cadena larga) girando. Pose agachada, a punto de saltar. Humo a su alrededor.
6. ap_splash_moha.png «Moha, el Halcón del Atlas» (asesino): hombre marroquí de unos 30 años, barba corta cuidada, mirada intensa. Chilaba de lana azul noche con capucha y bordados geométricos dorados en los bordes, botas de cuero, cinturón ancho. Empuña una gumía (daga curva) con funda de plata labrada. Un halcón posado en su hombro. Arena levantándose a sus pies. Elegante y digno.

RETRATOS REDONDOS (256x256, PNG con fondo transparente, cara y hombros de cada héroe dentro de un círculo, mismo estilo):
7. ap_r_brask.png  8. ap_r_aurel.png  9. ap_r_ata.png  10. ap_r_birdie.png  11. ap_r_fu.png  12. ap_r_moha.png

MENÚ:
13. ap_carta_duelo.png (600x360, PNG): tarjeta del modo Duelo: un tramo recto de autopista al anochecer visto en diagonal desde arriba, un peaje con luces azules en un extremo y otro con luces rojas en el otro, torres de vigilancia junto a la calzada.
14. ap_fondo_menu.png (1600x900): fondo del menú: autopista desierta y épica al anochecer, coches abandonados, señales caídas, farolas parpadeando, un peaje con luces azules a lo lejos. Zona izquierda más oscura y despejada (ahí va el retrato del héroe).

Entrégalo todo en un zip: Pack_Autopista_1_ART.zip
```

## Pack Autopista 2 · WORK (modo agente: gasta tokens). Hacer DESPUÉS del ART

Adjunta los 6 modelos que sustituyen (de `public/batalla/modelos_l/` o `public/abismo/modelos/`):
`enano_kk.glb`, `gandalf_kk.glb`, `elfo_kk.glb`, `hobbit_kk.glb`, `gollum.glb`, `rohan_kk.glb`, y los retratos del Pack 1 como referencia.

```
Juego de móvil «La Autopista» · WORK (modelos 3D)
Adjunto 6 modelos .glb con esqueleto y animaciones, y los retratos de los héroes. Necesito 6 personajes NUEVOS que se parezcan a sus retratos y usen EXACTAMENTE el mismo esqueleto (mismos nombres de huesos), las mismas animaciones con los mismos nombres de clip y la misma escala que el modelo que sustituyen. Estilo low poly, colores planos y vivos (como KayKit), originales, sin referencias a libros, películas, juegos ni marcas.

1. ap_brask.glb (sobre enano_kk.glb): general enorme, armadura completa de placas gruesas gris pizarra con grietas y juntas de material emisivo blanco azulado y gemas brillantes en el pecho; espadón gigantesco de hoja ancha en las manos.
2. ap_aurel.glb (sobre gandalf_kk.glb): caballero con túnica marrón con capucha sobre armadura blanca; espada con hoja de cristal dorado (material emisivo).
3. ap_ata.glb (sobre elfo_kk.glb): francotiradora con chaqueta táctica gris y naranja, trenza, rifle largo en las manos.
4. ap_birdie.glb (sobre hobbit_kk.glb): golfista con polo de rombos verde y blanco, gorra blanca, palo de golf en la mano derecha, bolsa de palos a la espalda.
5. ap_fu.glb (sobre gollum.glb): ninja calvo, traje negro con vendas rojas, máscara en nariz y boca, kusarigama en la mano.
6. ap_moha.glb (sobre rohan_kk.glb): hombre con chilaba azul noche con capucha y bordados dorados geométricos, botas de cuero y gumía (daga curva) en la mano derecha.

ESCENARIO (descárgalo de internet, SOLO licencia CC0, por ejemplo Kenney «Car Kit», «City Kit (Roads)» y «Racing Kit»), en .glb:
7. ap_tramo_recto.glb (calzada de 2 carriles con líneas pintadas), ap_quitamiedos.glb, ap_farola.glb, ap_cono.glb, ap_senal.glb, ap_valla.glb, ap_coche_1.glb, ap_coche_2.glb, ap_coche_3.glb (abandonados), ap_camion.glb, ap_peaje.glb (cabina de peaje: será la base de cada equipo).
Incluye un LICENCIAS.txt con el origen y la licencia de cada modelo descargado.

Entrégalo todo en un zip: Pack_Autopista_2_WORK.zip
```


## 17/11 · Reparto de 7 (sustituye a lo de arriba donde choque)
Brask = caballero de luz (su arte del Pack 1 vale). Aurel sale. Nuevos: el mago (kit `gandalf`) y el maestro jedi (kit `orco`, sobre esqueleto bajo).
Ata, Birdie, Fu y Moha: arte del Pack 1 / Tanda 2 vale.

### Pack Autopista 3 · ART
(ver el bloque en el chat del 17/11: ap_splash_vael, ap_splash_grub, ap_r_vael, ap_r_grub)

### Pack Autopista 2 · WORK (REHECHO, 7 héroes)
(ver el bloque en el chat del 17/11)

## 17/11 · Prompts ART reescritos en la cuenta nueva (los del 8-25 se quedaron en el chat viejo)
Todos en el MISMO chat de ChatGPT del Pack 22 (adjuntar `tools/autopista/pack22/hoja_estilo.png` si es un chat nuevo).
Los textos completos están en el mensaje del 17/11 de la sesión nueva; resumen de nombres de archivo:
- Pack 18 A (Brask, Vael, Grub, Ata) y 18 B (Birdie, Fu, Moha): `ap_ind_<clave>_<q|w|e|r|alcance>.png` (líneas 1024x256 hacia la derecha, conos y círculos 512x512).
- Pack 24: `ap_pr_<bola|brasa|energia|bala|hoz>.png` (512x512) y `ap_ind_<clave>_basico.png` (1024x256).
- Pack 25: `ap_fx_<clave>_<efecto>.png`, hojas 4x4 de 2048x2048, 2 por héroe.
- Pack 9: `ap_guia.png` (retrato redondo del guía, 1024x1024) y `ap_crear_sala.png` (icono 512x512).

## 17/11 · Pack Autopista 26 · WORK — sonidos
CC0 (Kenney Sci-Fi/Impact/Interface/Digital Audio, OpenGameArt CC0, Freesound CC0) y música CC0 o Pixabay. Zip `fx/` con los MISMOS nombres que `public/abismo/sonidos/fx` (golpe_carne, espada_armadura, espada_corte, disparo_arco, flecha_clavada, muerte_orco ×6, subir_nivel, recoger_moneda, cuerno_lejano, explosion_piedras, explosion_fuego, rafaga_viento, rayo_magico, derrumbe_muro, grito_guerra_orco, madera_rota, abrir_cofre, recoger_gema) _1.._3 pero con sonido moderno, + clic, + `ap_fusil/golf/llama/energia/luz/cadena/arena`; `mus/` menu, batalla, victoria, derrota; `amb/trafico_puente.mp3`; CREDITOS_audio.txt.
Voz (ElevenLabs): primera «¡Primera sangre!», doble «¡Doble derribo!», triple «¡Triple derribo!», racha «¡Está en racha!», imparable «¡Imparable!», leyenda «¡Leyenda!», cortada «Racha cortada.», aniquilacion «¡Aniquilación!», torre_enemiga «Torre enemiga destruida.», torre_nuestra «Hemos perdido una torre.», hordas «¡Los soldados están en camino!», victoria «Victoria.», derrota «Derrota.»

## 17/11 · WORK pendientes, por orden de importancia
Cada uno en el MODO AGENTE de ChatGPT. Adjuntar los archivos de referencia que dice cada prompt (están en el repo).

### 1 · Pack Autopista 8 · WORK — torres, nexos y fuentes
Adjuntar: `public/batalla/modelos/vado_torres.glb`, `vado_nexos.glb`, `vado_fuentes.glb` (referencia de tamaño y nombres) y `public/batalla/ui/ap_fondo_vs.webp` (estilo).

```
Pack Autopista 8 · WORK (modo agente)

Juego de móvil «A-6»: duelo 1 contra 1 estilo League of Legends: Wild Rift, en una autopista abandonada al atardecer. Dos bandos: AZUL y ROJO. Estilo: realista estilizado, serio, algo cyberpunk (metal gastado, hormigón, neón del color del bando). Nada infantil ni de juguete.

Te adjunto vado_torres.glb, vado_nexos.glb y vado_fuentes.glb: son las piezas actuales (medievales). Hay que SUSTITUIRLAS con los MISMOS nombres de nodo, el mismo tamaño aproximado (mide sus cajas) y el mismo origen (centro de la base en el suelo, y=0, frente hacia +Z).

1. ap_estructuras.glb con estos nodos raíz:
 - torre_azul_1, torre_azul_2, torre_azul_3 y torre_roja_1, torre_roja_2, torre_roja_3: TORRE DE DEFENSA = torreta de control de peaje / torre de vigilancia de hormigón y acero con un cañón o lanzador arriba y focos. Estado 1 entera, 2 dañada (grietas, chapa doblada, un foco roto), 3 en ruinas (solo la base y hierros). Neón azul o rojo según bando.
 - nexo_azul y nexo_rojo: NEXO = cabina central de peaje con marquesina y un núcleo de energía brillante del color del bando (el objetivo final de la partida). Más grande que la torre.
 - fuente_azul y fuente_roja: FUENTE (donde se cura y reaparece el jugador) = plataforma circular de hormigón con un anillo de luz en el suelo y un poste de carga/surtidor futurista.
2. Límite por pieza: 4.000 triángulos (torre), 6.000 (nexo), 3.000 (fuente). Un solo material por pieza si se puede, con textura atlas de 1024 px en WebP o PNG. Sin animaciones, sin luces, sin cámaras.
3. Escala en metros: misma altura que la pieza equivalente que te adjunto (±10 %).
4. Recursos CC0 (Kenney, Quaternius, Poly Haven) si te sirven de base; incluye LICENCIAS.txt con lo usado.
5. Entrega: Pack_Autopista_8_WORK.zip con ap_estructuras.glb, una captura PNG de las 12 piezas en fila y LICENCIAS.txt.
```

### 2 · Pack Autopista 14 · WORK — súbditos modernos
Adjuntar: `public/abismo/modelos/ballestero2.glb`, `arquero_rohan2.glb`, `uruk.glb`, `q_arquero.glb`, `public/batalla/modelos/super_rohan.glb`, `super_isengard.glb`.

```
Pack Autopista 14 · WORK (modo agente)

Juego de móvil «A-6» (duelo estilo Wild Rift en una autopista). Necesito los SÚBDITOS (soldados que avanzan solos por el carril) de los dos bandos, AZUL y ROJO, en estilo serio y moderno: equipo antidisturbios, chalecos reflectantes, cascos con visera, mono de operario de autopista. Nada medieval, nada infantil.

Te adjunto los 6 modelos que se usan ahora. Cada modelo nuevo debe usar EXACTAMENTE el mismo esqueleto (mismos nombres de huesos y jerarquía) y los MISMOS clips con los mismos nombres que el que sustituye, porque el código los llama por nombre:
 - ap_sub_azul_m.glb ← ballestero2.glb (cuerpo a cuerpo azul: porra y escudo antidisturbios). Clips: apuntar, morir, recibir_golpe, quieto, disparar, cargar, correr, andar.
 - ap_sub_azul_r.glb ← arquero_rohan2.glb (a distancia azul: lanzador de bengalas / rifle de clavos). Clips: apuntar, cargar, disparar, morir, recibir_golpe, quieto, correr, andar.
 - ap_sub_rojo_m.glb ← uruk.glb (cuerpo a cuerpo rojo: llave inglesa grande y careta). Mismos 14 clips del uruk.
 - ap_sub_rojo_r.glb ← q_arquero.glb (a distancia rojo: ballesta de chatarra). Mismos clips.
 - ap_super_azul.glb ← super_rohan.glb y ap_super_rojo.glb ← super_isengard.glb (SUPERSÚBDITO: grande y blindado, con exoesqueleto de obra y martillo hidráulico). Mismos clips.
Reglas:
1. Misma altura que el que sustituye (mide la caja) y mismo origen (pies en y=0, mirando a +Z).
2. Máximo 3.000 triángulos los normales y 5.000 los súper. Un material con textura de 512 px (1024 los súper). El color del bando debe leerse desde lejos (franjas reflectantes azules o rojas).
3. No toques los clips: solo cambia la malla y el pesado (skin) sobre el mismo esqueleto. Comprueba en Blender que cada clip se reproduce sin deformaciones.
4. Recursos CC0 (Quaternius, Kenney) si te sirven; LICENCIAS.txt.
5. Entrega: Pack_Autopista_14_WORK.zip con los 6 .glb, un GIF o captura de cada uno andando y LICENCIAS.txt.
```

### 3 · Pack Autopista 16 · WORK — barranco y pilas del puente
Adjuntar: `public/batalla/texturas/ap_barranco.webp`, `ap_pared_roca.webp` y una captura del puente en partida.

```
Pack Autopista 16 · WORK (modo agente)

Juego de móvil «A-6»: la partida se juega sobre un PUENTE de autopista de hormigón que cruza un barranco con un río 24 m más abajo. Ahora las pilas son cajas grises y el fondo del barranco está vacío. Estilo realista estilizado, atardecer, serio.

1. ap_pila.glb: pila de puente de autopista de hormigón (fuste con cabezal en T, manchas de humedad, juntas, algún hierro a la vista). 24 m de alto, unos 3 m de ancho, origen en la base (y=0). Máx. 2.000 triángulos.
2. ap_estribo.glb: estribo donde el puente toca tierra (muro de hormigón con aletas). 14 m de ancho, 8 m de alto. Máx. 2.000 triángulos.
3. ap_barranco_props.glb con varios nodos sueltos y nombres claros: 4 rocas grandes (roca_1..4), 3 árboles de ribera (arbol_1..3, 6-10 m), 3 arbustos (arbusto_1..3), 2 troncos caídos (tronco_1..2), 2 matas de juncos (juncos_1..2), 1 carro de supermercado oxidado y 1 neumático (basura_1..2). Cada uno con el origen en su base. Máx. 1.500 triángulos por pieza.
4. Todo con un único atlas de textura de 1024 px (WebP o PNG), sin luces ni cámaras. Recursos CC0 (Quaternius, Kenney, Poly Haven); LICENCIAS.txt.
5. Entrega: Pack_Autopista_16_WORK.zip con los 3 .glb, una captura de cada uno y LICENCIAS.txt.
```

### 4 · Pack Autopista 10 · WORK — decorado del borde de la autopista
Adjuntar: `public/batalla/ui/ap_fondo_menu.webp` (estilo) y una captura de partida.

```
Pack Autopista 10 · WORK (modo agente)

Juego de móvil «A-6»: autopista española abandonada al atardecer (piensa en la A-6 saliendo de Madrid hacia la sierra). Necesito decorado para los bordes de la calzada, estilo realista estilizado y serio.

ap_borde.glb con nodos sueltos (origen en la base, y=0, frente a +Z, metros reales):
 - muro_antirruido (tramo de 6 m de largo, 4 m de alto, paneles metálicos y de metacrilato sucio)
 - new_jersey (barrera de hormigón, tramo de 4 m)
 - talud (rampa de tierra con piedras, 8×4 m)
 - valla_publicitaria (cartel grande oxidado SIN texto ni logos, sobre poste, 9 m de alto)
 - paso_elevado (tramo de puente peatonal de 14 m que cruza por encima)
 - matojo_1..3, adelfa_1..2 (arbusto de mediana con flor rosa), pino_1..2 (pino piñonero)
 - suelo: neumatico, bidon, saco_escombro, palet, papelera, senal_caida (sin texto)
Reglas: máx. 1.500 triángulos por pieza (el paso elevado 4.000), un único atlas de 1024 px, sin texto, sin marcas reales, sin luces ni cámaras. Recursos CC0 (Kenney, Quaternius, Poly Haven); LICENCIAS.txt.
Entrega: Pack_Autopista_10_WORK.zip con ap_borde.glb, una captura de todas las piezas y LICENCIAS.txt.
```

## 17/11 · Pack Autopista 27 ART — fondo del menú con tormenta
Cuatro pedidos ART en el mismo chat y en orden (el 2 rehace el 1 con la luz del relámpago). Textos completos pasados en el chat del 17/11:
1. Fondo base 1536x1024: autopista abandonada de noche bajo tormenta, paleta fría (azul acero, índigo, violeta), sin naranja; peaje azul/rojo al centro-derecha; mitad izquierda sencilla (va tapada por el retrato); SIN rayos.
2. La MISMA imagen, idéntica, iluminada desde dentro de las nubes por un relámpago fuera de cuadro (sin dibujar el rayo).
3. Hoja 2048x2048, 4x4 de 512, fondo negro: rayo 1 vertical ramificado (fotogramas 1-8) y rayo 2 horizontal nube-nube (9-16), chispa → impacto → destello → se apaga.
4. Hoja 2048x2048, 2x2 de 1024, fondo negro: lluvia inclinada ~15°, 3 tamaños, mismo patrón en bucle y repetible en mosaico.

## 17/11 · Pack Autopista 28 ART — medallones del menú (partida guiada y crear sala)
Dos medallones redondos 512x512 sobre fondo transparente (o magenta #FF00FF para recortar), mismo estilo metal oscuro + neón del HUD de A-6, sin texto:
1. Partida guiada: casco de obra / instructor con silbato o un cono con un signo de interrogación, aro verde neón.
2. Crear sala: dos o tres siluetas de jugadores juntas con un walkie-talkie, aro dorado.

## 17/11 · Pack Autopista 30 ART — barras de vida y energía LÍQUIDAS (en el MISMO chat del 22, 4 imágenes por separado)

```
ART · Pack Autopista 30 · Barras de vida y energía de los héroes de A-6 (juego móvil tipo Wild Rift, HUD cyberpunk serio: metal oscuro con neón, el MISMO estilo que el HUD que ya hiciste en este chat). Hazlo en 4 imágenes, una por mensaje, sin texto, sin números, sin letras.

IMAGEN 1 — Placas (1536x1024, fondo magenta liso #FF00FF): tres placas iguales en forma, una debajo de otra con mucho hueco entre ellas: AZUL (aliado), ROJA (enemigo) y DORADA (el jugador). Cada placa es UNA sola pieza horizontal, proporción 5:1, con DOS ventanas vacías dentro: arriba una ventana ancha para la vida (ocupa ~60 % del alto) y debajo, pegada, una ventana más fina para la energía (~25 % del alto). Las dos ventanas DENTRO de la placa, con el mismo largo, bordes limpios y rectos por dentro; el interior de las ventanas también magenta liso #FF00FF. Marco fino (que no se coma la barra), remaches o detalles solo en los extremos. Vista frontal, plana, sin perspectiva.

IMAGEN 2 — Líquidos de vida (1024x1024, fondo magenta liso #FF00FF): tres tiras horizontales de líquido VISCOSO y espeso tipo gel/slime brillante, cada una 1024x200, separadas: VERDE ácido, AZUL cian y ROJO sangre. Cada tira se repite sin costura de izquierda a derecha (el borde izquierdo continúa el derecho). Que tenga volumen: brillo blanco curvo arriba como un tubo de cristal lleno, parte de abajo más oscura, burbujas pequeñas atrapadas, vetas que se arremolinan despacio. Nada de color plano.

IMAGEN 3 — Líquido de energía (1024x1024, fondo magenta liso #FF00FF): arriba una tira horizontal igual que las de la imagen 2 pero FUCSIA neón (1024x200, sin costura izquierda-derecha); abajo, el mismo líquido fucsia en VERTICAL (300x700, sin costura de arriba abajo) para rellenar la batería del HUD.

IMAGEN 4 — Frentes del líquido (1024x1024, fondo magenta liso #FF00FF): el borde donde se ACABA el líquido, para poner al final de la barra: una gota/menisco redondeado y un poco tembloroso, de 128 px de alto, en VERDE, AZUL, ROJO y FUCSIA (cuatro, separados, mirando a la derecha); y debajo la superficie de arriba del líquido fucsia de la batería vertical (una franja ondulada de 300x80 con brillo).

## 17/11 · Pack Autopista 31 WORK — Dalinar (antes Brask) con cuerpo de humano

```
WORK · Pack Autopista 31 · Rehacer el modelo 3D del héroe «Dalinar, Caballero de Luz» de A-6 (juego móvil tipo Wild Rift, vista cenital, HUD cyberpunk serio). Te adjunto el modelo actual `ap_brask.glb`: el problema es que está hecho sobre el cuerpo del ENANO de KayKit (cabeza enorme, piernas cortas, muy rechoncho) y la espada sale de lado. Hay que hacerlo sobre un cuerpo de HUMANO ADULTO alto y fuerte (base KayKit Adventurers «Knight» o «Barbarian», CC0), con EXACTAMENTE el mismo esqueleto de 41 huesos y los mismos nombres de hueso que el actual (root, hips, spine, chest, upperarm.l/r, lowerarm.l/r, wrist.l/r, hand.l/r, handslot.l/r, head…) y los MISMOS 15 clips con los mismos nombres: atacar, atacar_2, atacar_3, golpe_cargado, giro, quieto, quieto_2, celebrar, morir, morir_2, esquivar, recibir_golpe, aturdido, correr, andar (30 fps).

Diseño (original, sin marcas): tanque enorme con armadura completa de placas gruesas gris acero oscuro casi negro, con juntas y grietas por las que sale luz azul-blanca (como si la armadura estuviera viva), hombreras grandes, yelmo con visera abierta que deja ver una cara curtida de hombre de unos 50 años con barba corta canosa, capa corta azul marino. Espadón ENORME de dos manos (casi de su altura), hoja ancha gris con filo de luz azul, cogido con las dos manos y apuntando hacia delante en «quieto» y «correr», sin cruzarle el cuerpo de lado. En los golpes la espada barre de lado a lado por delante del cuerpo.

Técnico: 6.000-9.000 triángulos, una textura de 1024 (atlas) + material emisivo SOLO en las juntas de luz (en un material aparte llamado «luz» para poder encenderlo por código), altura 2,0 m de pies a cabeza en «quieto» (sin la espada levantada por encima de la cabeza en ese clip), pies en y=0, mirando a +Z. Entrega `ap_dalinar.glb` y una captura de frente y de lado junto al modelo antiguo para comparar tamaños. Licencias CC0 en un txt.
```

### Pack Autopista 31 WORK · versión 2 (18/11, con el retrato nuevo; adjuntar Pack31_dalinar.zip)

```
WORK · Pack Autopista 31 · Rehacer el modelo 3D del héroe «Dalinar, Caballero de Luz» de A-6 (juego móvil tipo Wild Rift visto desde arriba, en una autopista española; estilo serio con toque cyberpunk). Te adjunto `ap_brask.glb` (el modelo actual) y `dalinar_retrato.png` (su retrato oficial: el modelo tiene que parecerse a ESE retrato). Problemas del actual: está hecho sobre el cuerpo del ENANO de KayKit (cabeza enorme, piernas cortas, rechoncho), la armadura es un bloque liso y la espada sale de lado.
Hazlo sobre un cuerpo de HUMANO ADULTO alto y fuerte (base KayKit Adventurers «Knight» o «Barbarian», CC0) con EXACTAMENTE el mismo esqueleto y los mismos nombres de hueso que `ap_brask.glb` y los MISMOS clips con los mismos nombres (30 fps): atacar, atacar_2, atacar_3, golpe_cargado, giro, quieto, quieto_2, celebrar, morir, morir_2, esquivar, recibir_golpe, aturdido, correr, andar.
Diseño, como el retrato: hombre de unos 55 años, pelo gris muy corto, mandíbula cuadrada, cara curtida con cicatriz; ARMADURA COMPLETA de placas gruesas gris pizarra casi negra, con piezas separadas que se lean desde arriba: hombreras grandes en capas, peto con tres gemas romboidales azules, brazales, guanteletes, faldón de placas y grebas; por las juntas y grietas de la armadura sale luz AZUL-BLANCA; capa azul marino hasta las corvas. ESPADÓN de dos manos casi de su altura, hoja ancha y recta con un canal de luz azul y una gema en la guarda; en «quieto» lo sujeta delante apoyado en el suelo, en «correr» y «andar» cogido con las dos manos hacia delante (nunca cruzado de lado), y en los golpes barre por delante del cuerpo.
Técnico: 7.000-10.000 triángulos, una textura de 1024 (atlas) + un material aparte llamado «luz» SOLO para las juntas, las gemas y el canal de la espada (para encenderlo por código), altura 2,0 m de pies a cabeza en «quieto», pies en y=0, mirando a +Z. Entrega `ap_dalinar.glb`, capturas de frente, de lado y desde arriba en diagonal (como se verá en el juego) junto al modelo antiguo, y las licencias CC0 en un txt.
```

## 17/11 · Pack Autopista 32 ART — marcas de apuntar EN PIEZAS (blancas, se tiñen por código)

```
ART · Pack Autopista 32 · Marcas de apuntar habilidades para A-6 (juego móvil tipo Wild Rift visto desde arriba, HUD cyberpunk serio: neón limpio y fino, nada de caramelo). TODO en BLANCO/gris claro con un brillo suave, sobre fondo NEGRO puro #000000 (se suman como luz y el juego las tiñe del color de cada héroe). Vista cenital plana, sin perspectiva, sin texto, sin marco. Hazlo en 2 imágenes, una por mensaje.

IMAGEN 1 (1536x1024) — piezas de la flecha de las habilidades en línea, separadas con mucho hueco negro:
 A) CUERPO: tira horizontal de 1024x128 que se repite SIN COSTURA de izquierda a derecha. La franja ocupa EXACTAMENTE de y=32 a y=96 (la mitad central del alto): dos bordes finos y brillantes arriba y abajo, interior muy translúcido con chevrones suaves (>>>) apuntando a la derecha. Nada fuera de esa franja.
 B) PUNTA: 256x256, punta de flecha mirando a la DERECHA; su base (a la izquierda) mide exactamente 128 px de alto centrada, para encajar con el cuerpo; bordes finos y brillantes, interior translúcido.
 C) INICIO: 128x128, medio círculo abierto a la derecha (donde nace la flecha, en los pies del héroe), del mismo alto que la franja (64 px).

IMAGEN 2 (1536x1024) — formas de área, separadas con mucho hueco negro:
 D) CUATRO CONOS de 512x512 con aperturas de 30°, 60°, 90° y 120°: vértice EXACTO en el centro de abajo de su cuadro, abriéndose hacia ARRIBA hasta el borde superior (radio = 512 px); dos bordes rectos finos, arco exterior más brillante, interior muy translúcido con ondas suaves.
 E) CÍRCULO DE ÁREA 512x512: disco que toca los cuatro bordes, aro exterior brillante y fino, interior muy translúcido con un patrón hexagonal suave.
 F) ARO DE ALCANCE 512x512: solo el aro, fino, con marcas cortas cada 30° por fuera, que toque los cuatro bordes.
```

## 18/11 · Batalla 2v2 de A-6 (mapa «ojo» de La Brecha pasado a autopista)

Equivalencias con La Brecha (mismas reglas, solo cambia el bicho): Uruk Azul → NASOR · Draco → LAGARTO DE LA CENTRAL (fuego/hielo) · Troll (roja) → TORO NEGRO · Huorn (azul) → COLOSO DEL DESGUACE · Huargos → PERROS · Huargo alfa → PERRO JEFE · Crebain → BUITRES · Sapo (Gromp) → JABALÍ · Nutria (cangrejo) → RATA DE ALCANTARILLA. Plantas: seta de humo → BOCA DE RIEGO, baya → MÁQUINA EXPENDEDORA, elanor → RADAR DE TRÁFICO.

### Pack Autopista 33 WORK — los jefes (adjuntar `uruk_azul.glb`, `draco.glb`, `huorn.glb`, `ap_super_rojo.glb`)

```
WORK · Pack Autopista 33 · Cuatro monstruos jefe en 3D para A-6, juego móvil tipo Wild Rift visto desde arriba (cámara cenital a ~20 m), ambientado en una autopista española abandonada y oscura, estilo cyberpunk serio (metal sucio, óxido, neón tenue). Diseños ORIGINALES, sin marcas ni personajes conocidos. Te adjunto modelos de mi juego como REFERENCIA de formato, tamaño y nombres de clips (`uruk_azul.glb`, `draco.glb`, `huorn.glb`) y uno de estilo (`ap_super_rojo.glb`).

1) `ap_nasor.glb` — NASOR, el jefe del mapa (como el Barón Nashor del LoL): un gusano-escolopendra gigante acorazado que sale de un colector de alcantarilla reventado; placas de hormigón y chapa oxidada incrustadas en el cuerpo, boca circular con dientes de rebaba metálica, ojos y grietas con brillo morado. Solo se ve la mitad delantera saliendo del suelo (la cola queda bajo tierra). Altura 4,5 m. Clips: quieto, andar (balanceo en el sitio, no se desplaza), atacar (embestida hacia delante con la boca), pisoton (se alza y golpea el suelo; el impacto a los 0,75 s), recibir_golpe, morir (se hunde en el agujero), correr.
2) `ap_lagarto.glb` — LAGARTO DE LA CENTRAL (como el dragón del LoL): reptil de cuatro patas mutado junto a una central eléctrica, cables y aislantes de cerámica en el lomo, escamas oscuras. UNA sola textura neutra (gris/negro) con un material aparte llamado «brillo» en ojos, garganta y lomo, para teñirlo por código de NARANJA (fuego) o CIAN (hielo). Altura 2,1 m, largo ~5 m. Clips: quieto, andar, atacar (mordisco + aliento), recibir_golpe, morir.
3) `ap_toro.glb` — TORO NEGRO (bufo rojo): toro bravo enorme y mutado, negro, cuernos con brasas rojas en las puntas, grietas de lava en el lomo, anilla metálica en el morro. Altura 2,6 m a la cruz. Clips: quieto, andar, atacar (cornada), recibir_golpe, morir.
4) `ap_coloso.glb` — COLOSO DEL DESGUACE (bufo azul): gólem de chatarra hecho de puertas de coche, un bloque de motor por pecho con una luz azul dentro, ruedas en los hombros, brazos de tubo de escape. Altura 3,5 m. Clips: quieto, andar, atacar (puñetazo con los dos brazos), recibir_golpe, morir (se desmonta en piezas).

Técnico (los 4): 4.000-9.000 triángulos, una textura de 1024 (atlas) cada uno, pies en y=0, mirando a +Z, unidad = metro, con esqueleto y clips con EXACTAMENTE esos nombres a 30 fps, en bucle quieto/andar/correr. Que se lean bien desde arriba: siluetas claras y contraste. Entrega un zip con los 4 .glb, una captura de cada uno junto a `uruk_azul.glb` para comparar el tamaño y un txt con las licencias (CC0 si usas bases de Quaternius/KayKit).
```

### Pack Autopista 34 WORK — la fauna (adjuntar `crebain.glb`, `sapo.glb`, `nutria.glb`)

```
WORK · Pack Autopista 34 · Cinco animales 3D para la jungla de A-6 (mismo juego y estilo que el Pack 33: autopista española abandonada, cyberpunk serio, vista cenital). ORIGINALES, sin marcas. Te adjunto modelos de mi juego como referencia de formato y clips (`crebain.glb`, `sapo.glb`, `nutria.glb`).

1) `ap_perro.glb` — perro asilvestrado flaco, pelo sucio gris-pardo, collar roto con una chapa; altura 1,2 m a la cabeza. Clips: quieto, andar, correr, atacar (mordisco), recibir_golpe, morir.
2) `ap_perro_jefe.glb` — el jefe de la jauría: mastín enorme con cicatrices y una placa metálica en el lomo con una luz ámbar; altura 2,0 m. Mismos clips que el perro.
3) `ap_buitre.glb` — buitre leonado con alguna anilla y cable enredado en una pata; vuela bajo, a ~1,5 m del suelo, con las alas abiertas (envergadura 2 m). Clips: quieto (aleteo en el sitio), andar (vuelo), atacar (picotazo en picado), morir (cae al suelo).
4) `ap_jabali.glb` — jabalí gigante y mutado (como el Gromp del LoL: solitario y duro), colmillos enormes, cerdas oscuras, una señal de tráfico doblada clavada en el lomo; altura 1,4 m. Clips: quieto, andar, atacar (embestida corta), saltar, recibir_golpe, morir.
5) `ap_rata.glb` — rata de alcantarilla gigante (como el cangrejo del LoL: no ataca, huye), del tamaño de un perro pequeño (0,6 m), cola larga, ojos con brillo verde. Clips: quieto, andar, correr, atacar (no se usa, puede ser un chillido), morir.

Técnico: 2.000-6.000 triángulos, una textura de 1024 cada uno, pies en y=0 (el buitre con su altura de vuelo ya dentro del modelo), mirando a +Z, en metros, esqueleto y clips con EXACTAMENTE esos nombres a 30 fps. Zip con los 5 .glb, una captura de todos juntos al lado de `sapo.glb` y licencias en un txt.
```

### Pack Autopista 35 WORK — guaridas y piezas del mapa 2v2

```
WORK · Pack Autopista 35 · Piezas 3D de decorado para la jungla del mapa 2v2 de A-6 (mismo juego y estilo: autopista española abandonada, cyberpunk serio, vista cenital). Sin marcas ni texto legible. Cada pieza en su propio nodo con el nombre indicado, todo en UN solo `ap_jungla.glb`, en metros, base en y=0, centrada en el origen.

- `foso_nasor`: zanja de obra circular de 14 m de diámetro y 1,5 m de hondo con el colector de hormigón reventado en el centro (agujero de 4 m, por donde sale el gusano), vallas de obra caídas, cinta de balizamiento rota y focos de obra apagados alrededor del borde. El fondo, transitable y llano.
- `guarida_lagarto`: hondonada de 12 m junto a un transformador eléctrico destrozado con aisladores y cables caídos; un centro llano de 8 m libre para pelear.
- `cubil_toro`: corral de ganado abandonado (vallas de madera y hierro rotas, un abrevadero) de 9 m.
- `cubil_coloso`: rincón de desguace: pila de coches aplastados y neumáticos de 9 m con un hueco central de 6 m libre.
- `cubil` (genérico, para perros, buitres y jabalí): claro de tierra de 7 m con algún cascote, bidón y matojo en el borde.
- `rio_orilla`: tramo recto de orilla de 10 m (taludes de hormigón agrietado con juncos y basura), que se pueda repetir.
- `puente_vado`: pasarela peatonal metálica oxidada de 8 m de largo por 3 de ancho para cruzar el río (solo decorado, a ras de la orilla).

Técnico: menos de 8.000 triángulos por pieza, 1 o 2 texturas de 1024 compartidas por todo el glb, sin luces ni cámaras dentro, el centro de cada cubil LIBRE (ahí se pelea). Zip con el glb, una captura cenital de cada pieza con una persona de 1,8 m al lado y licencias en un txt.
```

### Pack Autopista 36 ART — iconos de la jungla (chat normal)

```
ART · Pack Autopista 36 · Iconos para la jungla del mapa 2v2 de A-6 (juego móvil tipo Wild Rift, HUD cyberpunk serio: metal oscuro con neón, el mismo estilo que el HUD que ya hiciste). Sin texto, sin letras, cada icono redondo y separado sobre fondo magenta liso #FF00FF. Hazlo en 2 imágenes.

IMAGEN 1 (1536x1024) — marcas del minimapa, 9 iconos redondos pequeños y muy legibles (cabeza del bicho de frente, silueta clara): gusano gigante acorazado (Nasor, morado), lagarto con cables (gris), toro negro con cuernos en brasa (rojo), gólem de chatarra (azul), perro (gris), buitre (marrón), jabalí (pardo), rata (verde), y una lápida de aro dorado vacía (campamento muerto).
IMAGEN 2 (1536x1024) — bendiciones y plantas: Furia de Nasor (fauces moradas), Alma del lagarto fuego (llama naranja) y hielo (cristal cian), Brasa del toro (cuerno con fuego), Turbo del coloso (motor con rayo azul), Jauría (huella de perro ámbar); y tres «plantas» del mapa: boca de riego que echa agua a presión, máquina expendedora con luz verde, radar de tráfico con un destello.
```

## 18/11 · Pack Autopista 37 ART — kit de botones del menú en neón rojo, azul y negro

```
ART · Pack Autopista 37 · Kit de botones del menú principal de A-6 (juego móvil tipo Wild Rift ambientado en una autopista española de noche bajo la tormenta, estilo cyberpunk serio). Colores: NEGRO casi puro de base, filos y luces de NEÓN ROJO (#ff2a4a) y NEÓN AZUL (#3aa0ff), algo de metal oscuro; nada de amarillo ni rayas de obra, nada de caramelo. Sin texto, sin letras, sin iconos dentro (el texto lo pone el juego). Vista frontal plana, sin perspectiva. Todo sobre fondo magenta liso #FF00FF, cada pieza separada con mucho hueco. Una sola imagen 1536x1024:
 A) JUGAR: placa alargada proporción 6:1, interior negro mate con un degradado rojo muy oscuro, filo de neón ROJO fino que brilla, esquinas cortadas en diagonal (chaflán), dos remaches discretos en los extremos.
 B) La misma placa JUGAR pulsada/encendida: el neón rojo más intenso y un halo rojo suave alrededor.
 C) Pestaña 3:1 APAGADA: negro, filo azul muy tenue, esquinas en chaflán.
 D) La misma pestaña ENCENDIDA: filo de neón AZUL brillante y un leve brillo azul dentro.
 E) Botón secundario 4:1 (para «Crear sala» y la caja del código): negro, filo azul fino, a la izquierda un hueco redondo vacío del alto del botón para poner un icono.
 F) Botón pequeño 2,5:1 («Unirse»): negro con filo de neón ROJO.
Los interiores de todas las placas deben ser lisos (sin dibujos) para que el texto se lea, y los filos finos (que no se coman el botón al verse pequeño, a 40 px de alto).
```

## 18/11 · Pack Autopista 38 ART — botones del menú CHILLONES (sustituye al 37, que no gustó)

```
ART · Pack Autopista 38 · Botones del menú principal de A-6 (juego móvil tipo Wild Rift ambientado en una autopista española de noche bajo la tormenta). Estilo: colores MUY CHILLONES y saturados, neón brillante y brillos de calidad de juego móvil de primera (Wild Rift, Brawl Stars), acabado pulido y con volumen (bisel, reflejo de luz arriba, sombra abajo), nada apagado ni oscuro ni oxidado. Sin texto, sin letras, sin iconos dentro (el texto lo pone el juego). Vista frontal plana, sin perspectiva. Fondo VERDE puro liso #00FF00 (no uses verde en ningún botón), cada pieza separada con mucho hueco. Una sola imagen 1536x1024:
 A) JUGAR: placa alargada proporción 7:1, ROJO-ROSA vivo (degradado de #ff0844 a #ff5e3a), esquinas cortadas en diagonal arriba a la izquierda y abajo a la derecha, filo fino blanco brillante, un reflejo de luz diagonal y un halo rojo-rosa intenso alrededor.
 B) La misma placa JUGAR pulsada: más brillante y con el halo más grande.
 C) Subrayado de la pestaña elegida: una raya de neón CIAN (#00e5ff) de 512x40, gruesa en el centro y que se afina hacia las puntas, con resplandor.
 D) Botón pequeño 5:1 CIAN: interior negro azulado brillante, filo de neón cian grueso y brillante, esquinas cortadas, y a la izquierda un hueco redondo del alto del botón con aro cian (ahí va un dibujo).
 E) Caja de texto 5:1 FUCSIA: interior negro violáceo, filo de neón fucsia (#ff2bd6) grueso y brillante, esquinas cortadas, interior liso para escribir.
 F) Botón 2,5:1 FUCSIA relleno: fucsia vivo con degradado, filo blanco fino y halo fucsia.
 G) Dos aros redondos de 256x256 para botones de icono: uno con neón CIAN y otro con neón FUCSIA, aro grueso brillante y centro vacío negro.
Los interiores lisos para que el texto se lea; los filos y halos deben verse bien aunque el botón salga pequeño (34-50 px de alto).
```

## 18/11 · Pack Autopista 39 WORK — matorrales para esconderse (adjuntar Pack39_referencia.zip)

```
WORK · Pack Autopista 39 · Matorrales para esconderse en A-6 (juego móvil tipo Wild Rift visto desde arriba a ~20 m, autopista española de noche, estilo cyberpunk serio pero con colores vivos). Son las «hierbas altas» del LoL: zonas donde el jugador se esconde, así que tienen que leerse CLARAMENTE desde arriba como una mata densa y continua. Ahora mismo uso los arbustos de `vado_rocas.glb` (te lo adjunto: nodos `arbusto_01..04`) y desde arriba parecen trozos de cartulina verde. Te adjunto también `ap_vegetacion.glb` como referencia de estilo y escala (matas secas, adelfas, pinos).
Haz en UN solo `ap_matorral.glb`, en metros, base en y=0 y centrado en el origen, 6 nodos:
 - `adelfa_alta_1..3`: mata de adelfa de mediana de autopista, 1,4-1,8 m de alto y ~2 m de ancho, hojas verdes alargadas con algunas flores rosas y blancas, follaje denso y redondeado (que no se vean huecos desde arriba), con un poco de polvo gris en las hojas de abajo.
 - `carrizo_1..3`: mata de carrizo/caña alta seca de cuneta, 1,6-2 m, tallos verde-amarillos con penachos, densa.
Técnico: 800-2.000 triángulos cada uno, UNA textura de 512 con transparencia para las hojas (alpha recortado, sin semitransparencias) compartida por los 6, normales hacia arriba en las hojas para que no salgan negras vistas desde arriba, sin luces ni cámaras. Zip con el glb, una captura CENITAL de las 6 juntas y una de un grupo de 8 matas formando un círculo de 4 m (así se usan en el juego) y licencias en un txt (CC0 si usas bases de Quaternius/Kenney).
```

## 18/11 · Pack Autopista 40 ART — disparo de las torres (sin adjuntos)

```
ART · Pack Autopista 40 · Disparo de las torres de A-6 (juego móvil tipo Wild Rift visto desde arriba, autopista española de noche, cyberpunk con colores vivos). Ahora las torres de peaje lanzan un pedrusco en llamas (era de un juego medieval) y no pega. Quiero una descarga eléctrica de plasma. Fondo NEGRO puro #000000 (se suma como luz), sin texto, sin marco. Hazlo en 2 imágenes, una por mensaje, cada una 1024x1024 en rejilla de 4x4 fotogramas (256x256 cada uno), en orden de izquierda a derecha y de arriba abajo:
IMAGEN 1 — el proyectil en vuelo: una bola de plasma eléctrico BLANCO-AZULADO con rayitos que chisporrotean alrededor y una cola corta, centrada en cada fotograma, ~40 % del fotograma, que palpita y cambia de forma en los 16 fotogramas (en bucle: el 16 enlaza con el 1).
IMAGEN 2 — el impacto en el suelo visto desde arriba: destello blanco, onda eléctrica azul que se abre en círculo hasta casi el borde, rayos que salen hacia fuera y chispas que se apagan; los últimos 3 fotogramas casi vacíos.
```

## 18/11 · Pack Autopista 41 WORK — rifle de Ata y palo de golf de Birdie (adjuntar Pack41_modelos.zip)

```
WORK · Pack Autopista 41 · Arreglar dos héroes de A-6 (juego móvil tipo Wild Rift visto desde arriba). Te adjunto `ap_ata.glb`, `ap_birdie.glb` y dos capturas de cómo se ven ahora en el juego (`ata_ingame.png`, `birdie_ingame.png`). Hay que CONSERVAR el mismo esqueleto (41 huesos, mismos nombres) y TODOS los clips con los mismos nombres; solo se cambian el arma y los clips que digo. 30 fps, altura y orientación iguales (pies en y=0, mirando a +Z).

1) ATA (francotiradora): ahora el rifle cuelga de UNA mano apuntando al suelo en diagonal, como si fuera una espada, y queda muy raro. Quiero el rifle cogido con LAS DOS MANOS: mano derecha en la empuñadura con el dedo en el gatillo y la izquierda bajo el guardamanos, culata contra el hombro derecho. En `quieto`, `quieto_2`, `andar` y `correr`: rifle cruzado delante del pecho, cañón apuntando adelante y un poco abajo (posición de patrulla), sin atravesar el cuerpo. En `atacar` (es el golpe básico, un disparo): encara el rifle, apunta recto hacia +Z a la altura del hombro, retroceso corto del arma y del hombro hacia atrás a los 0,15 s y vuelve. `atacar_2` y `golpe_cargado`: lo mismo con un disparo más fuerte (más retroceso). El rifle más fino y largo (francotirador futurista, cañón largo con mira telescópica), ~1,3 m, que se lea bien desde arriba.

2) BIRDIE (golfista): el golpe básico tiene que ser UN GOLPE DE GOLF con el palo. Ahora el palo es pequeño y lo lleva cruzado. Quiero: palo de golf (driver) más grande, ~1,2 m, cabeza metálica brillante; en `quieto`/`andar`/`correr` lo lleva al hombro o en la mano relajado. `atacar` y `atacar_2` = swing completo de golf: se coloca de lado, sube el palo por detrás (0-0,25 s), baja con fuerza y golpea a la altura del suelo delante de sus pies a los 0,32 s (ese es el momento en que el juego lanza la bola hacia +Z) y termina con el palo arriba por el otro lado (0,6 s). `atacar_2` un poco distinto (más corto, tipo approach). `golpe_cargado` = swing enorme con salto. Indica en un txt en qué segundo exacto toca la bola cada clip.

Entrega `ap_ata.glb` y `ap_birdie.glb` (menos de 3 MB cada uno, una textura de 1024), capturas de los clips nuevos (una pose por clip, vista de lado) y el txt con los tiempos de impacto.
```

## 18/11 · Pack Autopista 42 ART — aro del botón de ataque básico, uno por héroe (sin adjuntos)

```
ART · Pack Autopista 42 · Aro del botón de ATAQUE BÁSICO de A-6 (juego móvil tipo Wild Rift, HUD cyberpunk serio: metal oscuro con neón, colores vivos). Es el botón grande de abajo a la derecha: dentro va el dibujo del arma de cada héroe (eso ya lo tengo), y quiero que el ARO que lo rodea sea distinto para cada uno, con su arma y su color. 7 aros redondos de 512x512, centro VACÍO y transparente (un círculo liso del 70 % del diámetro, ahí va el arma), sin texto, sobre fondo magenta liso #FF00FF, en una imagen de 1536x1024 (4 arriba, 3 abajo, separados):
 1) Dalinar, caballero de luz: aro de acero pulido con runas/juntas de luz BLANCO-AZULADA y una gran espada cruzando el aro por detrás.
 2) Vael, mago de fuego: aro de metal ennegrecido con grietas de lava NARANJA y llamas lamiendo el borde.
 3) Grub, maestro de la espada de energía: aro de piedra y metal viejo con filo de energía VERDE ácido y una hoja de energía curvada abrazando el aro.
 4) Ata, francotiradora: aro táctico de carbono negro con marcas de mira telescópica (retícula, números de distancia) en ROJO láser.
 5) Birdie, golfista: aro con textura de bola de golf y césped, filo VERDE CÉSPED brillante y un palo de golf cruzando por detrás.
 6) Fu, el de la cadena: aro de eslabones de cadena oscura con brillo MORADO y una hoz colgando.
 7) Moha, guerrero del desierto: aro de bronce arenoso con arena dorada girando alrededor y filo ARENA/dorado.
Todos con el mismo grosor de aro (15 % del radio) y la misma forma exterior para que se puedan cambiar sin mover nada.
```

## 18/11 · Pack Autopista 43 ART — iconos de estado sobre la cabeza (sin adjuntos)

```
ART · Pack Autopista 43 · Iconos de ESTADO que salen encima de la cabeza de los héroes en A-6 (juego móvil tipo Wild Rift visto desde arriba, HUD cyberpunk con colores vivos y neón). Tienen que entenderse de un vistazo a 28 px. 8 iconos redondos de 256x256, cada uno con un aro fino de neón de su color y el dibujo dentro bien grueso, sin texto, sobre fondo magenta liso #FF00FF, separados, en una imagen de 1536x1024 (4 arriba, 4 abajo):
 1) ATURDIDO: tres estrellas y espirales girando, AMARILLO.
 2) RALENTIZADO: un caracol o un reloj de arena con hielo, CIAN.
 3) QUEMANDO: llama, NARANJA.
 4) SANGRANDO: tres gotas, ROJO.
 5) ESCUDO: escudo hexagonal de energía, AZUL.
 6) INVISIBLE / ESCONDIDO: ojo tachado, MORADO.
 7) VELOCIDAD: flechas hacia delante con estela, VERDE LIMA.
 8) FURIA (más daño): puño o garra con brillo, ROJO-ROSA.
```

## 18/11 · Pack Autopista 44 ART — pantalla de derribado y reaparición (sin adjuntos)

```
ART · Pack Autopista 44 · Pantalla de «te han derribado» de A-6 (juego móvil tipo Wild Rift en horizontal, autopista española de noche bajo la tormenta, cyberpunk con colores vivos). Ahora la pantalla solo se vuelve gris. Quiero 2 imágenes, una por mensaje, sin texto (los textos y números los pone el juego):
IMAGEN 1 (1920x1080) — VELO de la pantalla: bordes oscurecidos con grietas de cristal roto y un tono rojo apagado que se va a transparente hacia el centro (el centro de la imagen TRANSPARENTE de verdad, en PNG con transparencia; si no puedes, fondo negro puro #000000 en el centro); algo de lluvia y reflejos de neón rojo en los bordes.
IMAGEN 2 (1024x1024) — RELOJ DE REAPARICIÓN: un aro grande de neón rojo-rosa, roto en segmentos como un cronómetro digital, con un hueco redondo grande en el centro vacío (ahí va el número de segundos), y abajo un pequeño hueco alargado para el nombre de quien te derribó; sobre fondo magenta liso #FF00FF.
```

## 18/11 · Pack Autopista 45 ART — plataforma de salida (sin adjuntos)

```
ART · Pack Autopista 45 · Plataforma de SALIDA (donde reaparecen los héroes) de A-6, vista desde ARRIBA en planta, juego móvil tipo Wild Rift, autopista española de noche, cyberpunk con colores vivos. Una sola imagen 1024x1024, sin texto, fondo magenta liso #FF00FF: una plataforma HEXAGONAL de hormigón pulido y placas de acero que ocupa casi todo el cuadro (vértices tocando el borde izquierdo y derecho), con juntas de neón BLANCO (el juego lo tiñe de azul o rojo) que forman un dibujo de pista de aterrizaje: un círculo central, rayas como un helipuerto y flechas en los 6 lados; marcas de pintura gastada, tornillos y una ligera rejilla de ventilación. Vista perfectamente cenital, sin perspectiva ni sombras proyectadas fuera de la plataforma.
```

## 18/11 · Pack Autopista 46 WORK — objetos del mapa en 3D (vida, visión, salto y botiquín)

```
WORK · Pack Autopista 46 · Modelos 3D (.glb) de los objetos que se recogen en el mapa de A-6 (juego móvil tipo Wild Rift, vista cenital, autopista abandonada con estética cyberpunk seria: hormigón, chapa, neón). Ahora son dibujos planos que se ven como pegatinas: hay que hacerlos en 3D, low-poly (800-2.500 triángulos cada uno), estilo de los modelos CC0 de Kenney/Quaternius, UNA textura atlas de 512 + un material aparte llamado «luz» SOLO en las partes que brillan (para encenderlas/apagarlas por código). Pies en y=0, mirando a +Z, escala real. Puedes partir de piezas CC0 (Kenney City Kit, Quaternius) y montarlas.

1. `ap_obj_vida.glb` — MÁQUINA EXPENDEDORA de bebidas energéticas (cura): 1,4 m de alto, chapa roja y gris rayada, panel frontal con botellas de líquido VERDE y una cruz de luz verde arriba (material «luz»).
2. `ap_obj_vision.glb` — RADAR / antena parabólica sobre un trípode (da visión): 1,5 m, plato que pueda girar (el plato en un nodo aparte llamado «plato», con su pivote en el eje), luz cian en el centro del plato y en las patas (material «luz»).
3. `ap_obj_salto.glb` — BOCA DE RIEGO de incendios (lanza por los aires a quien la toca): 0,9 m, roja y desconchada, con una tapa en un nodo aparte llamado «tapa», y un aro naranja de luz en la base (material «luz»).
4. `ap_botiquin.glb` — BOTIQUÍN grande de emergencias (el del puente del Duelo): maletín de 0,6 x 0,45 x 0,25 m sobre un pequeño pedestal de hormigón, cruz verde que brilla (material «luz»).

Entrega los 4 .glb en un zip con una captura de cada uno y las licencias CC0 en un txt. Nada de animaciones (las haremos por código: girar el plato, botar la tapa, latir la luz).
```

## 18/11 · Pack Autopista 47 WORK — héroe mágico nuevo «el Visor» (rayos de los ojos; adjuntar Pack47_referencia.zip)

```
WORK · Pack Autopista 47 · Modelo 3D de un HÉROE NUEVO para A-6 (juego móvil tipo Wild Rift visto desde arriba, partidas en una autopista española; estilo de los héroes: cuerpo de humano adulto proporcionado, look actual y serio con toque cyberpunk, nada infantil). Te adjunto `ap_ata.glb`, otro héroe del juego: el nuevo tiene que usar EXACTAMENTE su mismo esqueleto (mismos huesos con los mismos nombres, mismo rig) para que el juego lo mueva igual.

Personaje (ORIGINAL, sin marcas ni parecido con ningún superhéroe existente): «El Visor», un mago de luz que dispara RAYOS DE ENERGÍA POR LOS OJOS. Hombre de unos 30 años, delgado y atlético, pelo castaño corto despeinado. Lleva una VISERA-GAFA de metal grafito que le tapa los ojos de lado a lado, con una ranura horizontal de cristal que brilla en CIAN-turquesa (no rojo). Ropa de calle técnica: chaqueta corta de motorista gris marengo con costuras y protecciones en hombros y codos, pantalón cargo negro, botas de seguridad, guantes sin dedos. Detalles de luz cian en las juntas de la chaqueta y en la visera. Nada de mallas, capas ni logos en el pecho.

Clips (30 fps), los MISMOS nombres que `ap_ata.glb`: quieto, quieto_2, andar, correr, atacar, atacar_2, golpe_cargado, esquivar, recibir_golpe, aturdido, celebrar, morir, morir_2. Pero animados para ESTE personaje: en atacar/atacar_2 se lleva dos dedos a la sien de la visera y echa la cabeza un poco hacia delante como disparando con la mirada (manos libres, sin arma); golpe_cargado = abre los brazos, se inclina hacia atrás y luego echa la cabeza hacia delante con fuerza (para la definitiva, un rayo largo de 1,5 s). Añade UN clip nuevo «canalizar»: de pie, una mano en la visera, la cabeza girando despacio de izquierda a derecha durante 2 s en bucle (para un rayo que barre).

Técnico: 6.000-9.000 triángulos, una textura de 1024 (atlas) + material emisivo SOLO en la ranura de la visera y en las juntas de luz, en un material aparte llamado «luz» para encenderlo por código. Altura 2,0 m de pies a cabeza en «quieto», pies en y=0, mirando a +Z, sin arma. Entrega `ap_visor.glb`, una captura de frente y otra de lado junto a `ap_ata.glb` para comparar tamaños, y las licencias CC0 de lo que uses en un txt.
```

## 18/11 · Pack Autopista 48 ART — todo el arte del Visor (adjuntar Pack48_referencia.zip; 4 imágenes, una por mensaje)

```
ART · Pack Autopista 48 · Imagen 1 de 4 · Retrato grande de un héroe nuevo de A-6 (juego móvil tipo Wild Rift ambientado en una autopista española). Te adjunto: `estilo_retrato_ata.png` (retrato de otro héroe: copia SOLO su estilo pictórico, encuadre, luz y acabado) y `visor_modelo_3d.png` (el modelo 3D del héroe nuevo: copia su ropa y su visera).
Héroe: «El Visor», mago de luz que dispara RAYOS DE ENERGÍA POR LOS OJOS. Personaje ORIGINAL, sin parecido con ningún superhéroe existente, sin logos. Hombre de unos 30 años, delgado y atlético, pelo castaño corto despeinado, mandíbula marcada. VISERA-GAFA de metal grafito que le tapa los ojos de lado a lado con una ranura horizontal de cristal que brilla en CIAN-turquesa intenso. Chaqueta corta de motorista gris marengo con protecciones en hombros y codos y juntas de luz cian, pantalón cargo negro, botas de seguridad, guantes sin dedos. Pose: dos dedos en la sien de la visera, y de la ranura sale un RAYO CIAN ancho y brillante que cruza la imagen en diagonal, iluminando su cara y la niebla. Fondo: autopista de noche con lluvia, farolas, reflejos cian en el asfalto mojado.
Formato: vertical 768x1024 (proporción 3:4), sin texto, sin marco, el héroe de cuerpo hasta las rodillas y la cara en el tercio de arriba.
```

```
ART · Pack Autopista 48 · Imagen 2 de 4 · Hoja de iconos del Visor para A-6 (mismo héroe de la imagen 1: visera con ranura cian, chaqueta de motorista gris). Estilo igual que `estilo_icono.png` que te adjunté: pintado, mucho contraste, fondo oscuro dentro del círculo, colores vivos. Sin texto. Fondo de la hoja MAGENTA liso #FF00FF, imagen de 1536x1024, 8 piezas redondas de igual tamaño (~340 px), separadas y en 2 filas de 4:
 1) Retrato redondo: cara y hombros del Visor de frente, la ranura de la visera encendida.
 2) Pasiva «Sobrecarga» (cada 4.º golpe es un rayo): la visera con 4 rayitas de carga, la 4.ª llena y chispeando.
 3) Q «Impacto óptico» (rayo que empuja): rayo cian corto y grueso golpeando y echando hacia atrás una silueta.
 4) W «Rebote» (rayo que salta de un enemigo a otro): rayo cian en zigzag que rebota entre dos puntos.
 5) E «Ráfaga» (abanico que frena): abanico de rayos cian en cono saliendo de la visera.
 6) R «Mirada total» (rayo enorme que barre): rayo cian gigantesco barriendo en arco con estela, el más espectacular.
 7) Botón de ataque básico: la visera vista de frente, grande, con el destello cian saliendo de la ranura.
 8) Aro del botón de ataque: aro de metal grafito con juntas de luz CIAN y un rayo que lo recorre por fuera; el centro VACÍO (un círculo liso del 70 % del diámetro, ahí irá el botón 7) y el grosor del aro el 15 % del radio.
```

```
ART · Pack Autopista 48 · Imagen 3 de 4 · Efectos de los rayos del Visor para un juego visto desde arriba (vista cenital plana, sin perspectiva). Color CIAN-turquesa con el centro casi blanco, sobre fondo NEGRO puro #000000 (se suman como luz). Sin texto, sin marco. Imagen de 1024x1024 partida en 2 mitades:
 - Mitad de arriba (1024x512): el CUERPO de un rayo de energía visto desde arriba, horizontal de lado a lado, que se pueda REPETIR en horizontal sin que se note la costura (el borde izquierdo continúa el derecho): núcleo blanco de ~1/4 del alto, halo cian que se difumina hacia arriba y abajo, chispas y ondas eléctricas a lo largo.
 - Mitad de abajo (1024x512): 2 dibujos de 512x512: a la izquierda el ARRANQUE del rayo (destello redondo que sale de la visera, abierto hacia la derecha); a la derecha el IMPACTO (estallido redondo de energía con salpicadura de chispas).
```

```
ART · Pack Autopista 48 · Imagen 4 de 4 · Dos hojas de animación de efectos del Visor (vista cenital plana, juego visto desde arriba), cada una de 4x4 fotogramas de 256x256 que se reproducen de izquierda a derecha y de arriba abajo, sobre fondo NEGRO puro #000000, color CIAN con centro blanco. Sin texto. Imagen de 2048x1024: la hoja A a la izquierda (1024x1024) y la hoja B a la derecha (1024x1024).
 - Hoja A «Ráfaga en abanico»: un abanico de 5 rayos finos que salen de abajo al centro de cada fotograma y se abren 60° hacia arriba; crecen, brillan y se deshacen en chispas.
 - Hoja B «Sobrecarga»: anillo de energía alrededor de un personaje (centro del fotograma vacío) que se carga en 4 pasos, chispea y estalla en una onda.
```

## 18/11 · Pack Autopista 49 ART — fondo propio en el retrato de cada héroe (adjuntar Pack49_retratos.zip; 7 imágenes, una por mensaje, cada una con SU retrato adjunto)

Plantilla (cambiar NOMBRE, ARCHIVO y FONDO en cada mensaje):

```
ART · Pack Autopista 49 · Retrato de NOMBRE (A-6, juego móvil tipo Wild Rift en una autopista española). Te adjunto su retrato actual ARCHIVO. Quiero EL MISMO personaje, idéntico: misma cara, misma pose, misma ropa, mismo arma, mismo encuadre y mismo estilo pictórico. Cambia SOLO el FONDO y la luz que el fondo echa sobre él, para que cada héroe tenga su propio escenario con su color. Fondo: FONDO. Formato vertical 768x1024, sin texto, sin marco, sin logos.
```

1. Dalinar · `1_dalinar.png` · un puerto de montaña con la autopista nevada al amanecer, ventisca suave, quitanieves con luces giratorias a lo lejos, todo en BLANCO y AZUL HIELO, la luz de su armadura reflejada en la nieve.
2. Vael · `2_vael.png` · la autopista en llamas de noche: coches ardiendo, un incendio en las colinas, pavesas y humo, cielo NARANJA y ROJO fuego.
3. Grub · `3_grub.png` · la boca de un túnel de autopista abandonado, niebla VERDE tóxica saliendo del túnel, luces de emergencia verdes, charcos que reflejan su espada.
4. Ata · `4_ata.png` · un paso elevado de noche sobre un atasco: cientos de luces de freno ROJAS abajo, lluvia fina, la ciudad al fondo, luz roja de láser en el humo.
5. Birdie · `5_birdie.png` · un campo de golf pegado a la autopista en un día de sol: césped VERDE brillante, una bandera de hoyo, la autopista y una valla al fondo, cielo azul con nubes.
6. Fu · `6_fu.png` · una gasolinera abandonada de noche junto a la autopista, letreros de neón MORADO parpadeando, niebla morada a ras de suelo.
7. Moha · `7_moha.png` · la autopista cruzando el desierto de Tabernas (Almería) en plena tormenta de arena DORADA, sol bajo, dunas y un cartel de salida medio enterrado.

## Sonidos ElevenLabs (18/11) — ElevenLabs → Sound Effects, 3 versiones de cada uno
Estilo común (añadir al final de cada prompt): `game sound effect, mobile MOBA, modern cyberpunk highway, punchy and clean, no music, no voice, dry, no long reverb`
| archivo | duración | prompt |
|---|---|---|
| golpe_carne | 0,4 s | heavy punch impact on a body, short thud with a little crunch |
| espada_armadura | 0,5 s | hard hit on a bulletproof vest, metallic clank with a short crack |
| espada_corte | 0,6 s | energy blade slash, fast electric whoosh ending in a sharp impact |
| muerte_orco | 0,8 s | small combat robot shutting down, electric fizz and a metal body falling on asphalt |
| explosion_piedras | 1,5 s | medium explosion of concrete and metal debris, tight, no long tail |
| explosion_fuego | 1,5 s | gasoline explosion with a roaring burst of flame |
| derrumbe_muro | 3 s | tall metal tower collapsing, steel groaning and scrap crashing to the ground |
| rayo_magico | 0,8 s | electric energy discharge, rising hum that snaps into a zap |
| subir_nivel | 1 s | level up sound, bright rising synth chime, futuristic |
| recoger_moneda | 0,4 s | a few metal coins clinking, short and satisfying |
| cuerno_lejano | 1,5 s | distant truck air horn blast, dramatic, short |
| rafaga_viento | 0,5 s | fast air whoosh, something swinging past quickly |
| ap_cadena | 0,8 s | heavy metal chain thrown and snapping tight with a hook |
| ap_plasma | 1 s | plasma cannon shot from a turret, deep thump with an electric crackle |
