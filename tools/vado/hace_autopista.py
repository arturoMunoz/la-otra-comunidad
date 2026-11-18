#!/usr/bin/env python3
"""Genera la versión SIN Tolkien de La Brecha (nombre provisional «La Autopista»)
a partir de public/batalla/juego.js e index.html.

    python3 tools/vado/hace_autopista.py

Salen public/batalla/autopista.js y public/batalla/autopista.html. Mismo motor, mismas mecánicas:
cada mejora de La Brecha llega aquí volviendo a pasar este script. Si un cambio de La Brecha
rompe una sustitución, el script se para y dice cuál (no genera nada a medias).

Los héroes conservan la clave interna del héroe de La Brecha cuyo kit usan (pasivas, marcas de
apuntado, animaciones…): enano = Brask (caballero de luz), gandalf = Vael (mago), orco = Grub (maestro), elfo = Ata,
hobbit = Birdie (golfista), gollum = Fu (ninja calvo), rohan = Moha (asesino).
"""
import pathlib, re, sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
B = RAIZ / 'public' / 'batalla'
js = (B / 'juego.js').read_text(encoding='utf8')
html = (B / 'index.html').read_text(encoding='utf8')
fallos = []


def sub(txt, viejo, nuevo, n=1, donde='js'):
    """sustituye exactamente n apariciones (n=0: todas, al menos una)"""
    c = txt.count(viejo)
    if c == 0 or (n and c != n):
        fallos.append(f'[{donde}] {c} apariciones (esperaba {n or "≥1"}): {viejo[:70]!r}')
        return txt
    return txt.replace(viejo, nuevo)


def bloque(txt, ini, fin, nuevo):
    """sustituye desde la línea que empieza por ini hasta la primera línea que empieza por fin (incluida)"""
    m = re.search(r'^' + re.escape(ini) + r'.*?^' + re.escape(fin) + r'[^\n]*\n', txt, re.S | re.M)
    if not m:
        fallos.append(f'bloque no encontrado: {ini!r}')
        return txt
    return txt[:m.start()] + nuevo + txt[m.end():]


# ---------- héroes ----------
HEROES = '''const HEROES = {
  /* LA AUTOPISTA (17/11): 7 héroes originales. Clave interna = héroe de La Brecha cuyo kit usan. Modelos y arte PROVISIONALES hasta los pedidos a ChatGPT. */
  enano: {nombre: 'Dalinar, Caballero de Luz', modelo: 'ap_brask', alto: 2.45, ret: 'ui/ap_r_enano.webp', mana: 300, crecM: 30, vida: 740, dano: 58, vatq: 0.8, alcance: 2.3, vel: 4.9, crecV: 95, crecD: 4, arm: 38, rm: 32,
    hab: {q: {n: 'Tajo radiante', cd: 5, mn: 30, tipo: 'cono', alc: 3.8, ang: 1.5, dano: 115, icono: 'hacha', d: 'Un espadazo de luz en abanico delante de ti.'},
      w: {n: 'Coraza de luz', cd: 14, mn: 45, tipo: 'reduce', val: 0.45, dur: 3, icono: 'escudo', d: 'Su armadura se llena de luz: recibe un 45 % menos de daño durante 3 s.'},
      e: {n: 'Caída luminosa', cd: 10, mn: 45, tipo: 'salto', dist: 7, radio: 2.6, dano: 85, lento: 0.35, durL: 1.5, icono: 'botas', d: 'Salta impulsado por la luz, hiere y frena al caer.'},
      r: {n: 'Estallido de luz', cd: 50, mn: 90, tipo: 'area', radio: 4.6, dano: 240, aturde: 1.25, icono: 'h_enano', d: 'Libera toda la luz de su armadura: daño enorme y aturde a todos alrededor.'}}},
  gandalf: {nombre: 'Vael, el Mago', modelo: 'ap_vael', ret: 'ui/ap_r_gandalf.webp', mana: 420, crecM: 40, vida: 540, dano: 50, vatq: 0.88, alcance: 6.8, vel: 5.1, crecV: 78, crecD: 4.3, mag: true, arm: 20, rm: 32, proy: 'brasa',
    hab: {q: {n: 'Orbe ígneo', cd: 8, mn: 50, tipo: 'linea', mag: true, alc: 11.5, ancho: 0.9, dano: 110, aturde: 1.3, proy: 'brasa', icono: 'h_gandalf_q', d: 'Lanza un orbe de fuego que atrapa 1,3 s al primero que toca.'},
      w: {n: 'Escudo de brasas', cd: 13, mn: 55, tipo: 'escudo', mag: true, val: 140, dur: 3, aliados: 7, icono: 'h_gandalf_w', d: 'Un escudo de brasas para ti y los aliados a 7 m durante 3 s.'},
      e: {n: 'Círculo de ceniza', cd: 9, mn: 60, tipo: 'zona', mag: true, alc: 10, radio: 3.2, dur: 1.5, dps: 100, lento: 0.45, icono: 'h_gandalf_e', d: 'Ceniza ardiente en el suelo que hiere y frena un 45 % a los que la pisan.'},
      r: {n: 'Llamarada', cd: 45, mn: 100, tipo: 'linea', mag: true, alc: 16, ancho: 1.5, dano: 250, perfora: true, proy: 'brasa', icono: 'h_gandalf_r', d: 'Un gran chorro de fuego que hiere a todos en una línea muy larga.'}}},
  orco: {nombre: 'Grub, el Maestro', modelo: 'ap_grub', alto: 1.25, ret: 'ui/ap_r_orco.webp', mana: 280, crecM: 28, vida: 730, dano: 63, vatq: 0.84, alcance: 2.7, vel: 5.0, crecV: 88, crecD: 4.4, arm: 34, rm: 30,
    hab: {q: {n: 'Remolino de energía', cd: 8, mn: 30, tipo: 'area', radio: 3.5, dano: 100, curaH: 0.1, icono: 'h_orco_q', d: 'Gira la espada de energía: hiere a los de alrededor y se cura un 10 % de la vida que le falta por cada héroe que toca.'},
      w: {n: 'Tajo pesado', cd: 7, mn: 30, tipo: 'cono', alc: 3.4, ang: 1.2, dano: 90, lento: 0.5, durL: 1.2, icono: 'h_orco_w', d: 'Un tajo delante que frena un 50 % 1,2 s.'},
      e: {n: 'Atracción', cd: 14, mn: 45, tipo: 'linea', alc: 6.5, ancho: 0.9, dano: 60, tira: true, lento: 0.4, durL: 1, proy: 'energia', icono: 'h_orco_e', d: 'Con la fuerza de su mente arrastra hasta él al primero que toca.'},
      r: {n: 'Sentencia', cd: 45, mn: 80, tipo: 'ejecuta', alc: 6, dano: 170, falta: 0.35, icono: 'h_orco_r', d: 'Salta sobre el héroe más cercano: más daño cuanta menos vida le quede (35 % de la que le falta). Si lo derriba, se recarga al momento.'}}},
  elfo: {nombre: 'Ata, la Francotiradora', modelo: 'ap_ata', ret: 'ui/ap_r_elfo.webp', mana: 340, crecM: 32, vida: 520, dano: 50, vatq: 0.95, alcance: 7, vel: 5.3, crecV: 75, crecD: 4.5, arm: 22, rm: 28, proy: 'bala',
    hab: {q: {n: 'Bala perforante', cd: 6, mn: 45, tipo: 'linea', alc: 13, ancho: 0.9, dano: 125, perfora: true, proy: 'bala', icono: 'arco', d: 'Un disparo largo que atraviesa a todos en su línea.'},
      w: {n: 'Cadencia', cd: 12, mn: 40, tipo: 'rafaga', val: 0.6, dur: 4, icono: 'i_abanico', d: 'Disparas un 60 % más rápido durante 4 s.'},
      e: {n: 'Voltereta', cd: 9, mn: 35, tipo: 'dash', dist: 5, dano: 0, icono: 'i_esquivar', d: 'Ruedas hacia donde apuntes.'},
      r: {n: 'Fuego de cobertura', cd: 45, mn: 90, tipo: 'zona', alc: 10, radio: 3.6, dur: 3, dps: 80, lento: 0.3, icono: 'h_elfo', d: 'Durante 3 s barres la zona a balazos: hieres y frenas.'}}},
  hobbit: {nombre: 'Birdie, el Golfista', modelo: 'ap_birdie', ret: 'ui/ap_r_hobbit.webp', mana: 320, crecM: 32, vida: 560, dano: 50, vatq: 1.0, alcance: 6.5, vel: 5.8, crecV: 78, crecD: 4, arm: 24, rm: 28, proy: 'bola',
    hab: {q: {n: 'Drive', cd: 7, mn: 40, tipo: 'linea', alc: 11, ancho: 0.8, dano: 100, aturde: 0.9, proy: 'bola', icono: 'honda', d: 'Una bola de golf a toda velocidad: aturde al primero que toca.'},
      w: {n: 'Bajo par', cd: 16, mn: 45, tipo: 'invis', dur: 3, vel: 0.35, icono: 'i_humo', d: 'Desapareces 3 s y corres más: ni torres ni enemigos te ven.'},
      e: {n: 'Cubo de bolas', cd: 6, mn: 35, tipo: 'cono', alc: 5.2, ang: 1.0, dano: 90, icono: 'i_piedras', d: 'Vacías el cubo: un puñado de bolas en abanico.'},
      r: {n: 'Hoyo en uno', cd: 45, mn: 80, tipo: 'suerte', cura: 0.4, vel: 0.5, dur: 5, icono: 'h_hobbit', d: 'Te curas un 40 %, corres más y pegas más fuerte 5 s.'}}},
  gollum: {nombre: 'Fu, el Ninja', modelo: 'ap_fu', ret: 'ui/ap_r_gollum.webp', mana: 280, crecM: 28, vida: 640, dano: 68, vatq: 1.1, alcance: 2.3, vel: 5.7, crecV: 90, crecD: 5, arm: 32, rm: 30,
    hab: {q: {n: 'Salto de la grulla', cd: 6, mn: 30, tipo: 'salto', dist: 6, radio: 2.2, dano: 140, lento: 0.35, durL: 1, icono: 'h_gollum_q', d: 'Salta sobre su presa: hiere y frena al caer.'},
      w: {n: 'Meditación', cd: 14, mn: 40, tipo: 'suerte', cura: 0.25, vel: 0.3, dur: 3, icono: 'h_gollum_w', d: 'Respira hondo: se cura un 25 %, corre más y pega más fuerte 3 s.'},
      e: {n: 'Kusarigama', cd: 10, mn: 35, tipo: 'linea', alc: 9, ancho: 0.8, dano: 70, aturde: 1.0, proy: 'cadena', icono: 'h_gollum_e', d: 'Lanza la hoz con cadena: atrapa 1 s al primero que toca.'},
      r: {n: 'Bomba de humo', cd: 50, mn: 80, tipo: 'invis', dur: 5, vel: 0.6, icono: 'h_gollum_r', d: 'Desaparece 5 s entre el humo y corre mucho más: nadie le ve llegar.'}}},
  rohan: {nombre: 'Moha, el Halcón del Atlas', modelo: 'ap_moha', ret: 'ui/ap_r_rohan.webp', mana: 300, crecM: 30, vida: 650, dano: 62, vatq: 0.9, alcance: 2.5, vel: 5.2, crecV: 85, crecD: 4.5, arm: 32, rm: 30,
    hab: {q: {n: 'Gumía', cd: 6, mn: 35, tipo: 'dash', dist: 5.5, dano: 95, icono: 'lanza', d: 'Se lanza hacia delante con su daga curva y hiere a todos los que atraviesa.'},
      w: {n: 'Velo de arena', cd: 12, mn: 45, tipo: 'escudo', val: 170, dur: 3, icono: 'escudo', d: 'Un remolino de arena que absorbe daño durante 3 s.'},
      e: {n: 'Siroco', cd: 10, mn: 40, tipo: 'area', radio: 4, dano: 55, lento: 0.4, durL: 2, icono: 'cuerno', d: 'Levanta el viento del desierto: hiere y frena a los que le rodean.'},
      r: {n: 'Picado del halcón', cd: 45, mn: 80, tipo: 'dash', dist: 11, dano: 230, aturde: 1, icono: 'h_rohan', d: 'Se lanza como un halcón: derriba y aturde 1 s a todos a su paso.'}}},
};
'''
js = bloque(js, 'const HEROES = {', '};', HEROES)

PASIVA = '''const PASIVA = {
  gandalf: {n: 'Marca de brasas', d: 'Sus hechizos marcan al enemigo; su siguiente golpe básico contra él estalla con daño mágico extra.'},
  orco: {n: 'Disciplina', d: 'Sus golpes a héroes se acumulan (hasta 5); con 5, +40 % de daño durante 5 s.'},
  gollum: {n: 'Acecho', d: 'Desde la hierba alta, su golpe básico es un salto hasta la presa (hasta 6 m).'},
  rohan: {n: 'Ojo de halcón', d: 'El primer golpe a cada enemigo quita un 8 % de su vida actual; se repite cada 6 s por enemigo.'},
  elfo: {n: 'Balas de goma', d: 'Sus disparos frenan un 25 % durante 1,5 s.'},
  enano: {n: 'Armadura viva', d: 'Un escudo del 10 % de su vida máxima que vuelve si pasa 10 s sin recibir daño.'},
  hobbit: {n: 'Concentración', d: 'Si se queda quieto 1,5 s se vuelve invisible hasta que se mueve o ataca.'},
};
'''
js = bloque(js, 'const PASIVA = {', '};', PASIVA)
js = sub(js, "const RET = (t) => {const h = HEROES[t] || HEROES.rohan;", "const RET = (t) => {const h = HEROES[t] || HEROES.enano;")
js = sub(js, "const ROL_H = {rohan: 'Luchador', enano: 'Tanque', elfo: 'Tirador', hobbit: 'Asesino', gandalf: 'Mago', orco: 'Luchador', gollum: 'Asesino'};",
         "const ROL_H = {rohan: 'Asesino', enano: 'Tanque', elfo: 'Tirador', hobbit: 'Tirador', gandalf: 'Mago', orco: 'Luchador', gollum: 'Asesino'};")
# sin las piezas de Tolkien (yelmos de Rohan, barba de enano…)
js = sub(js, "const VADO = ['vado_arboles',", "const VADO = ['ap_brask', 'ap_vael', 'ap_grub', 'ap_ata', 'ap_birdie', 'ap_fu', 'ap_moha', 'vado_arboles',")
js = sub(js, 'o = montar(HEROES[v.tipo].modelo, 2.05);', 'o = montar(HEROES[v.tipo].modelo, (HEROES[v.tipo].alto || 2.05) * ESC_H);')
js = sub(js, "o.aro = aro(v.eq === MI_EQ ? '#6fc8ff' : '#ff5a4a', 0.95);", "o.aro = aro(v.eq === MI_EQ ? '#6fc8ff' : '#ff5a4a', 0.95 * ESC_H);")
js = sub(js, "const altoB = v.k === 'h' ? 2.6 :", "const altoB = v.k === 'h' ? (HEROES[v.tipo].alto || 2.05) * ESC_H + 0.55 :")
js = sub(js, 'const ZOOMS = [[24, 14], [31, 18], [40, 23]];', 'const ESC_H = 1.28; const ZOOMS = [[17, 14], [21, 17], [27, 21.5]];')
js = bloque(js, 'const VESTIR = {', '};', 'const VESTIR = {};\n')
# retratos grandes de La Autopista
n = js.count('ui/splash_'); assert n >= 6, n
js = js.replace('ui/splash_', 'ui/ap_splash_')
js = sub(js, 'tipo = j ? j.heroe : Object.keys(HEROES)[(s * 5 + 1) % 6]', 'tipo = j ? j.heroe : Object.keys(HEROES)[(s * 5 + 1) % 7]')

# ---------- objetos: mismos números, nombres sin Tolkien ----------
for v, n in [("'Daga de Bree'", "'Daga ligera'"), ("'Cota de anillas'", "'Chaleco reforzado'"), ("'Yelmo de hierro'", "'Casco'"),
             ("'Manto de Lórien'", "'Capa aislante'"), ("'Tomo de Rivendel'", "'Libro arcano'"), ("'Botas de cuero'", "'Zapatillas'"),
             ("'Amuleto de Lórien'", "'Amuleto'"), ("t: 'Herugrim'", "t: 'Espada del campeón'"), ("t: 'Guthwinë'", "t: 'Hojas gemelas'"),
             ("'Escudo de la Marca'", "'Escudo antidisturbios'"), ("'Capa élfica'", "'Capa del viento'"), ("'Hacha de El Sagrario'", "'Hacha vampírica'"),
             ("'Báculo de los Istari'", "'Báculo arcano'"), ("'Narya, el Anillo de Fuego'", "'Anillo de fuego'"), ("'Velo de Galadriel'", "'Velo de plata'"),
             ("t: 'Cota de mithril'", "t: 'Armadura de titanio'")]:
    js = sub(js, v, n)
js = js.replace('Armería', 'Taller').replace('a tu campamento', 'a tu peaje'); html = html.replace('Armería', 'Taller')
for k in ['estasis', 'gargola', 'azogue', 'medallon']:
    js = sub(js, "i: 'ui/enc_" + k + ".webp'", "i: 'ui/ap_enc_" + k + ".webp'")
js = sub(js, '<img src="ui/tab_\' + k + \'.webp"', '<img src="ui/ap_tab_\' + k + \'.webp"')

# ---------- equipos: azul y rojo ----------
js = sub(js, "(eq === 0 ? 'Rohan' : 'Isengard')", "(eq === 0 ? 'El equipo azul' : 'El equipo rojo')", 0)
js = sub(js, "'¡Leyenda de la Marca!'", "'¡Leyenda de la autopista!'", 0)
js = sub(js, "d.eq === 0 ? 'Torre de Rohan destruida' : 'Torre de Isengard destruida'", "d.eq === 0 ? 'Torre de los azules destruida' : 'Torre de los rojos destruida'")
js = sub(js, "(d.eq ? '¡Isengard' : '¡Rohan')", "(d.eq ? '¡El equipo rojo' : '¡El equipo azul')")
js = sub(js, "'¡Furia de Mordor!'", "'¡Disciplina!'")
js = sub(js, "(t.eq ? 'Isengard' : 'Rohan')", "(t.eq ? 'los rojos' : 'los azules')")
js = sub(js, "(eq ? 'Isengard' : 'Rohan') + ' se rinde'", "(eq ? 'El equipo rojo' : 'El equipo azul') + ' se rinde'")
js = sub(js, '<div class="vsLado az"><i>Rohan</i>', '<div class="vsLado az"><i>Azules</i>')
js = sub(js, '<div class="vsLado ro"><i>Isengard</i>', '<div class="vsLado ro"><i>Rojos</i>')
js = sub(js, 'Camina hacia la derecha: allí está Isengard.', 'Camina hacia la derecha: allí está el equipo rojo.')
js = sub(js, 'por último el estandarte de Isengard. ¡Por Rohan!', 'por último su estandarte. ¡A por ellos!')

# ---------- zonas ----------
js = sub(js, "['Campamento de los Rohirrim', 'tu base'] : ['Campamento de los Rohirrim', 'base enemiga']", "['Peaje Azul', 'tu base'] : ['Peaje Azul', 'base enemiga']")
js = sub(js, "['Anillo de Isengard', 'tu base'] : ['Anillo de Isengard', 'base enemiga']", "['Peaje Rojo', 'tu base'] : ['Peaje Rojo', 'base enemiga']")
js = sub(js, "['El Desfiladero', 'tierra de nadie']", "['Kilómetro cero', 'tierra de nadie']")
js = sub(js, "['Desfiladero del Abismo de Helm', 'lado de Rohan'] : ['Camino de Isengard', 'lado de Saruman']", "['Carril azul', 'sentido norte'] : ['Carril rojo', 'sentido sur']")

js = sub(js, '¿Salir de La Brecha?', '¿Salir de A-6?')
js = sub(js, "'Bienvenido a La Brecha'", "'Bienvenido a A-6'")
js = sub(js, 'placeholder="Tu nombre en La Brecha"', 'placeholder="Tu nombre en A-6"')
js = sub(js, "return n || 'Hobbit' + Math.floor(", "return n || 'Jugador' + Math.floor(")

# ---------- suelo: el camino es asfalto y la hierba, la cuneta seca ----------
js = sub(js, 'vec3 arena=ba*vec3(1.35,1.18,.92);', 'vec3 arena=vec3(dot(ba,vec3(.33)))*vec3(.62,.63,.68);')
js = sub(js, 'vec3 musgo=hi*mix(vec3(1.55,2.15,.95),vec3(1.95,2.3,.85),smoothstep(.35,.7,mh))*(.85+.3*fbm(w*.6+3.));',
         'vec3 musgo=hi*mix(vec3(1.6,1.75,.85),vec3(1.95,1.85,.8),smoothstep(.35,.7,mh))*(.85+.3*fbm(w*.6+3.));')

# ---------- en línea: salas aparte (prefijo X); con «Servidor» la partida la calcula Cloudflare con sim_ap.js (17/11) ----------
js = sub(js, "base + '/api/sala/' + codigo", "base + '/api/sala/X' + codigo")
# preferencias propias (el nombre se comparte con La Brecha y La Otra Comunidad)
js = js.replace("'vado.nombre'", "'@@NOMBRE@@'").replace("'vado.", "'auto.").replace("'@@NOMBRE@@'", "'vado.nombre'")

# ---------- página ----------
html = sub(html, "l.href='ui/splash_'+hv", "l.href='ui/ap_splash_'+hv", donde='html')
html = sub(html, '<img src="ui/splash_rohan.webp" alt="" class="mTi2">', '<img src="ui/ap_splash_rohan.webp" alt="" class="mTi2">', donde='html')
html = sub(html, '<title>La Brecha</title>', '<title>A-6</title><link rel="icon" href="ui/ap_icono.png"><link rel="apple-touch-icon" href="ui/ap_icono_180.png"><meta property="og:title" content="A-6"><meta property="og:description" content="Duelos 1 contra 1 en la autopista. ¡Entra y juega!"><meta property="og:image" content="https://la-otra-comunidad.benbarek1903.workers.dev/batalla/ui/ap_compartir.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:url" content="https://la-otra-comunidad.benbarek1903.workers.dev/batalla/autopista.html"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><meta name="apple-mobile-web-app-title" content="A-6"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">', donde='html')
# ---------- arte propio de La Autopista (packs 4, 5 y 6; se hace con tools/autopista/procesa_arte.py) ----------
for n, ap in [('menu_cielo',)*2, ('menu_fondo',)*2, ('menu_medio',)*2, ('menu_frente',)*2, ('menu_niebla',)*2, ('menu_pavesas',)*2,
              ('fondo_vs',)*2, ('carga',)*2, ('fondo_menu',)*2, ('fondo_armeria',)*2, ('carta_duelo',)*2,
              ('m_jugar',)*2, ('m_jugar_on',)*2, ('m_secundario',)*2, ('m_secundario_on',)*2, ('m_campo',)*2, ('m_redondo',)*2,
              ('m_marco_modo',)*2, ('aro_hab',)*2, ('aro_hab_lista',)*2, ('marco_retrato',)*2, ('cartel_azul',)*2, ('cartel_rojo',)*2,
              ('est_victoria',)*2, ('est_derrota',)*2, ('btn_jugar', 'm_jugar'), ('btn_jugar_on', 'm_jugar_on'), ('btn_sec', 'm_secundario'),
              ('btn_redondo', 'm_redondo')]:
    v, nv = 'ui/' + n + '.webp', 'ui/ap_' + ap + '.webp'
    c = js.count(v) + html.count(v)
    if c == 0: fallos.append('[arte] ' + v + ' ya no aparece')
    js, html = js.replace(v, nv), html.replace(v, nv)
# ---------- Pack 13 (17/11): HUD de partida sin aire medieval (tools/autopista/procesa_pack13.py) ----------
for n, ap in [('vida_marco',)*2, ('mana_vacia',)*2, ('mana_llena',)*2, ('hz_destello',)*2, ('hz_curar',)*2, ('hz_castigo',)*2,
              ('b_ataque',)*2, ('b_armeria',)*2, ('b_zoom',)*2, ('b_volver',)*2, ('almenara', 'baliza'), ('almenara_off', 'baliza_off')]:
    v, nv = 'ui/' + n + '.webp', 'ui/ap_' + ap + '.webp'
    if js.count(v) + html.count(v) == 0: fallos.append('[pack13] ' + v + ' ya no aparece')
    js, html = js.replace(v, nv), html.replace(v, nv)
html = sub(html, '<button class="hb ap" id="bAtT" aria-label="Atacar torre"><img src="../abismo/iconos/torre.webp" alt="">', '<button class="hb ap" id="bAtT" aria-label="Atacar torre"><img src="ui/ap_b_torre.webp" alt="">', donde='html')
html = sub(html, '<button class="hb ap" id="bAtS" aria-label="Atacar súbditos"><img src="../abismo/iconos/uruk_acorazado.webp" alt="">', '<button class="hb ap" id="bAtS" aria-label="Atacar súbditos"><img src="ui/ap_b_subditos.webp" alt="">', donde='html')
# batería de energía: el líquido (solo la parte fucsia) va del 15,3 % al 88,5 % de la altura; el dibujo es el doble de alto que de ancho
js = sub(js, 'const HAY_BOTELLA = true, BOT_Y0 = 39.7, BOT_Y1 = 87;', 'const HAY_BOTELLA = true, BOT_Y0 = 17.9, BOT_Y1 = 84.5;')  # Pack 23: hueco medido con procesa_pack23.py
html = sub(html, '#vital .vBot{position:relative;width:51px;height:68px', '#vital .vBot{position:relative;width:40px;height:80px', donde='html')
html = sub(html, '#vital .vV{position:relative;width:calc(min(250px,28 * var(--vw)));aspect-ratio:4.88', '#vital .vV{position:relative;width:calc(min(250px,28 * var(--vw)));aspect-ratio:3', donde='html')
html = sub(html, '#vital .vH{position:absolute;left:13.6%;right:13.7%;top:33.5%;bottom:33.5%', '#vital .vH{position:absolute;left:15.1%;right:15.1%;top:38.5%;bottom:37.7%', donde='html')
# botiquín en vez de la reliquia: 64 fotogramas a 60 por segundo (antes 16 a 8: iba a saltos), giro del aro más tranquilo
# y una sombra en el suelo para que parezca un objeto que flota encima y no una pegatina
js = sub(js, "const tx = cargaTex('../batalla/ui/reliquia.webp'); tx.repeat.set(0.25, 0.25);",
         "const tx = cargaTex('../batalla/ui/ap_botiquin.webp'); tx.repeat.set(0.125, 0.125); tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false; RELIQ_MAT = new THREE.SpriteMaterial({map: tx, transparent: true, depthWrite: false, depthTest: false}); if (0)")
js = sub(js, "sp.scale.setScalar(3); scene.add(sp); const a = aro('#5aff6a', 1.2); a.material.opacity = 0.35; scene.add(a);",
         "sp.scale.setScalar(3.4); sp.renderOrder = 4; scene.add(sp); const a = aro('#5aff6a', 1.2); a.material.opacity = 0.3; scene.add(a); "
         "const so = new THREE.Mesh(new THREE.CircleGeometry(0.7, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: 0, transparent: true, opacity: 0.35, depthWrite: false})); so.position.y = -0.03; a.add(so);")
js = sub(js, "const f = Math.floor(t * 8) % 16; o.tx.offset.set((f % 4) / 4, 1 - (Math.floor(f / 4) + 1) / 4); o.sp.position.set(o.r.x, 1.05, o.r.z); o.aro.position.set(o.r.x, 0.06, o.r.z); o.aro.rotation.y = t;",
         "const f = Math.floor(t * 60) % 64; o.tx.offset.set((f % 8) / 8, 1 - (Math.floor(f / 8) + 1) / 8); o.sp.position.set(o.r.x, 1.5, o.r.z); o.aro.position.set(o.r.x, 0.06, o.r.z); o.aro.rotation.y = t * 0.4;")
# ---------- LA TIENDA (17/11): objetos de autopista, mismas estadísticas y recetas que La Brecha ----------
NOMBRES_OBJ = {'hoja': ('Barra de hierro', None), 'daga': ('Navaja automática', None), 'cota': ('Chaleco reflectante', None),
    'yelmo': ('Casco de obra', None), 'manto': ('Mono ignífugo', None), 'tomo': ('Batería de litio', None), 'botas': ('Zapatillas de correr', None),
    'amuleto': ('Termo de café', None), 'herugrim': ('Bate de acero', None), 'guthwine': ('Machetes gemelos', None),
    'escudo': ('Escudo antidisturbios', None), 'capa': ('Patinete eléctrico', None), 'hacha': ('Motosierra', 'Robo de vida del 12 %.'),
    'baculo': ('Bobina de alta tensión', None), 'narya': ('Generador portátil', None), 'velo': ('Traje aislante', None),
    'mithril': ('Armadura de kevlar', 'Ligera y casi irrompible: protege de golpes y de la magia.')}
