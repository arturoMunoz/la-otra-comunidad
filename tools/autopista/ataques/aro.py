import sys, numpy as np
from PIL import Image
for f in sys.argv[1:]:
    a = np.asarray(Image.open(f).convert('RGBA')).astype(np.float32)/255; H, W = a.shape[:2]
    mx = a[...,:3].max(-1); mn = a[...,:3].min(-1); s = (mx-mn)*a[...,3]*mx
    yy, xx = np.mgrid[0:H, 0:W]; rr = np.hypot((xx-(W-1)/2)/(W/2), (yy-(H-1)/2)/(H/2))
    b = np.linspace(0.5, 1.0, 101); idx = np.digitize(rr, b)
    p = np.array([s[idx==k].mean() if (idx==k).any() else 0 for k in range(1, len(b))])
    alfa = np.array([a[...,3][idx==k].mean() if (idx==k).any() else 0 for k in range(1, len(b))])
    ext = b[1:][np.where(alfa > 0.3)[0].max()] if (alfa > 0.3).any() else 0
    print(f"{f:28s} neon={b[1:][p.argmax()]:.3f} ext={ext:.3f}")
