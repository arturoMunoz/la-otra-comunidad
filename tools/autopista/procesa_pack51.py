# Pack Autopista 51 ART: botones de ataque básico (8 imágenes de 1254x1254 sobre negro) -> ui/ap_at_<clave>.webp a 512 px.
# Se busca el círculo (lo que no es negro), se recorta por DENTRO del aro dibujado si lo trae (K = fracción del radio que se queda)
# y se deja un círculo con el borde suave.
import numpy as np
from PIL import Image, ImageFilter
K = {'hobbit': .965, 'gollum': .965, 'rohan': .965, 'elfo': .965, 'enano': .985, 'visor': .845, 'gandalf': .65, 'orco': .76}
DESP = {'gandalf': (0, 0)}
for c, k in K.items():
    im = Image.open(f'tools/autopista/pack51/{c}.png').convert('RGB'); a = np.asarray(im).astype(int)
    m = a.max(2) > 18; ys, xs = np.where(m)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2; r = min(xs.max() - xs.min(), ys.max() - ys.min()) / 2
    if c == 'gandalf': cx, cy, r = im.width / 2, im.height / 2, im.width / 2 * .985
    R = r * k
    box = (round(cx - R), round(cy - R), round(cx + R), round(cy + R))
    sub = im.crop(box).resize((512, 512), Image.LANCZOS)
    yy, xx = np.mgrid[:512, :512]; d = np.hypot(xx - 255.5, yy - 255.5)
    al = np.clip((255.5 - d) / 2.0, 0, 1) * 255
    o = sub.convert('RGBA'); o.putalpha(Image.fromarray(al.astype(np.uint8)))
    o.save(f'public/batalla/ui/ap_at_{c}.webp', quality=90, method=6)
    print(c, im.size, round(cx), round(cy), round(r), '->', box)
