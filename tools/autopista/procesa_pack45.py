"""Pack Autopista 45 ART: plataforma de salida vista desde arriba (sobre magenta) -> texturas/ap_plataforma.webp (1024, con transparencia)"""
import os
import numpy as np
from PIL import Image
R = os.path.dirname(os.path.abspath(__file__)); TX = os.path.join(R, '..', '..', 'public', 'batalla', 'texturas')
a = np.asarray(Image.open(os.path.join(R, 'pack45', 'plataforma.png')).convert('RGB')).astype(np.float32)
mag = np.clip((np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 60) / 120, 0, 1); al = 1 - mag
col = np.clip((a - mag[..., None] * np.array([255, 0, 255], np.float32)) / np.maximum(al[..., None], 0.05), 0, 255)
Image.fromarray(np.dstack([col, al * 255]).astype(np.uint8), 'RGBA').resize((1024, 1024), Image.LANCZOS).save(os.path.join(TX, 'ap_plataforma.webp'), quality=88)
print('ok')
