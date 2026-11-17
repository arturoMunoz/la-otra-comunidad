# Pack Autopista 30 ART: placas de vida + energía (azul/roja/dorada). Quita el magenta (fuera y dentro de las ventanas) y mide las ventanas.
# python3 -I tools/autopista/procesa_pack30.py
import json, numpy as np
from PIL import Image
from scipy import ndimage
R = 'tools/autopista/pack30/'; S = 'public/batalla/ui/'
im = np.array(Image.open(R + 'placas.png').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
mag = (r > 150) & (b > 150) & (g < 130)
lab, n = ndimage.label(~mag)
placas = sorted([s for i, s in enumerate(ndimage.find_objects(lab)) if (lab[s] == i + 1).sum() > 20000], key=lambda s: s[0].start)
med = {}
for nombre, s in zip(['azul', 'rojo', 'yo'], placas):
    y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
    c = im[y0:y1, x0:x1].copy(); m = mag[y0:y1, x0:x1]
    # ventanas = magenta que no toca el borde de la placa
    l2, n2 = ndimage.label(m); vent = []
    for j, s2 in enumerate(ndimage.find_objects(l2)):
        if s2[0].start > 0 and s2[1].start > 0 and s2[0].stop < m.shape[0] and s2[1].stop < m.shape[1] and (l2[s2] == j + 1).sum() > 2000:
            vent.append((s2[0].start, s2[0].stop, s2[1].start, s2[1].stop))
    vent.sort()
    a = np.where(m, 0, 255).astype(np.uint8)
    # quitar el tinte rosa del borde: píxeles casi magenta junto al hueco → algo transparentes y sin rosa
    borde = ndimage.binary_dilation(m, iterations=2) & ~m
    a[borde] = 160
    cc = c.copy(); cc[borde, 1] = np.maximum(cc[borde, 1], np.minimum(cc[borde, 0], cc[borde, 2]) // 2)
    cc[borde, 0] = cc[borde, 0] * 0.6; cc[borde, 2] = cc[borde, 2] * 0.6
    out = np.dstack([cc.clip(0, 255).astype(np.uint8), a])
    Image.fromarray(out, 'RGBA').save(S + 'ap_placa_' + nombre + '.webp', quality=92)
    W, H = x1 - x0, y1 - y0
    med[nombre] = {'w': W, 'h': H, 'vent': [[v[2] / W * 100, v[0] / H * 100, v[3] / W * 100, v[1] / H * 100] for v in vent]}
print(json.dumps(med, indent=1))