i0 = js.index('const OBJ = {'); i1 = js.index('\n};', i0)
cuerpo = js[i0:i1]
for k, (n, p_) in NOMBRES_OBJ.items():
    cuerpo, c = re.subn(r"(\n  " + k + r": \{t: ')[^']*'", lambda m: m.group(1) + n + "'", cuerpo)
    if c != 1: fallos.append('[tienda] ' + k)
    cuerpo, c = re.subn(r"(\n  " + k + r": \{[^\n]*?i: ')[^']*'", lambda m: m.group(1) + 'ui/ap_obj_' + k + ".webp'", cuerpo)
    if c != 1: fallos.append('[tienda icono] ' + k)
    if p_: cuerpo = re.sub(r"(\n  " + k + r": \{[^\n]*p: ')[^']*'", lambda m: m.group(1) + p_ + "'", cuerpo)
js = js[:i0] + cuerpo + js[i1:]
for v, n in [("estasis: {t: 'Estasis'", "estasis: {t: 'Airbag'"), ("gargola: {t: 'Gárgola'", "gargola: {t: 'Jaula antivuelco'"),
             ("azogue: {t: 'Azogue'", "azogue: {t: 'Nitro'"), ("medallon: {t: 'Medallón'", "medallon: {t: 'Bengala de emergencia'")]:
    js = sub(js, v, n)
# ---------- FUERA EL AIRE MEDIEVAL (17/11): letra moderna y gruesa, paneles asfalto/acero en vez de cuero/pergamino ----------
html = re.sub(r"@font-face\{font-family:'(Cinzel|Alegreya Sans)'[^}]*\}", '', html)
for v, n in [("'Cinzel',Georgia,serif", "'Arial Black','Segoe UI Black',system-ui,sans-serif"), ("'Cinzel'", "'Arial Black',system-ui"),
             ("'Alegreya Sans',system-ui,sans-serif", "system-ui,'Segoe UI',Roboto,sans-serif"), ("'Alegreya Sans'", "system-ui,'Segoe UI',Roboto")]:
    html, js = html.replace(v, n), js.replace(v, n)
COLORES = {'1d140c': '141b26', '0c0806': '0a0e14', '0b0705': '090c12', '1a0f07': '111824', '6b5236': '3c4a5e', '8a6a3a': '5a6b82',
           'd9c49a': 'c8d4e3', 'f2e3c0': 'eef3f9', 'b8a27a': '93a3b8', 'd9c79c': 'c8d4e3', 'c99a3a': 'e0a91c', '2a1d10': '1b2433', '3a2a18': '28344a',
           '2b1d10': '1b2433', '120c07': '0c1119', '24180c': '172030', '4a3520': '34425a', 'e8d5a8': 'dfe8f2', 'a8875a': '7d8ea6'}
for a, b in COLORES.items():
    html = re.sub('#' + a, '#' + b, html, flags=re.I); js = re.sub('#' + a, '#' + b, js, flags=re.I)
def enfria(m):
    h = m.group(1); r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    if r > g > b and max(r, g, b) < 130 and r - b > 8:   # marrones oscuros (cuero, madera) → el mismo tono en azul asfalto
        return '#%02x%02x%02x' % (b, g, r)
    return m.group(0)
html = re.sub(r'#([0-9a-fA-F]{6})(?![0-9a-fA-F]{3}\b)', enfria, html); js = re.sub(r"(?<=[\'\"( ,:])#([0-9a-fA-F]{6})", enfria, js)
html = re.sub(r"Cinzel,(Georgia,)?serif", "'Arial Black',system-ui,sans-serif", html)
html = html.replace('url(../abismo/ui/boton2.webp) 72 64 fill', 'url(ui/ap_m_secundario.webp) 90 120 fill').replace('url(../abismo/ui/boton.webp);border-image-slice:92 100', 'url(ui/ap_m_jugar.webp);border-image-slice:90 120')
html = html.replace('url(../abismo/ui/boton.webp) 92 100 fill', 'url(ui/ap_m_secundario.webp) 90 120 fill').replace('url(../abismo/ui/boton2.webp) 92 100 fill', 'url(ui/ap_m_jugar.webp) 90 120 fill')
js = sub(js, 'const HAY_PALANTIR = true;', 'const HAY_PALANTIR = false;')
# ---------- EL MAPA DE AUTOPISTA (17/11): suelo de asfalto/arcén/hormigón (Pack 11) y piezas de Kenney (Pack 2) ----------
js = sub(js, "const VADO = ['ap_brask',", "const VADO = ['ap_farola', 'ap_quitamiedos', 'ap_coche_1', 'ap_coche_2', 'ap_coche_3', 'ap_camion', 'ap_cono', 'ap_senal', 'ap_valla', 'ap_brask',")
js = sub(js, "const tH = cargaTex('texturas/campo.webp', true), tB = cargaTex('texturas/barro.webp', true);",
         "const tH = cargaTex('texturas/campo.webp', true), tB = cargaTex('../batalla/texturas/ap_asfalto.webp', true), tC = cargaTex('../batalla/texturas/ap_hormigon.webp', true);")
js = sub(js, "const bakeU = {tH: {value: tH}, tB: {value: tB},", "const bakeU = {tH: {value: tH}, tB: {value: tB}, tC: {value: tC},")
js = sub(js, "uniform sampler2D tH,tB; uniform vec2 uA[7];", "uniform sampler2D tH,tB,tC; uniform vec2 uA[7];")
js = sub(js, "const listoTex = () => [tH, tB].every(", "const listoTex = () => [tH, tB, tC].every(")
i0 = js.index('      float mh=fbm(w*.09+9.);'); i1 = js.index('      col=mix(col,losa,base*.95);') + len('      col=mix(col,losa,base*.95);')
js = js[:i0] + """      /* LA AUTOPISTA: arcén de tierra seca, calzada de asfalto con sus líneas y plaza de hormigón en cada base */
      vec3 arc=mix(texture2D(tH,w*.085).rgb,texture2D(tH,rw*.043+.31).rgb,smoothstep(.35,.65,fbm(w*.07+4.)))*vec3(.82,.95,.72);
      vec3 hor0=texture2D(tC,w*.13).rgb*.8;
      vec3 asf=mix(texture2D(tB,w*.075).rgb,texture2D(tB,rw*.037+.5).rgb,.4)*1.12;
      float ax=abs(w.x), road=1.-smoothstep(6.75,7.25,ax+fbm(w*.6)*.35);
      float tablero=1.-smoothstep(10.95,11.05,ax);                            /* el tablero del puente: arcén asfaltado hasta el pretil */
      vec3 col=mix(arc,asf*.8,tablero); col=mix(col,asf,road); col=mix(col,hor0*.95,smoothstep(10.5,10.65,ax)*tablero);
      float rayaB=(1.-smoothstep(.07,.13,abs(ax-6.35)));                       /* línea continua del borde */
      float raya=(1.-smoothstep(.06,.11,abs(ax-3.2)))*step(.45,fract(w.y/7.)); /* discontinuas entre carriles */
      float rayaC=(1.-smoothstep(.05,.09,abs(ax-.16)));                       /* doble línea amarilla del centro */
      float gast=.55+.45*smoothstep(.25,.6,fbm(w*1.3));
      col=mix(col,vec3(.86,.85,.8),max(rayaB,raya)*road*gast); col=mix(col,vec3(.9,.68,.16),rayaC*road*gast);
      vec3 hor=texture2D(tC,w*.13).rgb*.72;
      float plaza=1.-smoothstep(9.,10.5,max(abs(w.x)*.8,min(abs(w.y-uF[0].y),abs(w.y-uF[1].y))+2.));
      col=mix(col,hor,plaza);
      float hueco=1.-(1.-tablero)*(1.-step(38.,abs(w.y)));  /* sobre el barranco: fuera del tablero no hay suelo */""" + js[i1:]
js = sub(js, "float borde=smoothstep(.0,1.,max(abs(w.x)-${MAPA.ancho.toFixed(1)},abs(w.y)-57.)/3.); col*=1.-clamp(borde,0.,1.)*.75;", "")
js = sub(js, "      float isen=smoothstep(-2.,24.,dot(w,uEje)); col=mix(col,vec3(dot(col,vec3(.33)))*vec3(1.05,.95,.85),isen*.45);", "")
js = sub(js, "const tF = cargaTex('texturas/campo.webp', true); tF.repeat.set(30, 36); const mF = new THREE.MeshLambertMaterial({map: tF, color: '#9ab870'});",
         "const tF = cargaTex('../batalla/texturas/ap_arcen.webp', true); tF.repeat.set(20, 24); const mF = new THREE.MeshLambertMaterial({map: tF, color: '#ead8c8'});")
js = sub(js, "diffuseColor.rgb*=clamp(.55+dot(dt,vec3(.3,.6,.1))*9.,.75,1.25);", "diffuseColor.rgb*=clamp(.7+dot(dt,vec3(.3,.6,.1))*.6,.9,1.1);")
# niebla de día y clara (la de La Brecha era verde oscura y a 24 m de bajada el barranco salía casi negro)
js = sub(js, "scene.background = new THREE.Color('#14201a'); scene.fog = new THREE.Fog('#14201a', 50, 115);", "scene.background = new THREE.Color('#9fc3dc'); scene.fog = new THREE.Fog('#9fc3dc', 60, 170);")
# ---------- HUD DE PARTIDA (17/11, Arturo): minimapa arriba del todo y con niebla, marcador nuevo, batería junto al retrato, R más arriba, aros de color ----------
# marcador: [azul] reloj [rojo] en una sola fila
js = sub(js, """$('marcador').innerHTML = '<span class="a">' + m[MI_EQ] + '</span> · <span class="b">' + m[1 - MI_EQ] + '</span><div style="font-size:11px;color:#c8d4e3">' + Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') + '</div>';""",
         """$('marcador').innerHTML = '<span class="a">' + m[MI_EQ] + '</span><i>' + Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') + '</i><span class="b">' + m[1 - MI_EQ] + '</span>';""")
# niebla en el minimapa: solo se ve lo que ven tu héroe, tus soldados, tus torres y tus balizas (como en el LoL)
js = sub(js, "function minimapa() {", """const NIEBLA_MM = document.createElement('canvas'); NIEBLA_MM.width = 96; NIEBLA_MM.height = 196; let VIS_MM = [], NIEBLA_F = '', NIEBLA_T = 0;
function vistoMm(q) {const x = q.xi ?? q.x, z = q.zi ?? q.z; return VIS_MM.some((v) => (x - v[0]) ** 2 + (z - v[1]) ** 2 < v[2] * v[2]);}
function minimapa() {""")
js = sub(js, "  for (const q of VISTA.values()) {\n    if (q.k === 'j') continue;",
         """  VIS_MM = [];
  for (const q of VISTA.values()) if (q.eq === MI_EQ && !(q.vida <= 0)) {if (q.k === 'h' && q.muerto < 0) VIS_MM.push([q.xi ?? q.x, q.zi ?? q.z, 13]); else if (q.k === 's' && q.muerto !== 0) VIS_MM.push([q.xi ?? q.x, q.zi ?? q.z, 8]); else if (q.k === 't' || q.k === 'n') VIS_MM.push([q.x, q.z, 13]);}
  for (const a of EXTRA.al || []) if (a[2] === MI_EQ) VIS_MM.push([a[0], a[1], 10]);
  {const n = NIEBLA_MM.getContext('2d'); n.globalCompositeOperation = 'source-over'; n.clearRect(0, 0, W, H); n.fillStyle = '#05080cb8'; n.fillRect(0, 0, W, H); n.globalCompositeOperation = 'destination-out';
   for (const v of VIS_MM) {n.beginPath(); n.ellipse(px(v[0]), pz(v[1]), v[2] / KX * W / 2, v[2] / 59 * H / 2, 0, 0, 7); n.fill();} g.drawImage(NIEBLA_MM, 0, 0);}
  for (const q of VISTA.values()) {
    if (q.k === 'j') continue;""")
js = sub(js, "else if (q.k === 's') {if (q.muerto === 0) continue;", "else if (q.k === 's') {if (q.muerto === 0 || (q.eq !== MI_EQ && !vistoMm(q))) continue;")
js = sub(js, "else if (q.k === 'h') {if (q.muerto >= 0 || (!mio && q.escondido)) continue;", "else if (q.k === 'h') {if (q.muerto >= 0 || (!mio && (q.escondido || !vistoMm(q)))) continue;")
html = sub(html, '</head>', """<style>
/* A-6 · HUD de partida (17/11) */
#mini{top:calc(6px + var(--sat)) !important;border:2px solid #4a6a8a !important;border-radius:10px !important}
#bAjustes{top:calc(6px + var(--sat)) !important}
#hud #ping{position:fixed;right:calc(162px + var(--sar));top:calc(56px + var(--sat));padding:2px 6px;font-size:10px !important}
#marcador{position:fixed;left:50%;top:calc(6px + var(--sat));transform:translateX(-50%);display:flex;align-items:stretch;gap:0;padding:0 !important;border:0 !important;background:none !important;filter:drop-shadow(0 3px 5px #000a)}
#marcador .a,#marcador .b{min-width:38px;padding:2px 10px;font:italic 900 22px 'Arial Black',system-ui,sans-serif;color:#fff;text-shadow:0 2px 0 #0008;display:flex;align-items:center;justify-content:center}
#marcador .a{background:linear-gradient(#3aa0ff,#1659c7);border-radius:10px 0 0 10px;clip-path:polygon(0 0,100% 0,88% 100%,0 100%)}
#marcador .b{background:linear-gradient(#ff5a4a,#b01e1e);border-radius:0 10px 10px 0;clip-path:polygon(12% 0,100% 0,100% 100%,0 100%)}
#marcador i{font:800 13px system-ui,sans-serif;font-style:normal;color:#e8f0ff;background:#0d1622e8;padding:0 9px;display:flex;align-items:center;border-top:2px solid #ffd21f;border-bottom:2px solid #ffd21f}
#vital{left:calc(186px + var(--sal)) !important;top:calc(8px + var(--sat)) !important;bottom:auto !important;transform:none !important}
#vital .vBot{width:30px !important;height:60px !important}
#vital .vBot b{font-size:10px !important}
#bR{bottom:172px !important}#mr{bottom:188px !important}
.hb[data-k] img,.hb.hs img{inset:7% !important;width:86% !important;height:86% !important}
.hb[data-k] .cd,.hb.hs .cd{inset:7% !important}
.hb[data-k]::after,.hb.hs::after{background:none !important;inset:4% !important;border-radius:50%;border:3px solid #38c8ff;box-shadow:0 0 9px #38c8ffaa,inset 0 0 6px #38c8ff66;filter:none !important}
#bR::after{border-color:#ff8a2a !important;box-shadow:0 0 10px #ff8a2aaa,inset 0 0 6px #ff8a2a66 !important}
.hb.hs::after{border-color:#e8eef6 !important;box-shadow:0 0 6px #fff6 !important;border-width:2px !important}
.hb[data-k].pronta::after{border-color:#ffd21f !important;box-shadow:0 0 14px #ffd21fcc,inset 0 0 8px #ffd21f88 !important;inset:2% !important}
.hb[data-k]:not(.pronta)::after{opacity:.75}
</style></head>""", donde='html')
# ---------- NIEBLA EN EL MAPA (17/11, Arturo: «como en el LoL»): fuera de la vista de los tuyos el suelo se oscurece y los enemigos no se ven ----------
# la vista se calcula a la vez que el minimapa (~7 veces por segundo) y se pinta en una textura de 64x140 (1 px = 1 m): coste casi nulo
js = sub(js, "const NIEBLA_MM = document.createElement('canvas');", "const NIEBLA_SUELO = document.createElement('canvas'); NIEBLA_SUELO.width = 64; NIEBLA_SUELO.height = 140; const NIEBLA_TEX = new THREE.CanvasTexture(NIEBLA_SUELO); NIEBLA_TEX.minFilter = NIEBLA_TEX.magFilter = THREE.LinearFilter; NIEBLA_TEX.generateMipmaps = false;\nconst NIEBLA_MM = document.createElement('canvas');")
js = sub(js, " g.drawImage(NIEBLA_MM, 0, 0);}", """ g.drawImage(NIEBLA_MM, 0, 0);
   const firma = VIS_MM.map((v) => Math.round(v[0]) + ',' + Math.round(v[1])).join(';'), ahoraN = performance.now(); if (firma !== NIEBLA_F && ahoraN - NIEBLA_T > 320) {NIEBLA_F = firma; NIEBLA_T = ahoraN;
   const ns = NIEBLA_SUELO.getContext('2d'); ns.globalCompositeOperation = 'source-over'; ns.clearRect(0, 0, 64, 140); ns.fillStyle = '#000'; ns.fillRect(0, 0, 64, 140); ns.globalCompositeOperation = 'destination-out';
   for (const v of VIS_MM) {const cx = v[0] + 32, cz = v[1] + 70, gr = ns.createRadialGradient(cx, cz, v[2] * 0.72, cx, cz, v[2]); gr.addColorStop(0, '#000'); gr.addColorStop(1, '#0000'); ns.fillStyle = gr; ns.beginPath(); ns.arc(cx, cz, v[2], 0, 7); ns.fill();}
   NIEBLA_TEX.needsUpdate = true;}}""")
js = sub(js, "uniform sampler2D tH;')", "uniform sampler2D tH,tNie;')")
js = sub(js, "m.onBeforeCompile = (sh) => {sh.uniforms.tH = {value: tH};", "m.onBeforeCompile = (sh) => {sh.uniforms.tH = {value: tH}; sh.uniforms.tNie = {value: NIEBLA_TEX};")
js = sub(js, "diffuseColor.rgb*=clamp(.7+dot(dt,vec3(.3,.6,.1))*.6,.9,1.1);", "diffuseColor.rgb*=clamp(.7+dot(dt,vec3(.3,.6,.1))*.6,.9,1.1); diffuseColor.rgb*=1.-.58*texture2D(tNie,vec2((vWD.x+32.)/64.,1.-(vWD.y+70.)/140.)).a;")
# enemigos fuera de la vista: no se ven ni se pueden señalar (los héroes cuentan como «escondidos», igual que en la hierba)
js = sub(js, "escondido = v.k === 'h' && v.eq !== MI_EQ && ((v.flags & 1) || ((v.flags & 8) && !veoHierba(v)));", "escondido = v.k === 'h' && v.eq !== MI_EQ && ((v.flags & 1) || ((v.flags & 8) && !veoHierba(v)) || !vistoMm(v));")
js = sub(js, "o.raiz.visible = !escondido && !(v.k === 'h' && muerto && v.muerto > 3);", "o.raiz.visible = !escondido && !(v.k === 'h' && muerto && v.muerto > 3) && !(v.k === 's' && v.eq !== MI_EQ && !vistoMm(v));")
# vista: héroe 16 m, soldados 9 m
js = js.replace("VIS_MM.push([q.xi ?? q.x, q.zi ?? q.z, 13]); else if (q.k === 's' && q.muerto !== 0) VIS_MM.push([q.xi ?? q.x, q.zi ?? q.z, 8]);", "VIS_MM.push([q.xi ?? q.x, q.zi ?? q.z, 14]); else if (q.k === 's' && q.muerto !== 0) VIS_MM.push([q.xi ?? q.x, q.zi ?? q.z, 9]);")
# textos que aún decían «armería»
for a, b in [('La armería está en tu fuente', 'El taller está en tu base'), ('puedes comprar en la armería', 'puedes comprar en el taller'), ('compras en la armería', 'compras en el taller')]:
    if a not in js: fallos.append('[texto] ' + a)
    js = js.replace(a, b)
# ---------- PACK 19 ART (17/11): HUD estilo Supercell (tools/autopista/procesa_pack19.py) ----------
js = sub(js, "pon_($('oro'), 'textContent', '🪙 ' + v.oro);", "pon_($('oro'), 'textContent', String(v.oro));")
js = sub(js, "pon_($('yoNv'), 'textContent', 'Nv ' + v.nivel);", "pon_($('yoNv'), 'textContent', String(v.nivel));")
html = sub(html, '</head>', """<style>
/* A-6 · Pack 19: aros de habilidad (hueco del 71 %; la definitiva, 66 %) */
.hb[data-k]::after,.hb.hs::after{border:0 !important;box-shadow:none !important;border-radius:0 !important;background:url(ui/ap_aro_hab.webp) center/contain no-repeat !important;inset:-8% !important;opacity:1 !important;filter:drop-shadow(0 3px 3px #0008) !important}
.hb[data-k].pronta::after{background-image:url(ui/ap_aro_hab_lista.webp) !important}
#bR::after{background-image:url(ui/ap_aro_ulti.webp) !important;inset:-17% !important}
#bR.pronta::after{background-image:url(ui/ap_aro_ulti_lista.webp) !important}
.hb.hs::after{background-image:url(ui/ap_aro_hechizo.webp) !important}
.hb[data-k]:not(.pronta)::after{filter:saturate(.75) brightness(.9) drop-shadow(0 3px 3px #0008) !important}
.hb[data-k] img,.hb.hs img{inset:6% !important;width:88% !important;height:88% !important}
.hb[data-k] .cd,.hb.hs .cd{inset:6% !important}
.mas{background:url(ui/ap_mas.webp) center/contain no-repeat !important;border:0 !important;box-shadow:none !important;color:transparent !important;font-size:0 !important}
.pip{gap:1px !important}.pip i{width:13px !important;height:7px !important;border:0 !important;border-radius:0 !important;background:url(ui/ap_punto_off.webp) center/contain no-repeat !important}
.pip i.on{background-image:url(ui/ap_punto_on.webp) !important}
/* panel del jugador: placa con el hueco del retrato (6,6 %–27,5 % del ancho) */
#yo{width:196px;height:72px;box-sizing:border-box;background:url(ui/ap_panel_yo.webp) center/100% 100% no-repeat !important;border:0 !important;border-radius:0 !important;padding:0 10px 0 0 !important;gap:0 !important;position:relative}
#yo::before{display:none !important}
#yo img{width:44px !important;height:44px !important;margin:0 0 0 10px !important;border-radius:50%;border:0 !important}
#yo>div{margin-left:18px;line-height:1.15;font-size:11px}
#yoNv{position:absolute;left:38px;top:40px;width:26px;height:26px;background:url(ui/ap_insignia_nivel.webp) center/contain no-repeat;display:flex;align-items:center;justify-content:center;font:900 12px 'Arial Black',system-ui,sans-serif;color:#fff;-webkit-text-stroke:2px #0b1430;paint-order:stroke fill;z-index:2}
#oro{display:flex;align-items:center;gap:3px;font-weight:900}#oro::before{content:'';width:15px;height:15px;background:url(ui/ap_moneda.webp) center/contain no-repeat;flex:none}
.xp{width:92px !important;height:24px !important;box-sizing:border-box;background:url(ui/ap_barra_xp.webp) center/100% 100% no-repeat !important;border-radius:0 !important;padding:7px 14px 8px 16px;overflow:visible !important;margin:0 !important}
.xp i{border-radius:3px}
#vital{left:calc(208px + var(--sal)) !important}
#kda{color:#fff !important;text-shadow:0 1px 0 #0b1430}
#bTienda{top:calc(84px + var(--sat)) !important;width:54px !important;height:54px !important}
#bZoom{top:calc(142px + var(--sat)) !important;width:46px !important;height:46px !important}
#compraRapida{top:calc(84px + var(--sat)) !important}
/* barras de vida de los héroes: la barra ocupa el hueco y el marco va encima (azul los tuyos, rojo enemigos, dorado tú) */
.bv.h i{width:76px !important;height:9px !important;border:0 !important;border-radius:2px !important;box-shadow:none !important;background:#0b1220 !important;overflow:visible !important;z-index:0}
.bv.h i u,.bv.h i s{border-radius:2px}
.bv.h i::before{content:'';position:absolute;left:-15px;right:-13px;top:-6px;bottom:-6px;background:url(ui/ap_bv_azul.webp) center/100% 100% no-repeat;pointer-events:none;z-index:3}
.bv.h.e1 i::before{background-image:url(ui/ap_bv_rojo.webp)}
.bv.h.yo i{width:84px !important;height:10px !important}
.bv.h.yo i::before{left:-20px;right:-20px;top:-8px;bottom:-8px;background-image:url(ui/ap_bv_yo.webp)}
.bv.h b{margin-bottom:6px !important}.bv.h .mn{margin-top:6px}
</style></head>""", donde='html')
# ---------- PACK 22 ART (17/11): HUD cyberpunk (mismos nombres que el 19; tools/autopista/procesa_pack22.py). Medidas de los huecos ----------
html = sub(html, '</head>', """<style>
/* A-6 · Pack 22: aros con hueco del 76 % */
.hb[data-k]::after,.hb.hs::after,#bR::after{inset:-11% !important}
/* panel del jugador: proporción 2,64; retrato en x 1,3-32,2 % e y 9,5-91 % */
#yo{width:200px !important;height:76px !important;padding:0 10px 0 0 !important}
#yo img{width:58px !important;height:58px !important;margin:0 0 0 4px !important}
#yo>div{margin-left:10px !important}
#yoNv{left:44px !important;top:48px !important;width:28px !important;height:28px !important;color:#e8fbff !important;-webkit-text-stroke:2px #061018 !important}
.xp{width:110px !important;height:14px !important;padding:4px 7px 4px 13px !important}
.xp i{background:linear-gradient(90deg,#1fa6ff,#5ff0ff) !important;border-radius:1px}
#oro{color:#ffd35a !important}
#vital{left:calc(212px + var(--sal)) !important}
/* barras de vida: el hueco de cada marco medido */
.bv.h i{width:80px !important;height:8px !important;border-radius:1px !important}
.bv.h i::before{left:-13px;right:-12px;top:-3px;bottom:-5px}
.bv.h.e1 i::before{left:-13px;right:-14px;top:-4px;bottom:-5px}
.bv.h.yo i{width:90px !important;height:8px !important}
.bv.h.yo i::before{left:-12px;right:-15px;top:-5px;bottom:-5px}
.bv.h i u{border-radius:1px}
.bv.h b{margin-bottom:3px !important}.bv.h .mn{margin-top:4px}
</style></head>""", donde='html')
# ---------- COLOR DE CADA HÉROE EN EL HUD (17/11, Henar): aros, + y panel se tiñen con el color del héroe que llevas ----------
# las piezas del Pack 22 son cian (~190°): se giran de tono con --tinte. Las barras de vida NO (cian/rojo = tu equipo/enemigo)
_n = 0
for a in ["querySelector('img').src = 'ui/at_' + tipo + '.webp';", "querySelector('img').src = 'ui/ap_at_' + tipo + '.webp';"]:
    _n += js.count(a)
    js = js.replace(a, a + " document.body.dataset.heroe = tipo;")
