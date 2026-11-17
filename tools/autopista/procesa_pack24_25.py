"""Packs Autopista 24 y 25 ART (17/11): proyectiles, flecha del golpe básico y efectos propios de cada héroe de A-6.
Originales: tools/autopista/pack24a, pack24b (Tanda 1 y 2) y pack25.
- ap_pr_<bola|brasa|energia|bala|hoz>.png -> public/batalla/ui/ap_pr_*.webp (256x256, apuntan a +X, estela a -X)
- ap_ind_<clave>_basico.png -> public/batalla/ui/ap_ind_<clave>_basico.webp (recortada al dibujo, como las del Pack 18)
- ap_fx_<clave>_<efecto>.png (hojas 4x4) -> public/batalla/fx/ap_<clave>_<efecto>.webp (1024x1024, como las de La Brecha).
  Las de fondo negro se pintan sumando luz; humo (Fu) y arena (Moha) traen transparencia y van con mezcla normal.
Uso: python3 -I tools/autopista/procesa_pack24_25.py"""
import glob, os
import numpy as np
from PIL import Image
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T = os.path.join(RAIZ, 'tools/autopista')
UI, FX = os.path.join(RAIZ, 'public/batalla/ui'), os.path.join(RAIZ, 'public/batalla/fx')

def caja(im, umbral=24):
    a = np.array(im)[..., 3]; ys, xs = np.where(a > umbral)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

for f in sorted(glob.glob(os.path.join(T, 'pack24[ab]', '*.png'))):
    n = os.path.basename(f)[:-4]; im = Image.open(f).convert('RGBA')
    if n.startswith('ap_pr_'):
        im = im.resize((256, 256), Image.LANCZOS)
    else:  # flecha del golpe básico
        a = np.array(im); a[a[..., 3] < 12, 3] = 0; im = Image.fromarray(a).crop(caja(Image.fromarray(a)))
        im = im.resize((1024, max(48, round(1024 * im.height / im.width))), Image.LANCZOS)
    im.save(os.path.join(UI, n + '.webp'), 'WEBP', quality=88); print(n, im.size)

for f in sorted(glob.glob(os.path.join(T, 'pack25', 'ap_fx_*.png'))):
    n = 'ap_' + os.path.basename(f)[len('ap_fx_'):-4]; im = Image.open(f)
    im = (im.convert('RGBA') if im.mode == 'RGBA' else im.convert('RGB')).resize((1024, 1024), Image.LANCZOS)
    im.save(os.path.join(FX, n + '.webp'), 'WEBP', quality=86); print(n, im.mode)
