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
