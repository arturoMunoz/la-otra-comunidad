# Medidas de los dibujos de ataques (22/11)

Para que la marca de apuntar, el dibujo del efecto y la zona de daño sean la misma, cada imagen se mide una vez y el número va a las tablas `FX_BORDE`, `IND_R` y `ABAN` de `cli.js`:

- `python3 -I mide.py fx/X.webp:4:4:a` — borde que se ve de una hoja radial (onda, polvo…), en fracción de medio fotograma (`a` = se suma como luz, `n` = mezcla normal).
- `python3 -I masa.py fx/X.webp:4:4:a` — radio que contiene el 97 % del dibujo (tajos y medias lunas).
- `python3 -I aro.py ui/X.webp` — radio de la línea de neón de una marca circular (`neon`) y del borde opaco (`ext`).
- `python3 -I cono2.py ui/X.webp` — vértice, semiabertura y radio de una marca de cono.
- `python3 -I abanico.py fx/X.webp:XA:YA` — abertura y radio de una hoja en abanico con el vértice en (XA, YA).

Se ejecutan desde `public/batalla`.
