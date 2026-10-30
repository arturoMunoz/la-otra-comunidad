"""Fondo de ChatGPT (1536x1024, vista lateral) -> 2 capas para el juego: paisaje (lento) y suelo con el camino (rápido).
Para que se pueda repetir sin costura, cada capa es la imagen + su reflejo (izquierda-derecha).
uso: python3 tools/fondo.py IMG NOMBRE FILA_PIES [FILA_CORTE]
  FILA_PIES: fila (en la imagen original) donde pisan los pies, en mitad del camino.
  FILA_CORTE: dónde empieza la capa de suelo (por defecto FILA_PIES-60).
salida: public/assets/tramos/NOMBRE_0.webp y NOMBRE_1.webp; imprime las capas para manifest.json"""
import sys, json, numpy as np
from PIL import Image
src, nom, pies = sys.argv[1], sys.argv[2], int(sys.argv[3]); cut = int(sys.argv[4]) if len(sys.argv) > 4 else pies - 60
im = Image.open(src).convert('RGB'); w, h = im.size
s = 228 / pies; y0 = round(228 - pies * s)
def capa(r0, r1, k):
    c = im.crop((0, r0, w, r1)); d = Image.new('RGB', (w * 2, r1 - r0)); d.paste(c, (0, 0)); d.paste(c.transpose(Image.FLIP_LEFT_RIGHT), (w, 0))
    d = d.resize((round(w * 2 * s), max(1, round((r1 - r0) * s))), Image.LANCZOS); d.save(f'public/assets/tramos/{nom}_{k}.webp', quality=88)
    return round(y0 + r0 * s)
ys = [capa(0, cut + 4, 0), capa(cut, h, 1)]
print(json.dumps([{"src": f"assets/tramos/{nom}_0.webp", "y": ys[0], "v": 0.4}, {"src": f"assets/tramos/{nom}_1.webp", "y": ys[1], "v": 1.0}]))
