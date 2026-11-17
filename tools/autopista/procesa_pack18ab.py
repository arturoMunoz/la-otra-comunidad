"""Pack Autopista 18 A/B (17/11): marcas de apuntado propias de cada héroe de A-6.
Originales en tools/autopista/pack18ab/ap_ind_<clave>_<k>.png -> public/batalla/ui/ap_ind_<clave>_<k>.webp
Mismo formato que las de La Brecha (Pack Vado 19): recortadas al borde del dibujo; líneas hacia la derecha;
conos con la punta abajo en el centro (ChatGPT los dibuja abiertos a la derecha: se giran); círculos y aros cuadrados.
Uso: python3 -I tools/autopista/procesa_pack18ab.py"""
import glob, os
import numpy as np
from PIL import Image
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC, DST = os.path.join(RAIZ, 'tools/autopista/pack18ab'), os.path.join(RAIZ, 'public/batalla/ui')
CONOS = {'enano_q', 'hobbit_e', 'orco_w'}

def caja(im, umbral=24):
    a = np.array(im)[..., 3]; ys, xs = np.where(a > umbral)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def limpia(im):  # quita la neblina casi invisible que deja ChatGPT por el fondo
    a = np.array(im); al = a[..., 3]; al[al < 12] = 0; a[..., 3] = al; return Image.fromarray(a)

for f in sorted(glob.glob(os.path.join(SRC, 'ap_ind_*.png'))):
    n = os.path.basename(f)[:-4]; clave = n[len('ap_ind_'):]; im = limpia(Image.open(f).convert('RGBA'))
    if clave in CONOS:
        im = im.rotate(90, expand=True)  # abierto a la derecha -> abierto hacia arriba
        x0, y0, x1, y1 = caja(im); cx = im.width / 2; m = max(cx - x0, x1 - cx)
        im = im.crop((int(cx - m), y0, int(cx + m), int(im.height / 2) + 4)).resize((512, 512), Image.LANCZOS)
    elif im.width > im.height * 1.5:  # línea
        im = im.crop(caja(im)); im = im.resize((1024, max(64, round(1024 * im.height / im.width))), Image.LANCZOS)
    else:  # círculo o aro
        x0, y0, x1, y1 = caja(im, 90); l = max(x1 - x0, y1 - y0); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        im = im.crop((int(cx - l / 2), int(cy - l / 2), int(cx + l / 2), int(cy + l / 2))).resize((512, 512), Image.LANCZOS)
        a = np.array(im); yy, xx = np.mgrid[:512, :512]; fuera = np.hypot(xx - 255.5, yy - 255.5) > 256  # la neblina de las esquinas
        a[fuera, 3] = 0; im = Image.fromarray(a)
    im.save(os.path.join(DST, n + '.webp'), 'WEBP', quality=88); print(n, im.size)
