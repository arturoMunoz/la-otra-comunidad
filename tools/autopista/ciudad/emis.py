# Máscara de ventanas encendidas: los azules claros de la textura de Kenney → luz cálida (uso: python3 -I emis.py ENTRADA SALIDA)
import sys, numpy as np
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
m = ((a[..., 2] > a[..., 0] + 30) & (a[..., 2] > 150)).astype(np.float32)
lum = a.mean(-1) / 255
out = np.stack([m * 255 * (0.75 + 0.25 * lum), m * 205 * (0.75 + 0.25 * lum), m * 140 * (0.75 + 0.25 * lum)], -1)
Image.fromarray(out.astype(np.uint8)).save(sys.argv[2])
