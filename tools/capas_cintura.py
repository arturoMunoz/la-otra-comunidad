"""Objetos de cintura (pañuelo en el bolsillo, cazo al cinto) pedidos sobre un maniquí con pantalón gris (04/11/2026).
Ancla: lo alto del pantalón gris (sheet) = lo alto de pj/capas/pantalon (juego); escala por el alto del pantalón.
La fila de quieto de ChatGPT salió de frente: los 4 quietos usan el fotograma de andar 3 (piernas juntas).
uso: python3 tools/capas_cintura.py hoja.png nombre [dy] [escala] [dx]"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
FW,FH,N=53,74,12
src,nombre=sys.argv[1],sys.argv[2]
DY=float(sys.argv[3]) if len(sys.argv)>3 else 0; ESC=float(sys.argv[4]) if len(sys.argv)>4 else 1; DX=float(sys.argv[5]) if len(sys.argv)>5 else 0
a=np.array(Image.open(src).convert('RGB')).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
mag=(r>170)&(b>170)&(g<120); cyan=(g>150)&(b>150)&(r<140)
sat=a.max(2)-a.min(2); L=a.mean(2)
gris=(sat<40)&(L>60)&(L<200)
fig=~mag
lab,n=ndimage.label(ndimage.binary_dilation(fig,iterations=4)); obs=ndimage.find_objects(lab)
H=a.shape[0]; big=[o for o in obs if (o[0].stop-o[0].start)>H*0.2]
big.sort(key=lambda o:(round(o[0].start/(H*0.3)),o[1].start)); assert len(big)==N,len(big)
teal=(g>r+25)&(b>r+25)
item=((sat>=60)|((L>=200)&(sat<40)))&~mag&~cyan&~teal&~((r>g+35)&(b>g+35))
# figura entera (cabeza a pies) para una escala fija: el juego mide unos 68 px de alto
SC=[]
pa=np.array(Image.open('public/assets/pj/capas/pantalon.webp').convert('RGBA'))[...,3]>0
CU=np.array(Image.open('public/assets/pj/capas/cuerpo.webp').convert('RGBA'))[...,3]>0
out=Image.new('RGBA',(FW*N,FH),(0,0,0,0))
for o in big[:8]:
    c=cyan[o]|gris[o]; ys=np.nonzero(c.any(1))[0]; SC.append(ys.max()-ys.min())
S0=68.0/np.median(SC)
for f in range(N):
    o=big[f if f<8 else 2]
    gp=pa[:,f*FW:(f+1)*FW]; ys,xs=np.nonzero(gp); gtop,gbot=ys.min(),ys.max(); gx=xs.mean()
    cuf=CU[:,f*FW:(f+1)*FW]; gfeet=np.nonzero(cuf.any(1))[0].max()
    sg=gris[o]; cnt=sg.sum(1); rows=np.nonzero(cnt>0.3*cnt.max())[0]; stop=rows.min()
    scx=np.nonzero(sg[rows].any(0))[0].mean(); s=S0*ESC
    cy_=np.nonzero(cyan[o].any(1))[0]; sfeet=cy_.max()
    it=item[o]; l2,n2=ndimage.label(ndimage.binary_dilation(it,iterations=2)); sz=ndimage.sum(it,l2,range(1,n2+1))
    it&=np.isin(l2,[i+1 for i,v in enumerate(sz) if v>120])
    iy,ix=np.nonzero(it); y0,y1,x0,x1=iy.min(),iy.max()+1,ix.min(),ix.max()+1
    crop=np.dstack([a[o][y0:y1,x0:x1],np.where(it[y0:y1,x0:x1],255,0)]).astype(np.uint8)
    im=Image.fromarray(crop,'RGBA').resize((max(1,round((x1-x0)*s)),max(1,round((y1-y0)*s))),Image.LANCZOS)
    arr=np.array(im); arr[...,3]=np.where(arr[...,3]>110,255,0); im=Image.fromarray(arr)
    out.paste(im,(round(f*FW+gx+(x0-scx)*s+DX),round(gfeet-(sfeet-y0)*s+DY)),im)
out.save('public/assets/pj/capas/'+nombre+'.webp',lossless=True)
cu=Image.open('public/assets/pj/capas/cuerpo.webp').convert('RGBA'); cu.alpha_composite(Image.open('public/assets/pj/capas/pantalon.webp').convert('RGBA'))
cu.alpha_composite(Image.open('public/assets/pj/capas/cab_arturo.webp').convert('RGBA')); cu.alpha_composite(out)
bg=Image.new('RGBA',cu.size,(120,160,110,255)); bg.alpha_composite(cu); bg.resize((cu.width*3,cu.height*3),Image.NEAREST).save('/tmp/prev_'+nombre+'.png'); print('ok',nombre)
