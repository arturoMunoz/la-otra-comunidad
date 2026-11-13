import numpy as np, subprocess, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=720,1280,30
OFF=0.6
cuts=[7.9,14.95,21.35,27.9,34.0]
VOZ=46.84; FIN=OFF+VOZ+2.6
T=[0]+[c+OFF for c in cuts]+[FIN]
imgs=[np.asarray(Image.open(f'{i}.png').convert('RGB')).astype(np.float32) for i in range(1,7)]
IM=[Image.open(f'{i}.png').convert('RGB') for i in range(1,7)]
ease=lambda x:0.5-0.5*math.cos(math.pi*max(0,min(1,x)))
# movimiento de cámara por imagen: (cx,cy,zoom) inicio -> fin, en píxeles de la imagen 1024x1536
CAM=[((512,820,1.0),(560,980,1.28)),   # 1: empuja hacia la puerta
     ((600,800,1.18),(430,820,1.12)),  # 2: barrido por la sala
     ((520,760,1.05),(560,690,1.45)),  # 3: golpe de zoom al anillo
     ((560,760,1.05),(760,560,1.4)),   # 4: hacia el desconocido
     ((470,900,1.25),(700,560,1.12)),  # 5: sube hacia la ventana rota
     ((512,1000,1.25),(560,760,1.0))]  # 6: se abre al paisaje y al cielo
def vista(i,p,dx=0,dy=0,zx=1.0):
    (a,b)=CAM[i]; e=ease(p) if i!=2 else 1-(1-min(1,p*1.4))**3
    cx=a[0]+(b[0]-a[0])*e+dx; cy=a[1]+(b[1]-a[1])*e+dy; z=(a[2]+(b[2]-a[2])*e)*zx
    ch=1536/z; cw=ch*W/H
    cx=min(max(cx,cw/2),1024-cw/2); cy=min(max(cy,ch/2),1536-ch/2)
    box=(cx-cw/2,cy-ch/2,cx+cw/2,cy+ch/2)
    return np.asarray(IM[i].resize((W,H),Image.BICUBIC,box=box)).astype(np.float32)
yy,xx=np.mgrid[0:H,0:W]; vig=1-0.55*(((xx-W/2)/(W*0.75))**2+((yy-H/2)/(H*0.72))**2); vig=np.clip(vig,0.35,1)[...,None]
# rótulo del acto
rot=Image.open('/home/claude/la-otra-comunidad/public/assets/ui/rotulo.webp').convert('RGBA'); rw=620; rot=rot.resize((rw,int(rw*rot.height/rot.width)),Image.LANCZOS)
f1=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',62); f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',30)
d=ImageDraw.Draw(rot); 
def txt(t,f,y,col):
    w=d.textlength(t,font=f); d.text(((rot.width-w)/2+2,y+3),t,font=f,fill=(0,0,0,200)); d.text(((rot.width-w)/2,y),t,font=f,fill=col)
txt('Acto III',f1,rot.height*0.30,(255,222,140,255))
cap=Image.new('RGBA',(W,140),(0,0,0,0)); dc=ImageDraw.Draw(cap)
t='Hacia la Cima de los Vientos'; w=dc.textlength(t,font=f2)
for o in [(2,2),(-2,2),(2,-2),(-2,-2)]: dc.text(((W-w)/2+o[0],40+o[1]),t,font=f2,fill=(0,0,0,230))
dc.text(((W-w)/2,40),t,font=f2,fill=(250,236,200,255))
T_ROT=OFF+42.7
def capa(fr,ov,x,y,a):
    if a<=0: return fr
    o=np.asarray(ov).astype(np.float32); h,w=o.shape[:2]; x=int(x); y=int(y)
    reg=fr[y:y+h,x:x+w]; al=o[...,3:4]/255*a; reg[:]=reg*(1-al)+o[...,:3]*al; return fr
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','video.mp4'],stdin=subprocess.PIPE)
N=int(FIN*FPS); random.seed(3)
TR=0.7
for n in range(N):
    t=n/FPS
    i=max(k for k in range(6) if t>=T[k]) ; i=min(i,5)
    def loc(k,tt): return (tt-T[k]+TR)/(T[k+1]-T[k]+2*TR)
    fr=vista(i,loc(i,t))
    # transición hacia la siguiente
    if i<5:
        dt=T[i+1]-t
        if dt<TR/2 or (i>0 and False): pass
    # mezcla alrededor de cada corte
    for k in range(1,6):
        c=T[k]; u=(t-(c-TR/2))/TR
        if 0<=u<=1:
            A=vista(k-1,loc(k-1,t)); B=vista(k,loc(k,t))
            if k==1:   # empuje hacia dentro de la posada
                A=vista(0,loc(0,t),zx=1+0.6*u*u); fr=A*(1-ease(u))+B*ease(u)
            elif k==2: # destello blanco
                fr=(A if u<0.5 else B); fr=fr+(255-fr)*max(0,1-abs(u-0.5)*2.4)**1.5
            elif k==3: # fundido lento con desenfoque
                fr=A*(1-ease(u))+B*ease(u)
            elif k==4: # a negro y vuelta
                m=abs(u-0.5)*2; fr=(A if u<0.5 else B)*m**1.3
            elif k==5: # deslizamiento a la izquierda
                e=ease(u); s=int(W*e); fr=np.concatenate([A[:,s:],B[:,:s]],axis=1) if s>0 else A
    # temblor tras el destello (la caída de la mesa)
    ts=t-T[2]
    if 0<ts<0.5:
        a=(1-ts/0.5)*14; dx=random.uniform(-a,a); dy=random.uniform(-a,a); fr=np.roll(fr,(int(dy),int(dx)),axis=(0,1))
    fr=fr*vig
    if t>T_ROT:
        k=min(1,(t-T_ROT)/0.6); s=1+0.12*(1-ease(k))
        r=rot.resize((int(rot.width*s),int(rot.height*s)),Image.BICUBIC)
        fr=capa(fr,r,(W-r.width)/2,250-(r.height-rot.height)/2,ease(k))
        k2=min(1,(t-T_ROT-0.8)/0.8)
        if k2>0: fr=capa(fr,cap,0,250+rot.height,ease(k2))
    if t<0.5: fr=fr*(t/0.5)
    if t>FIN-0.9: fr=fr*max(0,(FIN-t)/0.9)
    p.stdin.write(np.clip(fr,0,255).astype(np.uint8).tobytes())
p.stdin.close(); p.wait(); print('frames',N,'dur',FIN)
