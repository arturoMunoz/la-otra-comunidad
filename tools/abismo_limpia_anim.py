# quita las pistas de animación que no se mueven y están en la pose de reposo, y reempaqueta el .glb
import json,struct,sys,numpy as np
def load(f):
    b=open(f,'rb').read(); l=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+l]); return j,b[20+l+8:]
def acc(j,b,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; n={'SCALAR':1,'VEC3':3,'VEC4':4}[a['type']]
    return np.frombuffer(b,np.float32,a['count']*n,bv.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,n)
REST={'translation':[0,0,0],'rotation':[0,0,0,1],'scale':[1,1,1]}
def limpia(src,dst):
    j,b=load(src); quitadas=0
    for a in j['animations']:
        keep=[];
        for c in a['channels']:
            s=a['samplers'][c['sampler']]; o=acc(j,b,s['output']); nd=j['nodes'][c['target']['node']]
            rest=np.array(nd.get(c['target']['path'],REST[c['target']['path']]))
            v=o[0]
            if c['target']['path']=='rotation' and np.dot(v,rest)<0: v=-v
            if np.ptp(o,axis=0).max()<1e-5 and np.abs(v-rest).max()<1e-4: quitadas+=1; continue
            keep.append(c)
        samp=[]; m={}
        for c in keep:
            si=c['sampler']
            if si not in m: m[si]=len(samp); samp.append(a['samplers'][si])
            c['sampler']=m[si]
        a['channels']=keep; a['samplers']=samp
    # accessors usados
    usados=set()
    def walk(x):
        if isinstance(x,dict):
            for k,v in x.items():
                if k in ('accessor','indices','inverseBindMatrices','input','output') and isinstance(v,int): usados.add(v)
                elif k=='attributes' or k=='targets': 
                    vals=v.values() if isinstance(v,dict) else [vv for t in v for vv in t.values()]
                    for vv in vals: usados.add(vv)
                else: walk(v)
        elif isinstance(x,list): [walk(y) for y in x]
    for k in ('meshes','skins','animations'): walk(j.get(k,[]))
    bvs=set(j['accessors'][i]['bufferView'] for i in usados if 'bufferView' in j['accessors'][i])
    for im in j.get('images',[]):
        if 'bufferView' in im: bvs.add(im['bufferView'])
    acc_map={}; nuevos_acc=[]
    for i,a in enumerate(j['accessors']):
        if i in usados: acc_map[i]=len(nuevos_acc); nuevos_acc.append(a)
    bv_map={}; nuevos_bv=[]; out=bytearray()
    for i,bv in enumerate(j['bufferViews']):
        if i not in bvs: continue
        while len(out)%4: out.append(0)
        d=b[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
        nb=dict(bv); nb['byteOffset']=len(out); out+=d; bv_map[i]=len(nuevos_bv); nuevos_bv.append(nb)
    for a in nuevos_acc:
        if 'bufferView' in a: a['bufferView']=bv_map[a['bufferView']]
    for im in j.get('images',[]):
        if 'bufferView' in im: im['bufferView']=bv_map[im['bufferView']]
    def remap(x):
        if isinstance(x,dict):
            for k,v in list(x.items()):
                if k in ('accessor','indices','inverseBindMatrices','input','output') and isinstance(v,int): x[k]=acc_map[v]
                elif k=='attributes': x[k]={kk:acc_map[vv] for kk,vv in v.items()}
                elif k=='targets': x[k]=[{kk:acc_map[vv] for kk,vv in t.items()} for t in v]
                else: remap(v)
        elif isinstance(x,list): [remap(y) for y in x]
    for k in ('meshes','skins','animations'): remap(j.get(k,[]))
    j['accessors']=nuevos_acc; j['bufferViews']=nuevos_bv; j['buffers']=[{'byteLength':len(out)}]
    while len(out)%4: out.append(0)
    js=json.dumps(j,separators=(',',':')).encode();
    while len(js)%4: js+=b' '
    tot=12+8+len(js)+8+len(out)
    open(dst,'wb').write(struct.pack('<III',0x46546C67,2,tot)+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(out),0x004E4942)+bytes(out))
    return quitadas
for f in sys.argv[2:]:
    import os; print(f, limpia(f, os.path.join(sys.argv[1],os.path.basename(f))))
