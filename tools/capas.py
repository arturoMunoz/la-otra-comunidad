"""Personajes por capas: maniquí cian común (las hojas de objetos de ChatGPT) + cabeza de cada hobbit + objetos.
uso: python3 tools/capas.py  -> vista previa en tools/capas/prev_*.png (de momento solo prueba)"""
import numpy as np, sys, os
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
    top=0 if ri==0 else grounds[ri-1]+12
    fig=~isMag(ref)[top:gy]&~isLine(ref)[top:gy]; fig[-8:]=False
    lab,n=ndimage.label(ndimage.binary_dilation(fig,iterations=3)); obs=ndimage.find_objects(lab)
    big=sorted([o for o in obs if (o[0].stop-o[0].start)>(gy-top)*0.6],key=lambda o:o[1].start)
    for o in big:
        m=cy[top:gy][o]; ys,xs=np.nonzero(m); headtop=top+o[0].start+ys.min()
        # cuello: la fila más estrecha en el tercio de arriba, por debajo de la cabeza
        rows=[(m[y].sum(),y) for y in range(int(m.shape[0]*0.12),int(m.shape[0]*0.33))]
        neck=headtop+min(rows)[1]-ys.min()
        hx=np.nonzero(cy[headtop:headtop+20, o[1].start:o[1].stop].any(0))[0].mean()+o[1].start
        cells.append(dict(row=ri,ground=gy,headtop=headtop,neck=neck,cx=int(hx),x0=o[1].start,x1=o[1].stop))
print('celdas',len(cells),[c['row'] for c in cells])
MH=np.median([c['ground']-c['headtop'] for c in cells])
_b=load('cuerpo.png'); _cy=isCyan(_b)
for c in cells:
    x0=c['cx']-140; y0=max(0,c['headtop']-6); m=_cy[y0:c['ground'],x0:c['cx']+140]
    lab,n=ndimage.label(m); sz=ndimage.sum(m,lab,range(1,n+1)); ys,xs=np.nonzero(lab==np.argmax(sz)+1)
    c['hb']=ys.max()+y0; c['hx']=xs.mean()+x0      # base y centro de la cabeza del cuerpo
# misma altura y mismo centro en todos los fotogramas de cada fila: la cabeza no baila
# la cabeza sigue al TORSO en cada fotograma (el cuerpo se balancea a los lados al andar; la cabeza con él)
_sh=~isMag(_b)&~_cy&~isLine(_b)
for c in cells:
    x0=int(c['hx'])-60; t=c['hb']-17
    ch=np.nonzero(_sh[t+40,x0-40:x0+160])[0]+x0-40; c['torso']=ch.mean()
for r in set(c['row'] for c in cells):
    F=[c for c in cells if c['row']==r]; hb=int(np.median([c['hb'] for c in F]))
    off=np.median([c['hx']-c['torso'] for c in F])
    for c in F: c['hb']=hb; c['hx']=c['torso']+off
FW,FH=53,74; S=60/MH  # el maniquí mide 60 px en el juego
def limpio(a):
    r,g,b=a[...,0],a[...,1],a[...,2]
    morado=(r>90)&(b>90)&(g<np.minimum(r,b)-40)      # borde con el magenta del fondo
    cian=(g>r+25)&(b>r+25)                            # borde con el maniquí
    return ~morado&~cian
def capa_objeto(f):
    a=load(f); it=~isMag(a)&~isCyan(a)&~isLine(a)&limpio(a)
    for gy in grounds: it[gy:gy+14]=False   # la raya del suelo y lo que quede debajo
    return np.dstack([a,np.where(it,255,0)]).astype(np.uint8)
def cuerpo():
    a=ref; c=isCyan(a); L=(a[...,1]+a[...,2])/2/255.
    piel=np.array([236,180,128.]); col=piel[None,None,:]*np.clip(0.55+0.5*L,0,1.1)[...,None]
    return np.dstack([np.clip(col,0,255),np.where(c,255,0)]).astype(np.uint8)
