import sys, numpy as np
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mide import vis
def polar(v, xa, ya, th=0.2):
    h, w = v.shape; m = v.max()
    yy, xx = np.mgrid[0:h, 0:w]; dx = (xx - xa*w)/w; dy = (ya*h - yy)/h
    rho = np.hypot(dx, dy); ang = np.degrees(np.arctan2(dx, dy))  # 0 = arriba, + = derecha
    on = v > th*m
    return rho[on], ang[on], v[on]
for arg in sys.argv[1:]:
    path, xa, ya = arg.split(':'); xa, ya = float(xa), float(ya)
    frs, fw, fh = vis(path, 4, 4, False)
    # combinación de todos los fotogramas (máximo)
    v = np.max(np.stack(frs), 0)
    rho, ang, val = polar(v, xa, ya)
    print(path.split('/')[-1], f"ang {np.percentile(ang,1):.1f}..{np.percentile(ang,99):.1f}  rho p95={np.percentile(rho,95):.3f} p99={np.percentile(rho,99):.3f}")
    for a0 in range(-90, 100, 15):
        s = (ang > a0-5) & (ang < a0+5)
        if s.sum() > 20: print('   ', a0, f"{np.percentile(rho[s],98):.3f}", s.sum())
