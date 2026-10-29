"""Ciclo de andar de ChatGPT con raya de suelo (n fotogramas en fila, fondo magenta).
uso: python3 tools/andar8.py HOJA.png NOMBRE  -> public/assets/pj/andar_NOMBRE.webp (n x 53 x 74) e imprime los pies"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, nom = sys.argv[1], sys.argv[2]; FW, H = 53, 74
a = np.array(Image.open(src).convert('RGB')).astype(int); h, w, _ = a.shape
ly = [y for y in range(h) if (a.max(2)[y] < 60).mean() > 0.5]; base = min(ly) - 1
r, g, b = a[..., 0], a[..., 1], a[..., 2]
col = (a.max(2) - a.min(2)) > 45  # sin grises: el palo de golf de Arturo no cuenta para la altura ni para centrar la cabeza
fg = ~ndimage.binary_dilation((r > 170) & (b > 170) & (g < 120), iterations=1); fg[min(ly) - 1:max(ly) + 2] = False
lab, n = ndimage.label(ndimage.binary_closing(fg, iterations=4)); ob = ndimage.find_objects(lab)
sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
sel = sorted([i for i in range(n) if sz[i] > 8000], key=lambda i: ob[i][1].start)
top = min(ob[i][0].start + np.argmax(((lab[ob[i]] == i + 1) & col[ob[i]]).any(1)) for i in sel); sc = 71 / (base + 1 - top)
N = len(sel); sheet = Image.new('RGBA', (FW * N, H), (0, 0, 0, 0)); info = []
for f, i in enumerate(sel):
    s = ob[i]; m = (lab[s] == i + 1) & fg[s]
    mc = m & col[s]; t0 = np.argmax(mc.any(1)); hx = np.nonzero(mc[t0:t0 + 40])[1].mean()
    full = np.zeros((base + 1 - s[0].start, m.shape[1], 4), np.uint8)  # hasta la línea
    full[:m.shape[0], :, :3] = a[s][:full.shape[0]]; full[:m.shape[0], :, 3] = np.where(m, 255, 0)[:full.shape[0]]
    im = Image.fromarray(full); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    y0 = H - 2 - im.height  # la línea del suelo cae en y = H-2
    x0 = round(27 - hx * sc)
    fr = Image.new('RGBA', (FW, H), (0, 0, 0, 0)); fr.paste(im, (x0, y0), im); sheet.alpha_composite(fr, (f * FW, 0))
A = np.array(sheet); A[..., 3] = np.where(A[..., 3] > 110, 255, 0); Image.fromarray(A).save(f'public/assets/pj/andar_{nom}.webp', lossless=True)
op = A[..., 3] > 0
for f in range(N):
    o = op[:, f * FW:(f + 1) * FW]; c = o[H - 4:H - 1].any(0); xs = np.nonzero(c)[0]
    runs = np.split(xs, np.where(np.diff(xs) > 2)[0] + 1) if len(xs) else []
    print(f, [(int(r_[0]), int(r_[-1])) for r_ in runs])
print('ok', nom, N, round(sc, 3))
