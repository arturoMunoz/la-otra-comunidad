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
js = sub(js, 'o = montar(HEROES[v.tipo].modelo, 2.05);', 'o = montar(HEROES[v.tipo].modelo, HEROES[v.tipo].alto || 2.05);')
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

js = sub(js, '¿Salir de La Brecha?', '¿Salir de La Autopista?')
js = sub(js, "'Bienvenido a La Brecha'", "'Bienvenido a La Autopista'")
js = sub(js, 'placeholder="Tu nombre en La Brecha"', 'placeholder="Tu nombre en La Autopista"')
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
html = sub(html, '<title>La Brecha</title>', '<title>La Autopista</title><link rel="icon" href="ui/ap_icono.png"><link rel="apple-touch-icon" href="ui/ap_icono_180.png">', donde='html')
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
for v in ["'ui/h_' + ", "'ui/p_' + ", "'ui/at_' + "]:
    if v not in js: fallos.append('[arte] ' + v)
    js = js.replace(v, v.replace('ui/', 'ui/ap_'))
html = sub(html, '<script type="module" src="juego.js?', '<script type="module" src="autopista.js?', donde='html')
html = sub(html, '<h1>La Brecha</h1><p class="sub">Rohan contra Isengard</p>', '<h1>La Autopista</h1><p class="sub">Azules contra rojos</p>', donde='html')
html = sub(html, '<span>1 contra 1 · el Abismo</span>', '<span>1 contra 1 · la autopista</span>', donde='html')
html = re.sub(r'\s*<button data-m="2v2">.*?</button>', '', html, count=1)  # la Batalla 2v2 (mapa del Vado, bestias de Tolkien) aún no
html = html.replace("'vado.heroe'", "'auto.heroe'")
html = sub(html, 'La Brecha se juega en horizontal.', 'La Autopista se juega en horizontal.', donde='html')
html = sub(html, '<p>Preparando el campo de batalla</p>', '<p>Preparando la autopista</p>', donde='html')

if fallos:
    print('NO se ha generado nada. Sustituciones que fallan (La Brecha habrá cambiado):')
    print('\n'.join('  · ' + f for f in fallos))
    sys.exit(1)
(B / 'autopista.js').write_text(js, encoding='utf8')
(B / 'autopista.html').write_text(html, encoding='utf8')
print('ok: public/batalla/autopista.js y autopista.html')
