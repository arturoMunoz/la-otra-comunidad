"""A-6 · Pack 22 ART (HUD cyberpunk; sustituye al del Pack 19). Ejecutar: python3 -I tools/autopista/procesa_pack22.py"""
import os
import numpy as np
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P, UI = os.path.join(R, 'tools/autopista/pack22'), os.path.join(R, 'public/batalla/ui')


def hueco(a, fila=None, col=None):
    """límites del hueco transparente central en % (horizontal por la fila del medio, vertical por la columna)"""
    al = a[..., 3]; h, w = al.shape; fila = h // 2 if fila is None else fila; col = w // 2 if col is None else col
    def tramo(v, c):
        i = c
        while i > 0 and v[i - 1] < 40: i -= 1
        j = c
        while j < len(v) - 1 and v[j + 1] < 40: j += 1
        return i / len(v), j / len(v)
    return tramo(al[fila], col), tramo(al[:, col], fila)


for n, lado in [('aro_hab', 256), ('aro_hab_lista', 256), ('aro_ulti', 256), ('aro_ulti_lista', 256), ('aro_hechizo', 256),
                ('mas', 160), ('insignia_nivel', 160), ('moneda', 96), ('punto_on', 96), ('punto_off', 96),
                ('panel_yo', 1024), ('barra_xp', 512), ('bv_azul', 512), ('bv_rojo', 512), ('bv_yo', 512)]:
    im = Image.open(f'{P}/ap_{n}.png').convert('RGBA')
    im = im.crop(im.getbbox()); im.thumbnail((lado, lado), Image.LANCZOS)
    im.save(os.path.join(UI, f'ap_{n}.webp'), 'WEBP', quality=92, method=6)
    a = np.array(im); h, w = a.shape[:2]; txt = ''
    if n.startswith('aro'): (x0, x1), _ = hueco(a); txt = 'hueco %.3f' % (x1 - x0)
    if n.startswith('bv') or n == 'barra_xp': (x0, x1), (y0, y1) = hueco(a); txt = 'hueco x %.3f-%.3f y %.3f-%.3f' % (x0, x1, y0, y1)
    if n == 'panel_yo':
        al = a[..., 3]; cols = [x for x in range(int(w * .02), int(w * .4)) if al[h // 2, x] < 40]
        cx = (cols[0] + cols[-1]) // 2; (x0, x1), (y0, y1) = hueco(a, col=cx); txt = 'retrato x %.3f-%.3f y %.3f-%.3f' % (x0, x1, y0, y1)
    print(n, im.size, '%.2f' % (w / h), txt)
