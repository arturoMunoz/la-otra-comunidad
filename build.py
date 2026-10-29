"""Genera public/index.html (web real) y, con --demo SALIDA, el prototipo de un solo archivo.
Uso: python3 build.py            -> public/index.html
     python3 build.py --demo x.html -> prototipo con imágenes incrustadas y datos inventados
"""
import json, re, sys, base64, os

ROOT = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(ROOT, 'src.html'), encoding='utf-8').read()
man = json.load(open(os.path.join(ROOT, 'manifest.json'), encoding='utf-8'))
data = open(os.path.join(ROOT, 'data.js'), encoding='utf-8').read().replace('const ICON', 'var ICON').replace('const T =', 'var T =')
key = open(os.path.join(ROOT, 'supabase', 'clave_publica.txt')).read().strip()

def fill(html, man, demo):
    return (html.replace('__KEY__', key).replace('__MAN__', json.dumps(man)).replace('__DATA__', data)
                .replace('__LOGO__', man['logo']).replace('__DEMO__', 'true' if demo else 'false').replace('__MINI__', open(os.path.join(ROOT, 'minijuegos.js'), encoding='utf-8').read()))

if '--demo-files' in sys.argv:
    out = sys.argv[sys.argv.index('--demo-files') + 1]
    html = fill(src, man, True)
    head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
    head = re.sub(r'<meta[^>]*>\n?|<link rel="apple-touch-icon"[^>]*>\n?|<link rel="manifest"[^>]*>\n?', '', head)
    body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
    open(out, 'w', encoding='utf-8').write(head.strip() + '\n' + body.strip() + '\n')
elif '--demo' in sys.argv:
    out = sys.argv[sys.argv.index('--demo') + 1]
    def uri(p):
        return 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(ROOT, 'public', p), 'rb').read()).decode()
    m = json.loads(json.dumps(man))
    for ls in m['tramos']:
        for l in ls: l['src'] = uri(l['src'])
    m['arturo'] = [uri(p) for p in m['arturo']]
    m['vecinos'] = [uri(p) for p in m['vecinos']]
    m['faces'] = uri(m['faces']); m['logo'] = uri(m['logo'])
    m['mj'] = {k: uri(v) for k, v in m.get('mj', {}).items()}
    if 'papiro' in m: m['papiro'] = uri(m['papiro'])
    if 'andar' in m: m['andar']['src'] = uri(m['andar']['src'])
    if 'mapa' in m: m['mapa']['src'] = uri(m['mapa']['src'])
    if 'equipo' in m: m['equipo'] = {k: uri(v) for k, v in m['equipo'].items()}
    if 'prologo' in m:
        m['prologo']['poster'] = uri(m['prologo']['poster']); m['prologo']['casa'] = uri(m['prologo']['casa'])
        m['prologo']['video'] = 'data:video/mp4;base64,' + base64.b64encode(open(os.path.join(ROOT, 'public', m['prologo']['video']), 'rb').read()).decode()
    m['ilustraciones'] = [uri(p) for p in m.get('ilustraciones', [])]
    m['npc'] = {k: [uri(p) for p in v] for k, v in m.get('npc', {}).items()}
    m['libro'] = {k: uri(v) for k, v in m.get('libro', {}).items()}
    if 'ropa' in m: m['ropa'] = {k: (uri(v) if isinstance(v, str) else v) for k, v in m['ropa'].items()}
    if 'ropaIco' in m: m['ropaIco'] = {k: uri(v) for k, v in m['ropaIco'].items()}
    if 'andarPJ' in m: m['andarPJ'] = {h: {k: uri(v) for k, v in d.items()} for h, d in m['andarPJ'].items()}
    if 'objetos' in m: m['objetos'] = {k: uri(v) for k, v in m['objetos'].items()}
    html = fill(src, m, True)
    head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
    head = re.sub(r'<meta[^>]*>\n?|<link rel="apple-touch-icon"[^>]*>\n?', '', head)
    body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
    open(out, 'w', encoding='utf-8').write(head.strip() + '\n' + body.strip() + '\n')
else:
    open(os.path.join(ROOT, 'public', 'index.html'), 'w', encoding='utf-8').write(fill(src, man, False))
