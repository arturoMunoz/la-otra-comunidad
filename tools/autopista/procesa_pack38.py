"""Pack Autopista 38 ART: botones del menú chillones sobre verde -> ui/ap_c_*.webp
El halo sobre verde no se puede separar limpio (cian + verde, rojo + verde = amarillo): se quita el verde y el halo lo pone CSS (drop-shadow)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
a = np.asarray(Image.open(os.path.join(R, 'pack38', 'kit.png')).convert('RGB')).astype(np.int16)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
verde = (g > r + 35) & (g > b + 35)
lab, n = ndimage.label(~verde)
objs = ndimage.find_objects(lab); tam = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
ids = [i for i in range(n) if tam[i] > 4000]
fila = lambda i: sum((objs[i][0].start + objs[i][0].stop) / 2 > y for y in (200, 460, 545, 760))
ids.sort(key=lambda i: (fila(i), objs[i][1].start))
NOMBRES = ['jugar', 'jugar_on', 'raya', 'crear', 'codigo', 'unirse', 'aro_cian', 'aro_fucsia']
assert len(ids) == 8, [(objs[i], tam[i]) for i in ids]
for nom, i in zip(NOMBRES, ids):
    sy, sx = objs[i]
    m = ndimage.binary_fill_holes(lab[sy, sx] == i + 1)
    m = ndimage.binary_erosion(m, iterations=1)
    c = a[sy, sx].copy()
    borde = m & ~ndimage.binary_erosion(m, iterations=4)  # en el filo el verde se mezcla (rojo + verde = amarillo): ahí el verde no pasa del azul
    c[..., 1] = np.where(borde, np.minimum(c[..., 1], c[..., 2]), np.minimum(c[..., 1], np.maximum(c[..., 0], c[..., 2])))
    al = ndimage.gaussian_filter(m.astype(np.float32), 0.7)
    out = np.dstack([c.clip(0, 255), (al * 255).clip(0, 255)]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(os.path.join(UI, 'ap_c_' + nom + '.webp'), quality=90)
    print(nom, out.shape[1], out.shape[0])
