"""Pack Autopista 58 ART (22/11): Taller. pack58/marcos.png (3 marcos de tarjeta + botón Vender) y pack58/iconos.png (Magia, Vender,
Deshacer), sobre magenta -> ui/ap_t_marco{,_leg,_sel}.webp, ui/ap_t_vender.webp, ui/ap_tab_mag.webp, ui/ap_t_vende_ico.webp, ui/ap_t_deshaz.webp.
El halo que cae sobre el magenta se separa: a cada píxel teñido de magenta se le da el alfa más bajo que lo explica (sin pasarse de 0-255)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
MG = np.array([255, 0, 255], np.float32)

def separa(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    s = (np.minimum(r, b) - g) / 255  # cuánto magenta lleva
    amin = np.clip(np.maximum.reduce([1 - r / 255, 1 - b / 255, g / 255]), 0.001, 1)
    t = np.clip((s - 0.1) / 0.1, 0, 1)  # entre 0,1 y 0,2 se pasa poco a poco de opaco al alfa mínimo
    al = 1 - t * (1 - amin)
    col = (c - (1 - al)[..., None] * MG) / al[..., None]
    col = np.clip(col, 0, 255)
    osc = (col.max(-1) < 110) & (t > 0)  # bordes oscuros: gris, sin el verde que deja la resta
    col[osc] = col[osc].mean(-1, keepdims=True)
    return np.dstack([col, al * 255]).astype(np.uint8)

def piezas(f, minimo):
    a = np.asarray(Image.open(os.path.join(R, 'pack58', f)).convert('RGB')).astype(np.float32)
    fondo = (a[..., 0] > 200) & (a[..., 2] > 200) & (a[..., 1] < 80)
    lab, n = ndimage.label(~fondo); objs = ndimage.find_objects(lab)
    cajas = [o for o in objs if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > minimo]
    return a, sorted(cajas, key=lambda s: (round(s[0].start / 200), s[1].start))

# marcos y botón
a, cajas = piezas('marcos.png', 20000); assert len(cajas) == 4, len(cajas)
for nom, (sy, sx) in zip(['ap_t_marco', 'ap_t_marco_leg', 'ap_t_marco_sel', 'ap_t_vender'], cajas):
    sy = slice(max(0, sy.start - 6), sy.stop + 6); sx = slice(max(0, sx.start - 6), sx.stop + 6)
    out = separa(a[sy, sx].copy())
    # el de la tarjeta elegida trae halo por fuera: se recorta igual que los otros para que los tres casen (mismo hueco, mismo tamaño)
    Image.fromarray(out, 'RGBA').save(os.path.join(UI, nom + '.webp'), quality=90)
    al = out[..., 3] > 128; ys, xs = np.nonzero(al)
    # hueco: la fila del centro, del borde izquierdo opaco hacia dentro hasta que deja de ser opaco
    cy, cx = out.shape[0] // 2, out.shape[1] // 2
    fila = al[cy]; col = al[:, cx]
    def hueco(v):
        i = np.argmax(v); j = i
        while j < len(v) and v[j]: j += 1
        k = len(v) - 1 - np.argmax(v[::-1]); l = k
        while l >= 0 and v[l]: l -= 1
        return i, j, l, k
    print(nom, out.shape[1], 'x', out.shape[0], 'opaco x', xs.min(), xs.max(), 'y', ys.min(), ys.max(), '| borde izq/der (fila del centro):', hueco(fila), '| arriba/abajo:', hueco(col))

# iconos redondos: dentro del círculo, opaco (la bola de plasma es violeta, como el magenta); el borde, suavizado a 1 px
a, cajas = piezas('iconos.png', 100000); assert len(cajas) == 3, len(cajas)
for nom, (sy, sx) in zip(['ap_tab_mag', 'ap_t_vende_ico', 'ap_t_deshaz'], cajas):
    c = a[sy, sx]; h, w = c.shape[:2]; rad = min(h, w) / 2 - 1.5
    yy, xx = np.mgrid[0:h, 0:w]; d = np.hypot(xx - (w - 1) / 2, yy - (h - 1) / 2)
    al = np.clip(rad - d + 0.5, 0, 1)
    out = np.dstack([c, al * 255]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').resize((256, 256), Image.LANCZOS).save(os.path.join(UI, nom + '.webp'), quality=90)
    print(nom, w, h)
