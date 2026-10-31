"""Fondo de ChatGPT (1536x1024, vista lateral) -> 2 capas para el juego: paisaje (lento) y suelo con el camino (rápido).
Para que se pueda repetir sin costura, cada capa es la imagen + su reflejo (izquierda-derecha).
uso: [ALTO=420] python3 tools/fondo.py IMG NOMBRE FILA_PIES [FILA_CORTE]   (ALTO=420 para las verticales 1024x1536)
  FILA_PIES: fila (en la imagen original) donde pisan los pies, en mitad del camino.
  FILA_CORTE: dónde empieza la capa de suelo (por defecto FILA_PIES-60).
salida: public/assets/tramos/NOMBRE_0.webp y NOMBRE_1.webp; imprime las capas para manifest.json"""
import sys, json, numpy as np
from PIL import Image
src, nom, pies = sys.argv[1], sys.argv[2], int(sys.argv[3]); cut = int(sys.argv[4]) if len(sys.argv) > 4 else pies - 60
im = Image.open(src).convert('RGB'); w, h = im.size
import os
# imagen apaisada antigua: lo que hay encima de los pies ocupa 228 px de escena.
# imagen VERTICAL (formato bueno, 1024x1536): ALTO=420 -> llena la pantalla de un móvil entero sin reflejar el cielo.
s = int(os.environ.get('ALTO', 228)) / pies; y0 = round(228 - pies * s)
import os
def sin_luna(c):
    """en la copia reflejada se borra la luna (si no, salen dos lunas en el cielo)"""
    import cv2
    a = np.array(c); L = a.astype(int).sum(2) / 3; m = np.zeros(L.shape, np.uint8); hh = int(L.shape[0] * 0.35)
    from scipy import ndimage
    lab, n = ndimage.label(L[:hh] > 190)
    for j, sl in enumerate(ndimage.find_objects(lab)):
        if (lab[sl] == j + 1).sum() > 600: m[max(0, sl[0].start - 12):sl[0].stop + 12, max(0, sl[1].start - 12):sl[1].stop + 12] = 255
    return Image.fromarray(cv2.inpaint(a, m, 9, cv2.INPAINT_TELEA)) if m.any() else c
def capa(r0, r1, k):
    c = im.crop((0, r0, w, r1)); d = Image.new('RGB', (w * 2, r1 - r0)); d.paste(c, (0, 0))
    e = c.transpose(Image.FLIP_LEFT_RIGHT); d.paste(sin_luna(e) if os.environ.get('SIN_LUNA') else e, (w, 0))
    if os.environ.get('ESPEJO'): d = d.crop((0, 0, w, r1 - r0))  # el juego dibuja el reflejo él solo
    K = int(os.environ.get('HD', 1)); d = d.resize((round(d.width * s * K), max(1, round((r1 - r0) * s * K))), Image.LANCZOS); d.save(f'public/assets/tramos/{nom}_{k}.webp', quality=int(os.environ.get('Q', 88)))
    return round(y0 + r0 * s)
ys = [capa(0, cut + 4, 0), capa(cut, h, 1)]
print(json.dumps([{"src": f"assets/tramos/{nom}_0.webp", "y": ys[0], "v": 0.4}, {"src": f"assets/tramos/{nom}_1.webp", "y": ys[1], "v": 1.0}]))
