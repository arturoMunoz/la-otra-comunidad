# Dibuja la planta del mapa ciudad: calzadas (carriles), bloques (edificios), campamentos, hierbas
import json, sys, math
from PIL import Image, ImageDraw
S = 8; W, H = 36, 60
L = json.load(open(sys.argv[1]))
gira = lambda p: (-p[0], -p[1])
im = Image.new('RGB', (W*2*S, H*2*S), (60, 70, 60)); d = ImageDraw.Draw(im)
X = lambda x: (x + W) * S; Z = lambda z: (z + H) * S
A = L['carril']; B = [gira(p) for p in A][::-1]
for C in (A, B):
    for i in range(1, len(C)):
        d.line([X(C[i-1][0]), Z(C[i-1][1]), X(C[i][0]), Z(C[i][1])], fill=(40, 40, 45), width=int(8*S))
        d.ellipse([X(C[i][0])-4*S, Z(C[i][1])-4*S, X(C[i][0])+4*S, Z(C[i][1])+4*S], fill=(40,40,45))
    for i in range(1, len(C)):
        d.line([X(C[i-1][0]), Z(C[i-1][1]), X(C[i][0]), Z(C[i][1])], fill=(200, 170, 40), width=2)
blq = L['bloques'] + [[-b[2], -b[3], -b[0], -b[1]] for b in L['bloques']]
for b in blq: d.rectangle([X(b[0]), Z(b[1]), X(b[2]), Z(b[3])], fill=(150, 140, 160), outline=(30, 30, 30))
cm = L['campos'] + [dict(c, x=-c['x'], z=-c['z']) for c in L['campos'] if not c.get('unico')]
for c in cm:
    r = c.get('r', 3); d.ellipse([X(c['x'])-r*S, Z(c['z'])-r*S, X(c['x'])+r*S, Z(c['z'])+r*S], outline=(255, 80, 80), width=2); d.text((X(c['x'])-10, Z(c['z'])-5), c['t'], fill=(255,255,255))
for h in L.get('hierbas', []) + [[-h[0], -h[1]] for h in L.get('hierbas', [])]:
    d.ellipse([X(h[0])-2.4*S, Z(h[1])-2.4*S, X(h[0])+2.4*S, Z(h[1])+2.4*S], outline=(80, 220, 80), width=2)
for b in L['bases']: 
    for k, col in (('fuente', (80,160,255)), ('nexo', (255,255,0)), ('torre', (255,120,0))):
        p = b[k]; d.ellipse([X(p[0])-1.5*S, Z(p[1])-1.5*S, X(p[0])+1.5*S, Z(p[1])+1.5*S], fill=col)
d.rectangle([X(-34), Z(-58), X(34), Z(58)], outline=(255,255,255))
for z in range(-60, 61, 10): d.text((2, Z(z)), str(z), fill=(255,255,255))
for x in range(-30, 31, 10): d.text((X(x), 2), str(x), fill=(255,255,255))
im.save(sys.argv[2])
