# Gradúa la textura de colores de Kenney para A-6: grises azulados/morados → hormigón y ladrillo neutros, colores un poco más sobrios
# uso: python3 -I gradua.py ENTRADA.png SALIDA.png
import sys, numpy as np
from PIL import Image
im = np.asarray(Image.open(sys.argv[1]).convert('RGBA')).astype(np.float32) / 255
rgb = im[..., :3]; a = im[..., 3:]
mx = rgb.max(-1); mn = rgb.min(-1); s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0); l = (mx + mn) / 2
lum = rgb @ np.array([0.299, 0.587, 0.114])
gris = s < 0.32
# grises: luminancia algo más baja y tono cálido de hormigón
calido = np.stack([lum * 1.0, lum * 0.99, lum * 0.97], -1) * 0.9
out = np.where(gris[..., None], calido, rgb)
# colores: un 30 % menos saturados
col = lum[..., None] + (rgb - lum[..., None]) * 0.85
out = np.where(gris[..., None], out, col)
out = np.clip(out, 0, 1)
Image.fromarray((np.concatenate([out, a], -1) * 255).astype(np.uint8)).save(sys.argv[2])
