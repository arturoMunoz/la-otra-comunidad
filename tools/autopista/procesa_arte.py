"""Convierte el arte de ChatGPT de La Autopista (packs 4, 5 y 6) a public/batalla/ui/ap_*.webp.
Uso: python3 tools/autopista/procesa_arte.py  (desde la raíz del repo)
Los originales del Pack 4 llegaron sueltos (no en zip) y se guardan en tools/autopista/pack4/."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

R = os.path.dirname(os.path.abspath(__file__))
UI = os.path.join(R, '..', '..', 'public', 'batalla', 'ui')
P4, P5a, P5b, P6 = (os.path.join(R, d) for d in ('pack4', 'Pack_Autopista_5_ART_Tanda_1', 'Pack_Autopista_5_ART_Tanda_2', 'Pack_Autopista_6_ART'))
ORDEN = ['enano', 'gandalf', 'orco', 'elfo', 'hobbit', 'gollum', 'rohan']  # Brask, Vael, Grub, Ata, Birdie, Fu, Moha


def guarda(im, nombre, q=84, ancho=None):
    if ancho and im.width > ancho:
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    im.save(os.path.join(UI, nombre + '.webp'), quality=q, method=6)


def sin_magenta(ruta):
    """Quita el fondo magenta: máscara + borde rosa fuera + color de borde corregido."""
    a = np.asarray(Image.open(ruta).convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = ((r > 150) & (b > 150) & (g < 120)) | ((r > 120) & (b > 130) & (g < 95) & (r - g > 80) & (b - g > 80))
    mag = ndimage.binary_dilation(mag, iterations=1)  # el halo rosa del borde
    # los trozos sueltos que no son magenta pero están rodeados de él (motas) fuera
    lab, n = ndimage.label(~mag)
    if n:
        tam = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        mag |= np.isin(lab, [i + 1 for i, t in enumerate(tam) if t < 60])
    alfa = np.where(mag, 0, 255).astype(np.uint8)
    alfa = ndimage.gaussian_filter(alfa.astype(float), 0.7).astype(np.uint8)
    rgb = a.copy()
    # quita el tinte rosa en los píxeles semitransparentes del borde
    borde = (alfa > 0) & (alfa < 255)
    m = np.minimum(rgb[..., 0], rgb[..., 2])
    exceso = np.clip(m - rgb[..., 1], 0, None)
    for c in (0, 2):
        rgb[..., c] = np.where(borde, rgb[..., c] - exceso // 2, rgb[..., c])
    out = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alfa])
    return Image.fromarray(out, 'RGBA')


def rellena_suelo(im):
    """La capa lejana acaba en las montañas y debajo no hay nada: se pone DETRÁS un suelo
    con niebla (degradado por filas, igual en toda la anchura) desde la falda hasta abajo."""
    a = np.asarray(im).astype(float)
    h, w = a.shape[:2]
    ys = np.where((a[..., 3] > 200).any(axis=1))[0]
    y0 = int(np.percentile(np.where(a[..., 3] > 200)[0], 92)) - 40  # algo por encima de la falda
    arriba, abajo = np.array([78, 58, 104.]), np.array([18, 12, 26.])
    t = np.clip((np.arange(h) - y0) / max(1, h - y0), 0, 1)[:, None] ** 0.55
    fila = arriba * (1 - t) + abajo * t
    suelo = np.zeros((h, w, 4))
    suelo[..., :3] = fila[:, None, :]
    suelo[..., 3] = np.clip((np.arange(h) - y0) / 30, 0, 1)[:, None] * 255
    fa = a[..., 3:4] / 255
    out = a.copy()
    out[..., :3] = a[..., :3] * fa + suelo[..., :3] * (1 - fa)
    out[..., 3] = np.maximum(a[..., 3], suelo[..., 3])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')


def humo_a_alfa(ruta):
    """Humo blanco sobre negro → blanco con alfa según la luz."""
    g = np.asarray(Image.open(ruta).convert('L')).astype(float)
    a = np.clip((g - 8) * 1.6, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([np.full_like(a, 235)] * 3 + [a]), 'RGBA')


def chispas(ruta):
    """La tira llegó dentro de un lienzo negro de 2172x724 con rayas grises entre casillas:
    se busca la franja, se corta en 16 y cada casilla se limpia de la raya y va a 256x256."""
    im = Image.open(ruta).convert('RGB')
    a = np.asarray(im).astype(int)
    filas = np.where(a.max(axis=(1, 2)) > 30)[0]
    y0, y1 = filas.min(), filas.max() + 1
    W = im.width / 16
    tira = Image.new('RGB', (4096, 256))
    for i in range(16):
        c = im.crop((round(i * W) + 3, y0 + 3, round((i + 1) * W) - 3, y1 - 2)).resize((256, 256), Image.LANCZOS)
        c = np.asarray(c).astype(int)
        gris = (c.max(axis=2) - c.min(axis=2) < 18) & (c.max(axis=2) < 90)  # rayas grises del marco
        c[gris] = 0
        tira.paste(Image.fromarray(c.astype(np.uint8)), (i * 256, 0))
    return tira


def rejilla(ruta, cols, filas):
    im = Image.open(ruta).convert('RGBA')
    w, h = im.width // cols, im.height // filas
    return [[im.crop((x * w, y * h, (x + 1) * w, (y + 1) * h)) for x in range(cols)] for y in range(filas)]


def main():
    # ---- Pack 4: menú por capas, VS, carga, icono ----
    guarda(Image.open(f'{P4}/ap_menu_cielo.png').convert('RGB'), 'ap_menu_cielo')
    guarda(rellena_suelo(sin_magenta(f'{P4}/ap_menu_fondo.png')), 'ap_menu_fondo', q=86)
    for n in ('medio', 'frente'):
        guarda(sin_magenta(f'{P4}/ap_menu_{n}.png'), f'ap_menu_{n}', q=86)
    guarda(humo_a_alfa(f'{P4}/ap_menu_humo.png'), 'ap_menu_niebla', ancho=836)
    guarda(chispas(f'{P4}/ap_menu_chispas.png'), 'ap_menu_pavesas', q=80)
    guarda(Image.open(f'{P4}/ap_fondo_vs.png').convert('RGB'), 'ap_fondo_vs', ancho=1600)
    guarda(Image.open(f'{P4}/ap_carga.png').convert('RGB'), 'ap_carga', ancho=1600)
    ico = Image.open(f'{P4}/ap_icono.png').convert('RGB')
    ico.resize((512, 512), Image.LANCZOS).save(os.path.join(UI, 'ap_icono.png'), optimize=True)
    ico.resize((180, 180), Image.LANCZOS).save(os.path.join(UI, 'ap_icono_180.png'), optimize=True)

    # ---- Pack 1 / Tanda 2: tarjeta del Duelo y fondo del menú (sin capas) ----
    guarda(Image.open(f'{R}/ap_carta_duelo.png').convert('RGBA'), 'ap_carta_duelo', q=86)
    guarda(Image.open(f'{R}/ap_fondo_menu.png').convert('RGB'), 'ap_fondo_menu', ancho=1600)

    # ---- Pack 5: kit de interfaz (mismos nombres que La Brecha con ap_) ----
    for n in ('m_jugar', 'm_jugar_on', 'm_secundario', 'm_secundario_on', 'm_campo', 'm_redondo', 'm_marco_modo',
              'aro_hab', 'aro_hab_lista', 'marco_retrato'):
        guarda(Image.open(f'{P5a}/ap_{n}.png').convert('RGBA'), 'ap_' + n, q=88)
    for n in ('cartel_azul', 'cartel_rojo', 'tab', 'tab_on'):
        guarda(Image.open(f'{P5b}/ap_{n}.png').convert('RGBA'), 'ap_' + n, q=88)
    guarda(Image.open(f'{P5b}/ap_victoria.png').convert('RGBA'), 'ap_est_victoria', q=88)
    guarda(Image.open(f'{P5b}/ap_derrota.png').convert('RGBA'), 'ap_est_derrota', q=88)
    guarda(Image.open(f'{P5b}/ap_fondo_tienda.png').convert('RGB'), 'ap_fondo_armeria', ancho=1280, q=80)

    # ---- Pack 6: iconos (filas = héroes, columnas P Q W E R) y botones de ataque ----
    ic = rejilla(f'{P6}/ap_iconos.png', 5, 7)
    for f, clave in enumerate(ORDEN):
        for c, k in enumerate('pqwer'):
            img = ic[f][c].resize((160, 160), Image.LANCZOS)
            guarda(img, f'ap_p_{clave}' if k == 'p' else f'ap_h_{clave}_{k}', q=86)
    at = rejilla(f'{P6}/ap_ataque.png', 7, 1)[0]
    for i, clave in enumerate(ORDEN):
        guarda(at[i], f'ap_at_{clave}', q=88)
    # ---- Pack 12: iconos de la tienda (círculos sueltos: se buscan por el alfa) ----
    P12 = f'{R}/pack12'
    def circulos(ruta, n):
        im = Image.open(ruta).convert('RGBA'); a = np.asarray(im)[..., 3] > 40
        lab, k = ndimage.label(a); cajas = [c for c in ndimage.find_objects(lab) if (c[0].stop - c[0].start) > 100]
        assert len(cajas) == n, (ruta, len(cajas))
        filas = sorted(cajas, key=lambda c: c[0].start); orden = []
        while filas:
            y0 = filas[0][0].start; fila = [c for c in filas if abs(c[0].start - y0) < 60]
            orden += sorted(fila, key=lambda c: c[1].start); filas = [c for c in filas if c not in fila]
        return [im.crop((c[1].start, c[0].start, c[1].stop, c[0].stop)).resize((160, 160), Image.LANCZOS) for c in orden]
    for img, k in zip(circulos(f'{P12}/ap_objetos.png', 18), ['hoja', 'daga', 'cota', 'yelmo', 'manto', 'tomo', 'botas', 'amuleto', 'herugrim',
            'guthwine', 'escudo', 'capa', 'hacha', 'baculo', 'narya', 'velo', 'mithril', 'oro']):
        guarda(img, 'ap_obj_' + k, q=86)
    for img, k in zip(circulos(f'{P12}/ap_encantos.png', 9), ['enc_estasis', 'enc_gargola', 'enc_azogue', 'enc_medallon', 'tab_rec', 'tab_atq', 'tab_def', 'tab_mov', 'tab_enc']):
        guarda(img, 'ap_' + k, q=86)
    print('ok')


if __name__ == '__main__':
    main()
