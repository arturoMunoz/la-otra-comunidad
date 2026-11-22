import sys, numpy as np
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mide import vis
for arg in sys.argv[1:]:
    path, c, r, n = arg.split(':'); c, r = int(c), int(r)
    frs, fw, fh = vis(path, c, r, n == 'n')
    out = []
    for v in frs:
        h, w = v.shape; yy, xx = np.mgrid[0:h, 0:w]
        rr = np.hypot((xx-(w-1)/2)/(w/2), (yy-(h-1)/2)/(h/2))
        m = v.sum()
        if m <= 0: out.append(0); continue
        o = np.argsort(rr.ravel()); cs = np.cumsum(v.ravel()[o]); k = np.searchsorted(cs, 0.97*m)
        out.append(rr.ravel()[o][min(k, len(o)-1)])
    print(f"{path.split('/')[-1]:28s} r97_max={max(out):.3f} med={np.median(out):.3f}")
