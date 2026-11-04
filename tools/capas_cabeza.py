"""Objetos de cabeza (4 por imagen sobre maniquí cian, 04/11/2026) -> assets/eq/<clave>.webp + w/dx/dy para EQ.
Escala: ancho de la cabeza del maniquí = GW px de juego. dx desde el centro de la cabeza, dy desde lo alto (+2: el juego ancla en lo alto del pelo).
uso: python3 tools/capas_cabeza.py hoja.png clave1,clave2,-,clave4 [GW]"""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage
src=sys.argv[1]; claves=sys.argv[2].split(','); GW=float(sys.argv[3]) if len(sys.argv)>3 else 26
a=np.array(Image.open(src).convert('RGB')).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
mag=(r>170)&(b>170)&(g<120); cyan=(g>150)&(b>150)&(r<140); dark=a.max(2)<75
lab,n=ndimage.label(cyan); objs=ndimage.find_objects(lab)
figs=sorted([(o[1].start,i+1) for i,o in enumerate(objs) if (o[0].stop-o[0].start)>a.shape[0]*0.4])
assert len(figs)==4,len(figs)
cols=[0]+[(figs[i][0]+figs[i+1][0])//2+60 for i in range(3)]+[a.shape[1]]
res={}
for j,(k,(_,idn)) in enumerate(zip(claves,figs)):
    if k=='-': continue
    m=lab==idn; ys,xs=np.nonzero(m); top=ys.min(); hgt=ys.max()-top
    w=[(m[y].sum(),y) for y in range(top+int(hgt*.15),top+int(hgt*.5))]; neck=min(w)[1]
    feet=ys.max(); L=feet-neck
    # cabeza estimada con las proporciones del maniquí sin nada en la cabeza (la de la pipa): ancho 0.70*L, alto 0.62*L
    import os; hw=float(os.environ.get('HWR',0.626))*L; top=neck-float(os.environ.get('HHR',0.61))*L
    hx=np.nonzero(m[neck-5:neck+5].any(0))[0].mean()
    x0,x1=cols[j],cols[j+1]
    reg=np.zeros_like(mag); reg[:neck+30,x0:x1]=(~mag&~cyan&~dark)[:neck+30,x0:x1]
    reg=ndimage.binary_opening(reg,iterations=1)
    l2,n2=ndimage.label(ndimage.binary_dilation(reg,iterations=3)); sz=ndimage.sum(reg,l2,range(1,n2+1))
    keep=np.isin(l2,[i+1 for i,v in enumerate(sz) if v>150])&reg
    near=ndimage.binary_dilation(keep,iterations=4)&dark&~ndimage.binary_dilation(m,iterations=4)
    it=keep|near
    rosa=(r>g+35)&(b>g+35); it&=~rosa                     # borde rosa del fondo
    l3,n3=ndimage.label(ndimage.binary_dilation(it,iterations=2)); sz3=ndimage.sum(it,l3,range(1,n3+1))
    it&=(l3==np.argmax(sz3)+1)                             # solo el objeto (fuera motas sueltas)
    iy,ix=np.nonzero(it); Y0,Y1,X0,X1=iy.min(),iy.max()+1,ix.min(),ix.max()+1
    rgba=np.dstack([a[Y0:Y1,X0:X1],np.where(it[Y0:Y1,X0:X1],255,0)]).astype(np.uint8)
    s=GW/hw; im=Image.fromarray(rgba,'RGBA'); W2=max(2,round(im.width*s)); H2=max(2,round(im.height*s))
    im.resize((W2*4,H2*4),Image.LANCZOS).save('public/assets/eq/'+k+'.webp',lossless=True)
    res[k]=dict(w=W2,dx=round((X0-hx)*s),dy=round((Y0-top)*s)+2); print(k,res[k])
d=json.load(open('/tmp/cab.json')) if __import__('os').path.exists('/tmp/cab.json') else {}
d.update(res); json.dump(d,open('/tmp/cab.json','w'))
