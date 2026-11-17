# Pack Autopista 32 ART: marcas de apuntar en piezas (blancas sobre negro; se suman como luz y se tiñen por código).
# python3 -I tools/autopista/procesa_pack32.py   (imagen 1: flecha.png; la 2, conos/círculo/aro, cuando llegue)
from PIL import Image
R = 'tools/autopista/pack32/'; S = 'public/batalla/ui/'
im = Image.open(R + 'flecha.png').convert('RGB')
im.crop((240, 86, 240 + 11 * 96, 189)).save(S + 'ap_fl_cuerpo.webp', quality=92)   # 11 chevrones de 96 px: se repite sin costura
im.crop((612, 300, 930, 620)).save(S + 'ap_fl_punta.webp', quality=92)
im.crop((668, 736, 860, 936)).save(S + 'ap_fl_inicio.webp', quality=92)
print('ok')
