import sys, numpy as np
from PIL import Image
for f in sys.argv[1:]:
    a = np.asarray(Image.open(f).convert('RGBA')).astype(np.float32)/255; H, W = a.shape[:2]
    op = a[...,3] > 0.5
    L, R = [], []
    for y in range(int(H*0.55), int(H*0.97)):
        xx = np.nonzero(op[y])[0]
        if len(xx) < 2: continue
        L.append((xx.min(), y)); R.append((xx.max(), y))
    L, R = np.array(L, float), np.array(R, float)
    pl = np.polyfit(L[:,1], L[:,0], 1); pr = np.polyfit(R[:,1], R[:,0], 1)
    ya = (pr[1]-pl[1])/(pl[0]-pr[0]); xa = pl[0]*ya + pl[1]
    al = np.degrees(np.arctan(abs(pl[0]))); ar = np.degrees(np.arctan(abs(pr[0])))
    col = np.nonzero(op[:, int(round(xa))])[0]; rtop = ya - col.min()
    # neón: brillo saturado; perfil a lo largo del eje y a lo largo de un radio a media altura en el borde
    mx = a[...,:3].max(-1); mn = a[...,:3].min(-1); s = (mx-mn)*a[...,3]*mx
    ax = s[:, int(round(xa))-2:int(round(xa))+3].mean(1)
    # pico de neón del arco en la parte alta del eje
    yy = np.arange(H); top = (yy < col.min()+0.2*H)
    yn = yy[top][ax[top].argmax()]
    # pico de neón del lado: recorrer perpendicular al borde izquierdo a media altura
    ym = int(ya - rtop*0.55); xl = pl[0]*ym + pl[1]
    fila = s[ym, int(xl):int(xl)+60]; xn = int(xl) + fila.argmax()
    # ángulo del neón lateral visto desde el ápice
    an = np.degrees(np.arctan2(xa - xn, ya - ym))
    print(f.split('/')[-1], f"apex=({xa/W:.4f},{ya/H:.4f}) semi_ext={al:.2f}/{ar:.2f} R_ext={rtop/H:.4f} R_neon={(ya-yn)/H:.4f} semi_neon={an:.2f}")

def arco(f, xa, ya):
    a = np.asarray(Image.open(f).convert('RGBA')).astype(np.float32)/255; H, W = a.shape[:2]
    mx = a[...,:3].max(-1); mn = a[...,:3].min(-1); s = (mx-mn)*a[...,3]*mx
    res = []
    for deg in (-18, -12, -8, 8, 12, 18):
        t = np.radians(deg); best = (0, 0)
        for rho in np.linspace(0.6*H, 1.4*H, 600):
            x = xa*W + np.sin(t)*rho; y = ya*H - np.cos(t)*rho
            if 0 <= x < W and 0 <= y < H:
                v = s[int(y), int(x)]
                if v > best[0]: best = (v, rho/H)
        res.append(best[1])
    return res