if _n != 1: fallos.append('[tinte] botón de ataque')
html = sub(html, '</head>', """<style>
body{--tinte:0deg;--tsat:1;--tluz:1}
body[data-heroe=enano]{--tinte:0deg;--tsat:.55;--tluz:1.15}   /* Dalinar: luz blanca azulada */
body[data-heroe=gandalf]{--tinte:-165deg;--tsat:1.3}          /* Vael: fuego */
body[data-heroe=orco]{--tinte:-75deg;--tsat:1.2}              /* Grub: verde energía */
body[data-heroe=elfo]{--tinte:172deg;--tsat:1.5;--tluz:.95}              /* Ata: láser rojo */
body[data-heroe=hobbit]{--tinte:-100deg;--tsat:1.1}           /* Birdie: verde césped */
body[data-heroe=gollum]{--tinte:85deg;--tsat:1.2}             /* Fu: humo morado */
body[data-heroe=rohan]{--tinte:-150deg;--tsat:.9;--tluz:.95}  /* Moha: arena dorada */
.hb[data-k]::after,.hb.hs::after,.mas{filter:hue-rotate(var(--tinte)) saturate(var(--tsat)) brightness(var(--tluz)) drop-shadow(0 3px 3px #0008) !important}
.hb[data-k]:not(.pronta)::after{filter:hue-rotate(var(--tinte)) saturate(calc(var(--tsat) * .75)) brightness(calc(var(--tluz) * .9)) drop-shadow(0 3px 3px #0008) !important}
#bR::after{filter:drop-shadow(0 3px 3px #0008) !important}
#yo{background:none !important;isolation:isolate}
#yo::before{display:block !important;content:'' !important;position:absolute !important;inset:0 !important;left:0 !important;top:0 !important;width:auto !important;height:auto !important;background:url(ui/ap_panel_yo.webp) center/100% 100% no-repeat !important;z-index:-1 !important;filter:hue-rotate(var(--tinte)) saturate(var(--tsat)) brightness(var(--tluz))}
.xp i{filter:hue-rotate(var(--tinte)) saturate(var(--tsat))}
</style></head>""", donde='html')
# ---------- PACK 18 ART (17/11): marcas del suelo (tools/autopista/procesa_pack18.py las deja al mismo radio que las de La Brecha) ----------
js = sub(js, "const texAro = cargaTex('ui/aro_heroe.webp');", "const texAro = cargaTex('../batalla/ui/ap_aro_heroe.webp');")
js = sub(js, "if (!IND[n]) {const t = cargaTex('../batalla/ui/' + n + '.webp'); IND[n] = t;}", "if (!IND[n]) {const t = cargaTex('../batalla/ui/' + (IND_AP[n] || n) + '.webp'); IND[n] = t;}")
js = sub(js, "const IND = {};", "const IND = {}; const IND_AP = {ind_alcance: 'ap_alcance'};")
js = sub(js, "marcaObj = indicador('ind_alcance', '#ff4a3a');", "marcaObj = indicador('ap_objetivo', '#ff4a3a');")
js = sub(js, "aroFijo = indicador('ind_alcance', '#ffd24a');", "aroFijo = indicador('ap_objetivo', '#ffd24a');")
js = sub(js, "zona: indicador('ind_area', '#ff3a1a'),", "zona: indicador('ap_zona_torre', '#ffffff'),")
# ---------- PACK 18 A/B ART (17/11): marcas de apuntado propias (tools/autopista/procesa_pack18ab.py -> ui/ap_ind_<clave>_<k>.webp).
# Los 7 héroes completos (Grub y Ata llegaron el último). ----------
js = sub(js, "const IND_HEROE = {rohan: 'q r e alcance', enano: 'q e r alcance', elfo: 'q e r alcance', hobbit: 'q e alcance', gandalf: 'q e r alcance', orco: 'w e r alcance'};",
         "const IND_HEROE = {rohan: 'q e r alcance', enano: 'q e r alcance', hobbit: 'q e alcance', gandalf: 'q e r alcance', gollum: 'q e alcance', orco: 'q w e r alcance', elfo: 'q e r alcance'};".replace(" alcance'", " alcance basico'"))
js = sub(js, "const n = 'ind_' + tipo + '_' + k;", "const n = 'ap_ind_' + tipo + '_' + k;")
# ---------- PACKS 24 y 25 ART (17/11): proyectiles, flecha del golpe básico y efectos propios (tools/autopista/procesa_pack24_25.py) ----------
# flecha del golpe básico de cada héroe al arrastrar el ataque (antes la genérica)
js = sub(js, "const f = mira.flecha; f.visible = true; f.scale.set(alc, 1, 1.2);", "const f = marcaH(v.tipo, 'basico', 'flecha') || mira.flecha; f.visible = true; f.scale.set(alc, 1, f === mira.flecha ? 1.2 : 0.9);")
# hojas de efectos 4x4 (fondo negro = se suma la luz; humo y arena con transparencia = mezcla normal)
js = sub(js, "const fbTex = {};", """Object.assign(FB, {ap_enano_tajo: ['../batalla/fx/ap_enano_tajo.webp', 4, 4], ap_enano_estallido: ['../batalla/fx/ap_enano_estallido.webp', 4, 4], ap_gandalf_impacto: ['../batalla/fx/ap_gandalf_impacto.webp', 4, 4], ap_gandalf_ceniza: ['../batalla/fx/ap_gandalf_ceniza.webp', 4, 4],
  ap_orco_remolino: ['../batalla/fx/ap_orco_remolino.webp', 4, 4], ap_orco_tajo: ['../batalla/fx/ap_orco_tajo.webp', 4, 4], ap_elfo_fogonazo: ['../batalla/fx/ap_elfo_fogonazo.webp', 4, 4], ap_elfo_impacto: ['../batalla/fx/ap_elfo_impacto.webp', 4, 4],
  ap_hobbit_impacto: ['../batalla/fx/ap_hobbit_impacto.webp', 4, 4], ap_hobbit_hoyo: ['../batalla/fx/ap_hobbit_hoyo.webp', 4, 4], ap_gollum_humo: ['../batalla/fx/ap_gollum_humo.webp', 4, 4, 'n'], ap_gollum_tajo: ['../batalla/fx/ap_gollum_tajo.webp', 4, 4],
  ap_rohan_arena: ['../batalla/fx/ap_rohan_arena.webp', 4, 4, 'n'], ap_rohan_tajo: ['../batalla/fx/ap_rohan_tajo.webp', 4, 4]});
Object.assign(FB_DUR, {ap_enano_tajo: 0.45, ap_enano_estallido: 0.8, ap_gandalf_impacto: 0.6, ap_gandalf_ceniza: 1.5, ap_orco_remolino: 0.7, ap_orco_tajo: 0.45, ap_elfo_fogonazo: 0.22, ap_elfo_impacto: 0.4,
  ap_hobbit_impacto: 0.45, ap_hobbit_hoyo: 1.1, ap_gollum_humo: 1.1, ap_gollum_tajo: 0.45, ap_rohan_arena: 1, ap_rohan_tajo: 0.45});
const fbTex = {};""")
# lo heredado de La Brecha que tapa los efectos propios (17/11): la Furia de Durin (fuego y grietas) en la definitiva de Brask,
# la explosión naranja en las áreas de Grub y Moha, y el fuego de la Carga de los Rohirrim en el picado de Moha
js = sub(js, "flip('ondaC', x, z, H.radio * 2.6, true); flip('polvoA', x, z, H.radio * 2.2, true); flip('explosion', x, z, H.radio * 1.2);\n    if (k === 'r') {/* Furia de Durin",
         "flip('ondaC', x, z, H.radio * 2.6, true); flip('polvoA', x, z, H.radio * 2.2, true);\n    if (k === 'r' && v.tipo !== 'enano') {/* Furia de Durin")
js = sub(js, "fx: k === 'r' ? 'fuego' : 'polvo', tam: k === 'r' ? 2.4 : 1.5}", "fx: k === 'r' ? 'ap_rohan_arena' : 'polvo', tam: k === 'r' ? 2.4 : 1.5}")
js = sub(js, "else if (k !== 'r') flip('tArco', x + dx * H.dist * 0.5", "else if (k !== 'r' && v.tipo !== 'rohan') flip('tArco', x + dx * H.dist * 0.5")
js = sub(js, "flip('tArco', x + dx * f, z + dz * f, 5.5, true, rs + (i % 2 ? 0 : Math.PI)); flip('fuego', x + dx * f + rnd(-1, 1), z + dz * f + rnd(-1, 1), 2.2);",
         "flip('ap_rohan_tajo', x + dx * f, z + dz * f, 4.6, true, rs + (i % 2 ? 0 : Math.PI)); flip('ap_rohan_arena', x + dx * f + rnd(-1, 1), z + dz * f + rnd(-1, 1), 2.4, true);")
# VOZ DEL ANUNCIADOR DE A-6 (17/11, ElevenLabs, original en tools/autopista/voz/anunciador_a6.mp3, cortada por silencios en voces_ap/): sin las frases del Uruk
js = sub(js, "'voces/' + n", "'voces_ap/' + n", n=2)
js = sub(js, "'uruk_despierta', 'uruk_muerto', ", "")
# SONIDOS DE A-6 (17/11, Kenney CC0 desde GitHub, tools/autopista/hace_sonidos.py -> public/batalla/sonidos_ap/fx con los mismos nombres)
js = sub(js, "'../abismo/sonidos/fx/'", "'../batalla/sonidos_ap/fx/'", n=2)
js = sub(js, "const SON_LISTA = {", "const SON_LISTA = {ap_llama: 'ap_llama', ap_energia: 'ap_energia', ap_luz: 'ap_luz', ap_fusil: 'ap_fusil', ap_golf: 'ap_golf', ap_arena: 'ap_arena', ")
# sonidos bajados a mano (tools/autopista/hace_sonidos2.py): el golpe básico de Ata suena a fusil y el de Birdie a palo de golf;
# música de acción (menú y partida) y ambiente de tráfico en el puente. Victoria y derrota siguen siendo las de La Brecha.
js = sub(js, "} else suena('arco', 0.25);", "} else suena({bala: 'ap_fusil', bola: 'ap_golf'}[e[1]] || 'arco', {bala: 0.35, bola: 0.45}[e[1]] || 0.25);")
js = sub(js, "t: 0}); suena('arco', 0.5);}", "t: 0}); suena({bala: 'ap_fusil', bola: 'ap_golf'}[e[1]] || 'arco', 0.5);}")
js = sub(js, "menu: ['mus/tregua_tensa.mp3', 0.5], batalla: ['mus/batalla_epica.mp3', 0.38], amb: ['amb/batalla_lejana.mp3', 0.16]",
         "menu: ['../../batalla/sonidos_ap/mus/accion.mp3', 0.32], batalla: ['../../batalla/sonidos_ap/mus/accion.mp3', 0.38], amb: ['../../batalla/sonidos_ap/amb/trafico.mp3', 0.3]")
# cada proyectil recuerda qué es y al llegar suelta su golpe propio
js = sub(js, "const pr = {tipo: 'proy', o, x: e[2],", "const pr = {tipo: 'proy', k: e[1], o, x: e[2],")
js = sub(js, "suena('explosion', 0.45, p.x, p.z);} scene.remove(p.o); FXP.splice(i, 1); continue;}", "suena('explosion', 0.45, p.x, p.z);} if (IMPACTO_AP[p.k]) flip(IMPACTO_AP[p.k], p.x, p.z, 1.1, false, undefined, p.y); scene.remove(p.o); FXP.splice(i, 1); continue;}")
js = sub(js, "FXP.push({tipo: 'tiro', o, x: e[2],", "FXP.push({tipo: 'tiro', k: e[1], o, x: e[2],")
js = sub(js, "p.o.position.set(p.x + (p.tx - p.x) * k, 1.2, p.z + (p.tz - p.z) * k); if (k >= 1) {scene.remove(p.o); FXP.splice(i, 1);}}", "p.o.position.set(p.x + (p.tx - p.x) * k, 1.2, p.z + (p.tz - p.z) * k); if (k >= 1) {if (IMPACTO_AP[p.k]) flip(IMPACTO_AP[p.k], p.tx, p.tz, 1.5); scene.remove(p.o); FXP.splice(i, 1);}}")
# ---------- PACK 23 ART (17/11): botones redondos, baliza, marco del minimapa, marcador, cartel y batería (tools/autopista/procesa_pack23.py) ----------
# b_volver, b_zoom, b_armeria, b_torre, b_subditos, baliza y baliza_off ya se cambian arriba (Pack 13): el script deja los nuevos con el mismo nombre
html = sub(html, '<canvas id="mini" class="hidden" width="96" height="196"></canvas>', '<canvas id="mini" class="hidden" width="96" height="196"></canvas><div id="miniMarco"></div>', donde='html')
html = sub(html, '</head>', """<style>
/* A-6 · Pack 23: marco del minimapa (hueco x 7-93 %, y 13,5-87,3 %), el lienzo va justo en el hueco */
#miniMarco{position:fixed;right:calc(8px + var(--sar));top:calc(6px + var(--sat));width:181px;height:92px;background:url(ui/ap_marco_minimapa.webp) center/100% 100% no-repeat;z-index:7;pointer-events:none;filter:drop-shadow(0 3px 5px #000a)}
#mini.hidden + #miniMarco{display:none}
#mini{right:calc(20.7px + var(--sar)) !important;top:calc(18.4px + var(--sat)) !important;width:156px !important;height:68px !important;border:0 !important;border-radius:2px !important;box-shadow:none !important;opacity:.95 !important}
#bAjustes{right:calc(196px + var(--sar)) !important}
#hud #ping{right:calc(12px + var(--sar)) !important;top:calc(100px + var(--sat)) !important}
/* ajustes con el engranaje del pack (en el menú y en la partida) */
#bAjustes,#bSon{background:url(ui/ap_b_ajustes.webp) center/100% 100% no-repeat !important;font-size:0 !important;color:transparent !important;text-shadow:none !important;border:0 !important;width:46px !important;height:46px !important}
/* marcador: placa con tres huecos (azul 11,7-34,2 %, reloj 37,9-62 %, rojo 65,8-88,2 %; alto 24-69 %) */
#marcador{width:262px !important;height:36px !important;display:block !important;background:url(ui/ap_marcador.webp) center/100% 100% no-repeat !important}
#marcador .a,#marcador .b,#marcador i{position:absolute;top:24%;height:45%;padding:0 !important;min-width:0 !important;background:none !important;clip-path:none !important;border:0 !important;border-radius:0 !important;display:flex;align-items:center;justify-content:center;line-height:1}
#marcador .a{left:11.7%;width:22.5%;font-size:16px !important;color:#bfe9ff !important;text-shadow:0 0 6px #2fb8ff !important}
#marcador .b{left:65.8%;width:22.4%;font-size:16px !important;color:#ffc9c2 !important;text-shadow:0 0 6px #ff3a2a !important}
#marcador i{left:37.9%;width:24.1%;font-size:12px !important;color:#ffe9a0 !important}
/* objetivo sobre la placa fina (se estira por el centro, las puntas no) */
#objetivo{top:calc(46px + var(--sat)) !important;background:none !important;border:solid transparent;border-width:6px 26px;border-image:url(ui/ap_cartel.webp) 18 64 fill / 6px 26px stretch;border-radius:0 !important;padding:1px 4px !important;color:#cfeeff !important;text-shadow:0 1px 2px #000}
/* el Taller con su fondo de garaje a la vista: velo más fino y paneles translúcidos */
#tienda{background:linear-gradient(#050a1222,#050a1288),url(ui/ap_fondo_armeria.webp) center/cover !important}
#tienda .tDet{background:linear-gradient(#0c1724c8,#050a12dd) !important}
#tienda .tRuta{background:linear-gradient(90deg,#0c1724cc,#0c172455) !important}
#tienda .tI{background:radial-gradient(#101c2ae6,#0a0e14d0) !important}
#tienda .tCats button{background:#050a12b0 !important}
</style></head>""", donde='html')

# ---------- EFECTOS DE CADA HABILIDAD (17/11, Henar: «el cubo de bolas no saca nada; que todas las habilidades y el básico tengan animación») ----------
# Proyectiles propios (bola de golf, brasa, energía, bala, cadena): PROVISIONALES con esferas, como la «luz» de La Brecha, hasta el Pack 24 ART.
# Se clonan compartiendo geometría y material: no suben nada nuevo a la GPU (sin tirones).
js = sub(js, "function modeloProy(n) {", """/* A-6 (Pack 24 ART, 17/11): proyectiles dibujados vistos desde arriba (ui/ap_pr_*.webp, apuntan a +X con la estela detrás).
   Un plano tumbado y girado para que el dibujo mire a +Z, que es hacia donde se orientan los proyectiles (rotation.y = atan2(dx, dz)).
   [archivo, tamaño en metros] */
const PROY_AP = {bola: ['bola', 1.9], brasa: ['brasa', 2.4], energia: ['energia', 2.3], bala: ['bala', 2.2], cadena: ['hoz', 2.2]};  /* 17/11: más grandes y por encima de todo (antes los tapaban los personajes) */
const PROY_AP_G = {}, GEO_PROY = (() => {const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); g.rotateY(-Math.PI / 2); return g;})();
function proyAP(n) {
  if (!PROY_AP_G[n]) {const [f, tam] = PROY_AP[n], g = new THREE.Group(), m = new THREE.Mesh(GEO_PROY, new THREE.MeshBasicMaterial({map: cargaTex('../batalla/ui/ap_pr_' + f + '.webp'), transparent: true, depthWrite: false, depthTest: false})); m.scale.setScalar(tam); m.renderOrder = 6; g.add(m); PROY_AP_G[n] = g;}
  return PROY_AP_G[n].clone(true);
}
/* golpe al llegar, propio de cada proyectil (Pack 25 ART) */
const IMPACTO_AP = {bola: 'ap_hobbit_impacto', brasa: 'ap_gandalf_impacto', bala: 'ap_elfo_impacto', energia: 'ap_orco_tajo'};
/* ráfagas: varios proyectiles a la vez (cubo de bolas, balas de cobertura…), con bote opcional; solo dibujo, el daño lo pone la simulación */
const RAFAGAS = []; window._rafagas = RAFAGAS;
function rafaga({n = 1, x, z, ang, abre = 0, dist, varia = 0.25, cada = 0, y = 1.1, salta = 0, kind = 'bola', vel = 24, fin}) {
  if (fin === undefined) fin = IMPACTO_AP[kind] || 'impacto';
  for (let i = 0; i < n; i++) setTimeout(() => {if (RAFAGAS.length > 70) return; const a = ang + (Math.random() - 0.5) * abre, d = dist * (1 - varia + Math.random() * varia), o = proyAP(kind); scene.add(o); RAFAGAS.push({o, x, z, tx: x + Math.sin(a) * d, tz: z + Math.cos(a) * d, t: 0, dur: d / vel, y, salta, kind, fin});}, i * cada);
}
/* 17/11: el tajo de luz de Dalinar es un ABANICO cuyo vértice está en la esquina de abajo a la izquierda de cada fotograma: se coloca con
   ese vértice en la espada y la diagonal del abanico hacia donde golpea (antes el centro del dibujo iba delante y el vértice quedaba de lado) */
function abanico(nombre, x, z, r, largo, y) {const s = largo / 1.2, se = s * (FB_DUR[nombre] ? 1.3 : 1); return flip(nombre, x + Math.sin(r) * se * 0.62, z + Math.cos(r) * se * 0.62, s, true, r - 3 * Math.PI / 4, y);}
/* armadura que brilla (W de Dalinar) y que echa luz (R): emisivo en los materiales del héroe (copiados la primera vez, para no encender a otro igual) */
const BRILLOS = [];
function brillaArmadura(o, color, fuerza, dur) {
  if (!o || !o.raiz) return;
  if (!o.matsPropios) {o.matsPropios = []; o.raiz.traverse((m) => {if (m.isMesh && m.material && m.material.emissive) {m.material = m.material.clone(); o.matsPropios.push(m.material);}});}
  BRILLOS.push({o, c: new THREE.Color(color), f: fuerza, t: 0, dur});
}
function animaBrillos(dt) {
  const suma = new Map();
  for (let i = BRILLOS.length - 1; i >= 0; i--) {const b = BRILLOS[i]; b.t += dt; if (b.t >= b.dur) {BRILLOS.splice(i, 1); continue;} const ent = Math.min(1, b.t / 0.15), sal = Math.min(1, (b.dur - b.t) / 0.4), late = 0.75 + 0.25 * Math.sin(b.t * 9); const k = b.f * ent * sal * late, a = suma.get(b.o) || {r: 0, g: 0, b: 0}; a.r += b.c.r * k; a.g += b.c.g * k; a.b += b.c.b * k; suma.set(b.o, a);}
  for (const [o, a] of suma) for (const m of o.matsPropios || []) {m.emissive.setRGB(a.r, a.g, a.b); m.userData.brillando = true;}
  for (const b of animaBrillos.antes || []) if (!suma.has(b)) for (const m of b.matsPropios || []) if (m.userData.brillando) {m.emissive.setRGB(0, 0, 0); m.userData.brillando = false;}
  animaBrillos.antes = [...suma.keys()];
}
function animaRafagas(dt) {
  animaBrillos(dt);
  for (let i = RAFAGAS.length - 1; i >= 0; i--) {const r = RAFAGAS[i]; r.t += dt; const k = Math.min(1, r.t / r.dur);
    r.o.position.set(r.x + (r.tx - r.x) * k, r.y * (1 - k) + 0.25 * k + Math.sin(k * Math.PI) * r.salta, r.z + (r.tz - r.z) * k); r.o.rotation.y = Math.atan2(r.tx - r.x, r.tz - r.z);
    if (k >= 1) {scene.remove(r.o); RAFAGAS.splice(i, 1); if (r.fin) flip(r.fin, r.tx, r.tz, r.kind === 'bala' ? 0.9 : 1.3);}}
}
function modeloProy(n) {if (PROY_AP[n]) return proyAP(n);""")
js = sub(js, "function animaHabilidades(dt) {\n  animaRayos(dt);", "function animaHabilidades(dt) {\n  animaRafagas(dt); animaRayos(dt);")
# estela de las habilidades en línea: fuego (Vael), energía (Grub), humo (Fu) en vez del polvo
js = sub(js, "else flip('polvo', t.x + t.dx * d0, t.z + t.dz * d0, 0.9);}", "else flip(t.fx || 'polvo', t.x + t.dx * d0, t.z + t.dz * d0, t.fx === 'fuego' ? 1.4 : 0.9);}")
# Ata: ni hojas ni lluvia de flechas (eso era el elfo); sus efectos van en fxAP
js = sub(js, "if (v.tipo === 'elfo') flip('hojas', x, z, 3.2, true);", "if (v.tipo === 'elfo') flip('polvoA', x, z, 3.2, true);")
js = sub(js, "else if (H.tipo === 'zona') {const d0", "else if (H.tipo === 'zona' && v.tipo !== 'elfo') {const d0")
js = sub(js, "else if (H.tipo === 'rafaga') auraFx(o, 'hojas', du, 3.4);", "else if (H.tipo === 'rafaga') aura(o, '#ffd24a', du, 1.5);")
# el rayo de la definitiva de Vael, de fuego (era la luz blanca de Gandalf)
js = sub(js, "const capas = [capa(ancho * 0.18, '#ffffff', 1), capa(ancho * 0.45, '#fff2c0', 0.55), capa(ancho * 0.9, '#9fd2ff', 0.25)];",
         "const capas = [capa(ancho * 0.18, '#fff3d0', 1), capa(ancho * 0.45, '#ffb347', 0.6), capa(ancho * 0.9, '#ff4a12', 0.3)];")
js = sub(js, "  if (H.tipo === 'invis') {flip('humo', x, z, 4.2, false, undefined, 1.2); flip('humo', x, z, 4.6, true); suena('viento', 0.5, x, z);}\n}",
         "  if (H.tipo === 'invis') {flip('humo', x, z, 4.2, false, undefined, 1.2); flip('humo', x, z, 4.6, true); suena('viento', 0.5, x, z);}\n  fxAP(v, k, H, o, x, z, dx, dz, px, pz, rot, temb, luego2);\n}")
js = sub(js, "/* lluvia de flechas: caen flechas de verdad sobre la zona */", """/* A-6: lo propio de cada héroe, encima de lo común de La Brecha */
function fxAP(v, k, H, o, x, z, dx, dz, px, pz, rot, temb, luego2) {
  const t = v.tipo, rs = rot - Math.PI / 2, lejos = () => {const d0 = Math.min(H.alc || 0, Math.hypot(px - x, pz - z)); return [x + dx * d0, z + dz * d0];};
  if (o.estelaTiro) o.estelaTiro.fx = {gandalf: 'fuego', orco: 'impacto', gollum: 'humo'}[t];
  {const sn = {gandalf: 'ap_llama', orco: 'ap_energia', enano: 'ap_luz', elfo: 'ap_fusil', hobbit: 'ap_golf', rohan: 'ap_arena'}[t]; if (sn) suena(sn, k === 'r' ? 0.8 : 0.55, x, z);}
  if (t === 'hobbit') {
    if (k === 'q') {flip('ondaC', x + dx * 1.2, z + dz * 1.2, 2.4, true); temb(0.12);}  /* el drive: golpe seco y la bola sale disparada (tiro) */
    if (k === 'e') {rafaga({n: 11, x: x + dx * 0.6, z: z + dz * 0.6, ang: rot, abre: H.ang * 1.15, dist: H.alc, cada: 30, y: 1.0, salta: 1.4, kind: 'bola', vel: 13}); suena('arco', 0.6, x, z); luego2(140, () => suena('arco', 0.45, x, z));}
    if (k === 'r') {flip('ap_hobbit_hoyo', x, z, 4.2, false, undefined, 1.2); rafaga({n: 16, x, z, ang: 0, abre: Math.PI * 2, dist: 3.4, cada: 18, y: 2.6, salta: 2.4, kind: 'bola', vel: 9, fin: 'chispa'});}
  }
  if (t === 'elfo') {
    if (k === 'q') {flip('ap_elfo_fogonazo', x + dx * 1.3, z + dz * 1.3, 2, false, undefined, 1.3); flip('ondaC', x + dx, z + dz, 2.2, true); temb(0.15);}
    if (k === 'w') for (let i = 0; i < 5; i++) luego2(i * 110, () => {const p = o.raiz.position; rafaga({x: p.x, z: p.z, ang: o.raiz.rotation.y, abre: 0.12, dist: 7, kind: 'bala', vel: 40, y: 1.3}); flip('ap_elfo_fogonazo', p.x + Math.sin(o.raiz.rotation.y) * 1.3, p.z + Math.cos(o.raiz.rotation.y) * 1.3, 1.4, false, undefined, 1.3); suena('arco', 0.25, p.x, p.z);});
    if (k === 'r') {const [cx, cz] = lejos(); let n = 0; const tira = () => {if (n++ > H.dur / 0.09 || VIS.get(v.id) !== o) return; const p = o.raiz.position, a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * H.radio, tx = cx + Math.cos(a) * r, tz = cz + Math.sin(a) * r, l = Math.hypot(tx - p.x, tz - p.z) || 1; rafaga({x: p.x, z: p.z, ang: Math.atan2(tx - p.x, tz - p.z), dist: l, varia: 0, kind: 'bala', vel: 45, y: 1.3}); if (n % 3 === 0) suena('arco', 0.3, cx, cz); setTimeout(tira, 90);}; tira();}
  }
  if (t === 'orco') {
    if (k === 'q') {flip('ap_orco_remolino', x, z, H.radio * 2, true, rot); rafaga({n: 10, x, z, ang: 0, abre: Math.PI * 2, dist: H.radio, varia: 0.1, kind: 'energia', vel: 22, y: 1.0});}
    if (k === 'w') {flip('ap_orco_tajo', x + dx * H.alc * 0.45, z + dz * H.alc * 0.45, H.alc * 1.6, true, rs); rafaga({n: 5, x, z, ang: rot, abre: H.ang, dist: H.alc, kind: 'energia', vel: 26, y: 1.0});}
    if (k === 'e') flip('ondaC', x + dx, z + dz, 2.2, true);
    if (k === 'r') {o.salto = {t: 0, dur: 0.38, alto: 2.2, cx: px, cz: pz, r: 2.2}; luego2(380, () => {const p = o.raiz.position; flip('ap_orco_tajo', p.x, p.z, 5, true, rs); flip('ap_orco_remolino', p.x, p.z, 4, true); rafaga({n: 12, x: p.x, z: p.z, ang: 0, abre: Math.PI * 2, dist: 3, kind: 'energia', vel: 18, y: 1.2}); temb(0.5);});}
  }
  if (t === 'gandalf') {
    if (k === 'e') {const [cx, cz] = lejos(); flip('ap_gandalf_ceniza', cx, cz, H.radio * 2, true, rot, 0.13, H.dur + 0.4); for (let i = 0; i < 4; i++) {const a = i / 8 * Math.PI * 2; flip('fuego', cx + Math.cos(a) * H.radio * 0.8, cz + Math.sin(a) * H.radio * 0.8, 2);} luego2(500, () => {for (let i = 0; i < 5; i++) flip('fuego', cx + rnd(-H.radio, H.radio) * 0.6, cz + rnd(-H.radio, H.radio) * 0.6, 1.8);});}
    if (k === 'q') flip('fuego', x + dx, z + dz, 1.8);
  }
  if (t === 'gollum') {
    if (k === 'q') {flip('ap_gollum_humo', x, z, 2.6, true); luego2(300, () => {const p = o.raiz.position; flip('ap_gollum_tajo', p.x, p.z, 3, true, rs);});}
    if (k === 'e') flip('ap_gollum_tajo', x + dx * 1.2, z + dz * 1.2, 2.2, true, rs);
    if (k === 'r') {flip('ap_gollum_humo', x, z, 4.6, false, undefined, 1.2); flip('ap_gollum_humo', x, z, 4, true);}
  }
  if (t === 'rohan') {
    if (k === 'w') for (let i = 0; i < 3; i++) luego2(i * 220, () => {const p = o.raiz.position; flip('ap_rohan_arena', p.x, p.z, 3.2, true, Math.random() * 6);});
    if (k === 'q' || k === 'r') {const d = H.dist || 5; flip('ap_rohan_tajo', x + dx * d * 0.5, z + dz * d * 0.5, k === 'r' ? 4.4 : 3, true, rs); luego2(k === 'r' ? 350 : 220, () => {const p = o.raiz.position; flip('ap_rohan_tajo', p.x, p.z, k === 'r' ? 4 : 2.6, true, rs + 1.2);});}
    if (k === 'e') {flip('ap_rohan_arena', x, z, H.radio * 2, true, rot); for (let i = 0; i < 4; i++) luego2(i * 90, () => {const a = rot + i * 1.6, r = H.radio * 0.6; flip('ap_rohan_arena', x + Math.cos(a) * r, z + Math.sin(a) * r, 2.2, true, a);});}
  }
  if (t === 'enano') {
    if (k === 'q') {abanico('ap_enano_tajo', x + dx * 0.5, z + dz * 0.5, rot, (H.alc || 4) + 0.4, 1.1); abanico('ap_enano_tajo', x + dx * 0.5, z + dz * 0.5, rot, (H.alc || 4) * 0.8, 0.12);}
    if (k === 'w') {auraFx(o, 'escudo', H.dur, 3.8); brillaArmadura(o, '#5fc4ff', 0.9, H.dur || 3);}
    if (k === 'r') {flip('ap_enano_estallido', x, z, H.radio * 2, true); flip('ap_enano_estallido', x, z, H.radio * 1.4, false, undefined, 1.4); brillaArmadura(o, '#e8f6ff', 2.2, 2.6); flip('ondaC', x, z, H.radio * 2.6, true); luego2(180, () => flip('ondaC', x, z, H.radio * 3.4, true));}
  }
}
/* lluvia de flechas: caen flechas de verdad sobre la zona */""")

