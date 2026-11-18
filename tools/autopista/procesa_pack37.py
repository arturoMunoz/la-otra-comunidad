"""Pack Autopista 37 ART: kit de botones del menú en neón (una hoja sobre magenta) -> ui/ap_n_*.webp"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
a = np.asarray(Image.open(os.path.join(R, 'pack37', 'kit.png')).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
# cuánto se parece cada píxel al magenta: el halo rojo/azul sobre magenta sale rosa, se le baja el alfa y se le quita el tinte
mag = np.clip((np.minimum(r, b) - g - 60) / 120, 0, 1)
fondo = (r > 200) & (b > 200) & (g < 60)
lab, n = ndimage.label(~fondo)
objs = ndimage.find_objects(lab); tam = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
cajas = sorted([objs[i] for i in range(n) if tam[i] > 30000], key=lambda s: (round(s[0].start / 120), s[1].start))
NOMBRES = ['jugar', 'jugar_on', 'tab', 'tab_on', 'crear', 'unirse']
assert len(cajas) == 6, len(cajas)
for nom, (sy, sx) in zip(NOMBRES, cajas):
    sy = slice(max(0, sy.start - 14), sy.stop + 14); sx = slice(max(0, sx.start - 14), sx.stop + 14)
    c = a[sy, sx].copy(); m = mag[sy, sx]
    al = 1 - m
    # quitar el magenta mezclado: c = al*color + m*magenta  ->  color = (c - m*magenta)/al
    mg = np.array([255, 0, 255], np.float32)
    col = (c - m[..., None] * mg) / np.maximum(al[..., None], 0.05)
    out = np.dstack([np.clip(col, 0, 255), al * 255]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(os.path.join(UI, 'ap_n_' + nom + '.webp'), quality=90)
    print(nom, out.shape[1], out.shape[0])
