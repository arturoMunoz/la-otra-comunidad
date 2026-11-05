"""Recorta piezas de una hoja de ChatGPT sobre magenta, quitando el rosa de los bordes semitransparentes.
piezas(path, caja=(y0,y1,x0,x1), dil=4) -> [(y0,x0,y1,x1,Image RGBA)]"""
import numpy as np
from PIL import Image
from scipy import ndimage
def piezas(path,caja=None,dil=4,minpx=1500,llenar=False):
    a=np.array(Image.open(path).convert('RGB')).astype(float)
    if caja: a=a[caja[0]:caja[1],caja[2]:caja[3]]
    r,g,b=a[...,0],a[...,1],a[...,2]
    pink=np.clip((np.minimum(r,b)-g)/255.0,0,1); al=np.clip(1-pink*1.4,0,1); al[(r>220)&(b>220)&(g<60)]=0
    m=ndimage.binary_opening(al>0.15,iterations=2)
    lab,n=ndimage.label(ndimage.binary_dilation(m,iterations=dil)); sl=ndimage.find_objects(lab); out=[]
    for i,s in enumerate(sl):
        mm=(lab[s]==i+1)&m[s]
        if mm.sum()<minpx: continue
        if llenar: mm=ndimage.binary_fill_holes(mm)
        A=np.where(mm,al[s],0); mag=np.array([255,0,255.])
        c=np.clip((a[s]-(1-A)[...,None]*mag)/np.maximum(A,0.05)[...,None],0,255)
        oy,ox=(caja[0],caja[2]) if caja else (0,0)
        out.append((s[0].start+oy,s[1].start+ox,s[0].stop+oy,s[1].stop+ox,Image.fromarray(np.dstack([c,A*255]).astype(np.uint8),'RGBA')))
    return out
def fila(ps,tol=120): return sorted(ps,key=lambda p:(round(p[0]/tol),p[1]))
def guarda(im,path,maxw):
    im=im.crop(im.getbbox())
    if im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
    im.save(path,quality=90); return path.replace('public/','')
