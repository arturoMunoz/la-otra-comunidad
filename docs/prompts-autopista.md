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
