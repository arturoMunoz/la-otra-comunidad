"""A-6 · Pack 19 ART (HUD estilo Supercell). Ejecutar: python3 -I tools/autopista/procesa_pack19.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P, UI = os.path.join(R, 'tools/autopista/pack19'), os.path.join(R, 'public/batalla/ui')


def quita_claro(im, huecos=0.0):
    """Quita el fondo claro (blanco o cuadros grises pintados) unido al borde; con huecos>0 también los
    huecos claros cerrados más grandes que esa fracción de la imagen (interior de las barras)."""
    a = np.array(im.convert('RGBA')).astype(int)
    rgb = a[..., :3]
    claro = (rgb.min(-1) > 188) & (rgb.max(-1) - rgb.min(-1) < 22)
    lab, n = ndimage.label(claro)
    ids = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    if huecos:
        tam = np.bincount(lab.ravel())
        ids |= {i for i in range(1, n + 1) if tam[i] > huecos * claro.size}
    fondo = np.isin(lab, list(ids))
    suave = (rgb.min(-1) > 160) & (rgb.max(-1) - rgb.min(-1) < 30)
    for _ in range(3):
        fondo |= ndimage.binary_dilation(fondo) & suave
    a[..., 3] = np.where(fondo, 0, a[..., 3])
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def guarda(im, nombre, lado):
    im = im.crop(im.getbbox()); im.thumbnail((lado, lado), Image.LANCZOS)
    im.save(os.path.join(UI, nombre + '.webp'), 'WEBP', quality=90, method=6)
    return im


def hueco(im):
    """radio del hueco central / radio exterior (para colocar el dibujo dentro del aro)"""
    a = np.array(im)[..., 3]; h, w = a.shape; cy, cx = h // 2, w // 2
    x = cx
    while x < w and a[cy, x] < 40: x += 1
    return (x - cx) / (w / 2)


for n in ['aro_hab', 'aro_hab_lista', 'aro_ulti', 'aro_ulti_lista', 'aro_hechizo']:
    im = guarda(Image.open(f'{P}/ap_{n}.png').convert('RGBA'), 'ap_' + n, 256)
    print(n, im.size, 'hueco %.3f' % hueco(im))
for n in ['mas', 'insignia_nivel']:
    print(n, guarda(Image.open(f'{P}/ap_{n}.png').convert('RGBA'), 'ap_' + n, 192).size)
for n in ['punto_on', 'punto_off']:
    print(n, guarda(Image.open(f'{P}/ap_{n}.png').convert('RGBA'), 'ap_' + n, 128).size)
im = guarda(Image.open(f'{P}/ap_panel_yo.png').convert('RGBA'), 'ap_panel_yo', 1024)
a = np.array(im)[..., 3]; h, w = a.shape
cols = np.nonzero(a[h // 2] < 40)[0]; cols = cols[(cols > 5) & (cols < w * 0.4)]
print('panel_yo', im.size, 'hueco x %.3f-%.3f de ancho' % (cols.min() / w, cols.max() / w))
print('moneda', guarda(quita_claro(Image.open(f'{P}/ap_moneda.png')), 'ap_moneda', 128).size)
# hoja: marco de experiencia, moneda y barras de vida azul/roja/dorada
hoja = quita_claro(Image.open(f'{P}/ap_hoja_barras.png'), huecos=0.004)
al = np.array(hoja)[..., 3] > 30
lab, n = ndimage.label(ndimage.binary_closing(al, iterations=4))
cajas = [s for s in ndimage.find_objects(lab) if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > 0.01 * al.size]
for s in sorted(cajas, key=lambda s: (s[1].start > 700, s[0].start)):
    y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
    pieza = hoja.crop((x0, y0, x1, y1))
    r, g, b = np.array(pieza.convert('RGB')).reshape(-1, 3).astype(int).T
    m = np.array(pieza)[..., 3].ravel() > 100
    cr, cg, cb = r[m].mean(), g[m].mean(), b[m].mean()
    if x1 - x0 < 1.6 * (y1 - y0): nombre = None  # la moneda repetida
    elif x0 < 300: nombre = 'ap_barra_xp'
    elif cb > cr + 30: nombre = 'ap_bv_azul'
    elif cr > cg + 60: nombre = 'ap_bv_rojo'
    else: nombre = 'ap_bv_yo'
    if nombre:
        p = guarda(pieza, nombre, 600)
        aa = np.array(p)[..., 3]; hh, ww = aa.shape; fila = np.nonzero(aa[hh // 2] < 40)[0]; colm = np.nonzero(aa[:, ww // 2] < 40)[0]
        fila = fila[(fila > ww * .05) & (fila < ww * .95)]; colm = colm[(colm > hh * .1) & (colm < hh * .9)]
        print(nombre, p.size, 'hueco x %.3f-%.3f y %.3f-%.3f' % (fila.min() / ww, fila.max() / ww, colm.min() / hh, colm.max() / hh))