# ---------- EL PUENTE (17/11, Arturo: «como si estuvieses encima de un puente cruzando algo, y a los lados paisaje») ----------
# el tablero (|x| < 11) cruza un barranco con río entre z = -38 y 38; las bases quedan en tierra firme a los dos lados
js = sub(js, "      gl_FragColor=vec4(col,1.);\n      #include <colorspace_fragment>", "      gl_FragColor=vec4(col,hueco);\n      #include <colorspace_fragment>")
js = sub(js, "  const m = new THREE.MeshLambertMaterial({map: rt.texture});", "  const m = new THREE.MeshLambertMaterial({map: rt.texture, alphaTest: 0.5});")
js = sub(js, "const fuera_ = new THREE.Mesh(g, mF); fuera_.position.y = -0.03; fuera_.receiveShadow = true; scene_.add(fuera_);",
         "const fuera_ = new THREE.Mesh(g, mF); fuera_.position.y = -0.03; fuera_.receiveShadow = true; scene_.add(fuera_); if (TIPO_MAPA === 'linea') puente(scene_, fuera_);")
js = sub(js, "const tF = cargaTex('../batalla/texturas/ap_arcen.webp', true); tF.repeat.set(20, 24); const mF = new THREE.MeshLambertMaterial({map: tF, color: '#ead8c8'});",
         "const tF = cargaTex('texturas/campo.webp', true); tF.repeat.set(30, 36); const mF = new THREE.MeshLambertMaterial({map: tF, color: '#b8d39a'});")
js = sub(js, "/* el palantír junto al estandarte de Isengard:", """/* EL PUENTE: tierra firme a los dos lados (bases), barranco con río 24 m más abajo, tablero con pretil, pilas y estribos */
const PUENTE = {z: 38, hondo: 24, ancho: 11};
function puente(sc, fuera) {
  const {z: Z, hondo: H, ancho: A} = PUENTE;
  fuera.visible = false;
  const tG = cargaTex('texturas/campo.webp', true), tR = cargaTex('texturas/roca.webp', true), tC = cargaTex('../batalla/texturas/ap_hormigon.webp', true);
  /* tierra firme a los dos lados */
  const tT = tG.clone(); tT.repeat.set(26, 10); tT.source = tG.source;
  for (const sg of [1, -1]) {const g = new THREE.PlaneGeometry(260, 100); g.rotateX(-Math.PI / 2); const t = new THREE.Mesh(g, new THREE.MeshLambertMaterial({map: tT, color: '#b8d39a'})); t.position.set(0, -0.05, sg * (Z + 50)); t.receiveShadow = true; sc.add(t);}
  /* el fondo del barranco: hierba, roca en las orillas y el río que pasa por debajo del puente */
  const tV = cargaTex('../batalla/texturas/ap_barranco.webp', true); tV.wrapT = THREE.ClampToEdgeWrapping; tV.anisotropy = 4;
  const gV = new THREE.PlaneGeometry(260, Z * 2 + 4); gV.rotateX(-Math.PI / 2);
  const mV = new THREE.MeshLambertMaterial({color: '#ffffff'});
  mV.onBeforeCompile = (sh) => {sh.uniforms.tV = {value: tV}; sh.uniforms.tG = {value: tG}; sh.uniforms.tR = {value: tR}; sh.uniforms.uT = UT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\\nvarying vec2 vWV;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\\nvWV=(modelMatrix*vec4(transformed,1.)).xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\\nvarying vec2 vWV; uniform sampler2D tG,tR,tV; uniform float uT;').replace('#include <map_fragment>', `
      /* Pack 16 ART: el río visto desde arriba, se repite de lado a lado; 120 m de ancho por cada copia y los 80 m del barranco de alto */
      vec2 w=vWV; vec3 c=texture2D(tV,vec2(w.x/120.,.5-w.y/80.)).rgb;
      c=mix(c,vec3(.62,.75,.86),.1); /* bruma: está lejos, abajo */
      diffuseColor.rgb=c;`);};
  const valle = new THREE.Mesh(gV, mV); valle.position.y = -H; sc.add(valle);
  /* paredes del barranco bajo cada tierra firme */
  const tRp = cargaTex('../batalla/texturas/ap_pared_roca.webp', true); tRp.wrapT = THREE.ClampToEdgeWrapping; tRp.repeat.set(260 / 36, 1); /* Pack 16 ART: 24 m de alto = la imagen entera */
  for (const sg of [1, -1]) {const p = new THREE.Mesh(new THREE.BoxGeometry(260, H, 2), new THREE.MeshLambertMaterial({map: tRp})); p.position.set(0, -H / 2 - 0.06, sg * (Z + 1)); sc.add(p);}
  /* el tablero: cantos, panza, pretil, vigas y pilas de hormigón */
  const HC = {}, hc = (rx, ry) => HC[rx + 'x' + ry] || (HC[rx + 'x' + ry] = (() => {const t = tC.clone(); t.source = tC.source; t.repeat.set(rx, ry); return new THREE.MeshLambertMaterial({map: t, color: '#d8d8d4'});})());  /* 17/11: mismo material para piezas iguales → fusiona() las junta */
  const caja = (w, h, d, x, y, z, mat) => {const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, y, z); b.receiveShadow = true; sc.add(b); return b;};
  const L = Z * 2 + 2;
  for (const sg of [1, -1]) {caja(0.7, 2.2, L, sg * (A + 0.05), -1.1, 0, hc(1, 24)); caja(0.55, 0.75, L, sg * (A + 0.05), 0.37, 0, hc(1, 30)).castShadow = true;}
  caja(A * 2 + 0.6, 0.4, L, 0, -2.2, 0, hc(8, 24));
  for (const z of [-19, 0, 19]) {caja(A * 2 + 1.4, 1.4, 2.8, 0, -2.9, z, hc(8, 1)); for (const x of [-6.5, 6.5]) caja(2.6, H - 3, 2.6, x, -3.6 - (H - 3) / 2, z, hc(1, 8));}
}
/* el palantír junto al estandarte de Isengard:""")
# árboles: solo queda algún pino suelto lejos; en su sitio, el decorado de la autopista
js = sub(js, "  for (const n in arboles) instancias('vado_arboles', n, arboles[n]);",
         "  for (const n in arboles) if (n.startsWith('pino')) instancias('vado_arboles', n, arboles[n].filter((q, i) => i % 3 === 0 && Math.abs(q.x) > 16 && Math.abs(q.z) > 41));\n  if (TIPO_MAPA === 'linea') decoradoAutopista(pon2, al);")
js = sub(js, "if (TIPO_MAPA === 'linea') for (const z of [-30, -12, 12, 30]) for (const x of [-9.4, 9.4]) {pon2('brasero', x, z, 0, 1.5); luzFuego(x, z);}",
         "if (TIPO_MAPA === 'linea') for (const z of [-30, -12, 12, 30]) for (const x of [-11.1, 11.1]) luzFuego(x, z);")
js = sub(js, "/* el palantír junto al estandarte de Isengard:", """/* LA AUTOPISTA: quitamiedos a los dos lados, farolas, coches abandonados, conos y señales (piezas CC0 de Kenney, Pack Autopista 2) */
function decoradoAutopista(pon2, al) {
  const lejosBase = (z) => Math.abs(Math.abs(z) - 49) > 9;
  for (let z = -60; z < 60; z += 10) for (const x of [-10.5, 10.5]) if (lejosBase(z + 5) && Math.abs(z + 5) > 40) pon2('ap_quitamiedos', x, z + 5, 0, 1);
  for (let z = -42; z <= 42; z += 14) for (const x of [-11.1, 11.1]) {const o = pon2('ap_farola', x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2, 1); if (o) o.traverse((q) => {if (q.isMesh && q.material.emissive) q.material.emissiveIntensity = 2;});}
  const coches = ['ap_coche_1', 'ap_coche_2', 'ap_coche_3', 'ap_camion'];
  for (let i = 0; i < 22; i++) {const lado = al() < 0.5 ? -1 : 1, x = lado * (13 + al() * 14), z = (al() < 0.5 ? -1 : 1) * (41 + al() * 30); if (Math.abs(z) < 41) continue; pon2(coches[i % 4], x, z, (al() - 0.5) * 1.2 + (al() < 0.5 ? 0 : Math.PI), 1);}
  for (let i = 0; i < 26; i++) {const lado = al() < 0.5 ? -1 : 1, x = lado * (8.2 + al() * 2), z = (al() - 0.5) * 110; if (!lejosBase(z)) continue; pon2('ap_cono', x, z, al() * 6.3, 1.6);}
  for (let i = 0; i < 8; i++) {const lado = al() < 0.5 ? -1 : 1, z = (al() - 0.5) * 100; if (!lejosBase(z)) continue; if (Math.abs(z) > 40) pon2(al() < 0.5 ? 'ap_senal' : 'ap_valla', lado * (12 + al() * 3), z, al() * 6.3, 1.3);}
}
/* el palantír junto al estandarte de Isengard:""")

# ---------- PACKS 8, 14 y 10 WORK (17/11): torres/nexos/fuentes, súbditos y decorado de la autopista ----------
# los modelos van adelgazados a public/batalla/modelos con tools/vado/adelgaza.py (originales en tools/autopista/pack8, pack14, pack10)
js = sub(js, "'vado_torres', 'vado_nexos', 'vado_cubiles', 'vado_fuentes', 'super_rohan', 'super_isengard',",
         "'ap_estructuras', 'vado_cubiles', 'ap_sub_azul_m', 'ap_sub_azul_r', 'ap_sub_rojo_m', 'ap_sub_rojo_r', 'ap_super_azul', 'ap_super_rojo', 'ap_vegetacion', 'ap_borde', 'ap_suelo_props',")
js = sub(js, "'ballestero2', 'arquero_rohan2', 'uruk', 'q_arquero', 'proyectiles'", "'proyectiles'")
# súbditos: los tuyos siempre azules y los del rival rojos (como el aro y la barra); casi sin teñir, ya traen su color
js = sub(js, "const MODELO_SUBD = [{m: 'ballestero2', r: 'arquero_rohan2', a: 'ballestero2', x: 'super_rohan'}, {m: 'uruk', r: 'q_arquero', a: 'uruk', x: 'super_isengard'}];",
         "const MODELO_SUBD = [{m: 'ap_sub_azul_m', r: 'ap_sub_azul_r', a: 'ap_sub_azul_m', x: 'ap_super_azul'}, {m: 'ap_sub_rojo_m', r: 'ap_sub_rojo_r', a: 'ap_sub_rojo_m', x: 'ap_super_rojo'}];")
js = sub(js, "o = montar(MODELO_SUBD[v.eq][v.tipo], ALTO_SUBD[v.tipo]); const col = v.eq === MI_EQ ? '#3d8bff' : '#ff3b30';\n    tiñe(o.raiz, col, v.hk === 'F' ? 1 : 0.75);",
         "o = montar(MODELO_SUBD[v.eq === MI_EQ ? 0 : 1][v.tipo], ALTO_SUBD[v.tipo]); const col = v.eq === MI_EQ ? '#3d8bff' : '#ff3b30';\n    tiñe(o.raiz, col, v.hk === 'F' ? 1 : 0.12);")
# torres y nexos: los del Pack 8, ya a su tamaño (torre 8 m, nexo 9 m); azul = tu equipo
js = sub(js, "lado = v.eq ? 'isengard' : 'rohan', est = [1, 2, 3].map((n) => {const p = pieza('vado_torres', 'torre_' + lado + '_' + n);",
         "lado = v.eq === MI_EQ ? 'azul' : 'roja', est = [1, 2, 3].map((n) => {const p = pieza('ap_estructuras', 'torre_' + lado + '_' + n);")
js = sub(js, "g.rotation.y = v.eq ? 0 : Math.PI; g.scale.setScalar(0.82);", "g.rotation.y = v.eq ? 0 : Math.PI; g.scale.setScalar(1);")
js = sub(js, "b = pieza('vado_nexos', v.eq ? 'nexo_isengard' : 'nexo_rohan'); fusiona(b); b.scale.setScalar(1.35);",
         "b = pieza('ap_estructuras', v.eq === MI_EQ ? 'nexo_azul' : 'nexo_rojo'); fusiona(b); b.scale.setScalar(1);")
# fuentes: se ponen al empezar la partida (hasta entonces no se sabe cuál es la tuya); fuera la tienda de campaña y los braseros
js = sub(js, "    const b = BASES[eq], o = pieza('vado_fuentes', eq ? 'fuente_isengard' : 'fuente_rohan'); o.position.set(b.fuente.x, 0, b.fuente.z); o.scale.setScalar(1.3); scene_.add(o);\n    const s = signo(eq); pon2('tienda', b.fuente.x - 3 * s, b.fuente.z + 3.5 * s, eq ? 0 : Math.PI, 1.6);\n    for (const [dx, dz] of [[4, -4], [-1, -6]]) {pon2('brasero', b.fuente.x + dx * s, b.fuente.z + dz * s, 0, 1.4); luzFuego(b.fuente.x + dx * s, b.fuente.z + dz * s);}",
         "    const b = BASES[eq], s = signo(eq);\n    for (const [dx, dz] of [[4, -4], [-4, -4]]) luzFuego(b.fuente.x + dx * s, b.fuente.z + dz * s);")
js = sub(js, "function colorFuentes() {for (const a of FUENTE_AROS) a.material.color.set(a.userData.eq === MI_EQ ? '#4fb6ff' : '#ff5a4a');}",
         """function colorFuentes() {for (const a of FUENTE_AROS) a.material.color.set(a.userData.eq === MI_EQ ? '#4fb6ff' : '#ff5a4a'); ponFuentesA6();}
const FUENTES_A6 = [];
function ponFuentesA6() {
  for (const o of FUENTES_A6) o.parent && o.parent.remove(o); FUENTES_A6.length = 0;
  for (const eq of [0, 1]) {const f = BASES[eq].fuente, o = pieza('ap_estructuras', eq === MI_EQ ? 'fuente_azul' : 'fuente_roja'); fusiona(o); o.position.set(f.x, 0, f.z); o.rotation.y = eq ? 0 : Math.PI; (MAPA_G || scene).add(o); FUENTES_A6.push(o);}
}""")
# decorado del Pack 10: matas, adelfas, pinos, eucaliptos y hierba en tierra firme; taludes de roca al borde del barranco;
# cascotes, neumáticos, bidones y manchas de aceite por el puente; vallas, muros antirruido y un paso elevado al fondo
js = sub(js, "  for (let i = 0; i < 8; i++) {const lado = al() < 0.5 ? -1 : 1, z = (al() - 0.5) * 100; if (!lejosBase(z)) continue; if (Math.abs(z) > 40) pon2(al() < 0.5 ? 'ap_senal' : 'ap_valla', lado * (12 + al() * 3), z, al() * 6.3, 1.3);}\n}",
         """  for (let i = 0; i < 8; i++) {const lado = al() < 0.5 ? -1 : 1, z = (al() - 0.5) * 100; if (!lejosBase(z)) continue; if (Math.abs(z) > 40) pon2(al() < 0.5 ? 'ap_senal' : 'ap_valla', lado * (12 + al() * 3), z, al() * 6.3, 1.3);}
  decoradoPack10(al);
}
function decoradoPack10(al) {
  const V = {}, P = {}, B = {}, mete = (L, n, x, z, s = 1, ry = al() * 6.283, y = 0) => (L[n] = L[n] || []).push({x, z, y, s, ry});
  const sg = () => (al() < 0.5 ? -1 : 1), uno = (a) => a[Math.floor(al() * a.length)];
  const matas = ['mata_seca_1', 'mata_seca_2', 'mata_seca_3', 'mata_seca_4', 'adelfa_1', 'adelfa_2'];
  for (let i = 0; i < 110; i++) mete(V, uno(matas), sg() * (12 + al() * 34), sg() * (41.5 + al() * 36), 0.8 + al() * 0.6);
  for (let i = 0; i < 34; i++) mete(V, uno(['pino_1', 'pino_2', 'pino_3', 'pino_3', 'eucalipto_1', 'eucalipto_2']), sg() * (17 + al() * 36), sg() * (44 + al() * 34), 0.9 + al() * 0.35);
  for (let i = 0; i < 4; i++) mete(V, 'palmera_1', sg() * (20 + al() * 10), sg() * (60 + al() * 12));
  for (let i = 0; i < 150; i++) {const z = sg() * (41 + al() * 36); mete(V, uno(['hierba_1', 'hierba_2', 'hierba_3']), sg() * (9.6 + al() * 22), z, 1 + al() * 0.7);}
  for (let i = 0; i < 40; i++) mete(V, uno(['hierba_1', 'hierba_2', 'hierba_3']), sg() * (9.4 + al() * 1.3), (al() - 0.5) * 74, 0.8 + al() * 0.4);
  for (const n in V) instancias('ap_vegetacion', n, V[n], /pino|eucalipto|palmera/.test(n));  /* sombra solo los árboles (17/11: rendimiento) */
  const cosas = ['neumatico_1', 'neumatico_2', 'bidon_1', 'bidon_2', 'palé', 'cascotes_1', 'cascotes_2', 'cascotes_3', 'señal_caida_1', 'señal_caida_2', 'cono_tumbado'];
  for (let i = 0; i < 30; i++) mete(P, uno(cosas), sg() * (8.4 + al() * 1.9), (al() - 0.5) * 74);
  for (let i = 0; i < 26; i++) mete(P, uno(cosas), sg() * (11.5 + al() * 22), sg() * (42 + al() * 30));
  for (let i = 0; i < 9; i++) mete(P, 'mancha_aceite', (al() - 0.5) * 11, (al() - 0.5) * 100, 0.8 + al() * 0.8, al() * 6.283, 0.02);
  for (const n in P) instancias('ap_suelo_props', n, P[n], false);
  for (const s of [1, -1]) for (let x = 14; x < 78; x += 7.4) for (const sx of [1, -1]) mete(B, uno(['talud_roca_1', 'talud_roca_2', 'talud_roca_3']), sx * x, s * 41.3, 1, s > 0 ? 0 : Math.PI);
  for (const n in B) instancias('ap_borde', n, B[n], false);
  const G = MAPA_G || scene, pz = (n, x, z, ry) => {const o = pieza('ap_borde', n); o.position.set(x, 0, z); o.rotation.y = ry; G.add(o); return o;};
  for (const s of [1, -1]) {
    for (let z = 44; z < 86; z += 6) pz('muro_antirruido', s * 36, s * z, Math.PI / 2);
    pz('valla_publicitaria', s * 24, s * 64, s > 0 ? Math.PI * 0.75 : -Math.PI * 0.25);
    for (let k = 0; k < 5; k++) pz('new_jersey', s * (12.5 + (k % 2) * 0.4), s * (60 + k * 3.2), Math.PI / 2 + (al() - 0.5) * 0.3);
    pz('paso_elevado', 0, s * 82, 0);
  }
}""")
# ---------- DEFINITIVA MÁS A LA IZQUIERDA Y SIN «CAJAS» EN LOS AROS (17/11, Arturo) ----------
# la definitiva pegada al borde no dejaba sitio para arrastrar y apuntar; y un brillo viejo (box-shadow de antes del Pack 19)
# en el aro de las habilidades listas salía como un recuadro, y además encogía el aro (inset 2 %)
html = sub(html, '</head>', """<style>
.hb[data-k]::after,.hb[data-k].pronta::after,.hb.hs::after,#bR::after,#bR.pronta::after{box-shadow:none !important;border:0 !important;border-radius:0 !important;inset:-11% !important}
#bR{right:92px !important;bottom:186px !important}
</style></head>""", donde='html')
# ---------- PACK 27 ART (17/11, Henar): FONDO DEL MENÚ CON TORMENTA (tools/autopista/procesa_pack27.py) ----------
# base fría y oscura; cada 6-12 s un rayo (tira de 8 fotogramas) y el fondo encendido parpadea encima; lluvia en mosaico que cae
html = sub(html, '<i class="fr"></i></div>', '<i class="fr"></i><i class="tL"></i><i class="tR"></i><i class="tLl tA"></i><i class="tLl tB"></i></div>', donde='html')
html = sub(html, '</head>', """<style>
#menu #mFondo .fc,#menu #mFondo .tL{background-image:url(ui/ap_tormenta_base.webp)!important;background-position:62% 50%!important}
#menu .mSplash img{-webkit-mask-image:linear-gradient(90deg,#000 45%,transparent 92%)!important;mask-image:linear-gradient(90deg,#000 45%,transparent 92%)!important}
#menu #mFondo .tL{background-image:url(ui/ap_tormenta_luz.webp)!important;opacity:0;transition:opacity .07s linear;animation:mfCielo 48s ease-in-out infinite alternate}
#mFondo .fp,#mFondo .ff,#mFondo .fm,#mFondo .fr{display:none!important}
#mFondo .fn{opacity:.18}
#mFondo .tR{inset:auto;top:-2%;right:14%;width:34%;aspect-ratio:1;background:url(ui/ap_rayo1.webp) 0 0/800% 100% no-repeat;mix-blend-mode:screen;opacity:0}
#mFondo .tLl{inset:auto;top:-360px;left:-10%;width:130%;height:calc(100% + 360px);background:url(ui/ap_lluvia.webp) 0 0/340px 340px repeat;mix-blend-mode:screen;opacity:.42;animation:llueve .42s linear infinite}
#mFondo .tB{background-size:520px 520px;opacity:.28;animation-duration:.33s;filter:blur(.6px)}
@keyframes llueve{to{transform:translate(-91px,340px)}}
@media (prefers-reduced-motion:reduce){#mFondo .tLl,#mFondo .tR,#mFondo .tL{display:none}}
</style></head>""", donde='html')
html = sub(html, '</body>', """<script>
(() => {const f = document.getElementById('mFondo'); if (!f || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const L = f.querySelector('.tL'), R = f.querySelector('.tR'), menu = document.getElementById('menu');
  function rayo() {
    if (!menu || menu.classList.contains('hidden') || document.hidden) return setTimeout(rayo, 2500);
    const n = Math.random() < 0.6 ? 1 : 2; R.style.backgroundImage = 'url(ui/ap_rayo' + n + '.webp)';
    R.style.right = (2 + Math.random() * 30) + '%'; R.style.top = (n === 1 ? -2 : 2 + Math.random() * 10) + '%'; R.style.width = (n === 1 ? 30 + Math.random() * 10 : 38 + Math.random() * 10) + '%';
    let i = 0; R.style.backgroundPosition = '0% 0'; R.style.opacity = 1;
    const t = setInterval(() => {i++; if (i > 7) {clearInterval(t); R.style.opacity = 0; return;} R.style.backgroundPosition = (i * 100 / 7) + '% 0';}, 60);
    for (const [d, o] of [[150, 0.9], [230, 0.3], [300, 1], [420, 0.55], [620, 0.2], [800, 0]]) setTimeout(() => {L.style.opacity = o;}, d);
    setTimeout(rayo, 6000 + Math.random() * 6000);
  }
  setTimeout(rayo, 1800);
})();
</script></body>""", donde='html')
# ---------- MENÚ REORDENADO (17/11, Henar: «el orden de los botones no tiene sentido; quita el logo y que se vea el peaje») ----------
# abajo a la derecha, de abajo arriba: [Duelo | JUGAR] y encima [Crear sala | código + Unirse]; la partida guiada,
# pequeña y redonda arriba junto a ⚙ (su dibujo propio llega con el Pack Autopista 28 ART); el fondo sube para que el peaje quede a la vista
html = sub(html, '</head>', """<style>
#menu #mFondo .fc,#menu #mFondo .tL{background-position:62% 100%!important}
#menu .mTit{display:none!important}
#menu .mPanel{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,2fr)!important;grid-template-areas:"crear amigos" "modo jugar"!important;align-items:end!important;align-content:end!important;gap:8px 10px!important;top:auto!important;left:auto!important;right:calc(12px + var(--sar))!important;bottom:calc(10px + var(--sab))!important;width:min(60%,500px)!important;padding:0!important}
#menu .mFila2{display:contents!important}
#menu .modos{grid-area:modo;width:100%!important;margin:0!important;display:block!important}
#menu .modos button{width:100%!important}
#menu .jugar{grid-area:jugar;width:100%!important;margin:0!important}
#menu #bCrear{grid-area:crear;grid-column:1/2;width:100%!important;height:44px!important;min-height:44px!important}
#menu .mAmigos{grid-area:amigos;width:100%!important;margin:0!important;height:44px!important;min-height:44px!important}
#menu #sala,#menu #heroes,#menu #msg{grid-column:1/-1}
#menu #bGuia.mT{aspect-ratio:1!important;position:fixed!important;inset:calc(14px + var(--sat)) calc(76px + var(--sar)) auto auto!important;width:52px!important;height:52px!important;min-height:0!important;padding:0!important;border-radius:50%!important;background:none!important;border:0!important;overflow:visible!important}
#menu #bGuia img{width:100%!important;height:100%!important;margin:0!important;border-radius:50%!important;border:2px solid #7dff6a;box-shadow:0 0 10px #7dff6a88}
#menu #bGuia span{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:3px;white-space:nowrap}
#menu #bGuia span b{font-size:10px!important;color:#cfffc4;text-shadow:0 1px 2px #000}
#menu #bGuia span small{display:none!important}
#menu #bGuia.nueva::after{right:-8px!important;top:-6px!important}
</style></head>""", donde='html')
# ---------- 17/11 (Arturo): el «+» de la definitiva se había quedado donde estaba antes; soldados más bajitos ----------
html = sub(html, '</head>', """<style>
#mr{right:124px !important;bottom:226px !important}
</style></head>""", donde='html')
# las flechas de los soldados sonaban al 50 % estuvieran donde estuvieran: ahora bajan con la distancia y mucho más flojas; su muerte, también
js = sub(js, "suena({bala: 'ap_fusil', bola: 'ap_golf'}[e[1]] || 'arco', 0.5);}", "{const sh = {bala: 'ap_fusil', bola: 'ap_golf'}[e[1]]; suena(sh || 'arco', sh ? 0.5 : 0.12, e[2], e[3]);}}")
js = sub(js, "else suena('muerte', 0.35, v.x, v.z);}", "else suena('muerte', v.k === 's' ? 0.14 : 0.35, v.x, v.z);}")
# ---------- IGNICIÓN EN VEZ DE CASTIGO Y UN SOLO BOTIQUÍN (17/11, Henar; dentro de la simulación: volver a sacar sim_ap.js) ----------
# en el Duelo no hay bestias: el Castigo no servía. Ignición como en el Wild Rift: quema al héroe enemigo más cercano (7 m) durante 5 s
js = sub(js, "c: {n: 'Castigo', cd: 60, icono: 'ui/ap_hz_castigo.webp'}", "c: {n: 'Ignición', cd: 90, icono: 'ui/ap_hz_ignicion.webp'}")  # icono del Pack 29 ART (tools/autopista/procesa_pack29.py)
js = sub(js, """    const t = masCercano(h, S.u.filter((u) => (u.k === 'j' || u.k === 's') && u.eq !== h.eq && !u.muerto && u.vida > 0), 5.5); if (!t) return false;
    h.cd.f = HECHIZOS.c.cd; dana(h, t, 380 + 45 * h.nivel, 'hab'); ev(['castigo', t.x, t.z]); return true;""",
"""    if (TIPO_MAPA === 'ojo') {const t = masCercano(h, S.u.filter((u) => (u.k === 'j' || u.k === 's') && u.eq !== h.eq && !u.muerto && u.vida > 0), 5.5); if (!t) return false;
      h.cd.f = HECHIZOS.c.cd; dana(h, t, 380 + 45 * h.nivel, 'hab'); ev(['castigo', t.x, t.z]); return true;}
    const t = masCercano(h, S.u.filter((u) => u.k === 'h' && u.eq !== h.eq && !u.muerto && u.vida > 0), 7); if (!t) return false;
    h.cd.f = HECHIZOS.c.cd; t.quema = {dps: (80 + 45 * h.nivel) / 5, hasta: S.t + 5, o: h.id, tick: 0}; ev(['castigo', t.x, t.z]); ev(['num', t.x, t.z, '🔥', 'r']); return true;""")