def cabeza(f):
    a=load(f); cyn=isCyan(a); h=~isMag(a)&~cyn&~isLine(a)&limpio(a)
    ys,xs=np.nonzero(cyn); g=ys.max(); top=ys.min()
    lab,n=ndimage.label(h); sz=ndimage.sum(h,lab,range(1,n+1)); k=np.argmax(sz)+1; hm=lab==k
    hy,hx=np.nonzero(hm); neck_y=hy.max(); cyan_top=top; 
    mh=g-top  # altura del maniquí de esa imagen (con la cabeza)
    # restos verdosos del maniquí dentro de la cabeza: se rellenan con lo que hay alrededor
    import cv2
    r,g,b=a[...,0],a[...,1],a[...,2]; teal=hm&(g>r+12)&(b>r+5)
    a=cv2.inpaint(a.astype(np.uint8),(teal*255).astype(np.uint8),5,cv2.INPAINT_TELEA).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    morado=hm&(r>g)&(b>g+4)&~(b>r)   # reflejo del fondo magenta en el pelo: fuera el tono violeta
    a[...,2]=np.where(morado,np.minimum(b,(g*0.85).astype(int)),b)
    r,g,b=a[...,0],a[...,1],a[...,2]; L=(0.3*r+0.59*g+0.11*b)
    verde=hm&(g>r+4)&~((r>200)&(g>200)&(b>200))   # nada de la cabeza debería ser más verde que rojo (salvo blancos)
    verde&=~((g>b+40)&(L<120)&(g>r+30))              # menos los ojos verdes
    a=np.where((verde&(L>=105))[...,None],np.dstack([L*1.18,L*0.92,L*0.70]),a)   # piel
    a=np.where((verde&(L<105))[...,None],np.dstack([L*1.02,L,L*0.96]),a)          # barba / pelo oscuro: gris (luego se rellena)
    r,g,b=a[...,0],a[...,1],a[...,2]; L=(0.3*r+0.59*g+0.11*b)
    resto=hm&(g>r+4)&~(b>g+25)&~((r>200)&(g>200)&(b>200))   # cualquier resto verdoso (barba de Porru…) → gris neutro; ojos azules aparte
    import cv2
    # y además lo que antes se pasó a gris (era cian del maniquí): se rellena con los píxeles de alrededor (pelo, barba, piel)
    gris=hm&(np.abs(r-g)<14)&(b>=r+2)&(L>100)&(L<215)   # solo grises fríos (restos del cian), no el pelo canoso
    a=cv2.inpaint(np.clip(a,0,255).astype(np.uint8),((resto|gris)*255).astype(np.uint8),4,cv2.INPAINT_TELEA).astype(int)
    rgba=np.dstack([a,np.where(hm,255,0)]).astype(np.uint8)[hy.min():neck_y+1,hx.min():hx.max()+1]
    face_x=hx.max()-hx.min()
    ct=ys.min(); cx_=np.nonzero(cyn[ct:ct+8].any(0))[0].mean()   # donde empieza el cuerpo cian, bajo la cabeza
    nx=cx_-hx.min()
    # CUELLO: se estira hacia abajo la franja de piel de la base de la cabeza (los píxeles del propio dibujo)
    NECK=int(os.environ.get('CUELLO',2))   # px de juego
    G=S*MH/mh*float(os.environ.get('ESC_CAB',0.80))   # px de juego por px de esta imagen
    R=rgba.astype(int); al=R[...,3]>0; rr,gg,bb=R[...,0],R[...,1],R[...,2]
    piel=al&(rr>150)&(rr>gg+15)&(gg>bb+5)
    ncx=int(round(nx)); hh=R.shape[0]; win=slice(max(0,ncx-int(9/G)),ncx+int(9/G))
    rows=[y for y in range(hh-1,int(hh*0.6),-1) if piel[y,win].sum()>=max(3,int(2/G))]
    if rows and NECK>0:
        y=rows[0]; n=int(round(NECK/G)); w=int(round(2.6/G))       # cuello estrecho, detrás de la barbilla
        tono=np.median(R[piel][:,:3],0); osc=np.percentile(R[al][:,:3].sum(1),5)
        borde=R[al][R[al][:,:3].sum(1)<=osc][:,:3].mean(0) if (R[al][:,:3].sum(1)<=osc).any() else np.array([43,29,14])
        c0=int(round(nx-w*1.2)); c1=c0+2*w; ext=np.zeros((n,R.shape[1],4),np.uint8)
        ext[:,c0:c1,:3]=tono; ext[:,c0:c1,3]=255
        ext[:,c0:c1,:3]=(ext[:,c0:c1,:3]*np.linspace(0.78,1.0,c1-c0)[None,:,None]).astype(np.uint8)   # sombra hacia atrás
        e=max(1,int(round(0.7/G))); ext[:,c0:c0+e,:3]=borde; ext[:,c1-e:c1,:3]=borde                 # contorno
        # la cabeza entera sube n filas; debajo, solo en la franja del cuello, se rellena hasta el cuerpo
        base=ct-hy.min()                     # fila de la cabeza que antes tocaba el cuerpo
        fin=base+n+int(round(1/G))            # el cuello baja n filas (+1 px dentro de la camisa)
        out=np.concatenate([rgba,np.zeros((max(0,fin-rgba.shape[0]),R.shape[1],4),np.uint8)],0)
        for x in range(c0,c1):
            ys=np.nonzero(out[:fin,x,3]>0)[0]; y0=(ys.max()+1) if len(ys) else base
            out[y0:fin,x]=ext[0,x]
            out[y0:min(fin,y0+max(1,n//3)),x,:3]=(out[y0:min(fin,y0+max(1,n//3)),x,:3]*0.8).astype(np.uint8)  # sombra bajo la barbilla
        return Image.fromarray(out,'RGBA'), mh, base+n, nx   # la cabeza queda n filas más alta
    return Image.fromarray(rgba,'RGBA'), mh, ct-hy.min(), nx
def frames(rgba,head=None,orden=None):
    out=[]
    for c in cells:
        x0=c['cx']-int(FW/2/S); x1=x0+int(FW/S); y1=c['ground']+2; y0=y1-int(FH/S)
        cell=Image.new('RGBA',(x1-x0,y1-y0),(0,0,0,0))
        for L in rgba:
            cell.alpha_composite(Image.fromarray(L[max(0,y0):y1,x0:x1],'RGBA'),(0,max(0,-y0)))
        for L in (orden or []): cell.alpha_composite(Image.fromarray(L[max(0,y0):y1,x0:x1],'RGBA'),(0,max(0,-y0)))
        if head:
            im,mh,nk,nx=head; k=MH/mh*float(os.environ.get('ESC_CAB',0.80)); hi=im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS)
            # la nuca del maniquí y el cuello de la cabeza, alineados; la cara hacia la derecha del eje
            cell.alpha_composite(hi,(int(round(c['hx']-x0-nx*k)),int(round(c['hb']-y0-nk*k+2/S))))
        out.append(cell.resize((FW,FH),Image.LANCZOS))
    return out
if __name__=='__main__':
    body=capa_objeto('cuerpo.png'); capa=capa_objeto('10.png'); pant=capa_objeto('11.png'); moch=capa_objeto('13.png'); cant=capa_objeto('14.png')
    rows=[]
    for hf in sys.argv[1:] or ['06.png']:
        fr=frames([capa,body],cabeza(hf),[pant,cant,moch])
        sheet=Image.new('RGBA',(FW*len(fr),FH),(110,160,100,255))
        for i,f in enumerate(fr): sheet.alpha_composite(f,(i*FW,0))
        rows.append(sheet)
    o=Image.new('RGBA',(rows[0].width,FH*len(rows)),(255,255,255,255))
    for i,r in enumerate(rows): o.alpha_composite(r,(0,i*FH))
    o.resize((o.width*3,o.height*3),Image.NEAREST).save(D+'prev.png')

def exportar(dest, heads):
    """tiras de 12 fotogramas (8 andar + 4 quieto) de 53x74 por capa: cuerpo, objetos y cabeza de cada hobbit"""
    import os; os.makedirs(dest, exist_ok=True)
    def tira(layers, head=None):
        fr=frames(layers, head, [])
        sh=Image.new('RGBA',(FW*len(fr),FH),(0,0,0,0))
        for i,f in enumerate(fr): sh.alpha_composite(f,(i*FW,0))
        return sh
    for nom,f in [('cuerpo','cuerpo.png'),('capa','10.png'),('pantalon','11.png'),('mochila','13.png'),('cantimplora','14.png')]:
        tira([capa_objeto(f)]).save(f'{dest}/{nom}.webp',lossless=True)
    vacio=np.zeros((H,W,4),np.uint8)
    for nom,f in heads.items(): tira([vacio],cabeza(f)).save(f'{dest}/cab_{nom}.webp',lossless=True)
