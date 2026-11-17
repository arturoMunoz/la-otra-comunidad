# Pack Autopista 30 ART: placas de vida + energía (azul/roja/dorada). Quita el magenta (fuera y dentro de las ventanas) y mide las ventanas.
# python3 -I tools/autopista/procesa_pack30.py
import json, numpy as np
from PIL import Image
from scipy import ndimage
R = 'tools/autopista/pack30/'; S = 'public/batalla/ui/'
im = np.array(Image.open(R + 'placas.png').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
mag = (r > 150) & (b > 150) & (g < 130)
lab, n = ndimage.label(~mag)
placas = sorted([s for i, s in enumerate(ndimage.find_objects(lab)) if (lab[s] == i + 1).sum() > 20000], key=lambda s: s[0].start)
med = {}
for nombre, s in zip(['azul', 'rojo', 'yo'], placas):
    y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
    c = im[y0:y1, x0:x1].copy(); m = mag[y0:y1, x0:x1]
    # ventanas = magenta que no toca el borde de la placa
    l2, n2 = ndimage.label(m); vent = []
    for j, s2 in enumerate(ndimage.find_objects(l2)):
        if s2[0].start > 0 and s2[1].start > 0 and s2[0].stop < m.shape[0] and s2[1].stop < m.shape[1] and (l2[s2] == j + 1).sum() > 2000:
            vent.append((s2[0].start, s2[0].stop, s2[1].start, s2[1].stop))
    vent.sort()
    a = np.where(m, 0, 255).astype(np.uint8)
    # quitar el tinte rosa del borde: píxeles casi magenta junto al hueco → algo transparentes y sin rosa
    borde = ndimage.binary_dilation(m, iterations=2) & ~m
    a[borde] = 160
    cc = c.copy(); cc[borde, 1] = np.maximum(cc[borde, 1], np.minimum(cc[borde, 0], cc[borde, 2]) // 2)
    cc[borde, 0] = cc[borde, 0] * 0.6; cc[borde, 2] = cc[borde, 2] * 0.6
    out = np.dstack([cc.clip(0, 255).astype(np.uint8), a])
    Image.fromarray(out, 'RGBA').save(S + 'ap_placa_' + nombre + '.webp', quality=92)
    W, H = x1 - x0, y1 - y0
    med[nombre] = {'w': W, 'h': H, 'vent': [[v[2] / W * 100, v[0] / H * 100, v[3] / W * 100, v[1] / H * 100] for v in vent]}
print(json.dumps(med, indent=1))

# ---------- imágenes 2-4: líquidos viscosos (vida.png = tiras verde/azul/rojo, energia.png = fucsia horizontal y vertical, frentes.png = remates)
from scipy import ndimage as nd
def carga(n):
    a = np.array(Image.open(R + n + '.png').convert('RGB')); m = (a[..., 0] > 150) & (a[..., 2] > 150) & (a[..., 1] < 130); return a, m
a, m = carga('vida')
for nombre, (y0, y1) in zip(['verde', 'azul', 'rojo'], [(162, 418), (514, 771), (868, 1124)]):
    Image.fromarray(a[y0:y1]).resize((1024, 128), Image.LANCZOS).save(S + 'ap_liq_' + nombre + '.webp', quality=88)
a, m = carga('energia')
v = a[380:1228, 440:814]                                 # vertical sin la ola de arriba
Image.fromarray(v).save(S + 'ap_liq_fucsia_v.webp', quality=88)
Image.fromarray(np.rot90(v, 1).copy()).resize((1024, 128), Image.LANCZOS).save(S + 'ap_liq_fucsia.webp', quality=88)
# remates: la punta redondeada de cada gota (lo de la derecha), con transparencia
a, m = carga('frentes')
for nombre, (y0, y1) in zip(['verde', 'azul', 'rojo', 'fucsia'], [(61, 250), (300, 490), (539, 728), (784, 971)]):
    sub = ~m[y0:y1]; xs = np.where(sub.any(0))[0]; x1 = xs.max() + 2; h = y1 - y0; x0 = x1 - int(h * 0.75)
    rgb = a[y0:y1, x0:x1]; al = np.where(sub[:, x0:x1], 255, 0).astype(np.uint8)
    al = nd.uniform_filter(al.astype(float), 3).astype(np.uint8)
    Image.fromarray(np.dstack([rgb, al]), 'RGBA').resize((96, 128), Image.LANCZOS).save(S + 'ap_liq_punta_' + nombre + '.webp', quality=90)
# batería del HUD: el mismo hueco de la llena, relleno con el líquido vertical
ll = np.array(Image.open(S + 'ap_mana_llena.webp').convert('RGBA')); al = ll[..., 3]
ys, xs = np.where(al > 20); bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
tex = np.array(Image.fromarray(v).resize((bx1 - bx0, by1 - by0), Image.LANCZOS))
nuevo = ll.copy(); nuevo[by0:by1, bx0:bx1, :3] = tex
Image.fromarray(nuevo, 'RGBA').save(S + 'ap_mana_llena.webp', quality=90)
print('líquidos hechos')
