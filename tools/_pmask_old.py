from PIL import Image
import numpy as np, sys
from scipy import ndimage
S=sys.argv[1]
W=np.array(Image.open('public/assets/pj/arturo_andar.webp').convert('RGBA')).astype(int)
H,WW,_=W.shape; fw=53
rgb=W[...,:3]/255.; mx=rgb.max(2); mn=rgb.min(2); v=mx; s=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]; d=np.maximum(mx-mn,1e-6)
hue=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
op=W[...,3]>128
green=op&(hue>45)&(hue<100)&(s>0.4)
brown=op&(hue>5)&(hue<45)&(v>0.17)&(v<0.72)&(s>0.3)
mask=np.zeros((H,WW),bool)
brown2=op&(hue>5)&(hue<75)&(v>0.17)&(v<0.75)&(s>0.3)
for f in range(6):
    x0,x1=round(f*fw),round((f+1)*fw)
    c=green[:,x0:x1].sum(1); vb=max(y for y in range(30,50) if c[y]>=3)
    gl=np.nonzero(green[vb-4:vb,x0:x1])[1].min()
    br=brown2[:,x0:x1].copy(); br[:vb]=False; br[vb+18:]=False
    lab,n=ndimage.label(br); keep=np.zeros_like(br)
    for i,sl in enumerate(ndimage.find_objects(lab)):
        cc=lab[sl]==i+1; xs=sl[1]; ys=sl[0]
        if xs.stop<=gl+1 and ys.stop<=vb+7: continue
        if (xs.stop-xs.start)<=3 and (ys.stop-ys.start)>3: continue
        if cc.sum()<3: continue
        keep[sl]|=cc
    k2=ndimage.binary_closing(keep,iterations=2)
    k2=ndimage.binary_fill_holes(k2)
    k2&=op[:,x0:x1]&(v[:,x0:x1]>0.12)&~(v[:,x0:x1]>0.85)
    k2[:vb]=False
    gr_=np.nonzero(green[vb-6:vb,x0:x1])[1].max()
    pts=[(y,x) for y in range(vb-16,vb-1) for x in range(gr_+1,53) if brown[y,x0+x] or (op[y,x0+x] and hue[y,x0+x]<45 and v[y,x0+x]<0.8 and v[y,x0+x]>0.2)]
    if len(pts)>4:
        P=np.array(pts,float); A=np.polyfit(P[:,0],P[:,1],1)
        yy,xx=np.mgrid[0:H,0:x1-x0]; near=np.abs(xx-(A[0]*yy+A[1]))<1.6
        k2&=~near
    mask[:,x0:x1]=k2
np.save(f'{S}/pantmask.npy',mask)
t=W.copy().astype(np.uint8); L=v[mask]
t[mask,0]=(30+L*110).astype(int); t[mask,1]=(50+L*140).astype(int); t[mask,2]=(110+L*200).clip(0,255).astype(int)
Image.fromarray(t).resize((WW*4,H*4),Image.NEAREST).save(f'{S}/pant.png')
