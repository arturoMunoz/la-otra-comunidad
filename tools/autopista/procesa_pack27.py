# Pack Autopista 27 ART: fondo de tormenta del menú de A-6 (python3 -I tools/autopista/procesa_pack27.py)
from PIL import Image
import numpy as np, os
R = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
P = lambda n: os.path.join(R, 'pack27', n)
for src, dst in [('fondo_base.png', 'ap_tormenta_base.webp'), ('fondo_relampago.png', 'ap_tormenta_luz.webp')]:
    Image.open(P(src)).convert('RGB').save(os.path.join(O, dst), quality=82)
# rayos: 4x4 → dos tiras de 8 fotogramas de 256 (rayo vertical y rayo entre nubes); fondo negro (se suma la luz)
im = Image.open(P('rayos.png')).convert('RGB'); W, H = im.size; c = W / 4
for n, fil in [(1, (0, 1)), (2, (2, 3))]:
    tira = Image.new('RGB', (256 * 8, 256))
    for i in range(8):
        f, col = fil[i // 4], i % 4
        q = im.crop((round(col * c), round(f * c), round((col + 1) * c), round((f + 1) * c))).resize((256, 256), Image.LANCZOS)
        tira.paste(q, (i * 256, 0))
    tira.save(os.path.join(O, 'ap_rayo%d.webp' % n), quality=85)
# lluvia: un fotograma (arriba izquierda) en mosaico, que se desliza hacia abajo; fondo negro (se suma)
im = Image.open(P('lluvia.png')).convert('RGB'); W, H = im.size
im.crop((0, 0, W // 2, H // 2)).resize((512, 512), Image.LANCZOS).save(os.path.join(O, 'ap_lluvia.webp'), quality=80)
print('ok')
