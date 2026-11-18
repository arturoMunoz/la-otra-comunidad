"""Pack Autopista 42 ART: aro del botón de ataque básico por héroe (hoja 4+3 sobre magenta) -> ui/ap_aro_at_<clave>.webp
Cada aro se recorta centrado en su HUECO (medido): en la salida el hueco mide siempre el 50 % del ancho (1/S_HUECO)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
CLAVES = ['enano', 'gandalf', 'orco', 'elfo', 'hobbit', 'gollum', 'rohan']
a = np.asarray(Image.open(os.path.join(R, 'pack42', 'aros.png')).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mag = np.clip((np.minimum(r, b) - g - 60) / 120, 0, 1)
fondo = mag > 0.9
lab, n = ndimage.label(fondo)
H, W = fondo.shape
huecos = []
for i, sl in enumerate(ndimage.find_objects(lab)):
    sy, sx = sl
    if sy.start == 0 or sx.start == 0 or sy.stop == H or sx.stop == W: continue
    area = (lab[sl] == i + 1).sum()
    if area < 8000: continue
    cy, cx = ndimage.center_of_mass(lab == i + 1)
    huecos.append((cy, cx, np.sqrt(area / np.pi)))
huecos.sort(key=lambda h: (round(h[0] / 300), h[1]))
assert len(huecos) == 7, huecos
mg = np.array([255, 0, 255], np.float32)
al = 1 - mag
col = np.clip((a - mag[..., None] * mg) / np.maximum(al[..., None], 0.05), 0, 255)
rgba = np.dstack([col, al * 255]).astype(np.uint8)
img = Image.fromarray(rgba, 'RGBA')
S = 2.0   # medio lado del recorte = S x radio del hueco
for clave, (cy, cx, rh) in zip(CLAVES, huecos):
    m = rh * S
    c = img.crop((int(cx - m), int(cy - m), int(cx + m), int(cy + m))).resize((512, 512), Image.LANCZOS)
    c.save(os.path.join(UI, 'ap_aro_at_' + clave + '.webp'), quality=90)
    print(clave, round(cx), round(cy), round(rh))