# un solo botiquín, en mitad del puente (salía uno delante y otro detrás de cada torre: cuatro)
js = sub(js, "if (tipo === 'linea') {const t = puntoCarril(0, TORRE_F).z; for (const [z, t0] of [[t - 7, 105], [t + 8, 150]]) for (const sg of [1, -1]) RELIQ.push({x: -6.8, z: z * sg, t0});}",
         "if (tipo === 'linea') RELIQ.push({x: 0, z: 0, t0: 105});")
# ---------- EL GOLPE BÁSICO TE PARA (17/11, Arturo): como en el Wild Rift, al soltar un básico te quedas quieto lo que dura el gesto ----------
# en la simulación (tú contra la máquina, los bots y el anfitrión) se para al dar el golpe; en línea, tu móvil para con el golpe que predice
js = sub(js, "} else if (!(h.aturd > S.t)) {\n      if (h.bot || h.local) {if (h.mx || h.mz) {", "} else if (!(h.aturd > S.t) && !(h.paraT > S.t)) {\n      if (h.bot || h.local) {if (h.mx || h.mz) {")
js = sub(js, "golpea(h, obj); h.tap = 0;}", "golpea(h, obj); h.tap = 0; h.paraT = S.t + Math.min(0.3, 0.3 / st.vatq); h.mueve = false;}")
js = sub(js, "  if (MIO.dash) {MIO.x += MIO.dash.vx * dt; MIO.z += MIO.dash.vz * dt; MIO.dash.t -= dt; if (MIO.dash.t <= 0) MIO.dash = null;}\n  else {const ac = acercaAtaque(",
         """  {const oo = VIS.get(YO), marca = oo && oo.predT || 0; if (marca !== MIO.marcaAt) {if (MIO.marcaAt !== undefined && marca) MIO.para = performance.now() + Math.min(300, 300 / HEROES[v.tipo].vatq); MIO.marcaAt = marca;}}
  if (MIO.dash) {MIO.x += MIO.dash.vx * dt; MIO.z += MIO.dash.vz * dt; MIO.dash.t -= dt; if (MIO.dash.t <= 0) MIO.dash = null;}
  else if (performance.now() < (MIO.para || 0)) MIO.mueve = false;
  else {const ac = acercaAtaque(""")
# menú: fondo = la imagen de carga (los dos peajes), retrato sin cortar la cabeza, sin Gamling (Tolkien) ni el jinete
html = sub(html, '</head>', '<style>#mFondo .fc{background-image:url(ui/ap_carga.webp)!important}#mFondo .ff,#mFondo .fm,#mFondo .fr{display:none}'
           '#menu .mSplash img{object-position:50% 0%!important}</style></head>', donde='html')
html = sub(html, 'ui/guia_gamling.webp" alt="Gamling"', 'ui/ap_guia.webp" alt=""', donde='html')
html = sub(html, '<img src="ui/guia_gamling.webp" alt="">', '<img src="ui/ap_guia.webp" alt="">', donde='html')
html = sub(html, '<img src="ui/ap_splash_rohan.webp" alt="" class="mTi2">', '<img src="ui/ap_crear.webp" alt="" class="mTi2">', donde='html')
for v in ["'ui/h_' + ", "'ui/p_' + ", "'ui/at_' + "]:
    if v not in js: fallos.append('[arte] ' + v)
    js = js.replace(v, v.replace('ui/', 'ui/ap_'))
html = sub(html, '<script type="module" src="juego.js?', '<script type="module" src="autopista.js?', donde='html')
html = sub(html, '<h1>La Brecha</h1><p class="sub">Rohan contra Isengard</p>', '<h1>La Autopista</h1><p class="sub">Azules contra rojos</p>', donde='html')
# 17/11: el juego se llama «A-6»; título de texto hasta que llegue el logo nuevo (Pack 17 ART). Los logos del Pack 15 decían «La Autopista»
html = sub(html, '<h1>La Autopista</h1><p class="sub">Azules contra rojos</p>', '<h1 class="apLogo"><img src="ui/ap_logo_a6.webp" alt="A-6"></h1>', donde='html')
html = sub(html, '</head>', '<style>.mTit h1.apLogo{margin:6px 0 0;line-height:0}.mTit h1.apLogo img{width:min(200px,calc(24 * var(--vw)));height:auto;filter:drop-shadow(0 4px 6px #000a)}.mTit h1.apA6{margin:6px 0 0;font:italic 900 46px \'Arial Black\',system-ui,sans-serif!important;color:#ffd21f!important;letter-spacing:.04em;line-height:1;-webkit-text-stroke:2px #10161f;text-shadow:0 4px 0 #10161f,0 0 18px #2f8cff88}</style></head>', donde='html')
# ---------- MENÚ EN PANTALLAS BAJAS + FONDO DE ELEGIR HÉROE (17/11, Henar: «qué horror el menú») ----------
html = sub(html, '</head>', """<style>
#menu #bSon{background:url(ui/ap_b_ajustes.webp) center/100% 100% no-repeat !important;width:48px !important;height:48px !important}
#bGuia{overflow:visible !important}
#bGuia.nueva::after{right:10px !important;top:-9px !important;z-index:3}
#elige{background:linear-gradient(90deg,#05080d99 0%,#05080d33 30%,#05080db3 50%,#05080dbf 100%),linear-gradient(0deg,#05080dcc,#05080d00 35%),url(ui/ap_fondo_vs.webp) center/cover no-repeat,#05080d !important}
#elige.e2 .eDet,#elige .eDet{background:#070b12d9 !important}
@media (max-height:440px){
 .mPanel{padding-top:0 !important;gap:4px !important;bottom:calc(6px + var(--sab)) !important}
 .mTit h1.apLogo img{width:min(150px,calc(34 * var(--vh))) !important}
 .modos{width:min(100%,calc(70 * var(--vh)));margin:0 auto}
 #menu .modos button span,#menu .modos button small{display:none}
 #menu .modos button{padding-bottom:14% !important;overflow:visible !important}
 #menu .modos button b{font-size:15px !important;text-shadow:0 2px 3px #000,0 0 6px #000}
 .jugar{width:min(100%,calc(52 * var(--vh))) !important;margin:0 auto !important}
 .mFila2 .mT{height:42px !important;min-height:42px !important}
 .mAmigos{height:34px !important;min-height:34px !important;margin:2px auto 0 !important}
}
</style></head>""", donde='html')
html = sub(html, '<span>1 contra 1 · el Abismo</span>', '<span>1 contra 1 · la autopista</span>', donde='html')
html = html.replace("'vado.heroe'", "'auto.heroe'")
html = sub(html, 'La Brecha se juega en horizontal.', 'A-6 se juega en horizontal.', donde='html')
html = sub(html, '<p>Preparando el campo de batalla</p>', '<p>Preparando la autopista</p>', donde='html')

# Ignición: su icono en todas partes (botón de la partida, elegir héroe)
js = js.replace('ui/ap_hz_castigo.webp', 'ui/ap_hz_ignicion.webp'); html = html.replace('ui/ap_hz_castigo.webp', 'ui/ap_hz_ignicion.webp')

# ---------- GOLPES BÁSICOS QUE SE VEN (17/11, Henar: «más reales, más visibles»; héroes un 20 % más pequeños: ESC_H 1,28) ----------
# Al soltar el básico, en el instante del golpe: los de cuerpo a cuerpo dejan un tajo de su color delante (alterna lado, como el
# gesto), Ata un fogonazo en el cañón y retroceso, Vael una llamarada en la mano, Birdie el arco blanco del palo. En el que recibe,
# chispa más grande cuando pega un héroe. Solo dibujo (la simulación no cambia); lo propio de tu móvil al predecir el golpe.
js = sub(js, "function golpeVisual(id, de, fuerte) {", """const TAJO_B = {enano: 'ap_enano_tajo', orco: 'ap_orco_tajo', gollum: 'ap_gollum_tajo', rohan: 'ap_rohan_tajo'};
function basicoFx(v, o, n, rot) {
  if (!v || !o || v.k !== 'h') return; const H = HEROES[v.tipo]; if (!H) return;
  const espera = Math.min(150, 120 / Math.max(0.6, H.vatq));
  setTimeout(() => {const p = o.raiz.position, r = rot ?? o.rv ?? 0, dx = Math.sin(r), dz = Math.cos(r), lado = n % 2 ? 1 : -1;
    /* 17/11 (Henar: «los básicos no se ven bien»): además del tajo en el suelo (que el propio héroe tapaba), otro de pie delante, a la altura del pecho, y más grandes */
    if (v.tipo === 'enano') {abanico('ap_enano_tajo', p.x + dx * 0.45, p.z + dz * 0.45, r + lado * 0.18, H.alcance + 1.2, 1.15); abanico('ap_enano_tajo', p.x + dx * 0.45, p.z + dz * 0.45, r - lado * 0.18, H.alcance + 0.6, 0.12); brillaArmadura(o, '#7fd0ff', 0.25, 0.28);}
    else if (TAJO_B[v.tipo]) {const d = Math.min(H.alcance, 2.4) * 0.8; flip(TAJO_B[v.tipo], p.x + dx * d * 0.6, p.z + dz * d * 0.6, 3.4 + H.alcance * 0.7, true, r - Math.PI / 2 + lado * 0.35); flip(TAJO_B[v.tipo], p.x + dx * (d + 0.3), p.z + dz * (d + 0.3), 2.4 + H.alcance * 0.4, false, undefined, 1.15);}
    else if (v.tipo === 'elfo') {flip('ap_elfo_fogonazo', p.x + dx * 1.2, p.z + dz * 1.2, 2.4, false, undefined, 1.25); o.kb = {x: -dx * 0.25, z: -dz * 0.25, t: 0.12, d: 0.12};}
    else if (v.tipo === 'gandalf') {flip('fuego', p.x + dx * 0.9, p.z + dz * 0.9, 1.9, false, undefined, 1.3, 0.35); flip('ap_gandalf_impacto', p.x + dx * 0.9, p.z + dz * 0.9, 1.3, false, undefined, 1.3);}
    else if (v.tipo === 'hobbit') {flip('tArco', p.x + dx * 0.8, p.z + dz * 0.8, 2.8, true, r - Math.PI / 4); flip('ap_hobbit_impacto', p.x + dx * 0.9, p.z + dz * 0.9, 1.2, false, undefined, 0.6);}
  }, espera);
}
function golpeVisual(id, de, fuerte) {""")
js = sub(js, "o.ocup = animaClip(o, n, Math.max(1.15, 0.55 * H.vatq * 1.6)) * 0.9;}", "o.ocup = animaClip(o, n, Math.max(1.15, 0.55 * H.vatq * 1.6)) * 0.9; basicoFx(v, o, v.ac);}")
js = sub(js, "o.predAc = (o.predAc || 0) + 1; o.predT = ahora; o.sqA = 0.1; o.sqT = o.sqD = 0.22;", "o.predAc = (o.predAc || 0) + 1; o.predT = ahora; o.sqA = 0.1; o.sqT = o.sqD = 0.22; basicoFx(v, o, (v.ac || 0) + o.predAc, obj ? Math.atan2((obj.xi ?? obj.x) - MIO.x, (obj.zi ?? obj.z) - MIO.z) : MIO.rot);")
# la chispa del que recibe, más grande si pega un héroe
js = sub(js, "flip(fuerte ? 'critico' : 'chispa', (v.xi ?? v.x) + rnd(-0.3, 0.3), (v.zi ?? v.z) + rnd(-0.3, 0.3), fuerte ? 2 : 1.3);",
         "{const va = VISTA.get(de), deH = va && va.k === 'h'; flip(fuerte ? 'critico' : 'chispa', (v.xi ?? v.x) + rnd(-0.3, 0.3), (v.zi ?? v.z) + rnd(-0.3, 0.3), fuerte ? 2.4 : deH ? 1.9 : 1.3, false, undefined, deH ? 1.3 : undefined);}")

# ---------- RENDIMIENTO (17/11): cada héroe de A-6 venía en 12-16 trozos con la misma textura (= 12-16 dibujos, y otros tantos en
# la sombra). Al cargarlo se juntan en 2 (metal y resto) sin cambiar cómo se ve; los decorados pequeños ya no echan sombra.
js = sub(js, "function montar(n, altura) {\n", """function juntaPiezas(n) {
  const sc = M[n] && M[n].scene; if (!sc || sc.userData.juntado || !/^ap_/.test(n)) return; sc.userData.juntado = true;
  const grupos = new Map();
  sc.traverse((o) => {if (!o.isSkinnedMesh || !o.parent) return; const m = o.material, k = o.parent.uuid + '|' + o.skeleton.uuid + '|' + (m.map ? m.map.uuid : '-') + '|' + (m.metalness > 0.3 ? 'met' : 'mate') + '|' + !!m.transparent; (grupos.get(k) || grupos.set(k, []).get(k)).push(o);});
  for (const lista of grupos.values()) {
    if (lista.length < 2) continue; const a = lista[0];
    let g = null; try {g = mergeGeometries(lista.map((o) => {const q = o.geometry.clone(); for (const k of Object.keys(q.attributes)) if (!a.geometry.attributes[k]) q.deleteAttribute(k); return q;}), false);} catch (e) {g = null;}
    if (!g) continue;
    const r = lista.reduce((s, o) => s + o.material.roughness, 0) / lista.length, mt = lista.reduce((s, o) => s + o.material.metalness, 0) / lista.length;
    const mat = a.material.clone(); mat.roughness = r; mat.metalness = mt; mat.color.set('#ffffff');
    const j = new THREE.SkinnedMesh(g, mat); j.name = a.name; j.position.copy(a.position); j.quaternion.copy(a.quaternion); j.scale.copy(a.scale);
    a.parent.add(j); j.bind(a.skeleton, a.bindMatrix); for (const o of lista) o.parent.remove(o);
  }
}
function montar(n, altura) {
  juntaPiezas(n);
""")

# torres, nexos y fuentes: 21 materiales con la MISMA textura que solo cambian en lo metálico y en el brillo propio; se igualan
# (uno por textura + metal + brillo) para que fusiona() los junte: de 8-16 dibujos por edificio a 3-5
js = sub(js, "c.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true;}}); return c;",
         "c.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true;}}); if (archivo === 'ap_estructuras') unificaMats(c); return c;")
js = sub(js, "function pieza(archivo, nombre) {", """const MAT_UNI = new Map();
function unificaMats(raiz) {raiz.traverse((q) => {if (!q.isMesh || Array.isArray(q.material) || !q.material.isMeshStandardMaterial) return; const m = q.material, k = (m.map ? m.map.uuid : '-') + '|' + Math.round(m.metalness * 3) + '|' + m.emissive.getHexString() + '|' + m.transparent; if (!MAT_UNI.has(k)) {const n = m.clone(); n.metalness = Math.round(m.metalness * 3) / 3; MAT_UNI.set(k, n);} q.material = MAT_UNI.get(k);});}
function pieza(archivo, nombre) {""")

# ---------- FLUIDEZ (17/11, Henar: «que vaya fluido»): la pasada de la sombra dibujaba otra vez todo el decorado (56.000 triángulos
# de coches, conos, quitamiedos, señales…). Ahora solo echan sombra lo alto (≥ 2,2 m: farolas, camiones, árboles, edificios) y
# los personajes; lo bajo pega al suelo y su sombra casi no se ve.
js = sub(js, "  fusiona(MAPA_G);\n", """  {const bb = new THREE.Box3(); MAPA_G.updateMatrixWorld(true); MAPA_G.traverse((q) => {if (!q.isMesh || q.isInstancedMesh || q.isSkinnedMesh || !q.castShadow) return; bb.setFromObject(q); if (bb.max.y - Math.max(0, bb.min.y) < 2.2) q.castShadow = false;});}
  fusiona(MAPA_G);
""")

# los proyectiles propios (bola, brasa, bala…) también se calientan en la pantalla VS: antes el primer disparo subía su dibujo y
# compilaba su material en plena pelea (tirón en el primer básico)
js = sub(js, "  try {for (const n in FB) {flip(n, 0, 0, 0.01, false, 0, -40, 0.3); flip(n, 0, 0, 0.01, true, 0, -40, 0.3);}} catch (e) {}",
         "  try {for (const n in FB) {flip(n, 0, 0, 0.01, false, 0, -40, 0.3); flip(n, 0, 0, 0.01, true, 0, -40, 0.3);}} catch (e) {}\n  try {for (const n in PROY_AP) {const o = proyAP(n); o.position.set(0, -40, 0); scene.add(o); setTimeout(() => scene.remove(o), 1500);}} catch (e) {}")

# ---------- PACK 30 ART (17/11, Henar: «rehacer la vida y el maná, que no se salga»): una placa por héroe con la vida y la energía DENTRO.
# tools/autopista/procesa_pack30.py quita el magenta y mide las ventanas (placa 1396x227): vida x 10,67-89,33 % · y 17,6-59,9 %;
# energía y 70,0-88,8 %. La barra de vida (i) ocupa justo su ventana y la placa va encima con márgenes negativos en % de la ventana.
# El líquido es un degradado de momento: cuando lleguen las imágenes 2-4 del pack (líquidos viscosos) se cambia por la textura.
html = sub(html, '</head>', """<style>
/* A-6 · Pack 30: placa de vida + energía */
.bv.h i{z-index:auto !important;width:86px !important;height:7.4px !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;background:#06090f !important;overflow:visible !important}
.bv.h.yo i{width:100px !important;height:8.6px !important}
.bv.h i::before{content:'' !important;position:absolute !important;left:-13.57% !important;right:-13.57% !important;top:-41.7% !important;bottom:-94.8% !important;background:url(ui/ap_placa_azul.webp) center/100% 100% no-repeat !important;z-index:3 !important;pointer-events:none}
.bv.h.e1 i::before{background-image:url(ui/ap_placa_rojo.webp) !important}
.bv.h.yo i::before{background-image:url(ui/ap_placa_yo.webp) !important}
.bv.h i u,.bv.h i s{border-radius:0 !important}
/* líquido: brillo de tubo arriba, cuerpo y fondo oscuro, con un reflejo que pasa despacio */
.bv.h i u{background:linear-gradient(180deg,#eaffd6 0,#9bff5e 22%,#3fd426 52%,#1f9a14 78%,#0f5e0a 100%) !important;box-shadow:inset 0 -1px 0 #0006}
.bv.h.e0:not(.yo) i u{background:linear-gradient(180deg,#e2f6ff 0,#7fdcff 22%,#2aa6f0 52%,#1767b8 78%,#0b3a72 100%) !important}
.bv.h.e1 i u{background:linear-gradient(180deg,#ffe0dc 0,#ff7a6a 22%,#e5281c 52%,#a3140c 78%,#5e0805 100%) !important}
.bv.h i u::before{content:'';position:absolute;left:0;right:0;top:12%;height:22%;background:linear-gradient(90deg,#fff0 0,#fff9 50%,#fff0 100%) 0 0/40px 100% repeat-x;animation:apBrillo 2.4s linear infinite;opacity:.8}
@keyframes apBrillo{to{background-position:40px 0}}
.bv.h i s{background:#fff6 !important}
.bv.h i::after{opacity:.35}
.bv.h .mn{width:86px !important;height:3.3px !important;margin-top:1.8px !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;background:#06090f !important;position:relative;z-index:2}
.bv.h.yo .mn{width:100px !important;height:3.8px !important;margin-top:2.1px !important}
.bv.h .mn u{background:linear-gradient(180deg,#ffe0f8 0,#ff6fe0 30%,#e0189a 70%,#8a0a5e 100%) !important}
.bv.h b{margin-bottom:5px !important}
/* imágenes 2-4: líquido viscoso de verdad (textura que fluye despacio) y la punta redondeada donde se acaba */
.bv.h i u,.bv.h .mn u{position:relative;overflow:visible;background:url(ui/ap_liq_verde.webp) 0 0/auto 100% repeat-x !important;box-shadow:none !important;animation:apLiq 7s linear infinite}
.bv.h.e0:not(.yo) i u{background-image:url(ui/ap_liq_azul.webp) !important}
.bv.h.e1 i u{background-image:url(ui/ap_liq_rojo.webp) !important}
.bv.h .mn u{background-image:url(ui/ap_liq_fucsia.webp) !important;animation-duration:9s}
@keyframes apLiq{to{background-position:-138px 0}}
.bv.h i u::before{content:none !important}
.bv.h i u::after,.bv.h .mn u::after{content:'';position:absolute;top:-6%;bottom:-6%;left:calc(100% - 2px);aspect-ratio:3/4;background:url(ui/ap_liq_punta_verde.webp) 0 0/100% 100% no-repeat}
.bv.h.e0:not(.yo) i u::after{background-image:url(ui/ap_liq_punta_azul.webp)}
.bv.h.e1 i u::after{background-image:url(ui/ap_liq_punta_rojo.webp)}
.bv.h .mn u::after{background-image:url(ui/ap_liq_punta_fucsia.webp)}
.bv.h .mn{overflow:visible !important}
</style>
</head>""", donde='html')

# ---------- DALINAR (17/11, Henar: «Brask es una kk de nombre, llámale Dalinar; es mucho más pequeño que todos»): el modelo ap_brask
# tiene en reposo algo muy alto (la caja de reposo mide 1,83 veces lo que mide andando), así que salía a ~0,6 de los demás.
# AJ_ALTO corrige la altura medida de ese modelo: ahora mide sus 2,45 m (×ESC_H) de verdad, más alto que el resto como tanque que es.
js = sub(js, "function alto(n) {if (!ALTO[n]) {const b = new THREE.Box3().setFromObject(M[n].scene, ['draco', 'huorn', 'crebain', 'nutria', 'sapo', 'uruk_azul'].includes(n)); ALTO[n] = Math.max(0.5, b.max.y - b.min.y);} return ALTO[n];}",
         "const AJ_ALTO = {ap_brask: 1.83};\nfunction alto(n) {if (!ALTO[n]) {const b = new THREE.Box3().setFromObject(M[n].scene, ['draco', 'huorn', 'crebain', 'nutria', 'sapo', 'uruk_azul'].includes(n)); ALTO[n] = Math.max(0.5, b.max.y - b.min.y) / (AJ_ALTO[n] || 1);} return ALTO[n];}")

# ---------- HITBOX Y FLECHAS DE APUNTAR (17/11, Henar: «no se siente que le estés dando, las hitbox raras, las flechas salen muy gordas,
# pixeladas o raras»). (1) La flecha de una habilidad en línea se dibujaba a 5 × ancho (2,5 veces más ancha que lo que golpea): apuntabas con
# el borde y fallabas. Ahora la FRANJA dibujada (medida en cada imagen: IND_BANDA) mide justo lo que golpea: 2 × (ancho + radio del héroe).
# (2) El héroe se ve a ×1,28 pero su radio de golpe era 0,6: ahora 0,75 (en la simulación, también en el servidor). (3) Las marcas se ven
# en ángulo: filtro anisótropo para que no salgan borrosas ni a escalones. (4) La flecha del básico, fina (0,4 m).
def bandas():
    from PIL import Image
    import numpy as np
    out = {}
    for f in sorted(pathlib.Path('public/batalla/ui').glob('ap_ind_*.webp')):
        im = Image.open(f)
        if im.width < im.height * 2: continue          # conos y círculos: no son flechas
        a = np.array(im.getchannel('A')).astype(int); col = a[:, int(a.shape[1] * 0.4)]; ys = np.where(col > 60)[0]
        if len(ys): out[f.stem] = round((ys.max() - ys.min() + 1) / a.shape[0], 3)
    return out
import json as _json
js = sub(js, "function radio(u) {return u.rad || (u.k === 'h' ? 0.6 : 0.5);}", "function radio(u) {return u.rad || (u.k === 'h' ? 0.75 : 0.5);}")
js = sub(js, "function marcaH(tipo, k, forma) {", "const IND_BANDA = " + _json.dumps(bandas()) + ";\nfunction marcaH(tipo, k, forma) {")
js = sub(js, "const t = cargaTex('../batalla/ui/' + n + '.webp'), g = new THREE.PlaneGeometry(1, 1);", "const t = cargaTex('../batalla/ui/' + n + '.webp'), g = new THREE.PlaneGeometry(1, 1); t.anisotropy = renderer.capabilities.getMaxAnisotropy();")
js = sub(js, "const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, opacity: 0.8})); m.renderOrder = 4; m.visible = false; scene.add(m); MIRA_H[n] = m;}",
             "const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, opacity: 0.85})); m.renderOrder = 4; m.visible = false; m.userData.banda = IND_BANDA[n] || 0.35; scene.add(m); MIRA_H[n] = m;}")
js = sub(js, "f.scale.set(alc, 1, an);", "f.scale.set(alc, 1, propia ? (H.ancho ? 2 * (H.ancho + 0.75) : H.tipo === 'dash' ? (H.dano ? 3.2 : 0.9) : 1.2) / propia.userData.banda : an);")
js = sub(js, "f.scale.set(alc, 1, f === mira.flecha ? 1.2 : 0.9);", "f.scale.set(alc, 1, f === mira.flecha ? 1.2 : 0.4 / (f.userData.banda || 0.45));")

# ---------- PACK 32 ART imagen 1 (17/11, Henar: «las flechas que no te gusten, rehazlas»): flecha de apuntar EN PIEZAS, blanca y teñida del
# color del héroe con mezcla de luz: inicio en los pies + cuerpo que se REPITE (no se estira) + punta con la punta en el alcance. La franja
# del cuerpo mide justo lo que golpea. tools/autopista/pack32/flecha.png → ui/ap_fl_{cuerpo,inicio,punta}.webp (procesa_pack32.py).
# Medidas en píxeles del original: cuerpo 1056x103 (franja 82,5 entre las dos líneas, 11 chevrones de 96); punta 318x320 (rectángulo de
# 155 de alto que empieza en x=6, punta en x=312); inicio 192x200 (líneas a 100, extremo abierto en x=187).
js = sub(js, "function marcaH(tipo, k, forma) {", r"""const COLOR_FL = {enano: '#9bdcff', gandalf: '#ff8a3a', orco: '#7dff5a', elfo: '#ff5a4a', hobbit: '#c4ff6a', gollum: '#c88bff', rohan: '#ffcf7a'};
const FL = {};
function flechaAP(tipo, x, z, wx, wz, alc, W) {
  if (!FL.g) {
    FL.g = new THREE.Group(); FL.g.renderOrder = 5;
    const pieza = (n, rep) => {const t = cargaTex('../batalla/ui/' + n + '.webp'); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); if (rep) t.wrapS = THREE.RepeatWrapping; const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95})); m.renderOrder = 5; FL.g.add(m); return m;};
    FL.cuerpo = pieza('ap_fl_cuerpo', true); FL.punta = pieza('ap_fl_punta'); FL.inicio = pieza('ap_fl_inicio'); scene.add(FL.g);
  }
  const c = COLOR_FL[tipo] || '#ffffff'; for (const m of [FL.cuerpo, FL.punta, FL.inicio]) m.material.color.set(c).multiplyScalar(2.2);
  const k = W / 82.5, kh = W / 155, ks = W / 100, finCuerpo = Math.max(0.05, alc - 306 * kh + 2 * kh);
  FL.punta.scale.set(318 * kh, 1, 320 * kh); FL.punta.position.set(alc - (312 - 159) * kh, 0, 0);
  FL.cuerpo.scale.set(finCuerpo, 1, 103 * k); FL.cuerpo.position.set(finCuerpo / 2, 0, 0); FL.cuerpo.material.map.repeat.x = finCuerpo / (1056 * k); FL.cuerpo.material.map.offset.x = -(performance.now() / 1000) * 0.6 % 1;
  FL.inicio.scale.set(192 * ks, 1, 200 * ks); FL.inicio.position.set((96 - 187) * ks, 0, 0);
  FL.g.position.set(x, 0.11, z); FL.g.rotation.y = Math.atan2(-wz, wx); FL.g.visible = true; FL.vivo = performance.now();
}
function marcaH(tipo, k, forma) {""")
js = sub(js, "function animaRafagas(dt) {", "function animaRafagas(dt) {\n  if (FL.g && FL.g.visible && performance.now() - FL.vivo > 80) FL.g.visible = false;")
js = sub(js, "else {const f = propia || mira.flecha, an = (H.ancho ? H.ancho * 2 : H.tipo === 'dash' ? (H.dano ? 3.2 : 1.1) : 1.4) * 2 * (propia ? 1.25 : 1); /* ancho real de lo que golpea: la carga hiere a 1,6 m de cada lado; el paso élfico no hiere */ f.visible = true; f.scale.set(alc, 1, propia ? (H.ancho ? 2 * (H.ancho + 0.75) : H.tipo === 'dash' ? (H.dano ? 3.2 : 0.9) : 1.2) / propia.userData.banda : an); f.position.set(x + wx * alc / 2, 0.11, z + wz * alc / 2); f.rotation.y = Math.atan2(-wz, wx);}",
             "else {if (propia) propia.visible = false; flechaAP(t, x, z, wx, wz, alc, H.ancho ? 2 * (H.ancho + 0.75) : H.tipo === 'dash' ? (H.dano ? 3.2 : 0.9) : 1.2);}")
