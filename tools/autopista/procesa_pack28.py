# Pack Autopista 28 ART: medallones del menú (partida guiada y crear sala), recortados del magenta en círculo
from PIL import Image, ImageDraw
import numpy as np, os
R = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
for src, dst in [('guia.png', 'ap_guia.webp'), ('crear_sala.png', 'ap_crear.webp')]:
    im = Image.open(os.path.join(R, 'pack28', src)).convert('RGBA'); a = np.array(im)
    mag = (a[..., 0] > 200) & (a[..., 2] > 200) & (a[..., 1] < 90)
    ys, xs = np.where(~mag); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    im = im.crop((x0, y0, x1 + 1, y1 + 1)); w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((256, 256), Image.LANCZOS)
    m = Image.new('L', (1024, 1024), 0); ImageDraw.Draw(m).ellipse((6, 6, 1018, 1018), fill=255); m = m.resize((256, 256), Image.LANCZOS)
    im.putalpha(m); im.save(os.path.join(O, dst), quality=88)
print('ok')
