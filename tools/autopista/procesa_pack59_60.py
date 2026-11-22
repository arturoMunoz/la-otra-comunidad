"""Packs Autopista 59 y 60 ART (22/11), sobre magenta:
 pack59/maestria_mvp.png -> ui/ap_mae_1..5.webp (misma escala para los cinco), ui/ap_mvp.webp, ui/ap_svp.webp
 pack59/emoticonos.png   -> ui/ap_emo_{hola,risa,burla,gg}.webp, ui/ap_emo_boton.webp
 pack60/rangos.png       -> ui/ap_rango_1..7.webp (misma escala para los siete)
Cada pieza = sus trozos grandes + los trocitos sueltos más cercanos (chispas); el halo sobre magenta se separa como en el Pack 58."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
MG = np.array([255, 0, 255], np.float32)

def separa(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    s = (np.minimum(r, b) - g) / 255
    amin = np.clip(np.maximum.reduce([1 - r / 255, 1 - b / 255, g / 255]), 0.001, 1)
    t = np.clip((s - 0.1) / 0.1, 0, 1)
    al = 1 - t * (1 - amin)
    col = np.clip((c - (1 - al)[..., None] * MG) / al[..., None], 0, 255)
    osc = (col.max(-1) < 110) & (t > 0)
    col[osc] = col[osc].mean(-1, keepdims=True)
    return np.dstack([col, al * 255]).astype(np.uint8)

def grupos(f, n, filas=1, zona=7):
    a = np.asarray(Image.open(os.path.join(R, f)).convert('RGB')).astype(np.float32)
    fondo = np.hypot(np.hypot(a[..., 0] - 255, a[..., 1]), a[..., 2] - 255) < 70  # solo el magenta de verdad: el fucsia de la Leyenda y de la Maestría V no es fondo
    borde = ndimage.binary_dilation(fondo, iterations=zona) & ~fondo  # el halo solo se separa cerca del fondo; dentro, todo opaco
    lab, k = ndimage.label(~fondo); area = ndimage.sum(np.ones_like(lab), lab, range(1, k + 1)); cm = ndimage.center_of_mass(~fondo, lab, range(1, k + 1))
    grandes = sorted(range(k), key=lambda i: -area[i])[:n]
    # orden: por filas (arriba-abajo) y de izquierda a derecha
    alto = a.shape[0] / filas
    grandes.sort(key=lambda i: (int(cm[i][0] // alto), cm[i][1]))
    asig = np.zeros(k + 1, int)
    for gi, i in enumerate(grandes): asig[i + 1] = gi + 1
    for i in range(k):
        if asig[i + 1] or area[i] < 3: continue
        d = [np.hypot(cm[i][0] - cm[j][0], cm[i][1] - cm[j][1]) for j in grandes]; asig[i + 1] = int(np.argmin(d)) + 1
    G = asig[lab]; out = []
    for gi in range(1, n + 1):
        ys, xs = np.nonzero(G == gi); y0, y1, x0, x1 = max(0, ys.min() - 8), ys.max() + 9, max(0, xs.min() - 8), xs.max() + 9
        c = a[y0:y1, x0:x1].copy(); pieza = np.dstack([c, np.full(c.shape[:2], 255.0)]).astype(np.uint8)
        sep = separa(c); bz = borde[y0:y1, x0:x1]; pieza[bz] = sep[bz]; pieza[fondo[y0:y1, x0:x1], 3] = 0
        vecino = (G[y0:y1, x0:x1] > 0) & (G[y0:y1, x0:x1] != gi)
        pieza[vecino, 3] = 0
        out.append(pieza)
    return out

def guarda(nom, p, lado=None, escala=None):
    im = Image.fromarray(p, 'RGBA')
    if escala: im = im.resize((max(1, round(im.width * escala)), max(1, round(im.height * escala))), Image.LANCZOS)
    if lado:
        lienzo = Image.new('RGBA', (lado, lado), (0, 0, 0, 0)); lienzo.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2), im); im = lienzo
    im.save(os.path.join(UI, nom + '.webp'), quality=90); print(nom, im.size)

def serie(nombres, piezas, lado):
    k = lado / max(max(p.shape[:2]) for p in piezas)
    for nom, p in zip(nombres, piezas): guarda(nom, p, lado, k)

m = grupos('pack59/maestria_mvp.png', 7, filas=2)
serie(['ap_mae_%d' % i for i in range(1, 6)], m[:5], 160)
for nom, p in zip(['ap_mvp', 'ap_svp'], m[5:]): guarda(nom, p, None, 300 / p.shape[1])
e = grupos('pack59/emoticonos.png', 5, zona=22)  # la sombra de las pegatinas es ancha (y no llevan fucsia)
for nom, p in zip(['ap_emo_hola', 'ap_emo_risa', 'ap_emo_burla', 'ap_emo_gg', 'ap_emo_boton'], e): guarda(nom, p, 160, 150 / max(p.shape[:2]))
r = grupos('pack60/rangos.png', 7)
serie(['ap_rango_%d' % i for i in range(1, 8)], r, 160)
