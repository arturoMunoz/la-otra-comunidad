"""Personajes por capas: maniquí cian común (las hojas de objetos de ChatGPT) + cabeza de cada hobbit + objetos.
uso: python3 tools/capas.py  -> vista previa en tools/capas/prev_*.png (de momento solo prueba)"""
import numpy as np, sys
from PIL import Image
from scipy import ndimage
D='tools/capas/'
def load(f): return np.array(Image.open(D+f).convert('RGB')).astype(int)
def isMag(a): r,g,b=a[...,0],a[...,1],a[...,2]; return (r>170)&(b>170)&(g<110)
def isCyan(a):
    r,g,b=a[...,0],a[...,1],a[...,2]; c=(g>120)&(b>130)&(r<160)&(np.abs(g-b)<80)&(g>r+40)
    return ndimage.binary_dilation(c,iterations=1)&~((r>170)&(b>170)&(g<110)) | c
def isLine(a):
    m=a.max(2)<70; rows=m.mean(1)>0.2; out=np.zeros_like(m); out[rows]=m[rows]; return out  # solo la raya del suelo
REF='11.png'  # pantalón: el maniquí más limpio
ref=load(REF); H,W,_=ref.shape
lines=[y for y in range(H) if isLine(ref)[y].mean()>0.2]
grp=np.split(np.array(lines),np.where(np.diff(lines)>3)[0]+1); grounds=[int(g[0]) for g in grp]
cy=isCyan(ref)
# celdas: cada maniquí (componente cian grande) en su fila
cells=[]
for ri,gy in enumerate(grounds):
    top=0 if ri==0 else grounds[ri-1]+3
    lab,n=ndimage.label(ndimage.binary_dilation(cy[top:gy],iterations=3)); obs=ndimage.find_objects(lab)
    big=sorted([o for o in obs if (o[0].stop-o[0].start)>(gy-top)*0.6],key=lambda o:o[1].start)
    for o in big:
        m=cy[top:gy][o]; ys,xs=np.nonzero(m); headtop=top+o[0].start
        # cuello: la fila más estrecha en el tercio de arriba, por debajo de la cabeza
        rows=[(m[y].sum(),y) for y in range(int(m.shape[0]*0.12),int(m.shape[0]*0.33))]
        neck=top+o[0].start+min(rows)[1]
        hx=np.nonzero(cy[headtop:headtop+20, o[1].start:o[1].stop].any(0))[0].mean()+o[1].start
        cells.append(dict(row=ri,ground=gy,headtop=headtop,neck=neck,cx=int(hx),x0=o[1].start,x1=o[1].stop))
print('celdas',len(cells),[c['row'] for c in cells])
MH=np.median([c['ground']-c['headtop'] for c in cells])
FW,FH=53,74; S=60/MH  # el maniquí mide 60 px en el juego
def capa_objeto(f):
    a=load(f); it=~isMag(a)&~isCyan(a)&~isLine(a)
    return np.dstack([a,np.where(it,255,0)]).astype(np.uint8)
def cuerpo():
    a=ref; c=isCyan(a); L=(a[...,1]+a[...,2])/2/255.
    piel=np.array([236,180,128.]); col=piel[None,None,:]*np.clip(0.55+0.5*L,0,1.1)[...,None]
    return np.dstack([np.clip(col,0,255),np.where(c,255,0)]).astype(np.uint8)
def cabeza(f):
    a=load(f); cyn=isCyan(a); h=~isMag(a)&~cyn&~isLine(a)
    ys,xs=np.nonzero(cyn); g=ys.max(); top=ys.min()
    lab,n=ndimage.label(h); sz=ndimage.sum(h,lab,range(1,n+1)); k=np.argmax(sz)+1; hm=lab==k
    hy,hx=np.nonzero(hm); neck_y=hy.max(); 
    mh=g-top  # altura del maniquí de esa imagen (con la cabeza)
    rgba=np.dstack([a,np.where(hm,255,0)]).astype(np.uint8)[hy.min():neck_y+1,hx.min():hx.max()+1]
    face_x=hx.max()-hx.min()
    return Image.fromarray(rgba,'RGBA'), mh, neck_y-hy.min()
def frames(rgba,head=None,orden=None):
    out=[]
    for c in cells:
        x0=c['cx']-int(FW/2/S); x1=x0+int(FW/S); y1=c['ground']+2; y0=y1-int(FH/S)
        cell=Image.new('RGBA',(x1-x0,y1-y0),(0,0,0,0))
        for L in rgba:
            cell.alpha_composite(Image.fromarray(L[max(0,y0):y1,x0:x1],'RGBA'),(0,max(0,-y0)))
        if head:
            im,mh,nk=head; k=MH/mh; hi=im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS)
            # la nuca del maniquí y el cuello de la cabeza, alineados; la cara hacia la derecha del eje
            cell.alpha_composite(hi,(int(c['cx']-x0-hi.width*0.55),int(c['neck']-y0-hi.height+8*k*0+6)))
        for L in (orden or []): cell.alpha_composite(Image.fromarray(L[max(0,y0):y1,x0:x1],'RGBA'),(0,max(0,-y0)))
        out.append(cell.resize((FW,FH),Image.LANCZOS))
    return out
if __name__=='__main__':
    body=cuerpo(); capa=capa_objeto('10.png'); pant=capa_objeto('11.png'); moch=capa_objeto('13.png'); cant=capa_objeto('14.png')
    rows=[]
    for hf in sys.argv[1:] or ['06.png']:
        fr=frames([capa,body],cabeza(hf),[pant,cant,moch])
        sheet=Image.new('RGBA',(FW*len(fr),FH),(110,160,100,255))
        for i,f in enumerate(fr): sheet.alpha_composite(f,(i*FW,0))
        rows.append(sheet)
    o=Image.new('RGBA',(rows[0].width,FH*len(rows)),(255,255,255,255))
    for i,r in enumerate(rows): o.alpha_composite(r,(0,i*FH))
    o.resize((o.width*3,o.height*3),Image.NEAREST).save(D+'prev.png')
