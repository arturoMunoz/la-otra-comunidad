"""Animación de QUIETO de ChatGPT (fotogramas en fila sobre una raya negra de suelo, fondo magenta; puede traer varias filas).
uso: python3 tools/quieto.py HOJA.png NOMBRE [fila]  -> public/assets/pj/quieto_NOMBRE.webp (n x 53 x 74)"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, nom = sys.argv[1], sys.argv[2]; fila = int(sys.argv[3]) if len(sys.argv) > 3 else 0; FW, H = 53, 74
a = np.array(Image.open(src).convert('RGB')).astype(int); h, w, _ = a.shape
dark = [y for y in range(h) if (a.max(2)[y] < 70).mean() > 0.5]
lines = [g[0] for g in np.split(np.array(dark), np.where(np.diff(dark) > 3)[0] + 1)]
y1 = lines[fila]; y0 = (lines[fila - 1] + 4) if fila > 0 else 0
r, g, b = a[..., 0], a[..., 1], a[..., 2]
import os
col = ((a.max(2) - a.min(2)) > 45) if os.environ.get('SIN_GRIS') else np.ones(a.shape[:2], bool)  # SIN_GRIS=1: los grises (el palo de golf de Arturo) no cuentan para la altura ni para centrar la cabeza
fg = ~ndimage.binary_dilation((b > g + 40) & (r > 120) & (b > 120), iterations=1)
fg[:y0] = False; fg[y1 - 1:] = False
lab, n = ndimage.label(ndimage.binary_closing(fg, iterations=4)); ob = ndimage.find_objects(lab)
sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
sel = sorted([i for i in range(n) if sz[i] > 6000], key=lambda i: ob[i][1].start)
top = min(ob[i][0].start + np.argmax(((lab[ob[i]] == i + 1) & col[ob[i]]).any(1)) for i in sel); sc = 71 / (y1 - top)
N = len(sel); sheet = Image.new('RGBA', (FW * N, H), (0, 0, 0, 0))
for f, i in enumerate(sel):
    s = ob[i]; m = (lab[s] == i + 1) & fg[s]
    mc = m & col[s]; t0 = np.argmax(mc.any(1)); hx = np.nonzero(mc[t0:t0 + 40])[1].mean()
    full = np.zeros((y1 - s[0].start, m.shape[1], 4), np.uint8)
    full[:m.shape[0], :, :3] = a[s][:full.shape[0]]; full[:m.shape[0], :, 3] = np.where(m, 255, 0)[:full.shape[0]]
    im = Image.fromarray(full); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    fr = Image.new('RGBA', (FW, H), (0, 0, 0, 0)); fr.paste(im, (round(27 - hx * sc), H - 2 - im.height), im); sheet.alpha_composite(fr, (f * FW, 0))
A = np.array(sheet); A[..., 3] = np.where(A[..., 3] > 110, 255, 0); Image.fromarray(A).save(f'public/assets/pj/quieto_{nom}.webp', lossless=True)
print('ok', nom, N, round(sc, 3))
