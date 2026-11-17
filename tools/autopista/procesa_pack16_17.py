"""A-6 · Pack 16 ART (debajo del puente) y Pack 17 ART (logo e icono A-6).
Ejecutar: python3 -I tools/autopista/procesa_pack16_17.py"""
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T, UI = os.path.join(R, 'tools/autopista'), os.path.join(R, 'public/batalla')

# Pack 16: texturas del barranco
for n in ['ap_barranco', 'ap_pared_roca']:
    Image.open(f'{T}/pack16/{n}.png').convert('RGB').save(f'{UI}/texturas/{n}.webp', 'WEBP', quality=85, method=6)
    print(n)

# Pack 17: logo (ChatGPT pintó el fondo de blanco/cuadros: se quita lo claro unido al borde)
a = np.array(Image.open(f'{T}/pack17/ap_logo_a6.png').convert('RGBA')).astype(int)
rgb = a[..., :3]
claro = (rgb.min(-1) > 205) & (rgb.max(-1) - rgb.min(-1) < 22)
lab, _ = ndimage.label(claro)
ids = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fondo = np.isin(lab, list(ids))
suave = (rgb.min(-1) > 170) & (rgb.max(-1) - rgb.min(-1) < 30)
for _ in range(3):
    fondo |= ndimage.binary_dilation(fondo) & suave
a[..., 3] = np.where(fondo, 0, 255)
im = Image.fromarray(a.astype(np.uint8), 'RGBA'); im = im.crop(im.getbbox()); im.thumbnail((900, 900), Image.LANCZOS)
im.save(f'{UI}/ui/ap_logo_a6.webp', 'WEBP', quality=90, method=6); print('logo', im.size)

# icono: web y Android (cuadrado y redondo)
ic = Image.open(f'{T}/pack17/ap_icono_a6.png').convert('RGB')
ic.resize((512, 512), Image.LANCZOS).save(f'{UI}/ui/ap_icono.png'); ic.resize((180, 180), Image.LANCZOS).save(f'{UI}/ui/ap_icono_180.png')
res = os.path.join(R, 'android/autopista/src/main/res')
for d, s in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]:
    q = ic.resize((s, s), Image.LANCZOS); q.save(f'{res}/mipmap-{d}/ic_launcher.png')
    m = Image.new('L', (s * 4, s * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, s * 4 - 1, s * 4 - 1), fill=255)
    r = q.convert('RGBA'); r.putalpha(m.resize((s, s), Image.LANCZOS)); r.save(f'{res}/mipmap-{d}/ic_launcher_round.png')
print('iconos')