js = sub(js, "const f = marcaH(v.tipo, 'basico', 'flecha') || mira.flecha; f.visible = true; f.scale.set(alc, 1, f === mira.flecha ? 1.2 : 0.4 / (f.userData.banda || 0.45)); f.position.set(x + wx * alc / 2, 0.1, z + wz * alc / 2); f.rotation.y = Math.atan2(-wz, wx);",
             "flechaAP(v.tipo, x, z, wx, wz, alc, 0.55);")
js = sub(js, "function ocultaMira() {", "function ocultaMira() {if (FL.g) FL.g.visible = false; ")

# ---------- ICONOS QUE LLENAN EL ARO (18/11, Henar: «los botones de habilidad no llegan hasta el final del aro; calcula y pon un tamaño igual
# para todos»). Medido: el hueco de los aros (`ap_aro_hab`, `_lista`, `_ulti`, `_hechizo`) es el 77,3 % de su imagen y el aro se pinta a
# 1,22 × el botón (inset −11 %), así que el hueco = 0,943 del botón. Los iconos de habilidad tienen su dibujo en el 88-90 % de la imagen
# (antes al 88 % del botón: el dibujo se quedaba en el 0,79 y dejaba un anillo oscuro de ~4 px). Ahora el dibujo llega a 0,96 (pasa
# un pelo por debajo del aro): habilidades al 108 % (inset −4 %), hechizos (dibujo al 98-100 %) al 98 % (inset 1 %).
html = sub(html, '</head>', """<style>
/* A-6 · iconos que llenan el aro */
.hb[data-k] img,#bR img{inset:-4% !important;width:108% !important;height:108% !important}
.hb.hs img{inset:1% !important;width:98% !important;height:98% !important}
</style>
</head>""", donde='html')

# ---------- MANDOS EN ARCO (17/11, Henar: «es una chapuza»: botones pisándose) ----------
# Esquema fijo como el del Wild Rift alrededor del ataque (abajo a la derecha): Q a la izquierda, W en diagonal, E encima y la R
# más afuera; el «+» como insignia arriba a la izquierda de cada habilidad; torre y soldados pegados al ataque; hechizos, BASE y
# baliza en fila a la izquierda de la Q. Medidas = centro de cada botón contado desde la esquina de #mandos (que no recibe toques;
# solo sus botones). Los aros visibles salen un 11 % por fuera del botón: los centros están separados para que no se toquen.
MANDO_POS = {  # id: (centro desde la derecha, centro desde abajo, tamaño)
    'bAt': (66, 62, 92), 'bQ': (179, 78, 62), 'bW': (142, 147, 62), 'bE': (70, 176, 62), 'bR': (186, 230, 66),
    'mq': (204, 103, 30), 'mw': (167, 172, 30), 'me': (95, 201, 30), 'mr': (213, 257, 30),
    'bAtT': (26, 131, 36), 'bAtS': (137, 29, 36),
    'bF': (252, 34, 46), 'bD': (306, 34, 46), 'bAlm': (262, 100, 44), 'bEnc': (316, 100, 44),
}
_css = ['#mandos{right:calc(8px + var(--sar)) !important;bottom:calc(6px + var(--sab)) !important;width:340px !important;height:300px !important;pointer-events:none}',
        '#mandos > *{pointer-events:auto}']
for k, (cx, cy, t) in MANDO_POS.items():
    _css.append(f'body #mandos #{k}{{position:absolute !important;left:auto !important;top:auto !important;right:{cx - t / 2:g}px !important;bottom:{cy - t / 2:g}px !important;width:{t}px !important;height:{t}px !important;margin:0 !important;transform:none !important}}')
_css += [
    'body #mandos .mas{background-size:100% 100% !important;z-index:4}',
    # BASE a la izquierda de los hechizos, con su letrero encima (abajo no cabe)
    'body #bBase{right:calc(8px + 337px + var(--sar)) !important;bottom:calc(6px + 11px + var(--sab)) !important;width:46px !important;height:46px !important}',
    'body #bBase span{bottom:auto !important;top:-13px !important}',
    'body #mandos #retratos{right:250px !important;bottom:150px !important}',
]
html = sub(html, '</head>', '<style>\n/* A-6 · MANDOS EN ARCO */\n' + '\n'.join(_css) + '\n</style></head>', donde='html')

# ---------- SIN SIERRA NI BORROSO AL MOVERSE (18/11, Henar) ----------
# 1) la luz del sol seguía a la cámara en cada fotograma: los bordes de las sombras «reptaban» (sierra) al andar, y como la sombra se
#    repinta un fotograma sí y otro no, daba saltitos. Ahora el sol se recoloca a saltos de 6 m (la caja de sombra mide 60 m) y ese
#    fotograma la sombra se repinta sí o sí: entre salto y salto las sombras quietas no se mueven nada.
js = sub(js, "luces(); sol.position.set(camM.x + 10, 40, camM.z + 8); sol.target.position.set(camM.x, 0, camM.z);",
         "luces(); {const p = Math.round(camM.x / 6) * 6, q = Math.round(camM.z / 6) * 6; if (p !== SOL_C.x || q !== SOL_C.z) {SOL_C.x = p; SOL_C.z = q; SOL_C.forzar = true; sol.position.set(p + 10, 40, q + 8); sol.target.position.set(p, 0, q);}}")
js = sub(js, "renderer.shadowMap.needsUpdate = (SOMBRA_F = (SOMBRA_F + 1) % 2) === 0;",
         "renderer.shadowMap.needsUpdate = (SOMBRA_F = (SOMBRA_F + 1) % 2) === 0 || SOL_C.forzar; SOL_C.forzar = false;")
# 2) bordes de hojas, hierba y del suelo recortado (alphaTest) sin dientes: alpha-to-coverage usa el antialias que ya hay (casi gratis)
js = sub(js, "alphaTest: m.alphaTest, side: m.side", "alphaTest: m.alphaTest, alphaToCoverage: m.alphaTest > 0, side: m.side")
js = sub(js, "const m = new THREE.MeshLambertMaterial({map: rt.texture, alphaTest: 0.5});", "const m = new THREE.MeshLambertMaterial({map: rt.texture, alphaTest: 0.5, alphaToCoverage: true});")
# 3) texturas nítidas vistas de lado (asfalto, personajes, decorado): filtro anisótropo x4 por defecto
js = sub(js, "new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});",
         "new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'}); THREE.Texture.DEFAULT_ANISOTROPY = Math.min(4, renderer.capabilities.getMaxAnisotropy()); const SOL_C = {x: NaN, z: NaN, forzar: true};")

# ---------- HABILIDADES EN LÍNEA QUE VIAJAN DE VERDAD (18/11, Henar: «mejorar las hitboxes»; dentro de la simulación: sim_ap.js) ----------
# antes se decidía a quién daba EN EL MOMENTO de lanzar (con las posiciones de ese instante) y el daño llegaba después: si el rival se
# apartaba, le daba igual; si se metía en medio, no le daba. Ahora el disparo avanza 26 m/s cada paso y golpea a lo que toca por el
# camino (segmento contra círculo, ancho de la habilidad + radio del que recibe), como un skillshot del Wild Rift; también a los que
# estaban pegados al que lanza (antes solo valía lo que tenía delante del centro).
js = sub(js, '    const ex0 = h.x, ez0 = h.z; let golpeados = 0;\n    const lista = en().map((e) => ({e, t: (e.x - ex0) * dx + (e.z - ez0) * dz})).filter((o) => o.t > 0 && o.t < H.alc).sort((a, b) => a.t - b.t);\n    for (const o of lista) {const px0 = ex0 + dx * o.t, pz0 = ez0 + dz * o.t; if (Math.hypot(o.e.x - px0, o.e.z - pz0) < H.ancho + radio(o.e)) {const e = o.e; luego(o.t / 26, () => {' + "dana(h, e, n, T);", "{const p = {o: h.id, eq: h.eq, x: h.x - dx * 0.5, z: h.z - dz * 0.5, dx, dz, rec: -0.5, alc: H.alc, n, T, H, toc: []}; if (!(h.lat > 0 && avanzaTiroH(p, h.lat))) (S.tirosH = S.tirosH || []).push(p);} if (0) {const e = null; (() => {dana(h, e, n, T);")
js = sub(js, "}); golpeados++; if (!H.perfora) break;}}\n    ev(['tiro', H.proy, ex0, ez0, ex0 + dx * H.alc, ez0 + dz * H.alc, 26]);", "})}\n    ev(['tiro', H.proy, h.x, h.z, h.x + dx * H.alc, h.z + dz * H.alc, 26]);")
js = sub(js, "/* quemadura de la brasa del troll */", """mueveTirosH(dt); /* quemadura de la brasa del troll */""")
js = sub(js, "function usaHab(h, k, dx, dz, px, pz) {", """function golpeLinea(h, e, H, n, T) {dana(h, e, n, T); if (H.aturde && e.k !== 't') e.aturd = S.t + H.aturde; if (H.lento) frena(e, H.lento, H.durL); if (H.tira && e.vida > 0 && (e.k === 'h' || e.k === 's' || e.k === 'j')) {const l2 = Math.hypot(e.x - h.x, e.z - h.z) || 1, q = Math.max(0, l2 - 1.4); e.x -= (e.x - h.x) / l2 * q; e.z -= (e.z - h.z) / l2 * q; if (e.k === 'h') {e.dash = null; e.px = undefined;} limita(e); ev(['tp', e.id, e.x, e.z]);}}
function avanzaTiroH(p, dt) {/* true = se acaba */
  const h = S.porId.get(p.o), H = p.H, d = Math.min(26 * dt, p.alc - p.rec); if (!h || d <= 0) return true;
  for (const e of enemigosDe(p.eq)) {
    if (e.k === 'n' || (e.k === 't' && !atacable(e)) || e.vida <= 0 || e.muerto || p.toc.includes(e.id)) continue;
    const t = Math.max(0, Math.min(d, (e.x - p.x) * p.dx + (e.z - p.z) * p.dz));
    if (Math.hypot(p.x + p.dx * t - e.x, p.z + p.dz * t - e.z) < H.ancho + radio(e)) {p.toc.push(e.id); golpeLinea(h, e, H, p.n, p.T); if (!H.perfora) return true;}
  }
  p.x += p.dx * d; p.z += p.dz * d; p.rec += d; return p.rec >= p.alc - 1e-3;
}
function mueveTirosH(dt) {if (S.tirosH) for (let i = S.tirosH.length - 1; i >= 0; i--) if (avanzaTiroH(S.tirosH[i], dt)) S.tirosH.splice(i, 1);}
function usaHab(h, k, dx, dz, px, pz) {""")

# ---------- BATALLA 2 CONTRA 2 EN A-6 (18/11, Henar: «un mapa como el de La Brecha para dos jugadores, con su Nashor») ----------
# El mapa en «ojo» de La Brecha, igual en reglas (la simulación es la misma), pasado a autopista: dos calzadas curvas con sus líneas,
# jungla de tierra seca y pinar, río con la calzada pasando por encima. Jungla del LoL con bichos propios (Packs Autopista 33-36):
# Barón = NASOR (gusano del colector), dragón = LAGARTO DE LA CENTRAL (fuego/hielo), roja = TORO NEGRO, azul = COLOSO DEL DESGUACE,
# lobos = PERROS, rapaces = BUITRES, Gromp = JABALÍ, cangrejo = RATA. Plantas: boca de riego, máquina expendedora y radar de tráfico.
html = sub(html, '<span>2 contra 2 · el Ojo del Vado</span><small>Espesura, bestias y Uruk</small>',
           '<span>2 contra 2 · el nudo de la A-6</span><small>Jungla, bestias y Nasor</small>', donde='html')
html = sub(html, 'url(ui/carta_batalla.webp)', 'url(ui/ap_carta_duelo.webp)', 2, donde='html')
html = sub(html, 'content="Duelos 1 contra 1 en la autopista. ¡Entra y juega!"', 'content="Duelos 1 contra 1 y batallas 2 contra 2 en la autopista. ¡Entra y juega!"', donde='html')
html = sub(html, '</head>', """<style>
/* dos modos: Duelo y Batalla uno encima del otro, más bajitos */
#menu .modos{display:flex!important;flex-direction:column;gap:6px}
#menu .modos button{min-height:0!important}
#menu .modos button small{display:none!important}
</style></head>""", donde='html')
# los modelos de la jungla (se bajan solo para la Batalla y las salas)
js = sub(js, " 'huorn', 'crebain', 'draco', 'nutria', 'sapo', 'uruk_azul', 'palantir',",
         " 'ap_nasor', 'ap_lagarto', 'ap_toro', 'ap_coloso', 'ap_perro', 'ap_perro_jefe', 'ap_buitre', 'ap_jabali', 'ap_rata', 'ap_jungla', 'palantir',")
js = sub(js, "const JUNGLA = ['huorn', 'crebain', 'draco', 'nutria', 'sapo', 'uruk_azul', 'warg', 'huargo_alfa', 'troll', 'orco'];",
         "const JUNGLA = ['ap_nasor', 'ap_lagarto', 'ap_toro', 'ap_coloso', 'ap_perro', 'ap_perro_jefe', 'ap_buitre', 'ap_jabali', 'ap_rata', 'ap_jungla'];")
js = sub(js, "['draco', 'huorn', 'crebain', 'nutria', 'sapo', 'uruk_azul'].includes(n)", "/^ap_(nasor|lagarto|toro|coloso|perro|perro_jefe|buitre|jabali|rata)$/.test(n)")
# las bestias (mismos números; alto = lo que miden los modelos, para que salgan a escala 1)
for k, nom, mod, alto_ in [('warg', 'Perro asilvestrado', 'ap_perro', 1.2), ('orco', 'Perro asilvestrado', 'ap_perro', 1.2), ('troll', 'Toro negro', 'ap_toro', 2.86),
                           ('crebain', 'Buitre', 'ap_buitre', 0.3), ('sapo', 'Jabalí', 'ap_jabali', 1.4), ('huorn', 'Coloso del desguace', 'ap_coloso', 3.5),
                           ('draco', 'Lagarto de la central', 'ap_lagarto', 2.1), ('nutria', 'Rata de alcantarilla', 'ap_rata', 0.6),
                           ('alfa', 'Perro jefe', 'ap_perro_jefe', 2.0), ('uruk', 'Nasor', 'ap_nasor', 4.5)]:
    i0 = js.index('const NEUTRO = {'); i1 = js.index('\n};', i0)
    trozo, c = re.subn(r"(\n  " + k + r": \{nombre: ')[^']*('[^\n]*?modelo: ')[^']*(', alto: )[0-9.]+", lambda m: m.group(1) + nom + m.group(2) + mod + m.group(3) + str(alto_), js[i0:i1], count=1)
    js = js[:i0] + trozo + js[i1:]
    if c != 1: fallos.append('[2v2 bestia] ' + k)
# el lagarto: su material «brillo» se enciende naranja (fuego) o cian (hielo); el buitre ya no se pinta de negro (eso era el crebain)
js = sub(js, "if (NEUTRO[v.tipo].draco) tiñe(o.raiz, v.hk === 'h' ? '#8fd0ff' : '#ff5a24', 0.7);",
         "if (NEUTRO[v.tipo].draco) o.raiz.traverse((q) => {if (q.isMesh && q.material && q.material.name === 'brillo') {q.material = q.material.clone(); q.material.emissive.set(v.hk === 'h' ? '#00ddff' : '#ff7000'); q.material.emissiveIntensity = 2.5;}});")
js = sub(js, " if (v.tipo === 'crebain') o.raiz.traverse((q) => {if (q.isMesh) q.material.color.set('#2a2a30');});", "")
# textos
for v, n in [("Brasa del troll: tus golpes queman y frenan durante 90 s", "Brasa del toro: tus golpes queman y frenan durante 90 s"),
             ("Savia del Huorn: habilidades un 20 % más rápidas y más regeneración durante 90 s", "Turbo del coloso: habilidades un 20 % más rápidas y más regeneración durante 90 s"),
             ("Furia del Uruk: todo el equipo pega más, se cura más y sus hordas salen más fuertes durante 150 s", "Furia de Nasor: todo el equipo pega más, se cura más y sus soldados salen más fuertes durante 150 s"),
             ("' derriba al Uruk Azul'", "' derriba a Nasor'"), ("' caza al draco de fuego' : ' caza al draco frío'", "' caza al lagarto de fuego' : ' caza al lagarto de hielo'"),
             ("' consigue el ALMA DEL DRACO'", "' consigue el ALMA DEL LAGARTO'"), ("' caza a la nutria: santuario de velocidad y vista en el río'", "' caza a la rata: santuario de velocidad y vista en el río'"),
             ("'🔥 Un draco de fuego ha despertado junto al río' : '❄ Un draco frío ha bajado de las Montañas Grises'", "'🔥 Ha salido un lagarto de fuego en la central' : '❄ Ha salido un lagarto de hielo en la central'"),
             ("'¡El Uruk Azul ha despertado en su foso junto al río!'", "'¡Nasor ha salido del colector junto al río!'"), ("/Uruk Azul/.test(txt)", "/Nasor/.test(txt)"),
             ("['Foso del Uruk', 'el capitán de la Mano Blanca']", "['El colector', 'donde duerme Nasor']"), ("['Guarida del draco', 'bajó de las Montañas Grises']", "['La central eléctrica', 'la guarida del lagarto']"),
             ("['El Vado del Isen', 'los islotes del río']", "['El río', 'bajo la autopista']"), ("['Camino de los Rohirrim', ''] : ['Calzada de Isengard', '']", "['Calzada azul', ''] : ['Calzada roja', '']"),
             ("['Linde del Bosque de Fangorn', 'los árboles escuchan'] : ['Tierras Brunas', 'las colinas de los dunlendinos']", "['El pinar', 'lado azul'] : ['El descampado', 'lado rojo']"),
             ("'En la espesura (a los lados, cruzando los huecos de la empalizada) hay huargos: dan oro y experiencia'", "'En la jungla, entre las dos calzadas, hay perros, buitres y un jabalí: dan oro y experiencia'"),
             ("'El troll (oeste) y el huargo alfa (este) dan una bendición a todo tu equipo durante 90 s'", "'El toro negro y el coloso del desguace dan una bendición durante 90 s; Nasor y el lagarto, a todo tu equipo'")]:
    js = sub(js, v, n)
# iconos propios (Pack 36 ART: tools/autopista/procesa_pack36.py)
js = sub(js, "im = MM_IMG[n] = new Image(); im.src = 'ui/' + n + '.webp';", "im = MM_IMG[n] = new Image(); im.src = 'ui/ap_' + n + '.webp';")
js = sub(js, "sapo: 'huargo', orco: 'huargo', alfa: 'huargo'};", "sapo: 'jabali', orco: 'huargo', alfa: 'huargo'};")
js = sub(js, 'ui/bend_', 'ui/ap_bend_', 6)
js = sub(js, "cargaTex('../batalla/ui/pl_' + q.tipo + '.webp')", "cargaTex('../batalla/ui/ap_pl_' + q.tipo + '.webp')")
js = sub(js, "'ui/buff_troll.webp'", "'ui/ap_mm_troll.webp'")
js = sub(js, "g.strokeStyle = '#365a7a'; g.lineWidth = 6;", "g.strokeStyle = '#5d6674'; g.lineWidth = 6;")
# Castigo (Batalla, hay bestias) o Ignición (Duelo): el mismo botón cambia según el mapa
js = sub(js, "function ponMapa(modo) {\n  const tipo = modo === '2v2' ? 'ojo' : 'linea'; if (tipo === TIPO_MAPA) return false; TIPO_MAPA = tipo;",
         "function ponHechC(tipo) {Object.assign(HECHIZOS.c, tipo === 'ojo' ? {n: 'Castigo', cd: 60, icono: 'ui/ap_hz_castigo.webp'} : {n: 'Ignición', cd: 90, icono: 'ui/ap_hz_ignicion.webp'});}\n"
         "function ponMapa(modo) {\n  const tipo = modo === '2v2' ? 'ojo' : 'linea'; ponHechC(tipo); if (tipo === TIPO_MAPA) return false; TIPO_MAPA = tipo;")
js = sub(js, "  const el = $('elige'); eligeSel = heroeElegido;", "  ponHechC(modoElegido === '2v2' ? 'ojo' : 'linea');\n  const el = $('elige'); eligeSel = heroeElegido;")
# SUELO DEL OJO: calzadas de asfalto que siguen los caminos (borde blanco y doble línea amarilla), arcén, tierra seca, plaza de hormigón
i0 = js.index('      /* LA AUTOPISTA: arcén de tierra seca, calzada de asfalto')
js = js[:i0] + """      ${TIPO_MAPA === 'ojo' ? `
      vec3 seca=mix(texture2D(tH,w*.085).rgb,texture2D(tH,rw*.043+.31).rgb,smoothstep(.35,.65,fbm(w*.07+4.)))*vec3(.82,.95,.72);
      vec3 hierba=hi*mix(vec3(1.15,1.45,.75),vec3(1.4,1.5,.7),smoothstep(.35,.7,fbm(w*.09+9.)));
      vec3 col=mix(seca,hierba,smoothstep(.45,.75,fbm(w*.06+2.7))*.75);
      col=mix(col,ba*vec3(1.05,.98,.88),smoothstep(.62,.85,fbm(w*.05+1.3))*.55);
      vec3 asf=mix(texture2D(tB,w*.075).rgb,texture2D(tB,rw*.037+.5).rgb,.4)*1.12;
      float roadO=1.-smoothstep(4.55,4.85,dc), arcO=1.-smoothstep(5.,6.2,dc+fbm(w*.4)*.7);
      col=mix(col,ba*vec3(.85,.82,.78),arcO*.75); col=mix(col,asf,roadO);
      float gast=.55+.45*smoothstep(.25,.6,fbm(w*1.3));
      col=mix(col,vec3(.86,.85,.8),(1.-smoothstep(.07,.13,abs(dc-4.1)))*roadO*gast);
      col=mix(col,vec3(.9,.68,.16),(1.-smoothstep(.05,.09,abs(dc-.16)))*roadO*gast);
      col=mix(col,texture2D(tC,w*.13).rgb*.72,base);
      float hueco=1.;` : `float roadO=0.;`}
""" + js[i0:]
js = sub(js, "      float hueco=1.-(1.-tablero)*(1.-step(38.,abs(w.y)));  /* sobre el barranco: fuera del tablero no hay suelo */",
         "      float hueco=1.-(1.-tablero)*(1.-step(38.,abs(w.y)));  /* sobre el barranco: fuera del tablero no hay suelo */\n      `}")
js = sub(js, "      /* LA AUTOPISTA: arcén de tierra seca, calzada de asfalto", "      ${TIPO_MAPA === 'ojo' ? '' : `\n      /* LA AUTOPISTA: arcén de tierra seca, calzada de asfalto")
js = sub(js, "col=mix(col,agua,rio*.9*", "col=mix(col,agua,rio*.9*(1.-roadO)*")
# el agua animada tampoco pasa por encima de las calzadas (el río corre por debajo)
js = sub(js, "varying vec2 vW; uniform float uT; uniform vec2 uEje,uPit,uPit2; ${GLSL_RUIDO}",
         "varying vec2 vW; uniform float uT; uniform vec2 uEje,uPit,uPit2; uniform vec2 uA[7]; uniform vec2 uB[7]; ${GLSL_RUIDO}\n      float dSeg(vec2 p,vec2 a,vec2 b){vec2 v=b-a;float t=clamp(dot(p-a,v)/dot(v,v),0.,1.);return length(p-a-v*t);}\n      float dCar(vec2 p){float d=1e3;for(int i=0;i<6;i++){d=min(d,dSeg(p,uA[i],uA[i+1]));d=min(d,dSeg(p,uB[i],uB[i+1]));}return d;}")
js = sub(js, "*smoothstep(5.,7.5,length(w-uPit2));\n        if(rio<.02)discard;", "*smoothstep(5.,7.5,length(w-uPit2))*smoothstep(4.6,5.2,dCar(w));\n        if(rio<.02)discard;")
js = sub(js, "uPit2: {value: new THREE.Vector2(PIT2.x, PIT2.z)}, ...THREE.UniformsLib.fog},",
         "uPit2: {value: new THREE.Vector2(PIT2.x, PIT2.z)}, uA: {value: CARRILES[0].map((p) => new THREE.Vector2(p.x, p.z))}, uB: {value: CARRILES[1].map((p) => new THREE.Vector2(p.x, p.z))}, ...THREE.UniformsLib.fog},")
# árboles: en la Batalla se quedan TODOS (la simulación choca con ellos: sin dibujo serían paredes invisibles)
js = sub(js, "  for (const n in arboles) if (n.startsWith('pino')) instancias('vado_arboles', n, arboles[n].filter(",
         "  if (TIPO_MAPA === 'ojo') for (const n in arboles) instancias('vado_arboles', n, arboles[n]); else for (const n in arboles) if (n.startsWith('pino')) instancias('vado_arboles', n, arboles[n].filter(")
