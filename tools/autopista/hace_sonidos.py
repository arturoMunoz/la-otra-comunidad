"""Sonidos de A-6 (17/11): sustituyen a los medievales de La Brecha (public/abismo/sonidos/fx).
Fuente: packs CC0 de Kenney sacados de copias en GitHub (Sci-fi Sounds, Impact Sounds, Interface Sounds, Digital Audio):
  git clone https://github.com/Boyquotes/kenney-sci-fi-sounds-for-godot
  git clone https://github.com/Boyquotes/kenney-impact-sounds-for-godot
  git clone https://github.com/Calinou/kenney-interface-sounds
  git clone https://github.com/ismetcabbar9-oss/kenney-audio-assets   (Digital sounds)
Uso: python3 -I tools/autopista/hace_sonidos.py CARPETA_CON_LOS_CLONES
Escribe public/batalla/sonidos_ap/fx/<nombre>_N.mp3 con los MISMOS nombres que usa juego.js (SON_LISTA), para que A-6 solo cambie de carpeta.
Los que no son medievales (tajo, viento) se copian de La Brecha; los que no tienen equivalente en Kenney (fusil, golf, cadena, arena) esperan a Pixabay."""
import glob, os, shutil, subprocess, sys
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[1]
DST = os.path.join(RAIZ, 'public/batalla/sonidos_ap/fx'); os.makedirs(DST, exist_ok=True)
VIEJO = os.path.join(RAIZ, 'public/abismo/sonidos/fx')

def busca(patron):
    r = sorted(f for f in glob.glob(os.path.join(SRC, '**', patron), recursive=True) if not f.endswith('.import'))
    if not r: sys.exit('falta ' + patron)
    return r

# nombre -> lista de archivos (en orden: _1, _2, _3...)
MAPA = {
    'golpe_carne': busca('impact_punch_medium_00*.ogg')[:3],
    'espada_armadura': busca('impact_plate_medium_00*.ogg')[:3],
    'disparo_arco': busca('laser_small_00*.ogg')[:3],
    'flecha_clavada': busca('impact_generic_light_00*.ogg')[:3],
    'muerte_orco': busca('impact_soft_heavy_00*.ogg')[:5] + busca('impact_soft_medium_00*.ogg')[:1],
    'subir_nivel': busca('powerUp*.ogg')[:3],
    'recoger_moneda': busca('pepSound*.ogg')[:3],
    'cuerno_lejano': busca('threeTone*.ogg')[:2] + busca('zapThreeToneUp*.ogg')[:1],
    'explosion_piedras': busca('explosion_crunch_00*.ogg')[:3],
    'explosion_fuego': busca('low_frequency_explosion_00*.ogg')[:2] + busca('explosion_crunch_00*.ogg')[3:4],
    'rayo_magico': busca('force_field_00*.ogg')[:3],
    'derrumbe_muro': busca('impact_metal_heavy_00*.ogg')[:3],
    'madera_rota': busca('impact_tin_medium_00*.ogg')[:3],
    'abrir_cofre': busca('door_open_00*.ogg')[:3],
    'recoger_gema': busca('click_00*.wav')[:3],   # también es el clic de los menús
    # propios de los héroes que Kenney sí tiene
    'ap_llama': busca('thruster_fire_00*.ogg')[:3],
    'ap_energia': busca('laser_retro_00*.ogg')[:3],
    'ap_luz': busca('phaserUp*.ogg')[:3],
}
SE_QUEDAN = ['espada_corte', 'rafaga_viento', 'grito_guerra_orco', 'aullido_huargo']

for n, fs in MAPA.items():
    for i, f in enumerate(fs, 1):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-16:TP=-1.5',
                        '-ar', '44100', '-ac', '1', '-b:a', '96k', os.path.join(DST, f'{n}_{i}.mp3')], check=True)
    print(n, len(fs))
for n in SE_QUEDAN:
    for f in glob.glob(os.path.join(VIEJO, n + '_*.mp3')): shutil.copy(f, DST)
with open(os.path.join(DST, '..', 'CREDITOS_audio.txt'), 'w') as c:
    c.write('A-6 · Efectos de sonido\nKenney (kenney.nl): Sci-fi Sounds, Impact Sounds, Interface Sounds, Digital Audio · CC0 1.0 Universal\n'
            'espada_corte, rafaga_viento, grito_guerra_orco, aullido_huargo: los de La Brecha (ver public/abismo/sonidos/CREDITOS_audio.txt)\n'
            'Voz del anunciador (voces_ap): ElevenLabs\n')
