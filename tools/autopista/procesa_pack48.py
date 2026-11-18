"""Pack Autopista 48 ART: arte del Visor -> ui/ap_{splash,r,p,h_*,at,aro_at,pr}_visor/rayo y fx/ap_visor_*.webp"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(R, 'pack48')
UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui'); FX = os.path.join(R, '..', '..', 'public', 'batalla', 'fx')
op = lambda n: Image.open(os.path.join(P, n)).convert('RGB')
# 1) retrato grande 3:4
s = op('splash.png'); w, h = s.size; th = int(w * 4 / 3); s = s.crop((0, 0, w, min(h, th))).resize((768, 1024), Image.LANCZOS); s.save(os.path.join(UI, 'ap_splash_visor.webp'), quality=88)
# 2) hoja de iconos sobre magenta: 8 piezas en 2 filas de 4
a = np.asarray(op('iconos.png')).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
mag = np.clip((np.minimum(r, b) - g - 60) / 120, 0, 1); al = 1 - mag
col = np.clip((a - mag[..., None] * np.array([255, 0, 255], np.float32)) / np.maximum(al[..., None], 0.05), 0, 255)
img = Image.fromarray(np.dstack([col, al * 255]).astype(np.uint8), 'RGBA')
lab, n = ndimage.label(ndimage.binary_fill_holes(al > 0.5))
piezas = [(sl, (lab[sl] == i + 1).sum()) for i, sl in enumerate(ndimage.find_objects(lab))]
piezas = [sl for sl, ar in piezas if ar > 40000]
piezas.sort(key=lambda sl: (round(sl[0].start / 400), sl[1].start)); assert len(piezas) == 8, len(piezas)
nombres = [('ap_r_visor', 256), ('ap_p_visor', 160), ('ap_h_visor_q', 160), ('ap_h_visor_w', 160), ('ap_h_visor_e', 160), ('ap_h_visor_r', 160), ('ap_at_visor', 256)]
for (nom, tam), (sy, sx) in zip(nombres, piezas):
    cy, cx = (sy.start + sy.stop) / 2, (sx.start + sx.stop) / 2; m = max(sy.stop - sy.start, sx.stop - sx.start) / 2 + 2
    img.crop((int(cx - m), int(cy - m), int(cx + m), int(cy + m))).resize((tam, tam), Image.LANCZOS).save(os.path.join(UI, nom + '.webp'), quality=90)
# aro: centrado en su hueco (como el Pack 42: el hueco mide el 50 % del ancho)
sy, sx = piezas[7]; hueco = (mag > 0.9)[sy, sx]; hl, hn = ndimage.label(hueco)
k = max(range(1, hn + 1), key=lambda i: (hl == i).sum()); hy, hx = ndimage.center_of_mass(hl == k); rh = np.sqrt((hl == k).sum() / np.pi)
cy, cx, m = sy.start + hy, sx.start + hx, rh * 2.0
aro = np.asarray(img.crop((int(cx - m), int(cy - m), int(cx + m), int(cy + m))).resize((512, 512), Image.LANCZOS)).copy()
yy, xx = np.mgrid[:512, :512]; aro[np.hypot(yy - 255.5, xx - 255.5) > 180, 3] = 0  # fuera lo que asoma del icono de al lado
Image.fromarray(aro, 'RGBA').save(os.path.join(UI, 'ap_aro_at_visor.webp'), quality=90)
# 3) rayo: cuerpo que se repite, arranque (proyectil) e impacto (sobre negro = luz)
def aluz(im):  # negro -> transparente para poder pintarlo con mezcla normal
    x = np.asarray(im).astype(np.float32); a0 = x.max(-1); c = np.clip(x / np.maximum(a0[..., None], 1) * 255, 0, 255)
    return Image.fromarray(np.dstack([c, a0]).astype(np.uint8), 'RGBA')
z = op('rayo.png'); W, H = z.size
z.crop((0, 0, W, H // 2)).resize((1024, 512), Image.LANCZOS).save(os.path.join(FX, 'ap_visor_rayo.webp'), quality=88)
arr = z.crop((0, H // 2, W // 2, H)).transpose(Image.FLIP_LEFT_RIGHT)  # la cabeza a la derecha: los proyectiles miran a +X
aluz(arr.resize((512, 512), Image.LANCZOS)).save(os.path.join(UI, 'ap_pr_rayo.webp'), quality=90)
imp = z.crop((W // 2, H // 2, W, H)).resize((256, 256), Image.LANCZOS)
hoja = Image.new('RGB', (1024, 1024))
for f in range(16):  # el estallido crece y se apaga en 16 fotogramas
    t = f / 15; e = 0.45 + 0.75 * t; q = imp.resize((max(1, int(256 * e)),) * 2, Image.LANCZOS)
    q = Image.fromarray((np.asarray(q).astype(np.float32) * (1 - t ** 1.6)).astype(np.uint8))
    c0 = Image.new('RGB', (256, 256)); c0.paste(q.crop((max(0, (q.width - 256) // 2),) * 2 + (min(q.width, (q.width + 256) // 2),) * 2), (max(0, (256 - q.width) // 2),) * 2)
    hoja.paste(c0, ((f % 4) * 256, (f // 4) * 256))
hoja.save(os.path.join(FX, 'ap_visor_impacto.webp'), quality=88)
# 4) hojas 4x4: abanico (izquierda) y sobrecarga (derecha), separadas por una raya blanca en el medio
h4 = op('hojas.png'); W, H = h4.size; m = W // 2
h4.crop((0, 0, m - 2, H)).resize((1024, 1024), Image.LANCZOS).save(os.path.join(FX, 'ap_visor_abanico.webp'), quality=88)
h4.crop((m + 2, 0, W, H)).resize((1024, 1024), Image.LANCZOS).save(os.path.join(FX, 'ap_visor_carga.webp'), quality=88)
print('ok')