js = sub(js, "  if (TIPO_MAPA === 'linea') decoradoAutopista(pon2, al);", "  if (TIPO_MAPA === 'linea') decoradoAutopista(pon2, al); else decoradoOjo(pon2, al);")
# fuera los cubiles, braseros y piedras de vadear de La Brecha: sus sitios los ocupan las piezas del Pack 35
js = sub(js, "  for (const c of CAMPOS) {\n    if (NEUTRO[c.tipo].pasiva || c.tipo === 'huorn' || c.tipo === 'draco') continue;", "  for (const c of []) {\n    if (NEUTRO[c.tipo].pasiva || c.tipo === 'huorn' || c.tipo === 'draco') continue;")
js = sub(js, "  if (CAMPOS.some((c) => NEUTRO[c.tipo].jefe)) for (const P of [PIT, PIT2])", "  if (0) for (const P of [PIT, PIT2])")
js = sub(js, "for (const l of TIPO_MAPA === 'ojo' ? [0, 1] : []) {const L = CARRILES[l]; let mejor = 0;", "for (const l of []) {const L = CARRILES[l]; let mejor = 0;")
js = sub(js, "/* LA AUTOPISTA: quitamiedos a los dos lados, farolas,", """/* LA BATALLA (Pack Autopista 35): foso de Nasor, central del lagarto, cubiles, orillas del río, pasarelas; farolas y quitamiedos en las calzadas.
   ap_jungla llega con la jungla (después del mapa): si aún no está, se pone en cuanto llegue */
function decoradoOjo(pon2, al) {
  const G = MAPA_G;
  if (!M.ap_jungla) {const t = setInterval(() => {if (MAPA_G !== G) clearInterval(t); else if (M.ap_jungla) {clearInterval(t); decoradoOjo(pon2, al);}}, 400); return;}
  const pz = (n, x, z, ry, e = 1) => {const o = pieza('ap_jungla', n); o.position.set(x, 0.05, z); o.traverse((q) => {if (q.isMesh) for (const m of [].concat(q.material)) {m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2;}}); /* 18/11: el suelo de los fosos y cubiles estaba a la misma altura que el suelo del mapa y se veían rayas negras al moverse (z-fighting) */ o.rotation.y = ry; o.scale.setScalar(e); fusiona(o); G.add(o); return o;};
  const haciaCentro = (p) => Math.atan2(-p.x, -p.z);
  pz('foso_nasor', PIT.x, PIT.z, haciaCentro(PIT)); pz('guarida_lagarto', PIT2.x, PIT2.z, haciaCentro(PIT2));
  for (const c of CAMPOS) {const nd = NEUTRO[c.tipo]; if (nd.jefe || nd.draco || nd.pasiva) continue; pz(c.tipo === 'troll' ? 'cubil_toro' : c.tipo === 'huorn' ? 'cubil_coloso' : 'cubil', c.x, c.z, haciaCentro(c));}
  /* orillas del río: a los dos lados, siguiendo su curva, salvo donde pasan las calzadas y en los fosos */
  const pe = {x: -EJE.z, z: EJE.x};
  for (let a = -40; a <= 40; a += 10) for (const lado of [1, -1]) {
    let x = pe.x * a, z = pe.z * a; const ond = Math.sin(a * 0.22) * 0.9; x -= EJE.x * ond; z -= EJE.z * ond; x += EJE.x * 3.6 * lado; z += EJE.z * 3.6 * lado;
    if (!dentroOjo(x, z) || distCarril(x, z) < 7.5 || Math.hypot(x - PIT.x, z - PIT.z) < 9 || Math.hypot(x - PIT2.x, z - PIT2.z) < 9) continue;
    pz('rio_orilla', x, z, Math.atan2(pe.x, pe.z) + Math.PI / 2 + (lado > 0 ? Math.PI : 0));
  }
  for (const p of ORILLA) pz('puente_vado', p.x, p.z, Math.atan2(EJE.x, EJE.z) + Math.PI / 2);
  /* las calzadas: farolas a un lado cada ~16 m y quitamiedos donde cruzan el río */
  for (const l of [0, 1]) {
    for (let f = 0.12; f < 0.9; f += 0.11) {const p = puntoCarril(l, f), q = puntoCarril(l, f + 0.01), dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz) || 1, nx = dz / d, nz = -dx / d, sg = l ? -1 : 1;
      const x = p.x + nx * 5.6 * sg, z = p.z + nz * 5.6 * sg; if (Math.abs(ladoDe({x, z})) < 4 || BASES.some((b) => Math.hypot(b.torre.x - x, b.torre.z - z) < 6)) continue;
      const o = pon2('ap_farola', x, z, Math.atan2(-nx * sg, -nz * sg) + Math.PI / 2, 1); if (o) o.traverse((q) => {if (q.isMesh && q.material.emissive) q.material.emissiveIntensity = 2;});}
    let mejor = 0; for (let f = 0; f <= 1; f += 0.005) if (Math.abs(ladoDe(puntoCarril(l, f))) < Math.abs(ladoDe(puntoCarril(l, mejor)))) mejor = f;
    const p = puntoCarril(l, mejor), q = puntoCarril(l, mejor + 0.01), dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz) || 1, nx = dz / d, nz = -dx / d;
    for (const sg of [1, -1]) pon2('ap_quitamiedos', p.x + nx * 4.95 * sg, p.z + nz * 4.95 * sg, Math.atan2(dx, dz) + Math.PI / 2, 1);
  }
}
/* LA AUTOPISTA: quitamiedos a los dos lados, farolas,""")

# ---------- MENÚ COMPACTO (18/11, Henar: «los botones son enormes, no tiene sentido») ----------
html = sub(html, 'placeholder="Código de sala"', 'placeholder="Código"', donde='html')
# panel abajo a la derecha más estrecho: [Crear sala | código + Unirse], debajo el modo como dos pestañas (Duelo | Batalla)
# y abajo del todo JUGAR, ancho pero bajo (placa con border-image: no se deforma al cambiar de alto)
html = sub(html, '</head>', """<style>
#menu .mPanel{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr)!important;grid-template-areas:"crear amigos" "modo modo" "jugar jugar"!important;width:min(48%,430px)!important;gap:7px 8px!important}
#menu .modos{display:grid!important;grid-template-columns:1fr 1fr;gap:6px!important;flex-direction:unset}
#menu .modos button{height:46px!important;min-height:0!important;aspect-ratio:auto!important;padding:4px 8px!important;background-size:cover!important;background-position:center 70%!important;border-radius:10px!important;border:2px solid #ffffff22!important;filter:saturate(.6) brightness(.65);display:flex!important;flex-direction:column;justify-content:center;align-items:flex-start;box-shadow:inset 0 0 0 999px #0a0e1499}
#menu .modos button.on{filter:none;border-color:#ffd21f!important;box-shadow:inset 0 0 0 999px #0a0e1466,0 0 10px #ffd21f66}
#menu .modos button b{font-size:15px!important;line-height:1.1;margin:0!important;color:#fff!important}
#menu .modos button span{display:block!important;font-size:10px!important;opacity:.85;margin:0!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;color:#dfe8f2!important}
#menu .modos button small,#menu .modos button .mc{display:none!important}
#menu .jugar{height:58px!important;min-height:0!important;aspect-ratio:auto!important;background:none!important;border-style:solid!important;border-width:14px 26px!important;border-image:url(ui/ap_m_jugar.webp) 90 120 fill stretch!important;padding:0!important;display:flex!important;flex-direction:column;justify-content:center;align-items:center}
#menu .jugar b{font-size:24px!important;line-height:1!important;margin:0!important}
#menu .jugar small{font-size:10px!important;margin:0!important;line-height:1}
#menu #bCrear,#menu .mAmigos{height:40px!important;min-height:40px!important}
#menu #bCrear img{width:30px!important;height:30px!important}
#menu #bCrear b{font-size:13px!important}#menu #bCrear small{font-size:9.5px!important}
#menu .mAmigos input{min-width:0;font-size:12px!important;letter-spacing:.06em!important}
@media (max-height:440px){#menu .modos button{height:40px!important}#menu .jugar{height:52px!important}#menu #bCrear,#menu .mAmigos{height:36px!important;min-height:36px!important}}
</style></head>""", donde='html')

# ---------- MENÚ NEÓN (18/11, Henar: «más pequeño, colores rojo, azul y negro neón; el contra la máquina sale mal») ----------
# provisional con CSS hasta que llegue el kit del Pack Autopista 37 ART: placas negras con filo de neón (JUGAR rojo, lo demás azul)
html = sub(html, '</head>', """<style>
#menu .mPanel{width:min(40%,350px)!important;gap:6px!important;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr)!important}
#menu .jugar,#menu .modos button,#menu #bCrear,#menu .mAmigos,#menu #bUnir{border-image:none!important;border-style:solid!important;background-image:none!important;filter:none!important}
#menu .jugar{height:44px!important;border-width:2px!important;border-color:#ff2a4a!important;border-radius:8px!important;background:linear-gradient(180deg,#1a0a10,#07080c)!important;box-shadow:0 0 12px #ff2a4a99,inset 0 0 14px #ff2a4a44!important}
#menu .jugar b{font-size:20px!important;color:#fff!important;letter-spacing:.12em;text-shadow:0 0 8px #ff2a4a,0 0 2px #ff6a80}
#menu .jugar small,#menu .jugar i{display:none!important}
#menu .modos button{height:34px!important;border-width:1.5px!important;border-color:#2f8cff55!important;border-radius:7px!important;background:#07090ecc!important;box-shadow:none!important;align-items:center!important;opacity:.7}
#menu .modos button.on{opacity:1;border-color:#3aa0ff!important;box-shadow:0 0 10px #3aa0ff88,inset 0 0 10px #3aa0ff33!important}
#menu .modos button b{font-size:13px!important;text-shadow:0 0 6px #3aa0ff}
#menu .modos button span{display:none!important}
#menu #bCrear,#menu .mAmigos{height:34px!important;min-height:34px!important;border-width:1.5px!important;border-color:#3aa0ff88!important;border-radius:7px!important;background:#07090ecc!important;box-shadow:0 0 6px #3aa0ff44!important}
#menu #bCrear img{width:24px!important;height:24px!important}
#menu #bCrear b{font-size:12px!important;color:#fff!important}#menu #bCrear small{display:none!important}
#menu .mAmigos{padding:0 3px 0 0!important}
#menu .mAmigos input{background:transparent!important;color:#cfe6ff!important;font-size:11px!important}
#menu #bUnir{height:26px!important;min-height:0!important;margin:auto 0!important;padding:0 10px!important;border-width:1.5px!important;border-color:#ff2a4a!important;border-radius:5px!important;background:#1a0a10!important;color:#fff!important;font-size:11px!important;box-shadow:0 0 6px #ff2a4a77!important}
#menu .modos button.on{transform:none!important}
#menu .mAmigos #bUnir{width:auto!important;height:26px!important;padding:0 12px!important;background-image:none!important;background:#1a0a10!important;color:#fff!important;border-radius:5px!important}
@media (max-height:440px){#menu .jugar{height:40px!important}#menu .modos button,#menu #bCrear,#menu .mAmigos{height:31px!important;min-height:31px!important}}
</style></head>""", donde='html')

# ---------- PACK 37 ART (18/11): kit de botones del menú en neón (tools/autopista/procesa_pack37.py -> ui/ap_n_*.webp) ----------
# placas con border-image (las esquinas en chaflán no se deforman); Crear sala a su proporción con el icono en el hueco redondo
html = sub(html, '</head>', """<style>
#menu .jugar{border-width:11px 14px!important;border-image:url(ui/ap_n_jugar.webp) 70 78 fill stretch!important;border-color:transparent!important;background:none!important;box-shadow:none!important;border-radius:0!important}
#menu .jugar:active,#menu .jugar:hover{border-image-source:url(ui/ap_n_jugar_on.webp)!important}
#menu .jugar{animation:apJug 2.4s ease-in-out infinite}
@keyframes apJug{50%{border-image-source:url(ui/ap_n_jugar_on.webp)}}
#menu .modos button{border-width:8px 10px!important;border-image:url(ui/ap_n_tab.webp) 55 62 fill stretch!important;background:none!important;box-shadow:none!important;border-radius:0!important;opacity:.85}
#menu .modos button.on{border-image-source:url(ui/ap_n_tab_on.webp)!important;opacity:1;box-shadow:none!important}
#menu .mAmigos{border-width:5px 9px!important;border-image:url(ui/ap_n_tab.webp) 40 62 fill stretch!important;background:none!important;box-shadow:none!important;border-radius:0!important;padding:0!important}
#menu .mAmigos #bUnir,#menu #bUnir{border-width:4px 7px!important;border-image:url(ui/ap_n_unirse.webp) 40 56 fill stretch!important;background:none!important;box-shadow:none!important;border-radius:0!important;height:22px!important;line-height:1!important;font-size:11px!important;padding:0 6px!important;margin:auto 0!important}
#menu #bCrear{position:relative;overflow:visible!important;height:34px!important;min-height:34px!important;aspect-ratio:auto!important;border-style:solid!important;border-width:5px 8px 5px 34px!important;border-image:url(ui/ap_n_crear.webp) 34 40 34 199 fill stretch!important;background:none!important;box-shadow:none!important;border-radius:0!important;padding:0 0 0 6px!important;display:flex!important;align-items:center}
#menu #bCrear img{position:absolute!important;left:-31px;top:-2px;width:28px!important;height:28px!important;margin:0!important;border-radius:50%}
#menu #bCrear span{margin:0!important}
@media (max-height:440px){#menu #bCrear{height:32px!important;min-height:32px!important;border-left-width:32px!important}#menu #bCrear img{left:-29px;width:26px!important;height:26px!important}}
</style></head>""", donde='html')

# ---------- MENÚ CHILLÓN AL ESTILO WILD RIFT (18/11, Henar: «no me ha gustado; me gustan mucho más chillones los colores») ----------
# un solo bloque: arriba «DUELO · BATALLA» como texto con subrayado de neón; JUGAR rojo vivo que brilla; debajo Crear sala y el código
# como piezas pequeñas de filo neón (azul y fucsia). Sin placas dibujadas (el Pack 37 queda sin usar)
html = sub(html, '</head>', """<style>
#menu .mPanel{grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)!important;grid-template-areas:"modo modo" "jugar jugar" "crear amigos"!important;width:min(42%,360px)!important;gap:8px 8px!important}
#menu .modos{display:flex!important;justify-content:center;gap:22px!important;margin:0 0 2px!important}
#menu .modos button{width:auto!important;height:auto!important;min-height:0!important;border:0!important;border-image:none!important;background:none!important;box-shadow:none!important;padding:2px 2px 6px!important;opacity:.55;position:relative;filter:none!important}
#menu .modos button b{font:italic 900 17px 'Arial Black',system-ui,sans-serif!important;letter-spacing:.08em;text-transform:uppercase;color:#fff!important;text-shadow:0 0 6px #00c8ff,0 0 14px #00c8ff}
#menu .modos button::after{content:''!important;display:block!important;position:absolute;left:0;right:0;bottom:0;height:3px;border-radius:3px;background:#00e5ff;box-shadow:0 0 6px #00e5ff,0 0 14px #00e5ff;transform:scaleX(0);transition:transform .2s}
#menu .modos button.on{opacity:1}
#menu .modos button.on::after{transform:scaleX(1)}
#menu .jugar{height:50px!important;border:0!important;border-image:none!important;border-radius:6px!important;clip-path:polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px);background:linear-gradient(100deg,#ff0844 0%,#ff2a6d 55%,#ff5e3a 100%)!important;box-shadow:none!important;animation:apJug2 1.6s ease-in-out infinite!important}
#menu .jugar b{font:italic 900 24px 'Arial Black',system-ui,sans-serif!important;letter-spacing:.14em;color:#fff!important;text-shadow:0 2px 0 #7a0020,0 0 12px #fff8}
@keyframes apJug2{50%{filter:brightness(1.18) saturate(1.2)}}
#menu .jugarHalo{display:none}
#menu .mPanel::before{content:'';grid-area:jugar;align-self:stretch;margin:-6px;border-radius:12px;background:radial-gradient(closest-side,#ff1f5a88,transparent);filter:blur(6px);pointer-events:none;z-index:-1}
#menu #bCrear,#menu .mAmigos{height:34px!important;min-height:34px!important;border-style:solid!important;border-width:2px!important;border-image:none!important;border-radius:6px!important;background:#05060cdd!important}
#menu #bCrear{border-color:#00e5ff!important;box-shadow:0 0 8px #00e5ffaa,inset 0 0 8px #00e5ff44!important;padding:0 8px 0 4px!important;overflow:visible!important}
#menu #bCrear img{position:static!important;width:24px!important;height:24px!important;margin:0 6px 0 0!important}
#menu #bCrear b{font:800 12px system-ui,sans-serif!important;color:#e9fdff!important;letter-spacing:.04em}
#menu .mAmigos{border-color:#ff2bd6!important;box-shadow:0 0 8px #ff2bd6aa,inset 0 0 8px #ff2bd644!important;padding:0 3px 0 0!important}
#menu .mAmigos input{color:#ffe6fb!important;font:700 11px system-ui,sans-serif!important;letter-spacing:.1em!important}
#menu .mAmigos input::placeholder{color:#ff9bea!important}
#menu .mAmigos #bUnir,#menu #bUnir{height:24px!important;border:0!important;border-image:none!important;border-radius:4px!important;background:#ff2bd6!important;color:#fff!important;font:900 11px system-ui,sans-serif!important;padding:0 10px!important;box-shadow:0 0 10px #ff2bd6!important;margin:auto 0!important}
@media (max-height:440px){#menu .jugar{height:46px!important}#menu #bCrear,#menu .mAmigos{height:32px!important;min-height:32px!important}}
</style></head>""", donde='html')

# ---------- PACK 38 ART (18/11): botones chillones del menú (tools/autopista/procesa_pack38.py -> ui/ap_c_*.webp) ----------
# misma colocación que el MENÚ CHILLÓN; el halo de neón lo pone CSS (drop-shadow) porque sobre el verde no se podía recortar limpio
html = sub(html, '</head>', """<style>
#menu .jugar{clip-path:none!important;background:none!important;border-style:solid!important;border-width:9px 14px!important;border-image:url(ui/ap_c_jugar.webp) 34 48 fill stretch!important;border-radius:0!important;filter:drop-shadow(0 0 6px #ff1f5a) drop-shadow(0 0 14px #ff1f5a99)!important;animation:apJug3 1.6s ease-in-out infinite!important}
@keyframes apJug3{50%{border-image-source:url(ui/ap_c_jugar_on.webp);filter:drop-shadow(0 0 9px #ff3a7a) drop-shadow(0 0 22px #ff1f5acc)}}
#menu .mPanel::before{display:none!important}
#menu .modos button::after{height:7px!important;bottom:-2px!important;left:-14%!important;right:-14%!important;border-radius:0!important;background:url(ui/ap_c_raya.webp) center/100% 100% no-repeat!important;box-shadow:none!important;filter:drop-shadow(0 0 5px #00e5ff)}
#menu #bCrear{background:none!important;box-shadow:none!important;border-radius:0!important;border-style:solid!important;border-width:6px 12px 6px 34px!important;border-image:url(ui/ap_c_crear.webp) 30 40 30 165 fill stretch!important;filter:drop-shadow(0 0 5px #00e5ff);padding:0 0 0 6px!important;overflow:visible!important}
#menu #bCrear img{position:absolute!important;left:-30px;top:1px;width:24px!important;height:24px!important;margin:0!important;border-radius:50%}
#menu .mAmigos{background:none!important;box-shadow:none!important;border-radius:0!important;border-style:solid!important;border-width:6px 10px!important;border-image:url(ui/ap_c_codigo.webp) 30 40 fill stretch!important;filter:drop-shadow(0 0 5px #ff2bd6);padding:0!important}
#menu .mAmigos #bUnir,#menu #bUnir{background:none!important;box-shadow:none!important;border-radius:0!important;border-style:solid!important;border-width:5px 9px!important;border-image:url(ui/ap_c_unirse.webp) 30 40 fill stretch!important;height:22px!important;padding:0 4px!important;filter:drop-shadow(0 0 4px #ff2bd6)}
#menu #bGuia.mT{background:url(ui/ap_c_aro_cian.webp) center/100% 100% no-repeat!important;filter:drop-shadow(0 0 6px #00e5ff)}
#menu #bGuia img{width:72%!important;height:72%!important;margin:14%!important;border:0!important;box-shadow:none!important}
#menu #bSon{background:url(ui/ap_b_ajustes.webp) center/66% no-repeat,url(ui/ap_c_aro_fucsia.webp) center/100% 100% no-repeat!important;filter:drop-shadow(0 0 6px #ff2bd6)}
/* 18/11 (Henar): el fondo de tormenta un pelín menos oscuro, con más brillo y color */
#menu #mFondo .fc,#menu #mFondo .tL{filter:brightness(1.3) saturate(1.45) contrast(1.05)}
@media (max-height:440px){#menu #bCrear{border-left-width:32px!important}#menu #bCrear img{left:-29px;top:0;width:24px!important;height:24px!important}}
</style></head>""", donde='html')

# ---------- EN PARTIDA (18/11, Henar: «mejora el juego ingame»): que los héroes se lean y que la hierba se note ----------
# (1) filo de luz alrededor de cada héroe con el color de su equipo (tú dorado, aliados cian, enemigos rojo), como el contorno del
#     Wild Rift: en el puente oscuro los héroes de armadura negra (Dalinar) se perdían. Cada héroe lleva sus materiales propios.
# (2) si tu héroe (o un aliado) está en la hierba se vuelve medio transparente: así sabes que estás escondido.
# (3) fuera las manchas de aceite del Pack 10: desde arriba parecían agujeros negros en la calzada.
js = sub(js, "if (v.id === YO) o.aro.material.color.set('#ffd24a'); scene.add(o.aro);}",
         "if (v.id === YO) o.aro.material.color.set('#ffd24a'); scene.add(o.aro); rimHeroe(o, v.id === YO ? '#ffc23a' : v.eq === MI_EQ ? '#38c8ff' : '#ff3048');}")
js = sub(js, "function brillaArmadura(o, color, fuerza, dur) {", """function rimHeroe(o, color) {
  o.rimMats = []; o.matsPropios = [];
  const c = new THREE.Color(color);
  o.raiz.traverse((m) => {if (!m.isMesh || !m.material) return; const mats = Array.isArray(m.material) ? m.material : [m.material];
    const nuevos = mats.map((mt) => {const n = mt.clone(); n.userData.rim = {value: c}; n.userData.op = mt.opacity;
      n.onBeforeCompile = (sh) => {sh.uniforms.uRim = n.userData.rim;
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\\nuniform vec3 uRim;').replace('#include <dithering_fragment>', '#include <dithering_fragment>\\n#ifdef USE_RIM_A6\\n#endif\\n{float fr=1.-abs(dot(normalize(normal),normalize(vViewPosition)));gl_FragColor.rgb+=uRim*pow(fr,2.)*1.35;}');};
      n.customProgramCacheKey = () => 'rimA6'; o.rimMats.push(n); if (n.emissive) o.matsPropios.push(n); return n;});
    m.material = Array.isArray(m.material) ? nuevos : nuevos[0];});
}
function animaRim() {
  for (const [id, o] of VIS) {if (!o.rimMats) continue; const v = VISTA.get(id); if (!v) continue;
    const esc = v.eq === MI_EQ && HIERBAS.length && enHierba({x: v.xi ?? v.x, z: v.zi ?? v.z}) >= 0, op = esc ? 0.5 : 1;
    if (o.rimOp !== op) {o.rimOp = op; for (const m of o.rimMats) {m.transparent = op < 1 || m.userData.op < 1; m.opacity = op < 1 ? op : m.userData.op; m.depthWrite = op >= 1;}}}
}
function brillaArmadura(o, color, fuerza, dur) {""")
js = sub(js, "function camara(dt) {", "function camara(dt) {\n  try {animaRim();} catch (e) {}")
js = sub(js, "for (let i = 0; i < 9; i++) mete(P, 'mancha_aceite',", "for (let i = 0; i < 0; i++) mete(P, 'mancha_aceite',")

# ---------- PACK 40 ART (18/11): las torres disparan una bola de plasma, no un pedrusco en llamas (tools/autopista/procesa_pack40.py) ----------
# sprite animado (16 fotogramas en bucle, se suma como luz) que gira para que la cola quede detrás según va en pantalla;
# chispas eléctricas por el camino y al caer. El impacto propio (imagen 2) se usa en cuanto exista fx/ap_plasma_imp.webp
js = sub(js, "const h = HALO_T.clone(); h.scale.setScalar(0.45); o.add(h);",
         "scene.remove(o); const sp = plasmaSprite(); sp.scale.setScalar(3); pr.o = new THREE.Group(); pr.o.add(sp); scene.add(pr.o); pr.sp = sp;")
js = sub(js, "flip('explosion', e[2], e[3], 2, false, undefined, pr.y0, 0.35); suena('explosion', 0.35, e[2], e[3]);",
         "flip('chispa', e[2], e[3], 2.4, false, undefined, pr.y0, 0.35); suena('ap_luz', 0.3, e[2], e[3]);")
js = sub(js, "p.o.rotation.x += dt * 9; p.est -= dt; if (p.est <= 0) {p.est = 0.035; flip('fuego', p.x, p.z, 1.3, false, undefined, p.y, 0.35);}",
         "if (p.sp) animaPlasma(p, dt); p.est -= dt; if (p.est <= 0) {p.est = 0.08; flip('chispa', p.x, p.z, 0.9, false, undefined, p.y, 0.35);}")
js = sub(js, "if (p.torre) {flip('explosion', p.x, p.z, 2.6, false, undefined, 1, 0.5);",
         "if (p.torre) {flip(PLASMA.imp ? 'ap_plasma_imp' : 'chispa', p.x, p.z, PLASMA.imp ? 4.2 : 3, !!PLASMA.imp, undefined, PLASMA.imp ? undefined : 1, 0.5);")
js = sub(js, "function modeloProy(n) {", """const PLASMA = {tex: null, imp: false};
fetch('../batalla/fx/ap_plasma_imp.webp', {method: 'HEAD'}).then((r) => {if (r.ok && typeof FB === 'object') {PLASMA.imp = true; FB.ap_plasma_imp = ['../batalla/fx/ap_plasma_imp.webp', 4, 4]; FB_DUR.ap_plasma_imp = 0.6;}}).catch(() => {});
PLASMA.tex = cargaTex('../batalla/fx/ap_plasma.webp'); PLASMA.tex.repeat.set(0.25, 0.25); /* una sola textura para todas las bolas (clonarla la subiría otra vez a la gráfica): van al mismo fotograma */
function plasmaSprite() {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: PLASMA.tex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false}));
  sp.renderOrder = 6; return sp;
}
const _pA = new THREE.Vector3(), _pB = new THREE.Vector3();
function animaPlasma(p, dt) {
  const f = Math.floor(performance.now() / 45) % 16; PLASMA.tex.offset.set((f % 4) / 4, 1 - (Math.floor(f / 4) + 1) / 4);
  _pA.set(p.x, p.y, p.z).project(camera); _pB.set(p.tx ?? p.x, 1, p.tz ?? p.z).project(camera);
  p.sp.material.rotation = Math.atan2((_pB.y - _pA.y) * VH, (_pB.x - _pA.x) * VW);
}
function modeloProy(n) {""")

# ---------- PACK 42 ART (18/11): aro propio del botón de ataque básico para cada héroe (tools/autopista/procesa_pack42.py) ----------
# cada aro sale recortado con su hueco centrado y midiendo el 50 % del ancho; el dibujo del arma (ap_at_*) ocupa el 90 % del botón
# de 92 px → aro de 160 px centrado, por encima del botón y sin recibir toques
html = sub(html, '</head>', """<style>
#bAt{overflow:visible!important}
#bAt::after{content:'';position:absolute;left:50%;top:50%;width:160px;height:160px;margin:-80px 0 0 -80px;background:center/100% 100% no-repeat;pointer-events:none;z-index:2;filter:drop-shadow(0 2px 4px #000a)}
body[data-heroe=enano] #bAt::after{background-image:url(ui/ap_aro_at_enano.webp)}
body[data-heroe=gandalf] #bAt::after{background-image:url(ui/ap_aro_at_gandalf.webp)}
body[data-heroe=orco] #bAt::after{background-image:url(ui/ap_aro_at_orco.webp)}
body[data-heroe=elfo] #bAt::after{background-image:url(ui/ap_aro_at_elfo.webp)}
body[data-heroe=hobbit] #bAt::after{background-image:url(ui/ap_aro_at_hobbit.webp)}
body[data-heroe=gollum] #bAt::after{background-image:url(ui/ap_aro_at_gollum.webp)}
body[data-heroe=rohan] #bAt::after{background-image:url(ui/ap_aro_at_rohan.webp)}
#bAtT,#bAtS{z-index:3!important}
</style></head>""", donde='html')

