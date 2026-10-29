"""Pantalón y capa para el andar de un hobbit ya preparado (public/assets/pj/andar_NOMBRE.webp, fotogramas de 53x74).
uso: python3 tools/ropa.py NOMBRE"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
nom = sys.argv[1]; FW, H = 53, 74
A = np.array(Image.open(f'public/assets/pj/andar_{nom}.webp').convert('RGBA')); N = A.shape[1] // FW
def piezas(path, minsz):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fg = ~ndimage.binary_dilation((r > 170) & (b > 170) & (g < 120), iterations=1)
    lab, n = ndimage.label(ndimage.binary_closing(fg, iterations=5)); ob = ndimage.find_objects(lab)
    sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return a, fg, lab, ob, [i for i in range(n) if sz[i] > minsz], None
# ---- pantalón: debajo del chaleco verde, tonos pardos/verdosos, sin piel ni el negro del contorno
W = A.astype(int); rgb = W[..., :3] / 255.; mx = rgb.max(2); mn = rgb.min(2); v = mx
s_ = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0); r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]; d = np.maximum(mx - mn, 1e-6)
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
op = W[..., 3] > 128
green = op & (hue > 45) & (hue < 100) & (s_ > 0.35) & (v > 0.2)
skin = op & (hue > 15) & (hue < 40) & (v > 0.75) & (s_ > 0.3)
mask = np.zeros((H, FW * N), bool)
for f in range(N):
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
lum = np.zeros((H, CF * N, 4), np.uint8); oro = np.zeros((H, CF * N, 4), np.uint8)
for f in range(N):
    i = big2[min(5, f * 6 // N)]
    s = ob2[i]; m = (lab2[s] == i + 1) & fg2[s]; cr = a2[s]; rr, gg, bb = cr[..., 0], cr[..., 1], cr[..., 2]
    gold = m & (rr > 150) & (gg > 90) & (bb < 90) & (rr - bb > 80); gy, gx = np.nonzero(gold); by, bx = gy.mean(), gx.mean()
    k = 44 / (m.shape[0] - by)
    o = (op & ((W[..., :3].max(2) - W[..., :3].min(2)) > 45))[:, f * FW:f * FW + FW]; top = np.argmax(o.any(1)); cx = np.nonzero(o[top:top + 14])[1].mean()
    ax, ay = cx - 1 - OX, top + 18
    L = (0.3 * rr + 0.59 * gg + 0.11 * bb)
    for arr, dst in [(np.dstack([L, L, L, np.where(m & ~gold, 255, 0)]), lum), (np.dstack([cr, np.where(gold, 255, 0)]), oro)]:
        im = Image.fromarray(arr.astype(np.uint8)).resize((round(m.shape[1] * k), round(m.shape[0] * k)), Image.LANCZOS)
        fr = Image.new('RGBA', (CF, H), (0, 0, 0, 0)); fr.paste(im, (round(ax - bx * k), round(ay - by * k)), im)
        dst[:, f * CF:(f + 1) * CF] = np.array(fr)
Image.fromarray(lum).save(f'public/assets/pj/ropa_capa_{nom}.webp', lossless=True)
Image.fromarray(oro).save(f'public/assets/pj/ropa_capa_f_{nom}.webp', lossless=True)
print('ok', nom, N)
