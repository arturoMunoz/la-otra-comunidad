"""A-6 · Pack 18 ART (marcas del suelo). Cada aro se recoloca para que su borde exterior quede al mismo radio que la
pieza de La Brecha que sustituye (así no cambia ninguna escala del código). Ejecutar: python3 -I tools/autopista/procesa_pack18.py"""
import os
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P, UI = os.path.join(R, 'tools/autopista'), os.path.join(R, 'public/batalla/ui')


def ajusta(origen, salida, r, lado):
    im = Image.open(origen).convert('RGBA'); im = im.crop(im.getbbox())
    d = max(im.size); L = round(d / r)
    lienzo = Image.new('RGBA', (L, L), (0, 0, 0, 0)); lienzo.paste(im, ((L - im.size[0]) // 2, (L - im.size[1]) // 2))
    lienzo = lienzo.resize((lado, lado), Image.LANCZOS); lienzo.save(os.path.join(UI, salida + '.webp'), 'WEBP', quality=92, method=6)
    print(salida, lienzo.size)


C = os.path.join(P, 'pack18c')
ajusta(f'{C}/ap_alcance.png', 'ap_alcance', 0.926, 512)     # sustituye a ind_alcance
ajusta(f'{C}/ap_objetivo.png', 'ap_objetivo', 0.926, 512)   # marca del objetivo (va donde ind_alcance)
ajusta(f'{C}/ap_zona_torre.png', 'ap_zona_torre', 0.922, 1024)  # zona de la torre (donde ind_area)
ajusta(f'{C}/ap_aro_heroe.png', 'ap_aro_heroe', 0.891, 256)  # aro bajo los pies
