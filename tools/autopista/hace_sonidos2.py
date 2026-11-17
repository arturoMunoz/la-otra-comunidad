"""Sonidos de A-6 bajados a mano por Henar/Arturo (Pixabay, 17/11), originales en tools/autopista/sonidos_orig.
Golf (6 golpes, se usan 3), fusiles (francotirador, M1 y el francotirador un poco más grave), arena (3 trozos del barrido),
ambiente de tráfico (60 s en bucle) y música de acción (bucle de 42 s, para menú y partida).
Uso: python3 -I tools/autopista/hace_sonidos2.py"""
import os, subprocess
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
O, S = os.path.join(R, 'tools/autopista/sonidos_orig'), os.path.join(R, 'public/batalla/sonidos_ap')
FX = '-ar 44100 -ac 1 -b:a 96k'.split()
def corta(src, ini, dur, dst, extra='', norm='loudnorm=I=-16:TP=-1.5,alimiter=limit=0.85:level=false,volume=-3dB'):
    af = ','.join(x for x in [extra, f'afade=t=out:st={max(0.01, dur - 0.08):.2f}:d=0.08', norm] if x)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(ini), '-t', str(dur), '-i', os.path.join(O, src), '-af', af, *FX, os.path.join(S, dst)], check=True)
# golf: los golpes empiezan en 0,97 / 2,33 / 3,77 s
for i, t in enumerate([0.95, 2.31, 3.75], 1): corta('golf_serie.mp3', t, 0.55, f'fx/ap_golf_{i}.mp3')
corta('fusil_francotirador.mp3', 0, 1.3, 'fx/ap_fusil_1.mp3')
corta('fusil_m1.mp3', 0, 1.2, 'fx/ap_fusil_2.mp3')
corta('fusil_francotirador.mp3', 0, 1.3, 'fx/ap_fusil_3.mp3', extra='asetrate=44100*0.9,aresample=44100')
# arena: barrido de 0,49 a 2,88 s
for i, t in enumerate([0.49, 1.0, 1.5], 1): corta('arena.mp3', t, 1.3, f'fx/ap_arena_{i}.mp3', extra='afade=t=in:d=0.06')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '20', '-t', '60', '-i', os.path.join(O, 'trafico.mp3'), '-af', 'afade=t=in:d=1,afade=t=out:st=59:d=1,loudnorm=I=-24:TP=-3', '-ar', '44100', '-ac', '1', '-b:a', '64k', os.path.join(S, 'amb/trafico.mp3')], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(O, 'accion_120bpm.mp3'), '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '44100', '-b:a', '128k', os.path.join(S, 'mus/accion.mp3')], check=True)
print('ok')
