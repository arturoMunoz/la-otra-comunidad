"""Prepara el andar de un hobbit a partir de la hoja de ChatGPT (fondo magenta, 6 fotogramas en fila).
uso: python3 tools/andar.py HOJA.png NOMBRE [fila]   (fila 0 = arriba, 1 = abajo si la hoja trae dos)
Saca: public/assets/pj/andar_NOMBRE.webp (6x53x74), ropa_pantalon_NOMBRE.webp y ropa_capa_NOMBRE(+_f).webp"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, nom = sys.argv[1], sys.argv[2]; fila = int(sys.argv[3]) if len(sys.argv) > 3 else 0
FW, H = 53, 74
def piezas(path, minsz):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fg = ~ndimage.binary_dilation((r > 170) & (b > 170) & (g < 120), iterations=1)
    lab, n = ndimage.label(ndimage.binary_closing(fg, iterations=5)); ob = ndimage.find_objects(lab)
    sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    big = [i for i in range(n) if sz[i] > minsz]
    filas = sorted(set(round(((ob[i][0].start + ob[i][0].stop) / 2) / 150) for i in big))
    return a, fg, lab, ob, big, filas
a, fg, lab, ob, big, filas = piezas(src, 8000)
mid = lambda i: (ob[i][0].start + ob[i][0].stop) / 2
ys = sorted(set(int(mid(i)) for i in big)); cut = (min(ys) + max(ys)) / 2
sel = sorted([i for i in big if (mid(i) > cut) == bool(fila)], key=lambda i: ob[i][1].start)[:6]
assert len(sel) == 6, len(sel)
hmax = max(ob[i][0].stop - ob[i][0].start for i in sel); sc = 71 / hmax
sheet = Image.new('RGBA', (FW * 6, H), (0, 0, 0, 0))
for f, i in enumerate(sel):
    s = ob[i]; m = (lab[s] == i + 1) & fg[s]
    im = Image.fromarray(np.dstack([a[s], np.where(m, 255, 0)]).astype(np.uint8))
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    al = np.array(im)[..., 3] > 128; top = np.argmax(al.any(1)); hx = np.nonzero(al[top:top + 14])[1].mean()
    fr = Image.new('RGBA', (FW, H), (0, 0, 0, 0)); fr.alpha_composite(im, (0, 0)) if False else fr.paste(im, (round(27 - hx), H - 1 - im.height), im)
    sheet.alpha_composite(fr, (f * FW, 0))
A = np.array(sheet); A[..., 3] = np.where(A[..., 3] > 110, 255, 0); sheet = Image.fromarray(A)
sheet.save(f'public/assets/pj/andar_{nom}.webp', lossless=True)
# ---- pantalón: debajo del chaleco verde, tonos pardos/verdosos, sin piel ni el negro del contorno
W = A.astype(int); rgb = W[..., :3] / 255.; mx = rgb.max(2); mn = rgb.min(2); v = mx
s_ = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0); r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]; d = np.maximum(mx - mn, 1e-6)
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
op = W[..., 3] > 128
green = op & (hue > 45) & (hue < 100) & (s_ > 0.35) & (v > 0.2)
skin = op & (hue > 15) & (hue < 40) & (v > 0.75) & (s_ > 0.3)
mask = np.zeros((H, FW * 6), bool)
for f in range(6):
    x0 = f * FW; c = green[:, x0:x0 + FW].sum(1)
    rows = [y for y in range(25, 60) if c[y] >= 3]
    vb = max(rows) if rows else 45
    reg = op[:, x0:x0 + FW] & ~skin[:, x0:x0 + FW] & (v[:, x0:x0 + FW] > 0.16)
    cand = reg & ((hue[:, x0:x0 + FW] < 75) | green[:, x0:x0 + FW]); cand[:vb - 1] = False; cand[vb + 22:] = False
    lab2, n2 = ndimage.label(cand); keep = np.zeros_like(cand)
    for j, sl in enumerate(ndimage.find_objects(lab2)):
        cc = lab2[sl] == j + 1
        if cc.sum() >= 25 and sl[0].start <= vb + 6: keep[sl] |= cc
    keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, iterations=1)) & reg
    mask[:, x0:x0 + FW] = keep
V = (W[..., :3].max(2)).astype(np.uint8)
Image.fromarray(np.dstack([V, V, V, np.where(mask, 255, 0).astype(np.uint8)])).save(f'public/assets/pj/ropa_pantalon_{nom}.webp', lossless=True)
# ---- capa: los 6 fotogramas de capa de ChatGPT, anclados al cuello de cada postura
CAPA = 'tools/capa_chatgpt.png'
a2, fg2, lab2, ob2, big2, _ = piezas(CAPA, 5000); big2.sort(key=lambda i: ob2[i][1].start)
CF, OX = 84, -31
lum = np.zeros((H, CF * 6, 4), np.uint8); oro = np.zeros((H, CF * 6, 4), np.uint8)
for f, i in enumerate(big2[:6]):
    s = ob2[i]; m = (lab2[s] == i + 1) & fg2[s]; cr = a2[s]; rr, gg, bb = cr[..., 0], cr[..., 1], cr[..., 2]
    gold = m & (rr > 150) & (gg > 90) & (bb < 90) & (rr - bb > 80); gy, gx = np.nonzero(gold); by, bx = gy.mean(), gx.mean()
    k = 44 / (m.shape[0] - by)
    o = op[:, f * FW:f * FW + FW]; top = np.argmax(o.any(1)); cx = np.nonzero(o[top:top + 14])[1].mean()
    ax, ay = cx - 1 - OX, top + 18
    L = (0.3 * rr + 0.59 * gg + 0.11 * bb)
    for arr, dst in [(np.dstack([L, L, L, np.where(m & ~gold, 255, 0)]), lum), (np.dstack([cr, np.where(gold, 255, 0)]), oro)]:
        im = Image.fromarray(arr.astype(np.uint8)).resize((round(m.shape[1] * k), round(m.shape[0] * k)), Image.LANCZOS)
        fr = Image.new('RGBA', (CF, H), (0, 0, 0, 0)); fr.paste(im, (round(ax - bx * k), round(ay - by * k)), im)
        dst[:, f * CF:(f + 1) * CF] = np.array(fr)
Image.fromarray(lum).save(f'public/assets/pj/ropa_capa_{nom}.webp', lossless=True)
Image.fromarray(oro).save(f'public/assets/pj/ropa_capa_f_{nom}.webp', lossless=True)
print('ok', nom, round(sc, 3))
