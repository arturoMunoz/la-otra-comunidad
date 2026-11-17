"""La Autopista · Pack 13 ART (HUD) → public/batalla/ui/ap_*.webp

Entradas: los 14 dibujos sueltos (copias en tools/autopista/pack13/) y el atlas
del botiquín de 64 fotogramas (zip). Cada dibujo se guarda con el nombre que el
generador ya busca (ui/<nombre>.webp → ui/ap_<nombre>.webp).
Ejecutar: python3 -I tools/autopista/procesa_pack13.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ORIG = os.path.join(RAIZ, 'tools/autopista/pack13')
UI = os.path.join(RAIZ, 'public/batalla/ui')
ZIP = os.path.join(ORIG, 'botiquin_64f')

# archivo original → nombre de salida, tamaño máximo del lado mayor
MAPA = {
    '4af6825f-image.png': ('ap_mana_vacia', 512),   # batería vacía
    '9d87acd5-image.png': ('ap_mana_llena', 512),   # batería llena
    'f3a5af0c-image.png': ('ap_vida_marco', 1024),  # marco de la barra de vida
    '5855efa9-image.png': ('ap_hz_castigo', 256),   # hechizo Castigo
    'b9ea26bd-image.png': ('ap_hz_destello', 256),  # hechizo Destello
    'e43ae393-image.png': ('ap_hz_curar', 256),     # hechizo Curar
    'e49f0bbd-image.png': ('ap_b_ataque', 256),     # botón de ataque
    '491905f5-image.png': ('ap_b_subditos', 256),   # botón súbditos
    '71b1e3be-image.png': ('ap_b_torre', 256),      # botón torre
    '8135d683-image.png': ('ap_b_armeria', 256),    # botón Taller (llave y destornillador)
    '2e4aebfe-image.png': ('ap_b_zoom', 256),       # botón zoom
    '1c02c8c3-image.png': ('ap_b_volver', 256),     # botón base (peaje)
    '2ede06e4-image.png': ('ap_baliza', 256),       # baliza encendida
    '21942fa7-image.png': ('ap_baliza_off', 256),   # baliza apagada
}


def esquina_alfa(im):
    """Alfa de las cuatro esquinas: 0 = fondo transparente de verdad."""
    w, h = im.size
    return [im.getpixel(p)[3] if im.mode == 'RGBA' else 255
            for p in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]]


def quita_blanco(im, hueco=False):
    """ChatGPT a veces pinta el «transparente» como blanco/cuadros grises: se quita el claro unido al borde
    (y, con hueco=True, también el del centro, para el marco de la vida)."""
    a = np.array(im).astype(int)
    rgb = a[..., :3]
    claro = (rgb.min(-1) > 200) & (rgb.max(-1) - rgb.min(-1) < 25)
    lab, _ = ndimage.label(claro)
    h, w = claro.shape
    ids = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    if hueco: ids.add(lab[h // 2, w // 2])
    fondo = np.isin(lab, list(ids))
    # el borde suave (gris claro pegado al fondo) también fuera, para que no quede halo blanco
    suave = (rgb.min(-1) > 160) & (rgb.max(-1) - rgb.min(-1) < 30)
    for _ in range(3):
        fondo |= ndimage.binary_dilation(fondo) & suave
    a[..., 3] = np.where(fondo, 0, a[..., 3])
    return Image.fromarray(a.astype(np.uint8), 'RGBA'), fondo


def guarda(origen, nombre, lado):
    im = Image.open(origen).convert('RGBA')
    alfa = esquina_alfa(im)
    if any(a > 0 for a in alfa):
        im, fondo = quita_blanco(im, hueco=(nombre == 'ap_vida_marco'))
        if nombre == 'ap_vida_marco':
            lab, _ = ndimage.label(fondo)
            ys, xs = np.nonzero(lab == lab[fondo.shape[0] // 2, fondo.shape[1] // 2])
            h, w = fondo.shape
            print(f'  hueco de la vida: x {xs.min()/w*100:.1f}-{xs.max()/w*100:.1f} %  y {ys.min()/h*100:.1f}-{ys.max()/h*100:.1f} %  proporción {w/h:.2f}')
    if nombre == 'ap_mana_llena':
        # solo el líquido: se pone encima de la batería vacía (los marcos de las dos no son idénticos)
        a = np.array(im)
        r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
        fucsia = (r > 150) & (b > 90) & (g < 150) & (r - g > 60)
        lab, n = ndimage.label(fucsia)
        mayor = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
        liq = ndimage.binary_fill_holes(ndimage.binary_closing(mayor, iterations=6))
        a[..., 3] = np.where(liq, a[..., 3], 0)
        im = Image.fromarray(a, 'RGBA')
        ys = np.nonzero(liq.any(1))[0]
        print(f'  líquido: BOT_Y0 = {ys.min()/liq.shape[0]*100:.1f}  BOT_Y1 = {ys.max()/liq.shape[0]*100:.1f}')
    im.thumbnail((lado, lado), Image.LANCZOS)
    salida = os.path.join(UI, nombre + '.webp')
    im.save(salida, 'WEBP', quality=90, method=6)
    print(f'  {nombre}.webp {im.size}')


def main():
    os.makedirs(UI, exist_ok=True)
    for archivo, (nombre, lado) in MAPA.items():
        origen = os.path.join(ORIG, archivo)
        if not os.path.exists(origen):
            raise SystemExit(f'Falta {origen}: copia el dibujo antes de ejecutar')
        guarda(origen, nombre, lado)

    # botiquín: atlas de 8x8 fotogramas de 256 → se baja a 1024 (fotogramas de 128)
    atlas = os.path.join(ZIP, 'ap_botiquin_64f.png')
    im = Image.open(atlas).convert('RGBA')
    im.thumbnail((1024, 1024), Image.LANCZOS)
    im.save(os.path.join(UI, 'ap_botiquin.webp'), 'WEBP', quality=88, method=6)
    print(f'  ap_botiquin.webp {im.size} (8x8 fotogramas)')


if __name__ == '__main__':
    main()
