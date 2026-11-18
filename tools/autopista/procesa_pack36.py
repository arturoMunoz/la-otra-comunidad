"""Pack Autopista 36 ART: iconos de la jungla del 2v2 (dos hojas 3x3 de medallones sobre magenta).
Salen con los nombres que usa La Brecha con prefijo ap_ (el generador cambia ui/mm_, ui/bend_ y ui/pl_ por ui/ap_...)."""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
HOJAS = {'marcas.png': ['mm_uruk', 'mm_draco', 'mm_troll', 'mm_huorn', 'mm_huargo', 'mm_crebain', 'mm_jabali', 'mm_nutria', 'mm_lapida'],
         'bendiciones.png': ['bend_furia', 'bend_fuego', 'bend_hielo', 'bend_brasa', 'bend_savia', 'bend_jauria', 'pl_seta', 'pl_baya', 'pl_flor']}
for hoja, nombres in HOJAS.items():
    a = np.asarray(Image.open(os.path.join(R, 'pack36', hoja)).convert('RGBA')).astype(np.int16)
    mag = (a[..., 0] > 150) & (a[..., 2] > 150) & (a[..., 1] < 120)
    lab, n = ndimage.label(~mag)
    tams = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    caj = [ndimage.find_objects(lab)[i] for i in range(n) if tams[i] > 20000]
    caj.sort(key=lambda s: (round(s[0].start / 200), s[1].start))
    assert len(caj) == 9, (hoja, len(caj))
    for nombre, (sy, sx) in zip(nombres, caj):
        c = a[sy, sx].copy(); h, w = c.shape[:2]; d = min(h, w)
        yy, xx = np.mgrid[0:h, 0:w]; r = np.hypot(yy - (h - 1) / 2, xx - (w - 1) / 2)
        al = np.clip((d / 2 - 1 - r) * 255 / 1.5, 0, 255)
        c[..., 3] = al.astype(np.int16)
        im = Image.fromarray(c.astype(np.uint8), 'RGBA').resize((128, 128), Image.LANCZOS)
        im.save(os.path.join(UI, 'ap_' + nombre + '.webp'), quality=88)
        print(nombre, w, h)
