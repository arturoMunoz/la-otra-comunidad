"""Pack Autopista 40 ART: disparo de plasma de las torres (rejilla 4x4 sobre negro) -> fx/ap_plasma.webp (1024, 256 por fotograma)
e impacto (imagen 2, cuando llegue: pack40/impacto.png -> fx/ap_plasma_imp.webp)."""
import os
from PIL import Image
R = os.path.dirname(os.path.abspath(__file__)); FX = os.path.join(R, '..', '..', 'public', 'batalla', 'fx')
for src, dst in [('plasma.png', 'ap_plasma.webp'), ('impacto.png', 'ap_plasma_imp.webp')]:
    p = os.path.join(R, 'pack40', src)
    if not os.path.exists(p): continue
    Image.open(p).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(os.path.join(FX, dst), quality=88)
    print(dst)
