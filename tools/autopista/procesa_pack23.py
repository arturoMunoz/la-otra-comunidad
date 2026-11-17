"""A-6 · Pack 23 ART (botones redondos, baliza, minimapa, marcador, cartel, batería). Ejecutar: python3 -I tools/autopista/procesa_pack23.py

- Las hojas de marcos (hoja_marcos_*.png) venían SIN transparencia (cuadros pintados): se quita el fondo claro unido al borde.
- La batería llena venía con otro marco distinto de la vacía: se usa SOLO su líquido fucsia, encajado en el hueco de la vacía.
- La baliza apagada venía sin aro (solo la cámara gris): se hace de la encendida, sin color y más oscura.
"""
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P, UI = os.path.join(R, 'tools/autopista/pack23'), os.path.join(R, 'public/batalla/ui')


def guarda(im, n, lado):
    im = im.crop(im.getbbox()); im.thumbnail((lado, lado), Image.LANCZOS)
    im.save(os.path.join(UI, f'ap_{n}.webp'), 'WEBP', quality=92, method=6); return im


def quita_fondo(im):
    """fondo claro y gris (sin color) unido al borde → transparente"""
    a = np.array(im.convert('RGB')).astype(int); mx, mn = a.max(2), a.min(2)
    claro = (mn > 200) & (mx - mn < 22)
    lab, _ = ndimage.label(claro); borde = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fondo = np.isin(lab, list(borde)); fondo = ndimage.binary_dilation(fondo, iterations=2) & (mn > 150)
    out = np.dstack([a, np.where(fondo, 0, 255)]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


# botones redondos
for n in ['volver', 'zoom', 'torre', 'subditos', 'ajustes', 'armeria', 'baliza']:
    guarda(Image.open(f'{P}/{n}.png').convert('RGBA'), {'volver': 'b_volver', 'zoom': 'b_zoom', 'torre': 'b_torre', 'subditos': 'b_subditos',
           'ajustes': 'b_ajustes', 'armeria': 'b_armeria', 'baliza': 'baliza'}[n], 256)
b = Image.open(f'{P}/baliza.png').convert('RGBA'); a = np.array(b).astype(float)
g = a[..., :3].mean(2, keepdims=True); a[..., :3] = (g * 0.55).repeat(3, 2)
guarda(Image.fromarray(a.astype(np.uint8), 'RGBA'), 'baliza_off', 256)

# marco del minimapa (interior ya transparente): medir el hueco
m = guarda(Image.open(f'{P}/marco_minimapa.png').convert('RGBA'), 'marco_minimapa', 768)
al = np.array(m)[..., 3]; h, w = al.shape
fila, col = al[h // 2], al[:, w // 2]
x0 = next(i for i in range(w // 2, 0, -1) if fila[i] > 60); x1 = next(i for i in range(w // 2, w) if fila[i] > 60)
y0 = next(i for i in range(h // 2, 0, -1) if col[i] > 60); y1 = next(i for i in range(h // 2, h) if col[i] > 60)
print('marco_minimapa', m.size, 'hueco x %.3f-%.3f y %.3f-%.3f' % (x0 / w, x1 / w, y0 / h, y1 / h))

# marcador y cartel: de la hoja B (la de los huecos tintados azul / oro / rojo)
hb = quita_fondo(Image.open(f'{P}/hoja_marcos_b.png'))
A = np.array(hb); lab, n = ndimage.label(A[..., 3] > 0)
piezas = sorted([s for s in ndimage.find_objects(lab) if (s[1].stop - s[1].start) > 600], key=lambda s: s[0].start)
for s, nom in zip(piezas[1:3], ['marcador', 'cartel']):
    im = guarda(hb.crop((s[1].start, s[0].start, s[1].stop, s[0].stop)), nom, 768)
    print(nom, im.size, '%.2f' % (im.width / im.height))

# batería: el marco de la vacía y, dentro de su hueco, el líquido de la llena
v = Image.open(f'{P}/mana_vacia.png').convert('RGBA'); v = v.crop(v.getbbox())
va = np.array(v).astype(int); h, w = va.shape[:2]
# hueco = la zona oscura del centro (rgb < 40) unida al punto central
osc = (va[..., :3].max(2) < 40) & (va[..., 3] > 200)
lab, _ = ndimage.label(osc); hu = lab == lab[h // 2, w // 2]
ys, xs = np.where(hu); X0, X1, Y0, Y1 = xs.min(), xs.max(), ys.min(), ys.max()
print('mana_vacia', (w, h), 'hueco x %.3f-%.3f y %.3f-%.3f' % (X0 / w, X1 / w, Y0 / h, Y1 / h))
L = Image.open(f'{P}/mana_llena_original.png').convert('RGBA'); la = np.array(L).astype(int)
rosa = (la[..., 0] > 150) & (la[..., 2] > 120) & (la[..., 1] < 110)
lab, _ = ndimage.label(rosa); mayor = max(range(1, lab.max() + 1), key=lambda i: (lab == i).sum())
ys, xs = np.where(lab == mayor); liq = L.crop((xs.min() + 6, ys.min() + 6, xs.max() - 6, ys.max() - 6)).resize((X1 - X0 + 1, Y1 - Y0 + 1), Image.LANCZOS)
# solo dentro del hueco (máscara suavizada) y encima del marco vacío
mask = Image.fromarray((hu * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
capa = Image.new('RGBA', v.size, (0, 0, 0, 0)); capa.paste(liq.convert('RGBA'), (X0, Y0))
capa.putalpha(mask)
guarda(v, 'mana_vacia', 512)
guarda(Image.alpha_composite(v, capa), 'mana_llena', 512)
print('mana_llena: BOT_Y0 %.1f BOT_Y1 %.1f (desde abajo y arriba del hueco, en %% de la altura)' % (100 - Y1 / h * 100, 100 - Y0 / h * 100))
