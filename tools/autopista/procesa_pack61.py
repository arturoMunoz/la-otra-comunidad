# Pack Autopista 61 ART (23/11): marcas de apuntar nuevas, blancas sobre negro (se suman como luz y se tiñen del color de cada héroe).
# python3 -I tools/autopista/procesa_pack61.py   · Las medidas (bordes, periodo, vértice, radios) se sacaron con numpy de los originales:
#  A cuerpo: líneas en y 446,5 y 577 (130,5 px entre ellas), chevrones cada 128 px → recorte de 10 periodos (1280 px) y 164 px de alto.
#  B punta: base abierta en x 392 (y 312-941), punta en x 1014 → recorte 376-1030 × 296-957 (base a 16 px, punta a 638, centro 330,5).
#  C inicio: «D» con el lado recto en x 724, 661 px de alto → recorte 379-742 × 280-973 (lado recto a 345, centro 346,5).
#  D cono: vértice (625, 1132), lados a 43,5°, arco a ~820 px (no es un círculo perfecto: 806 en las esquinas, 835 arriba).
#  E círculo: centro (622, 625), línea a 559,5 px.  F aro: centro (626, 625), línea a 514,6 px (las marcas van por fuera).
from PIL import Image
R = 'tools/autopista/pack61/'; S = 'public/batalla/ui/'
def g(n): return Image.open(R + n).convert('RGB')
g('A_cuerpo.png').crop((24, 430, 1304, 594)).save(S + 'ap_fl_cuerpo.webp', quality=92)
g('B_punta.png').crop((376, 296, 1030, 957)).save(S + 'ap_fl_punta.webp', quality=92)
g('C_inicio.png').crop((379, 280, 742, 973)).save(S + 'ap_fl_inicio.webp', quality=92)
g('D_cono.png').resize((1024, 1024), Image.LANCZOS).save(S + 'ap_m_cono.webp', quality=92)
g('E_circulo.png').crop((0, 3, 1244, 1247)).resize((1024, 1024), Image.LANCZOS).save(S + 'ap_m_area.webp', quality=92)
g('F_aro.png').crop((1, 0, 1251, 1250)).resize((1024, 1024), Image.LANCZOS).save(S + 'ap_m_alcance.webp', quality=92)
print('ok')
