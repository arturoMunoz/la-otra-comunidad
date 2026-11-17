"""A-6 · Pack 29 ART: icono de Ignición (mechero) sobre magenta → ui/ap_hz_ignicion.webp. python3 -I tools/autopista/procesa_pack29.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
im = Image.open(os.path.join(R, 'tools/autopista/pack29/ignicion.png')).convert('RGBA')
a = np.array(im).astype(int)
mag = (a[..., 0] > 150) & (a[..., 2] > 150) & (a[..., 1] < 120)
lab, _ = ndimage.label(mag); borde = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fondo = ndimage.binary_dilation(np.isin(lab, list(borde)), iterations=2)
a[..., 3] = np.where(fondo, 0, 255)
# además, recorte en círculo limpio (el dibujo es un medallón redondo)
h, w = a.shape[:2]; yy, xx = np.mgrid[:h, :w]; cy, cx = h / 2, w / 2; r = min(h, w) / 2 - 4
a[..., 3] = np.where((yy - cy) ** 2 + (xx - cx) ** 2 > r * r, 0, a[..., 3])
out = Image.fromarray(a.astype(np.uint8), 'RGBA'); out = out.crop(out.getbbox()); out.thumbnail((256, 256), Image.LANCZOS)
out.save(os.path.join(R, 'public/batalla/ui/ap_hz_ignicion.webp'), 'WEBP', quality=92, method=6)
print('ok', out.size)
