import sys, numpy as np
from PIL import Image
def vis(path, c, r, normal):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)/255
    H, W = a.shape[:2]; fh, fw = H//r, W//c
    out = []
    for j in range(r):
        for i in range(c):
            f = a[j*fh:(j+1)*fh, i*fw:(i+1)*fw]
            al = f[...,3]; lu = f[...,:3].max(-1)
            v = al if normal else al*lu
            out.append(v)
    return out, fw, fh
def perfil(v):
    h, w = v.shape; yy, xx = np.mgrid[0:h, 0:w]; cx, cy = (w-1)/2, (h-1)/2
    rr = np.hypot((xx-cx)/(w/2), (yy-cy)/(h/2))  # 1 = borde del fotograma
    bins = np.linspace(0, 1.42, 72); idx = np.digitize(rr, bins)
    p = np.array([v[idx==k].mean() if (idx==k).any() else 0 for k in range(1, len(bins))])
    return bins[1:], p
def borde(v, th=0.25):
    b, p = perfil(v)
    if p.max() <= 0: return 0, 0
    k = np.where(p > th*p.max())[0]; pico = b[p.argmax()]
    return b[k.max()], pico
if __name__ == '__main__':
    for arg in sys.argv[1:]:
        path, c, r, n = arg.split(':'); c, r = int(c), int(r)
        fr, fw, fh = vis(path, c, r, n == 'n')
        res = [borde(v) for v in fr]
        m = max(e for e, _ in res)
        print(f"{path.split('/')[-1]:32s} {fw}x{fh} borde_max={m:.3f} ", ' '.join(f"{e:.2f}" for e, _ in res))
