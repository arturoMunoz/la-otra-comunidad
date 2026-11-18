"""Pack Autopista 43 ART (iconos de estado, 4+4 sobre magenta) -> ui/ap_est_<nombre>.webp
Pack Autopista 44 ART imagen 1 (velo de derribado; el centro vino BLANCO en vez de transparente) -> ui/ap_velo_muerte.webp"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
# 43: iconos redondos
a = np.asarray(Image.open(os.path.join(R, 'pack43', 'estados.png')).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mag = np.clip((np.minimum(r, b) - g - 60) / 120, 0, 1)
lab, n = ndimage.label(mag < 0.5)
objs = ndimage.find_objects(lab); tam = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
ids = sorted([i for i in range(n) if tam[i] > 20000], key=lambda i: (round(objs[i][0].start / 300), objs[i][1].start))
assert len(ids) == 8, len(ids)
mg = np.array([255, 0, 255], np.float32); al = 1 - mag
col = np.clip((a - mag[..., None] * mg) / np.maximum(al[..., None], 0.05), 0, 255)
rgba = np.dstack([col, al * 255]).astype(np.uint8)
for nom, i in zip(['aturdido', 'lento', 'quema', 'sangra', 'escudo', 'invisible', 'velocidad', 'furia'], ids):
    sy, sx = objs[i]; c = rgba[sy, sx].copy(); h, w = c.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]; rr = np.hypot(yy - (h - 1) / 2, xx - (w - 1) / 2)
    c[..., 3] = np.minimum(c[..., 3], np.clip((min(h, w) / 2 - 1 - rr) * 170, 0, 255)).astype(np.uint8)
    Image.fromarray(c, 'RGBA').resize((96, 96), Image.LANCZOS).save(os.path.join(UI, 'ap_est_' + nom + '.webp'), quality=90)
    print(nom)
# 44: velo; blanco = transparente (se separa el blanco igual que el magenta: cuánto blanco lleva cada píxel)
v = np.asarray(Image.open(os.path.join(R, 'pack44', 'velo.png')).convert('RGB')).astype(np.float32)
bl = np.clip((v.min(axis=2) - 150) / 90, 0, 1)
al = 1 - bl
col = np.clip((v - bl[..., None] * 255) / np.maximum(al[..., None], 0.05), 0, 255)
Image.fromarray(np.dstack([col, al * 255]).astype(np.uint8), 'RGBA').resize((1280, 720), Image.LANCZOS).save(os.path.join(UI, 'ap_velo_muerte.webp'), quality=82)
print('velo')
