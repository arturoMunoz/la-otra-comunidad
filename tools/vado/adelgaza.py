# Adelgaza un .glb para La Brecha: quita clips que el juego no usa y pasa las texturas PNG a WebP (EXT_texture_webp).
import json, struct, sys, io, re
from PIL import Image
src, dst, js = sys.argv[1], sys.argv[2], sys.argv[3]
codigo = open(js).read()
usados = set(re.findall(r"'([a-z_0-9]+)'", codigo))
b = open(src, 'rb').read()
l = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + l])
bin0 = 20 + l; bl = struct.unpack('<I', b[bin0:bin0 + 4])[0]; BIN = b[bin0 + 8:bin0 + 8 + bl]
anims = j.get('animations', [])
quedan = [a for a in anims if a.get('name') in usados]
if len(quedan) == 0: quedan = anims
j['animations'] = quedan
if not j['animations']: j.pop('animations', None)
# bufferViews vivos: recorre todo lo que los referencia
vivos = set()
for a in j.get('accessors', []):
    pass
acc_vivos = set()
def marca_acc(i):
    if i is not None: acc_vivos.add(i)
for m in j.get('meshes', []):
    for p in m['primitives']:
        for v in p['attributes'].values(): marca_acc(v)
        marca_acc(p.get('indices'))
        for t in p.get('targets', []):
            for v in t.values(): marca_acc(v)
for s in j.get('skins', []): marca_acc(s.get('inverseBindMatrices'))
for a in j.get('animations', []):
    for smp in a['samplers']: marca_acc(smp['input']); marca_acc(smp['output'])
for i in acc_vivos:
    bv = j['accessors'][i].get('bufferView')
    if bv is not None: vivos.add(bv)
# imágenes → webp
webp = {}
for ii, im in enumerate(j.get('images', [])):
    if 'bufferView' not in im: continue
    bv = j['bufferViews'][im['bufferView']]; raw = BIN[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
    pic = Image.open(io.BytesIO(raw)); out = io.BytesIO()
    if pic.mode not in ('RGB', 'RGBA'): pic = pic.convert('RGBA')
    pic.save(out, 'WEBP', quality=88, method=6); webp[ii] = out.getvalue()
# reescribe el binario solo con lo vivo + las imágenes nuevas
nuevoBin = bytearray(); mapa = {}; nbv = []
def añade(data, extra):
    while len(nuevoBin) % 4: nuevoBin.append(0)
    off = len(nuevoBin); nuevoBin.extend(data); d = dict(extra); d['buffer'] = 0; d['byteOffset'] = off; d['byteLength'] = len(data); nbv.append(d); return len(nbv) - 1
for i, bv in enumerate(j['bufferViews']):
    if i in vivos:
        data = BIN[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
        extra = {k: v for k, v in bv.items() if k in ('byteStride', 'target')}
        mapa[i] = añade(data, extra)
for ii, im in enumerate(j.get('images', [])):
    if ii in webp: im['bufferView'] = añade(webp[ii], {}); im['mimeType'] = 'image/webp'
    elif 'bufferView' in im: im['bufferView'] = añade(BIN[j['bufferViews'][im['bufferView']].get('byteOffset', 0):][:j['bufferViews'][im['bufferView']]['byteLength']], {})
for a in j.get('accessors', []):
    if a.get('bufferView') is not None:
        if a['bufferView'] in mapa: a['bufferView'] = mapa[a['bufferView']]
        else: a.pop('bufferView')
j['bufferViews'] = nbv
j['buffers'] = [{'byteLength': len(nuevoBin)}]
if webp:
    for t in j.get('textures', []):
        if 'source' in t and t['source'] in webp:
            t.setdefault('extensions', {})['EXT_texture_webp'] = {'source': t['source']}
    eu = j.setdefault('extensionsUsed', []);
    if 'EXT_texture_webp' not in eu: eu.append('EXT_texture_webp')
while len(nuevoBin) % 4: nuevoBin.append(0)
js_b = json.dumps(j, separators=(',', ':')).encode();
while len(js_b) % 4: js_b += b' '
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js_b) + 8 + len(nuevoBin)) + struct.pack('<II', len(js_b), 0x4E4F534A) + js_b + struct.pack('<II', len(nuevoBin), 0x004E4942) + bytes(nuevoBin)
open(dst, 'wb').write(out)
print(f"{src.split('/')[-1]}: {len(b)//1024} → {len(out)//1024} KB · clips {len(anims)} → {len(quedan)} ({', '.join(a['name'] for a in quedan)})")
