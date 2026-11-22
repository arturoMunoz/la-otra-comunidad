# Junta los edificios CC0 de Kenney (City Kit Commercial 2.1 e Industrial 1.0) en un solo .glb con la textura en WebP
# uso: python3 -I junta.py CARPETA_KITS SALIDA.glb TEX_COM.png TEX_IND.png
import json, struct, sys, io, glob, os
from PIL import Image
src, dst, tcom, tind = sys.argv[1:5]
emi = sys.argv[5:7]
kits = [('c', 'kenney_city-kit-commercial_2.1', tcom), ('i', 'kenney_city-kit-industrial_1.0', tind)]
J = {'asset': {'version': '2.0', 'generator': 'junta.py (A-6)'}, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'accessors': [], 'bufferViews': [],
     'materials': [], 'textures': [], 'images': [], 'samplers': [{'magFilter': 9729, 'minFilter': 9987}], 'extensionsUsed': ['EXT_texture_webp'], 'extensionsRequired': ['EXT_texture_webp']}
BIN = bytearray()
def pon(raw, target=None):
    while len(BIN) % 4: BIN.append(0)
    o = len(BIN); BIN.extend(raw); bv = {'buffer': 0, 'byteOffset': o, 'byteLength': len(raw)}
    if target: bv['target'] = target
    J['bufferViews'].append(bv); return len(J['bufferViews']) - 1
for ki, (pre, carpeta, tex) in enumerate(kits):
    out = io.BytesIO(); Image.open(tex).convert('RGBA').save(out, 'WEBP', quality=92, method=6)
    J['images'].append({'bufferView': pon(out.getvalue()), 'mimeType': 'image/webp', 'name': pre})
    J['textures'].append({'sampler': 0, 'extensions': {'EXT_texture_webp': {'source': len(J['images']) - 1}}})
    mat = {'name': 'kit_' + pre, 'pbrMetallicRoughness': {'baseColorTexture': {'index': len(J['textures']) - 1}, 'metallicFactor': 0, 'roughnessFactor': 0.85}}
    if emi:
        out = io.BytesIO(); Image.open(emi[ki]).convert('RGB').save(out, 'WEBP', quality=90, method=6)
        J['images'].append({'bufferView': pon(out.getvalue()), 'mimeType': 'image/webp', 'name': pre + '_luz'})
        J['textures'].append({'sampler': 0, 'extensions': {'EXT_texture_webp': {'source': len(J['images']) - 1}}})
        mat['emissiveTexture'] = {'index': len(J['textures']) - 1}; mat['emissiveFactor'] = [1, 1, 1]
    J['materials'].append(mat)
    for f in sorted(glob.glob(os.path.join(src, carpeta, '*.glb'))):
        nom = os.path.basename(f)[:-4]
        if nom.startswith('detail-awning') or nom.startswith('detail-overhang'): continue
        b = open(f, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
        b0 = 20 + n; bl = struct.unpack('<I', b[b0:b0 + 4])[0]; B = b[b0 + 8:b0 + 8 + bl]
        def acc(i, target):
            a = dict(j['accessors'][i]); bv = j['bufferViews'][a['bufferView']]
            raw = B[bv.get('byteOffset', 0) + a.get('byteOffset', 0):]
            comp = {5126: 4, 5125: 4, 5123: 2, 5121: 1}[a['componentType']] * {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
            st = bv.get('byteStride', comp); data = bytearray()
            for k in range(a['count']): data += raw[k * st:k * st + comp]
            a['bufferView'] = pon(bytes(data), target); a.pop('byteOffset', None)
            J['accessors'].append(a); return len(J['accessors']) - 1
        prims = []
        for p in j['meshes'][j['nodes'][j['scenes'][0]['nodes'][0]].get('mesh', 0)]['primitives']:
            at = {k: acc(v, 34962) for k, v in p['attributes'].items() if k in ('POSITION', 'NORMAL', 'TEXCOORD_0')}
            q = {'attributes': at, 'material': ki}
            if 'indices' in p: q['indices'] = acc(p['indices'], 34963)
            prims.append(q)
        J['meshes'].append({'name': pre + '_' + nom, 'primitives': prims})
        nd = j['nodes'][j['scenes'][0]['nodes'][0]]
        node = {'name': pre + '_' + nom.replace('low-detail-building-', 'ld_').replace('building-', '').replace('-', '_'), 'mesh': len(J['meshes']) - 1}
        for k in ('scale', 'rotation', 'translation'):
            if k in nd: node[k] = nd[k]
        J['nodes'].append(node); J['scenes'][0]['nodes'].append(len(J['nodes']) - 1)
while len(BIN) % 4: BIN.append(0)
J['buffers'] = [{'byteLength': len(BIN)}]
js = json.dumps(J, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN)
open(dst, 'wb').write(glb); print(dst, len(glb), 'bytes', [n['name'] for n in J['nodes']])
