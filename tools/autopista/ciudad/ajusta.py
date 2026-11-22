import json, math, sys
L=json.load(open(sys.argv[1])); A=L['carril']; B=[(-p[0],-p[1]) for p in A][::-1]
def ds(px,pz,a,b):
    vx,vz=b[0]-a[0],b[1]-a[1]; t=max(0,min(1,((px-a[0])*vx+(pz-a[1])*vz)/(vx*vx+vz*vz))); return math.hypot(px-a[0]-vx*t,pz-a[1]-vz*t)
def dc(x,z): return min(ds(x,z,C[i-1],C[i]) for C in (A,B) for i in range(1,len(C)))
def mind(b):
    m=1e9
    for i in range(13):
        for k in range(13):
            m=min(m,dc(b[0]+(b[2]-b[0])*i/12,b[1]+(b[3]-b[1])*k/12))
    return m
MIN=float(sys.argv[2]) if len(sys.argv)>2 else 5
out=[]
for b in L['bloques']:
    b=list(b)
    while mind(b)<MIN and b[2]-b[0]>1 and b[3]-b[1]>1:
        best=None
        for s in range(4):
            c=list(b); c[s]+= 0.5 if s<2 else -0.5
            v=mind(c); area=(c[2]-c[0])*(c[3]-c[1])
            if best is None or (v,area)>(best[0],best[1]): best=(v,area,c)
        b=best[2]
    out.append([round(v,1) for v in b]); print(out[-1], round(mind(b),2))
L['bloques']=out; json.dump(L,open(sys.argv[1].replace('.json','b.json'),'w'))
