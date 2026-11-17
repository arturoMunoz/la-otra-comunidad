# Suavidad en línea: los dos héroes andan en zigzag por su mitad del puente y cada móvil mide cómo pinta al OTRO (tirones = fotogramas con
# velocidad muy distinta de la normal). Con tools/pruebas/sala_local.mjs. python3 t_suave.py [SEG] [nube|movil]
import asyncio, sys, json
from playwright.async_api import async_playwright
SEG = int(sys.argv[1]) if len(sys.argv) > 1 else 40
MODO_SRV = sys.argv[2] if len(sys.argv) > 2 else 'nube'
URL = 'http://localhost:8791/batalla/autopista.html'
ESPIA = """(() => {const W = window.WebSocket; window._red = {fotos: [], tam: 0, envio: 0};
  window.WebSocket = function (u, p) {const ws = new W(u, p); ws.addEventListener('message', (m) => {try {const o = JSON.parse(m.data); if (o.t === 'foto') {window._red.fotos.push(performance.now()); window._red.tam += m.data.length; for (const e of (o.f && o.f.ev) || []) if (e[0] === 'g') {const k = 'de' + e[2]; window._red[k] = (window._red[k] || 0) + 1;}}} catch (e) {}}); const s = ws.send.bind(ws); ws.send = (d) => {window._red.envio++; s(d);}; return ws;};
  window.WebSocket.prototype = W.prototype; Object.assign(window.WebSocket, {OPEN: 1, CLOSED: 3, CONNECTING: 0, CLOSING: 2});})();"""
async def abre(b, nombre, heroe):
    pg = await b.new_page(viewport={'width': 640, 'height': 300})
    pg.on('pageerror', lambda e: print(nombre, 'ERROR', str(e)[:200]))
    await pg.add_init_script("localStorage.setItem('vado.nombre','%s');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.srv','%s');" % (nombre, heroe, MODO_SRV) + ESPIA)
    await pg.goto(URL); await pg.wait_for_timeout(2500); return pg
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        A = await abre(b, 'Arturo', 'rohan'); B = await abre(b, 'Henar', 'elfo')
        await A.click('#bCrear'); await A.wait_for_timeout(700); await A.click('#eOk')
        for i in range(60):
            await A.wait_for_timeout(500); c = await A.evaluate("() => window._vado && window._vado.NET.codigo")
            if c: break
        print('código', c)
        await B.fill('#codigo', c); await B.click('#bUnir'); await B.wait_for_timeout(700); await B.click('#eOk')
        for i in range(60):
            await A.wait_for_timeout(500)
            if await A.query_selector('#bEmpezar') and await B.evaluate("() => window._vado.ESTADO") == 'sala': break
        await A.wait_for_timeout(1500); await A.click('#bEmpezar')
        for i in range(60):
            await A.wait_for_timeout(1000)
            if await A.evaluate("() => window._vado.ESTADO") == 'juego' and await B.evaluate("() => window._vado.ESTADO") == 'juego': break
        print('en partida; servidor:', await A.evaluate("() => !window._vado.S"))
        for pg in (A, B): await pg.evaluate("() => {const V = window._vado; V.renderer.render = () => {V.renderer.info.render.frame++;};}")
        for pg, s in [(A, 1), (B, -1)]:
            await pg.evaluate("""(s) => {const V = window._vado; const t0 = performance.now(); window._sv = []; window._sy = []; let antY = null;
              setInterval(() => {const t = (performance.now() - t0) / 1000; V.MANDO.mx = Math.cos(t * 1.0 * s); V.MANDO.mz = Math.sin(t * 1.0 * s); V.MANDO.ataca = false;}, 50);
              let ant = null; const mide = () => {requestAnimationFrame(mide); const yo = V.VISTA.get(V.YO); const o = [...V.VISTA.values()].find((q) => q.k === 'h' && q.id !== V.YO); if (!o || o.muerto >= 0 || o.xi === undefined) {ant = null; return;} const ah = performance.now(); if (yo && yo.xi !== undefined) {if (antY) {const dt = ah - antY.t; if (dt > 0 && dt < 40) window._sy.push(Math.hypot(yo.xi - antY.x, yo.zi - antY.z) / dt * 1000);} antY = {t: ah, x: yo.xi, z: yo.zi};} if (ant) {const dt = ah - ant.t; if (dt > 0 && dt < 40) window._sv.push(Math.hypot(o.xi - ant.x, o.zi - ant.z) / dt * 1000);} ant = {t: ah, x: o.xi, z: o.zi};}; mide();}""", s)
        await A.wait_for_timeout(5000)
        for pg in (A, B): await pg.evaluate("() => {window._sv.length = 0; window._sy.length = 0;}")
        await A.wait_for_timeout(SEG * 1000)
        for nombre, pg in [('Arturo ve a Henar', A), ('Henar ve a Arturo', B)]:
            r = await pg.evaluate("""() => {const st = (a) => {const v = a.filter((x) => x > 0.3); if (v.length < 30) return {pocos: v.length}; const o = [...v].sort((a, b) => a - b), med = o[o.length >> 1];
              const malos = v.filter((x) => x < med * 0.6 || x > med * 1.4).length; let jerk = 0; for (let i = 1; i < v.length; i++) jerk += Math.abs(v[i] - v[i - 1]);
              return {fotogramas: v.length, vel_mediana: +med.toFixed(2), tirones_pc: +(100 * malos / v.length).toFixed(1), cambio_medio_pc: +(100 * jerk / (v.length - 1) / med).toFixed(1), };}; return {otro: st(window._sv), yo_control: st(window._sy), interp: Math.round(window._vado.INTERP), extrapola: window._vado.PERF.ext || 0, ip_otro: Math.round(([...window._vado.VISTA.values()].find((q) => q.k === "h" && q.id !== window._vado.YO) || {}).reloj?.ip || 0)};}""")
            print(nombre, json.dumps(r))
asyncio.run(main())
