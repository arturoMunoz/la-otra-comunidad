# Pack Autopista 62 ART (23/11): reloj de reaparición sobre magenta → ui/ap_reloj.webp (transparente) + medidas de sus huecos.
# python3 -I tools/autopista/procesa_pack62.py
from PIL import Image; import numpy as np
im = np.asarray(Image.open('tools/autopista/pack62/reloj.png').convert('RGB')).astype(float)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
d = np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2)          # distancia al magenta de verdad
a = np.clip((d - 40) / 70, 0, 1)                                 # fondo fuera; el halo, medio transparente
# lo que queda del magenta en el borde se quita del color (sin rosa en el filo)
k = (1 - a)[..., None]; col = np.clip((im - k * np.array([255, 0, 255])) / np.maximum(a[..., None], 1e-3), 0, 255)
out = np.dstack([col, a * 255]).astype(np.uint8); ys, xs = np.where(a > 0.05)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
Image.fromarray(out).crop((x0, y0, x1, y1)).resize(((x1 - x0) // 2, (y1 - y0) // 2), Image.LANCZOS).save('public/batalla/ui/ap_reloj.webp', quality=90)
W, H = x1 - x0, y1 - y0
# hueco redondo (oscuro dentro del aro) y hueco del nombre: medidos en el original
print('recorte', x0, y0, W, H)
cx, cy = 626, 510; print('centro del hueco en %%: %.1f %.1f' % ((cx - x0) / W * 100, (cy - y0) / H * 100))
