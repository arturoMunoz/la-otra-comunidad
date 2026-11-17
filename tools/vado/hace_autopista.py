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
  enano: {nombre: 'Brask, Caballero de Luz', modelo: 'ap_brask', alto: 2.45, ret: 'ui/ap_r_enano.webp', mana: 300, crecM: 30, vida: 740, dano: 58, vatq: 0.8, alcance: 2.3, vel: 4.9, crecV: 95, crecD: 4, arm: 38, rm: 32,
    hab: {q: {n: 'Tajo radiante', cd: 5, mn: 30, tipo: 'cono', alc: 3.8, ang: 1.5, dano: 115, icono: 'hacha', d: 'Un espadazo de luz en abanico delante de ti.'},
      w: {n: 'Coraza de luz', cd: 14, mn: 45, tipo: 'reduce', val: 0.45, dur: 3, icono: 'escudo', d: 'Su armadura se llena de luz: recibe un 45 % menos de daño durante 3 s.'},
      e: {n: 'Caída luminosa', cd: 10, mn: 45, tipo: 'salto', dist: 7, radio: 2.6, dano: 85, lento: 0.35, durL: 1.5, icono: 'botas', d: 'Salta impulsado por la luz, hiere y frena al caer.'},
      r: {n: 'Estallido de luz', cd: 50, mn: 90, tipo: 'area', radio: 4.6, dano: 240, aturde: 1.25, icono: 'h_enano', d: 'Libera toda la luz de su armadura: daño enorme y aturde a todos alrededor.'}}},
  gandalf: {nombre: 'Vael, el Mago', modelo: 'ap_vael', ret: 'ui/ap_r_gandalf.webp', mana: 420, crecM: 40, vida: 540, dano: 50, vatq: 0.88, alcance: 6.8, vel: 5.1, crecV: 78, crecD: 4.3, mag: true, arm: 20, rm: 32, proy: 'luz',
    hab: {q: {n: 'Orbe ígneo', cd: 8, mn: 50, tipo: 'linea', mag: true, alc: 11.5, ancho: 0.9, dano: 110, aturde: 1.3, proy: 'luz', icono: 'h_gandalf_q', d: 'Lanza un orbe de fuego que atrapa 1,3 s al primero que toca.'},
      w: {n: 'Escudo de brasas', cd: 13, mn: 55, tipo: 'escudo', mag: true, val: 140, dur: 3, aliados: 7, icono: 'h_gandalf_w', d: 'Un escudo de brasas para ti y los aliados a 7 m durante 3 s.'},
      e: {n: 'Círculo de ceniza', cd: 9, mn: 60, tipo: 'zona', mag: true, alc: 10, radio: 3.2, dur: 1.5, dps: 100, lento: 0.45, icono: 'h_gandalf_e', d: 'Ceniza ardiente en el suelo que hiere y frena un 45 % a los que la pisan.'},
      r: {n: 'Llamarada', cd: 45, mn: 100, tipo: 'linea', mag: true, alc: 16, ancho: 1.5, dano: 250, perfora: true, proy: 'luz', icono: 'h_gandalf_r', d: 'Un gran chorro de fuego que hiere a todos en una línea muy larga.'}}},
  orco: {nombre: 'Grub, el Maestro', modelo: 'ap_grub', alto: 1.25, ret: 'ui/ap_r_orco.webp', mana: 280, crecM: 28, vida: 730, dano: 63, vatq: 0.84, alcance: 2.7, vel: 5.0, crecV: 88, crecD: 4.4, arm: 34, rm: 30,
    hab: {q: {n: 'Remolino de energía', cd: 8, mn: 30, tipo: 'area', radio: 3.5, dano: 100, curaH: 0.1, icono: 'h_orco_q', d: 'Gira la espada de energía: hiere a los de alrededor y se cura un 10 % de la vida que le falta por cada héroe que toca.'},
      w: {n: 'Tajo pesado', cd: 7, mn: 30, tipo: 'cono', alc: 3.4, ang: 1.2, dano: 90, lento: 0.5, durL: 1.2, icono: 'h_orco_w', d: 'Un tajo delante que frena un 50 % 1,2 s.'},
      e: {n: 'Atracción', cd: 14, mn: 45, tipo: 'linea', alc: 6.5, ancho: 0.9, dano: 60, tira: true, lento: 0.4, durL: 1, proy: 'luz', icono: 'h_orco_e', d: 'Con la fuerza de su mente arrastra hasta él al primero que toca.'},
      r: {n: 'Sentencia', cd: 45, mn: 80, tipo: 'ejecuta', alc: 6, dano: 170, falta: 0.35, icono: 'h_orco_r', d: 'Salta sobre el héroe más cercano: más daño cuanta menos vida le quede (35 % de la que le falta). Si lo derriba, se recarga al momento.'}}},
  elfo: {nombre: 'Ata, la Francotiradora', modelo: 'ap_ata', ret: 'ui/ap_r_elfo.webp', mana: 340, crecM: 32, vida: 520, dano: 50, vatq: 0.95, alcance: 7, vel: 5.3, crecV: 75, crecD: 4.5, arm: 22, rm: 28, proy: 'flecha_elfica',
    hab: {q: {n: 'Bala perforante', cd: 6, mn: 45, tipo: 'linea', alc: 13, ancho: 0.9, dano: 125, perfora: true, proy: 'flecha_elfica', icono: 'arco', d: 'Un disparo largo que atraviesa a todos en su línea.'},
      w: {n: 'Cadencia', cd: 12, mn: 40, tipo: 'rafaga', val: 0.6, dur: 4, icono: 'i_abanico', d: 'Disparas un 60 % más rápido durante 4 s.'},
      e: {n: 'Voltereta', cd: 9, mn: 35, tipo: 'dash', dist: 5, dano: 0, icono: 'i_esquivar', d: 'Ruedas hacia donde apuntes.'},
      r: {n: 'Fuego de cobertura', cd: 45, mn: 90, tipo: 'zona', alc: 10, radio: 3.6, dur: 3, dps: 80, lento: 0.3, icono: 'h_elfo', d: 'Durante 3 s barres la zona a balazos: hieres y frenas.'}}},
  hobbit: {nombre: 'Birdie, el Golfista', modelo: 'ap_birdie', ret: 'ui/ap_r_hobbit.webp', mana: 320, crecM: 32, vida: 560, dano: 50, vatq: 1.0, alcance: 6.5, vel: 5.8, crecV: 78, crecD: 4, arm: 24, rm: 28, proy: 'piedra',
    hab: {q: {n: 'Drive', cd: 7, mn: 40, tipo: 'linea', alc: 11, ancho: 0.8, dano: 100, aturde: 0.9, proy: 'piedra', icono: 'honda', d: 'Una bola de golf a toda velocidad: aturde al primero que toca.'},
      w: {n: 'Bajo par', cd: 16, mn: 45, tipo: 'invis', dur: 3, vel: 0.35, icono: 'i_humo', d: 'Desapareces 3 s y corres más: ni torres ni enemigos te ven.'},
      e: {n: 'Cubo de bolas', cd: 6, mn: 35, tipo: 'cono', alc: 5.2, ang: 1.0, dano: 90, icono: 'i_piedras', d: 'Vacías el cubo: un puñado de bolas en abanico.'},
      r: {n: 'Hoyo en uno', cd: 45, mn: 80, tipo: 'suerte', cura: 0.4, vel: 0.5, dur: 5, icono: 'h_hobbit', d: 'Te curas un 40 %, corres más y pegas más fuerte 5 s.'}}},
  gollum: {nombre: 'Fu, el Ninja', modelo: 'ap_fu', ret: 'ui/ap_r_gollum.webp', mana: 280, crecM: 28, vida: 640, dano: 68, vatq: 1.1, alcance: 2.3, vel: 5.7, crecV: 90, crecD: 5, arm: 32, rm: 30,
    hab: {q: {n: 'Salto de la grulla', cd: 6, mn: 30, tipo: 'salto', dist: 6, radio: 2.2, dano: 140, lento: 0.35, durL: 1, icono: 'h_gollum_q', d: 'Salta sobre su presa: hiere y frena al caer.'},
      w: {n: 'Meditación', cd: 14, mn: 40, tipo: 'suerte', cura: 0.25, vel: 0.3, dur: 3, icono: 'h_gollum_w', d: 'Respira hondo: se cura un 25 %, corre más y pega más fuerte 3 s.'},
      e: {n: 'Kusarigama', cd: 10, mn: 35, tipo: 'linea', alc: 9, ancho: 0.8, dano: 70, aturde: 1.0, proy: 'piedra', icono: 'h_gollum_e', d: 'Lanza la hoz con cadena: atrapa 1 s al primero que toca.'},
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
js = sub(js, 'const ZOOMS = [[24, 14], [31, 18], [40, 23]];', 'const ESC_H = 1.6; const ZOOMS = [[17, 14], [21, 17], [27, 21.5]];')
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

# ---------- en línea: siempre «mi móvil» (la simulación del servidor es la de La Brecha) y salas aparte ----------
js = sub(js, "const SRV = {get: () => localStorage.getItem('vado.srv') || 'nube'};", "const SRV = {get: () => 'movil'};")
js = re.sub(r"^function botonesSrv\(\) \{.*$", "function botonesSrv() {return '';}", js, count=1, flags=re.M)
js = sub(js, "base + '/api/sala/' + codigo", "base + '/api/sala/X' + codigo")
# preferencias propias (el nombre se comparte con La Brecha y La Otra Comunidad)
js = js.replace("'vado.nombre'", "'@@NOMBRE@@'").replace("'vado.", "'auto.").replace("'@@NOMBRE@@'", "'vado.nombre'")

# ---------- página ----------
html = sub(html, "l.href='ui/splash_'+hv", "l.href='ui/ap_splash_'+hv", donde='html')
html = sub(html, '<img src="ui/splash_rohan.webp" alt="" class="mTi2">', '<img src="ui/ap_splash_rohan.webp" alt="" class="mTi2">', donde='html')
html = sub(html, '<title>La Brecha</title>', '<title>A-6</title><link rel="icon" href="ui/ap_icono.png"><link rel="apple-touch-icon" href="ui/ap_icono_180.png">', donde='html')
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
js = sub(js, 'const HAY_BOTELLA = true, BOT_Y0 = 39.7, BOT_Y1 = 87;', 'const HAY_BOTELLA = true, BOT_Y0 = 15.3, BOT_Y1 = 88.5;')
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
js = sub(js, "function minimapa() {", """const NIEBLA_MM = document.createElement('canvas'); NIEBLA_MM.width = 96; NIEBLA_MM.height = 196; let VIS_MM = [];
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
   const ns = NIEBLA_SUELO.getContext('2d'); ns.globalCompositeOperation = 'source-over'; ns.clearRect(0, 0, 64, 140); ns.fillStyle = '#000'; ns.fillRect(0, 0, 64, 140); ns.globalCompositeOperation = 'destination-out';
   for (const v of VIS_MM) {const cx = v[0] + 32, cz = v[1] + 70, gr = ns.createRadialGradient(cx, cz, v[2] * 0.72, cx, cz, v[2]); gr.addColorStop(0, '#000'); gr.addColorStop(1, '#0000'); ns.fillStyle = gr; ns.beginPath(); ns.arc(cx, cz, v[2], 0, 7); ns.fill();}
   NIEBLA_TEX.needsUpdate = true;}""")
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
body[data-heroe=enano]{--tinte:0deg;--tsat:.55;--tluz:1.15}   /* Brask: luz blanca azulada */
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
  const hc = (rx, ry) => {const t = tC.clone(); t.source = tC.source; t.repeat.set(rx, ry); return new THREE.MeshLambertMaterial({map: t, color: '#d8d8d4'});};
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

# menú: fondo = la imagen de carga (los dos peajes), retrato sin cortar la cabeza, sin Gamling (Tolkien) ni el jinete
html = sub(html, '</head>', '<style>#mFondo .fc{background-image:url(ui/ap_carga.webp)!important}#mFondo .ff,#mFondo .fm,#mFondo .fr{display:none}'
           '#menu .mSplash img{object-position:50% 0%!important}</style></head>', donde='html')
html = sub(html, 'ui/guia_gamling.webp" alt="Gamling"', 'ui/ap_guia.webp" alt=""', donde='html')
html = sub(html, '<img src="ui/guia_gamling.webp" alt="">', '<img src="ui/ap_guia.webp" alt="">', donde='html')
html = sub(html, '<img src="ui/ap_splash_rohan.webp" alt="" class="mTi2">', '<img src="ui/ap_r_rohan.webp" alt="" class="mTi2">', donde='html')
for v in ["'ui/h_' + ", "'ui/p_' + ", "'ui/at_' + "]:
    if v not in js: fallos.append('[arte] ' + v)
    js = js.replace(v, v.replace('ui/', 'ui/ap_'))
html = sub(html, '<script type="module" src="juego.js?', '<script type="module" src="autopista.js?', donde='html')
html = sub(html, '<h1>La Brecha</h1><p class="sub">Rohan contra Isengard</p>', '<h1>La Autopista</h1><p class="sub">Azules contra rojos</p>', donde='html')
# 17/11: el juego se llama «A-6»; título de texto hasta que llegue el logo nuevo (Pack 17 ART). Los logos del Pack 15 decían «La Autopista»
html = sub(html, '<h1>La Autopista</h1><p class="sub">Azules contra rojos</p>', '<h1 class="apLogo"><img src="ui/ap_logo_a6.webp" alt="A-6"></h1>', donde='html')
html = sub(html, '</head>', '<style>.mTit h1.apLogo{margin:6px 0 0;line-height:0}.mTit h1.apLogo img{width:min(200px,calc(24 * var(--vw)));height:auto;filter:drop-shadow(0 4px 6px #000a)}.mTit h1.apA6{margin:6px 0 0;font:italic 900 46px \'Arial Black\',system-ui,sans-serif!important;color:#ffd21f!important;letter-spacing:.04em;line-height:1;-webkit-text-stroke:2px #10161f;text-shadow:0 4px 0 #10161f,0 0 18px #2f8cff88}</style></head>', donde='html')
html = sub(html, '<span>1 contra 1 · el Abismo</span>', '<span>1 contra 1 · la autopista</span>', donde='html')
html = re.sub(r'\s*<button data-m="2v2">.*?</button>', '', html, count=1)  # la Batalla 2v2 (mapa del Vado, bestias de Tolkien) aún no
html = html.replace("'vado.heroe'", "'auto.heroe'")
html = sub(html, 'La Brecha se juega en horizontal.', 'A-6 se juega en horizontal.', donde='html')
html = sub(html, '<p>Preparando el campo de batalla</p>', '<p>Preparando la autopista</p>', donde='html')

if fallos:
    print('NO se ha generado nada. Sustituciones que fallan (La Brecha habrá cambiado):')
    print('\n'.join('  · ' + f for f in fallos))
    sys.exit(1)
(B / 'autopista.js').write_text(js, encoding='utf8')
(B / 'autopista.html').write_text(html, encoding='utf8')
print('ok: public/batalla/autopista.js y autopista.html')
