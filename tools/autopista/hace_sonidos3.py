"""Sonidos de Henar (18/11): tools/autopista/sonidos_orig/henar_1811 -> public/batalla/sonidos_ap/fx/<nombre>_N.mp3 (pico a -3 dB, recortados y con salida suave)"""
import os, subprocess
R = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(R, 'sonidos_orig', 'henar_1811'); FX = os.path.join(R, '..', '..', 'public', 'batalla', 'sonidos_ap', 'fx')
MAPA = [  # (original, salida, segundos máximos)
    ('d01e2470-punch_impcat_1.wav', 'golpe_carne_1', 0.6), ('2a79976d-sword.flac', 'espada_armadura_1', 1.0), ('fc655704-cut_sword.wav', 'espada_corte_1', 0.8),
    ('6832f144-click.wav', 'recoger_gema_1', 0.2), ('0baa7434-dead.wav', 'muerte_orco_1', 1.0), ('fab4e553-dead2.mp3', 'muerte_orco_2', 1.4),
    ('ed92020a-laser.wav', 'ap_laser_1', 1.0), ('2dff3672-cadenas_hit.mp3', 'ap_cadena_1', 1.2), ('63835c73-teleport.wav', 'teleport_1', 2.3),
    ('73e3e0a7-blaster.wav', 'soldado_disparo_1', 0.6), ('457d5d88-hit.wav', 'soldado_impacto_1', 0.3)]
for src, dst, mx in MAPA:
    i = os.path.join(O, src); o = os.path.join(FX, dst + '.mp3'); f = max(0.05, mx - 0.15)
    pico = float(subprocess.run(['ffmpeg', '-hide_banner', '-i', i, '-t', str(mx), '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr.split('max_volume: ')[1].split(' dB')[0])
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', i, '-t', str(mx), '-af', f'silenceremove=start_periods=1:start_threshold=-50dB,afade=t=out:st={f}:d=0.15,volume={-3 - pico}dB', '-ac', '2', '-ar', '44100', '-b:a', '128k', o], check=True)
    print(dst)