# ---------- EN PARTIDA II (18/11, Henar: «mételos») ----------
# (1) el héroe ENEMIGO con el filo rojo más fuerte y más ancho que tus aliados: no se pierde entre sus soldados rojos
js = sub(js, "n.userData.rim = {value: c};", "n.userData.rim = {value: c}; n.userData.rimF = {value: color === '#ff3048' ? 2.4 : 1.35};")
js = sub(js, "sh.uniforms.uRim = n.userData.rim;", "sh.uniforms.uRim = n.userData.rim; sh.uniforms.uRimF = n.userData.rimF;")
js = sub(js, "'#include <common>\\nuniform vec3 uRim;'", "'#include <common>\\nuniform vec3 uRim; uniform float uRimF;'")
js = sub(js, "gl_FragColor.rgb+=uRim*pow(fr,2.)*1.35;", "gl_FragColor.rgb+=uRim*pow(fr,uRimF>2.?1.6:2.)*uRimF;")
# (2) de dónde te pegan: destello rojo en el borde de la pantalla del lado del que pega (si está fuera de la pantalla o cerca del borde)
html = sub(html, '</body>', '<div id="dirDolor"><i class="dI"></i><i class="dD"></i><i class="dA"></i><i class="dB"></i></div></body>', donde='html')
html = sub(html, '</head>', """<style>
#dirDolor{position:fixed;inset:0;pointer-events:none;z-index:6}
#dirDolor i{position:absolute;opacity:0;transition:opacity .45s ease-out}
#dirDolor i.on{opacity:1;transition:none}
#dirDolor .dI{left:0;top:0;bottom:0;width:18%;background:linear-gradient(90deg,#ff1e3ccc,#ff1e3c00)}
#dirDolor .dD{right:0;top:0;bottom:0;width:18%;background:linear-gradient(270deg,#ff1e3ccc,#ff1e3c00)}
#dirDolor .dA{left:0;right:0;top:0;height:22%;background:linear-gradient(180deg,#ff1e3ccc,#ff1e3c00)}
#dirDolor .dB{left:0;right:0;bottom:0;height:22%;background:linear-gradient(0deg,#ff1e3ccc,#ff1e3c00)}
/* (3) moneda que vuela al oro */
.monVuela{position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;background:url(ui/ap_obj_oro.webp) center/contain no-repeat;pointer-events:none;z-index:9;filter:drop-shadow(0 0 6px #ffd24a);transition:left .55s cubic-bezier(.5,-.3,.7,1),top .55s cubic-bezier(.3,.1,.7,1),transform .55s;transform:scale(1.1)}
#oro.cobra{animation:apCobra .3s}
@keyframes apCobra{40%{transform:scale(1.35);color:#fff36a}}
</style></head>""", donde='html')
js = sub(js, "  if (meDan) {const d = $('dolor'); d.style.opacity = 1; clearTimeout(d._t); d._t = setTimeout(() => {d.style.opacity = 0;}, 140);}\n}",
         "  if (meDan) {const d = $('dolor'); d.style.opacity = 1; clearTimeout(d._t); d._t = setTimeout(() => {d.style.opacity = 0;}, 140); dirDolor(de);}\n}\n"
         """const _dd = new THREE.Vector3();
function dirDolor(de) {
  const va = VISTA.get(de); if (!va) return; _dd.set(va.xi ?? va.x, 1, va.zi ?? va.z).project(camera);
  const x = _dd.x * (_dd.z > 1 ? -1 : 1), y = _dd.y * (_dd.z > 1 ? -1 : 1); if (Math.abs(x) < 0.8 && Math.abs(y) < 0.75) return;  /* lo ves: no hace falta */
  const cl = Math.abs(x) > Math.abs(y) ? (x < 0 ? 'dI' : 'dD') : (y > 0 ? 'dA' : 'dB'), el = document.querySelector('#dirDolor .' + cl); if (!el) return;
  el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 60);
}""")
# (3) al rematar, la moneda vuela desde el soldado hasta tu contador de oro
js = sub(js, "if (e[4] === 'o') {suena('moneda', 0.3); flip('monedas', e[1], e[2], 1.8, false, 0, 1.4);}",
         "if (e[4] === 'o') {suena('moneda', 0.3); flip('monedas', e[1], e[2], 1.8, false, 0, 1.4); monedaVuela(e[1], e[2]);}")
js = sub(js, "function numero(x, z, txt, cls) {", """function monedaVuela(x, z) {
  const oro = $('oro'); if (!oro || document.querySelectorAll('.monVuela').length > 6) return;
  _dd.set(x, 1.4, z).project(camera); const sx = (_dd.x + 1) / 2 * VW, sy = (1 - _dd.y) / 2 * VH, b = oro.getBoundingClientRect(), r = GIRO ? {left: b.top, top: innerWidth - b.right, height: b.width} : b;
  const m = document.createElement('i'); m.className = 'monVuela'; m.style.left = sx + 'px'; m.style.top = sy + 'px'; document.body.appendChild(m);
  requestAnimationFrame(() => requestAnimationFrame(() => {m.style.left = (r.left + 10) + 'px'; m.style.top = (r.top + r.height / 2) + 'px'; m.style.transform = 'scale(.6)';}));
  setTimeout(() => {m.remove(); oro.classList.remove('cobra'); void oro.offsetWidth; oro.classList.add('cobra');}, 560);
}
function numero(x, z, txt, cls) {""")
# (4) cámara 60/40: el héroe se queda en el 40 % de la pantalla del lado de donde viene y ve el 60 % hacia donde va (según hacia dónde camina)
js = sub(js, "  const {F} = ejes(), x = v.xi ?? v.x, z = v.zi ?? v.z, ade = CAM_FIN ? 0 : APAI ? 5 : 3;\n  camM.x += (x + F.x * ade - camM.x) * Math.min(1, dt * 6); camM.z += (z + F.z * ade - camM.z) * Math.min(1, dt * 6);",
         """  const {F, R} = ejes(), x = v.xi ?? v.x, z = v.zi ?? v.z;
  {const L = CAM_LEAD; if (L.x === undefined) {L.x = x; L.z = z; L.fx = F.x; L.fz = F.z;}
   const mx = x - L.x, mz = z - L.z, sp = Math.hypot(mx, mz) / Math.max(dt, 1e-3); L.x = x; L.z = z;
   if (sp > 1.2 && sp < 40) {const k = Math.min(1, dt * 3); L.fx += (mx / (sp * dt) - L.fx) * k; L.fz += (mz / (sp * dt) - L.fz) * k; const l = Math.hypot(L.fx, L.fz) || 1; L.fx /= l; L.fz /= l;}
   const z0 = ZOOMS[zoomI], dist = Math.hypot(z0[0], z0[1]), t = Math.tan(camera.fov * Math.PI / 360), sinP = z0[0] / dist,
     hw = dist * t * camera.aspect, hh = dist * t / sinP, fr = L.fx * R.x + L.fz * R.z, ff = L.fx * F.x + L.fz * F.z;
   const ox = CAM_FIN ? 0 : R.x * fr * 0.2 * hw + F.x * ff * 0.2 * hh, oz = CAM_FIN ? 0 : R.z * fr * 0.2 * hw + F.z * ff * 0.2 * hh;
   L.ox = (L.ox || 0) + (ox - (L.ox || 0)) * Math.min(1, dt * 2.5); L.oz = (L.oz || 0) + (oz - (L.oz || 0)) * Math.min(1, dt * 2.5);}
  camM.x += (x + CAM_LEAD.ox - camM.x) * Math.min(1, dt * 6); camM.z += (z + CAM_LEAD.oz - camM.z) * Math.min(1, dt * 6);""")
js = sub(js, "let CAM_FIN = null;", "let CAM_FIN = null; const CAM_LEAD = {};")

# ---------- PACKS 40 (imagen 2), 43 y 44 ART (18/11) ----------
# 40.2: impacto del plasma (fx/ap_plasma_imp.webp; el código ya lo usa si existe). 43: iconos de estado encima de la barra de vida
# de cada héroe (tools/autopista/procesa_pack43_44.py). La simulación manda en flagsE (campo 33) los estados que antes no viajaban:
# 4 frenado, 8 quemando, 16 sangrando, 32 más velocidad, 64 furia (dentro de la simulación: volver a sacar sim_ap.js).
js = sub(js, "(q.buf.estasis > 0 ? 1 : 0) | (q.buf.gargola > 0 ? 2 : 0)",
         "(q.buf.estasis > 0 ? 1 : 0) | (q.buf.gargola > 0 ? 2 : 0) | (q.buf.lento > 0 ? 4 : 0) | (q.quema && q.quema.hasta > S.t ? 8 : 0) | (q.sang && q.sang.hasta > S.t ? 16 : 0) | (q.buf.azogue > 0 || q.buf.alfa > 0 ? 32 : 0) | (q.buf.furiaO > 0 ? 64 : 0)")
js = sub(js, "    if (!b._u) {b._s = b.querySelector('s'); b._u = b.querySelector('u'); b._i = b.querySelector('i'); b._b = b.querySelector('b');}",
         "    if (!b._u) {b._s = b.querySelector('s'); b._u = b.querySelector('u'); b._i = b.querySelector('i'); b._b = b.querySelector('b');}\n    if (v.k === 'h') estadosBarra(b, v);")
js = sub(js, "function quitaVis(id) {", """function estadosBarra(b, v) {
  const f = v.flags || 0, e = v.flagsE || 0, l = [];
  if (f & 2) l.push('aturdido'); if (e & 4) l.push('lento'); if (e & 8) l.push('quema'); if (e & 16) l.push('sangra'); if (f & 4 || e & 2) l.push('escudo');
  if (f & 1 || (f & 8 && v.eq === MI_EQ)) l.push('invisible'); if (e & 32) l.push('velocidad'); if (e & 64) l.push('furia');
  const k = l.join(); if (b._est === k) return; b._est = k;
  let d = b._estD; if (!d) {d = b._estD = document.createElement('div'); d.className = 'est'; b.appendChild(d);}
  d.innerHTML = l.map((n) => '<img src="ui/ap_est_' + n + '.webp" alt="">').join('');
}
function quitaVis(id) {""")
html = sub(html, '</head>', """<style>
.bv.h{position:relative}
.bv .est{position:absolute;left:50%;bottom:calc(100% + 16px);transform:translateX(-50%);display:flex;gap:2px;pointer-events:none}
.bv .est img{width:22px;height:22px;filter:drop-shadow(0 1px 2px #000)}
.bv.yo .est img{width:26px;height:26px}
.bv .est img:first-child{animation:apEst .9s ease-out}
@keyframes apEst{0%{transform:scale(1.8);opacity:0}100%{transform:scale(1);opacity:1}}
/* derribado como en el Wild Rift (18/11, Henar: «al morir sale este pedazo de horror»): el velo de cristal roto (Pack 44) ya no se usa.
   La partida se sigue viendo en GRIS (el filtro del lienzo ya lo pone juego.js) con un viñeteado rojo
   suave en los bordes; arriba, una ficha pequeña con quién te ha derribado y la cuenta atrás. */
#muerto{background:radial-gradient(ellipse at center,#0000 55%,#3a0508aa 100%)!important;justify-content:flex-start!important;padding-top:calc(var(--sat,0px) + 64px)}
#muerto .mRec{transform:scale(.82);background:#05060ccc}
#muerto{font-size:18px!important}
</style></head>""", donde='html')

# ---------- NÚCLEOS Y PLATAFORMA DE SALIDA (18/11, Henar: «los núcleos más pequeños y rojo/azul; tu zona de spawn marcada con una plataforma») ----------
# nexo al 60 % y teñido del color de su equipo (azul el tuyo); en cada fuente una plataforma hexagonal de hormigón con filo de luz
# de su color, hecha con piezas sencillas y la textura de hormigón del Pack 11 (PROVISIONAL hasta el Pack Autopista 45 ART)
js = sub(js, "b = pieza('ap_estructuras', v.eq === MI_EQ ? 'nexo_azul' : 'nexo_rojo'); fusiona(b); b.scale.setScalar(1);",
         "b = pieza('ap_estructuras', v.eq === MI_EQ ? 'nexo_azul' : 'nexo_rojo'); fusiona(b); b.scale.setScalar(0.6); {const c = new THREE.Color(v.eq === MI_EQ ? '#2f8cff' : '#ff2a3a'); b.traverse((q) => {if (q.isMesh && q.material) {q.material = q.material.clone(); q.material.color.lerp(c, 0.3); if (q.material.emissive) {q.material.emissive.copy(c); q.material.emissiveIntensity = 0.22;}}});}")
js = sub(js, "v.k === 't' ? 8 : 8.4;", "v.k === 't' ? 8 : 6;")
js = sub(js, "  for (const eq of [0, 1]) {const f = BASES[eq].fuente, o = pieza('ap_estructuras', eq === MI_EQ ? 'fuente_azul' : 'fuente_roja');",
         "  for (const eq of [0, 1]) plataformaSalida(eq);\n  for (const eq of [0, 1]) {const f = BASES[eq].fuente, o = pieza('ap_estructuras', eq === MI_EQ ? 'fuente_azul' : 'fuente_roja');")
js = sub(js, "const FUENTES_A6 = [];", """const FUENTES_A6 = [];
let TEX_HOR_PL = null, PLAT_TEX = null;
function plataformaSalida(eq) {
  const f = BASES[eq].fuente, col = eq === MI_EQ ? '#2f9cff' : '#ff2a3a', g = new THREE.Group();
  if (!TEX_HOR_PL) {TEX_HOR_PL = cargaTex('../batalla/texturas/ap_hormigon.webp', true); TEX_HOR_PL.repeat.set(3, 3);}
  const losa = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.6, 0.36, 6), new THREE.MeshLambertMaterial({map: TEX_HOR_PL, color: '#8a909a'})); losa.position.y = 0.18; losa.receiveShadow = true; g.add(losa);
  const filo = new THREE.Mesh(new THREE.CylinderGeometry(5.72, 5.72, 0.12, 6, 1, true), new THREE.MeshBasicMaterial({color: col, transparent: true, opacity: 0.9, side: THREE.DoubleSide})); filo.position.y = 0.3; g.add(filo);
  const halo = new THREE.Mesh(new THREE.CylinderGeometry(5.75, 6.4, 0.02, 6, 1, true), new THREE.MeshBasicMaterial({color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide})); halo.position.y = 0.05; g.add(halo);
  {if (!PLAT_TEX) PLAT_TEX = cargaTex('../batalla/texturas/ap_plataforma.webp'); const gp = new THREE.PlaneGeometry(10.5, 10.5); gp.rotateX(-Math.PI / 2);  /* Pack 45 ART: el dibujo cenital va tumbado encima de la losa */
   const tapa = new THREE.Mesh(gp, new THREE.MeshLambertMaterial({map: PLAT_TEX, transparent: true, alphaTest: 0.4, color: new THREE.Color('#ffffff').lerp(new THREE.Color(col), 0.22)})); tapa.position.y = 0.37; tapa.rotation.y = -Math.PI / 6; tapa.receiveShadow = true; g.add(tapa);}
  g.position.set(f.x, 0, f.z); g.rotation.y = Math.PI / 6; g.userData.salida = 1; (MAPA_G || scene).add(g); FUENTES_A6.push(g);
}""")

# ---------- OBJETOS DEL MAPA EN 3D Y SIN CORRAL DEL TORO (18/11, Henar: «los de vida y visión parecen un png»; «el establo del toro es horrible»; sin más WORK) ----------
# las plantas eran los iconos redondos del minimapa puestos de pie en el mapa: ahora son objetos 3D que ya teníamos (Pack 10 y Kenney),
# teñidos y con luz de su color, un aro que late en el suelo y una columna de luz: vida = bidones verdes, visión = baliza cian, salto = neumáticos naranjas
js = sub(js, "    for (const q of PLANTAS) {const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: cargaTex('../batalla/ui/ap_pl_' + q.tipo + '.webp'), transparent: true, depthWrite: false})); const t = PL_TAM[q.tipo]; sp.scale.setScalar(t); sp.center.set(0.5, 0.12); sp.position.set(q.x, 0, q.z); scene.add(sp); PLANTA_V.push({sp, q});}}",
         "    for (const q of PLANTAS) {const sp = plantaA6(q); sp.position.set(q.x, 0, q.z); scene.add(sp); PLANTA_V.push({sp, q});}}")
js = sub(js, "if (o.q.tipo === 'seta') o.sp.scale.setScalar(PL_TAM.seta * (1 + 0.04 * Math.sin(performance.now() / 200)));});",
         "animaPlantaA6(o.sp, o.q);});")
js = sub(js, "const PLANTA_V = []; const PL_TAM = {seta: 3.4, baya: 2.8, flor: 2.4};", """const PLANTA_V = []; const PL_TAM = {seta: 3.4, baya: 2.8, flor: 2.4};
const PL_A6 = {baya: '#3dff74', flor: '#46d8ff', seta: '#ff8a2a'};
let PL_HAZ = null;
function plantaA6(q) {
  const g = new THREE.Group(), c = new THREE.Color(PL_A6[q.tipo]), cuerpo = new THREE.Group();
  const pon = (o, x, y, z, e, ry = 0) => {o.position.set(x, y, z); o.scale.setScalar(e); o.rotation.y = ry; cuerpo.add(o); return o;};
  if (q.tipo === 'baya') {pon(pieza('ap_suelo_props', 'bidon_2'), -0.32, 0, 0, 1.35, 0.4); pon(pieza('ap_suelo_props', 'bidon_1'), 0.36, 0, 0.12, 1.2, 1.9); pon(pieza('ap_suelo_props', 'bidon_2'), 0.02, 0, -0.42, 1.05, 2.8);}
  else if (q.tipo === 'flor') {if (M.ap_cono) pon(M.ap_cono.scene.clone(true), 0, 0, 0, 2.7); pon(pieza('ap_suelo_props', 'palé'), 0, 0, 0, 1.3, 0.3).position.y = -0.02;}
  else for (let k = 0; k < 3; k++) pon(pieza('ap_suelo_props', k % 2 ? 'neumatico_2' : 'neumatico_1'), (k - 1) * 0.04, k * 0.44, 0, 1.25, k);
  cuerpo.traverse((m) => {if (!m.isMesh) return; m.castShadow = true; m.material = [].concat(m.material).map((x) => {const y = x.clone(); if (y.color) y.color.lerp(c, q.tipo === 'flor' ? 0.6 : 0.22); if (y.emissive) {y.emissive.copy(c); y.emissiveIntensity = 0.16;} return y;}); if (m.material.length === 1) m.material = m.material[0];});
  g.add(cuerpo); g.userData.cuerpo = cuerpo;
  const a = aro(PL_A6[q.tipo], 1.3); a.material.opacity = 0.55; a.position.y = 0.05; g.add(a); g.userData.aro = a;
  if (!PL_HAZ) {const cv = document.createElement('canvas'); cv.width = 4; cv.height = 64; const x = cv.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); PL_HAZ = new THREE.CanvasTexture(cv);}
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 3.2, 24, 1, true), new THREE.MeshBasicMaterial({color: c, map: PL_HAZ, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending}));
  h.position.y = 1.6; g.add(h); g.userData.haz = h;
  return g;
}
function animaPlantaA6(g, q) {
  if (!g.visible) return; const t = performance.now() / 1000, u = g.userData, f = 0.5 + 0.5 * Math.sin(t * 3 + q.x);
  u.aro.material.opacity = 0.35 + 0.35 * f; u.aro.scale.setScalar(1 + 0.08 * f); u.haz.material.opacity = 0.2 + 0.16 * f;
  if (q.tipo === 'seta') u.cuerpo.scale.y = 1 + 0.06 * Math.sin(t * 7);  /* los neumáticos botan: aquí se sale disparado */
  if (q.tipo === 'flor') u.cuerpo.rotation.y = t * 0.6;
}""")
# el «corral» del toro (suelo redondo de tierra y valla) desaparece: el toro está en un claro con chatarra alrededor;
# a los demás cubiles se les quita el disco de tierra del suelo (los triángulos planos a ras de suelo) y se quedan sus piedras y troncos
js = sub(js, "  for (const c of CAMPOS) {const nd = NEUTRO[c.tipo]; if (nd.jefe || nd.draco || nd.pasiva) continue; pz(c.tipo === 'troll' ? 'cubil_toro' : c.tipo === 'huorn' ? 'cubil_coloso' : 'cubil', c.x, c.z, haciaCentro(c));}",
         """  const sinSuelo = (o) => o.traverse((q) => {if (!q.isMesh) return; const g = q.geometry.index ? q.geometry.clone() : q.geometry.clone(); const P = g.attributes.position; let I = g.index ? g.index.array : null;
    if (!I) {I = new Uint32Array(P.count); for (let i = 0; i < P.count; i++) I[i] = i;} const k = []; for (let i = 0; i < I.length; i += 3) {const ya = P.getY(I[i]), yb = P.getY(I[i + 1]), yc = P.getY(I[i + 2]); if (Math.max(ya, yb, yc) < 0.8 && Math.max(ya, yb, yc) - Math.min(ya, yb, yc) < 0.04) continue; k.push(I[i], I[i + 1], I[i + 2]);} g.setIndex(k); q.geometry = g;});
  const chatarra = (c, esc = 1) => {const L = [['palé', 3.6, 0.2, 1.4], ['palé', 3.9, 0.55, 1.2], ['neumatico_1', 4.1, 1.5, 1.3], ['neumatico_2', 3.7, 2.2, 1.2], ['bidon_1', 4.3, 2.9, 1.1], ['bidon_2', 4.0, 3.15, 1.1], ['cascotes_2', 4.4, 3.9, 1.3], ['neumatico_1', 3.8, 4.6, 1.25], ['palé', 4.2, 5.3, 1.3], ['cascotes_1', 4.5, 5.9, 1.2]];
    const a0 = haciaCentro(c) + Math.PI; for (const [n, r, a, e] of L) {const o = pieza('ap_suelo_props', n), an = a0 + a; o.position.set(c.x + Math.sin(an) * r * esc / (esc > 1 ? 4 : 1), 0, c.z + Math.cos(an) * r * esc / (esc > 1 ? 4 : 1)); o.rotation.y = an * 3.1; o.scale.setScalar(e); fusiona(o); G.add(o);}};
  for (const c of CAMPOS) {const nd = NEUTRO[c.tipo]; if (nd.jefe || nd.draco || nd.pasiva) continue; if (c.tipo === 'troll') {chatarra(c); continue;}
    const o = pieza('ap_jungla', c.tipo === 'huorn' ? 'cubil_coloso' : 'cubil'); sinSuelo(o); o.position.set(c.x, 0, c.z); o.rotation.y = haciaCentro(c); fusiona(o); G.add(o);}
  chatarra(PIT, 6.2); chatarra(PIT2, 6.2);  /* Nasor y el lagarto: en un claro con chatarra, sin el foso de tierra con valla */""")
js = sub(js, "pz('foso_nasor', PIT.x, PIT.z, haciaCentro(PIT)); pz('guarida_lagarto', PIT2.x, PIT2.z, haciaCentro(PIT2));", "")


# ---------- BOLA DE BIRDIE EN 3D Y DEL TAMAÑO DE LO QUE GOLPEA (18/11, Henar: «parece más grande el png que el hitbox, da la sensación de que no entra») ----------
# el dibujo plano medía 1,9 m con la bola 0,4 m por delante del punto real y una estela verde enorme: llegaba antes de tiempo y «tocaba» sin dar.
# Ahora es una bola 3D centrada en el punto exacto del proyectil, con un halo verde cuyo borde ES el ancho de lo que golpea (2 × 0,6 m)
# y una estela corta detrás. La Q («Drive») golpea con ancho 0,6 (antes 0,8): halo y golpe coinciden.
js = sub(js, "q: {n: 'Drive', cd: 7, mn: 40, tipo: 'linea', alc: 11, ancho: 0.8,", "q: {n: 'Drive', cd: 7, mn: 40, tipo: 'linea', alc: 11, ancho: 0.6,")
js = sub(js, "function proyAP(n) {\n  if (!PROY_AP_G[n]) {", """let HALO_BOLA = null;
function bolaGolf() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 14), new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.35, metalness: 0, emissive: '#2a3a2a'})); g.add(b);
  if (!HALO_BOLA) {const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.55)'); gr.addColorStop(0.85, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); HALO_BOLA = new THREE.CanvasTexture(cv);}
  const h = new THREE.Sprite(new THREE.SpriteMaterial({map: HALO_BOLA, color: '#5dff5a', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending})); h.scale.setScalar(1.2); g.add(h);
  const e = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.3, 14, 1, true), new THREE.MeshBasicMaterial({color: '#4dff4a', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide}));
  e.rotation.x = Math.PI / 2; e.position.z = -0.7; g.add(e);  /* la punta de la estela hacia atrás (los proyectiles miran a +Z) */
  g.userData.tamFijo = 1;  /* su tamaño ya es el real: no se agranda como los dibujos */
  return g;
}
function proyAP(n) {
  if (n === 'bola') {if (!PROY_AP_G.bola) PROY_AP_G.bola = bolaGolf(); return PROY_AP_G.bola.clone(true);}
  if (!PROY_AP_G[n]) {""")


js = sub(js, "if (t === 'proy') {const o = modeloProy(e[1]); o.scale.multiplyScalar(e[6] || 1);", "if (t === 'proy') {const o = modeloProy(e[1]); if (!o.userData.tamFijo) o.scale.multiplyScalar(e[6] || 1);")
js = sub(js, "if (t === 'tiro') {const o = modeloProy(e[1]); o.scale.multiplyScalar(1.6);", "if (t === 'tiro') {const o = modeloProy(e[1]); if (!o.userData.tamFijo) o.scale.multiplyScalar(1.6);")

# ---------- TODOS LOS PROYECTILES DEL TAMAÑO DE LO QUE GOLPEAN (18/11, Henar: «revísalo para todos los que lancen proyectiles») ----------
# Mismo fallo que la bola de Birdie en Vael (brasa), Grub (energía), Ata (bala) y Fu (hoz): el dibujo era un plano de 2,2-2,4 m
# (×1,6 en las habilidades) con la «cabeza» 0,3-0,8 m por DELANTE del punto real. Ahora cada dibujo se coloca con el centro de su cabeza
# (medido en la imagen: PROY_CAB = [centro, diámetro] en fracción del ancho) justo en el punto real y a la escala en que esa cabeza
# mide lo que golpea: 2 × ancho en las habilidades en línea (el ancho viaja en el evento 'tiro') y 0,7 m en los golpes básicos
# (que siempre dan: van a por su objetivo). La estela queda detrás. La bala de Ata: ancho 0,55 (antes 0,9; si no, la bala medía 1,8 m).
js = sub(js, "ev(['tiro', H.proy, h.x, h.z, h.x + dx * H.alc, h.z + dz * H.alc, 26]);", "ev(['tiro', H.proy, h.x, h.z, h.x + dx * H.alc, h.z + dz * H.alc, 26, H.ancho || 0.5]);")
js = sub(js, "q: {n: 'Bala perforante', cd: 6, mn: 45, tipo: 'linea', alc: 13, ancho: 0.9,", "q: {n: 'Bala perforante', cd: 6, mn: 45, tipo: 'linea', alc: 13, ancho: 0.55,")
js = sub(js, "const PROY_AP_G = {}, GEO_PROY", "const PROY_CAB = {bola: [0.664, 0.492], brasa: [0.656, 0.5], energia: [0.631, 0.574], bala: [0.818, 0.363], hoz: [0.621, 0.594]};\nconst PROY_AP_G = {}, GEO_PROY")
js = sub(js, "function proyAP(n) {\n  if (n === 'bola') {if (!PROY_AP_G.bola) PROY_AP_G.bola = bolaGolf(); return PROY_AP_G.bola.clone(true);}\n  if (!PROY_AP_G[n]) {",
         """function proyAP(n, D = 0.7) {
  const k = n + '|' + D.toFixed(2);
  if (n === 'bola') {if (!PROY_AP_G[k]) {PROY_AP_G[k] = bolaGolf(); const h = PROY_AP_G[k].children[1]; h.scale.setScalar(D); PROY_AP_G[k].children[0].scale.setScalar(Math.min(1, D / 1.2));} return PROY_AP_G[k].clone(true);}
  {const f = PROY_AP[n][0], cab = PROY_CAB[f];
   if (cab) {if (!PROY_AP_G[k]) {const S = D / cab[1], g = new THREE.Group(), m = new THREE.Mesh(GEO_PROY, new THREE.MeshBasicMaterial({map: cargaTex('../batalla/ui/ap_pr_' + f + '.webp'), transparent: true, depthWrite: false, depthTest: false}));
     m.scale.setScalar(S); m.position.z = -(cab[0] - 0.5) * S; m.renderOrder = 6; g.add(m); g.userData.tamFijo = 1; PROY_AP_G[k] = g;} return PROY_AP_G[k].clone(true);}}
  if (!PROY_AP_G[n]) {""")
js = sub(js, "if (t === 'tiro') {const o = modeloProy(e[1]); if (!o.userData.tamFijo)", "if (t === 'tiro') {const o = PROY_AP[e[1]] ? proyAP(e[1], 2 * (e[7] || 0.5)) : modeloProy(e[1]); if (!o.userData.tamFijo)")
js = sub(js, "if (t === 'proy') {const o = modeloProy(e[1]); if (!o.userData.tamFijo)", "if (t === 'proy') {const o = PROY_AP[e[1]] ? proyAP(e[1], 0.7) : modeloProy(e[1]); if (!o.userData.tamFijo)")


if fallos:
    print('NO se ha generado nada. Sustituciones que fallan (La Brecha habrá cambiado):')
    print('\n'.join('  · ' + f for f in fallos))
    sys.exit(1)
(B / 'autopista.js').write_text(js, encoding='utf8')
(B / 'autopista.html').write_text(html, encoding='utf8')
print('ok: public/batalla/autopista.js y autopista.html')
