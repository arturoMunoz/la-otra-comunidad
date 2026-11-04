"""Objetos de cuerpo pedidos sobre un maniquí cian distinto del nuestro (04/11/2026).
Coloca el objeto fotograma a fotograma usando el CUELLO como ancla y la altura cuello-pies como escala.
uso: python3 tools/capas_cuerpo.py tools/capas/nuevos/broche.png broche"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
FW,FH,N=53,74,12
src,nombre=sys.argv[1],sys.argv[2]
DY=float(sys.argv[3]) if len(sys.argv)>3 else 0; ESC=float(sys.argv[4]) if len(sys.argv)>4 else 1; DX=float(sys.argv[5]) if len(sys.argv)>5 else 0
a=np.array(Image.open(src).convert('RGB')).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
mag=(r>170)&(b>170)&(g<120)
linea=(a.max(2)<70); filas=linea.mean(1)>0.25; linea[:]=False; linea[filas]=True
cyan=(g>150)&(b>150)&(r<140)
fig=cyan|(~mag&(a.max(2)>=70))
lab,n=ndimage.label(cyan); obs=ndimage.find_objects(lab)
H=a.shape[0]; big=[(slice(max(0,o[0].start-30),o[0].stop+30),slice(max(0,o[1].start-40),o[1].stop+40)) for o in obs if (o[0].stop-o[0].start)>H*0.12]
big.sort(key=lambda o:(round(o[0].start/(H*0.25)),o[1].start))
assert len(big)==N,len(big)
item=~mag&~cyan&~linea&(a.max(2)>60)   # objeto: lo que no es fondo, maniquí, raya ni contorno negro
cyan_d=ndimage.binary_dilation(cyan,iterations=1)
# ancla del juego: cuello = parte de arriba de la camisa del cuerpo; pies = fondo
cu=np.array(Image.open('public/assets/pj/capas/cuerpo.webp').convert('RGBA'))
out=Image.new('RGBA',(FW*N,FH),(0,0,0,0))
for f,o in enumerate(big):
    fr=cu[:,f*FW:(f+1)*FW,3]>0; ys,xs=np.nonzero(fr); gtop=ys.min(); gfeet=ys.max()
    gx=np.nonzero(fr[gtop:gtop+3].any(0))[0].mean()
    c=cyan[o]|(item[o]&cyan_d[o]); cys,cxs=np.nonzero(cyan[o]); top=cys.min(); feet=cys.max(); hgt=feet-top
    w=[(cyan[o][y].sum(),y) for y in range(top+int(hgt*.15),top+int(hgt*.42)) if cyan[o][y].sum()>0]
    ny=min(w)[1]; nx=np.nonzero(cyan[o][ny])[0].mean()
    s=(gfeet-gtop)/(feet-ny)*ESC
    it=item[o]; iy,ix=np.nonzero(it)
    if not len(iy): continue
    y0,y1,x0,x1=iy.min(),iy.max()+1,ix.min(),ix.max()+1
    crop=np.dstack([a[o][y0:y1,x0:x1],np.where(it[y0:y1,x0:x1],255,0)]).astype(np.uint8)
    im=Image.fromarray(crop,'RGBA'); W2,H2=max(1,round(im.width*s)),max(1,round(im.height*s))
    im=im.resize((W2,H2),Image.LANCZOS); al=np.array(im)[...,3]; arr=np.array(im); arr[...,3]=np.where(al>110,255,0); im=Image.fromarray(arr)
    px=round(f*FW+gx+(x0-nx)*s+DX); py=round(gtop+(y0-ny)*s+DY)
    out.alpha_composite(im,(px,py)) if px>=0 and py>=0 else out.paste(im,(px,py),im)
out.save('public/assets/pj/capas/'+nombre+'.webp',lossless=True)
# vista previa sobre el cuerpo
pv=Image.fromarray(cu); pv.alpha_composite(Image.open('public/assets/pj/capas/cab_arturo.webp').convert('RGBA')); pv.alpha_composite(out); bg=Image.new('RGBA',pv.size,(120,160,110,255)); bg.alpha_composite(pv)
bg.resize((pv.width*3,pv.height*3),Image.NEAREST).save('/tmp/prev_'+nombre+'.png'); print('ok',nombre)
