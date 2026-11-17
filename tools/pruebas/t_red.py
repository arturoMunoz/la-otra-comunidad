# Dos móviles jugando A-6 en línea contra el servidor local (tools/pruebas/sala_local.mjs): python3 t_red.py [SEG] [srv=nube|movil]
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
        # los dos van al centro y se pegan
        for pg, s in [(A, 1), (B, -1)]:
            await pg.evaluate("""(s) => {window._t0 = performance.now(); window._red.fotos.length = 0; window._red.tam = 0; window._mon = {saltos: 0, err: [], hits: 0}; const V = window._vado;
              setInterval(() => {const v = V.VISTA.get(V.YO); if (!v || !V.MIO) return; const enemigo = [...V.VISTA.values()].find((q) => q.k === 'h' && q.eq !== v.eq);
                const tx = enemigo ? (enemigo.xi ?? enemigo.x) : 0, tz = enemigo ? (enemigo.zi ?? enemigo.z) : 0, dx = tx - V.MIO.x, dz = tz - V.MIO.z, l = Math.hypot(dx, dz) || 1;
                if (l > (s > 0 ? 1.6 : 3)) {V.MANDO.mx = dx / l; V.MANDO.mz = dz / l; V.MANDO.ataca = false;} else {V.MANDO.mx = V.MANDO.mz = 0; V.MANDO.ataca = true; V.MANDO.fijo = enemigo ? enemigo.id : 0; V.MANDO.golpes = (V.MANDO.golpes || 0) + 1;}}, 100);
              let ux = null, uz = null; setInterval(() => {const M = V.MIO; if (ux !== null && Math.hypot(M.x - ux, M.z - uz) > 1.2) window._mon.saltos++; ux = M.x; uz = M.z;}, 50);}""", s)
        await A.wait_for_timeout(SEG * 1000)
        for nombre, pg in [('Arturo(anfitrión de la sala)', A), ('Henar', B)]:
            r = await pg.evaluate("""() => {const f = window._red.fotos, d = []; for (let i = 1; i < f.length; i++) d.push(f[i] - f[i - 1]); d.sort((a, b) => a - b); const V = window._vado, v = V.VISTA.get(V.YO), seg = (performance.now() - window._t0) / 1000;
              return {fotos_por_s: +(f.length / seg).toFixed(1), hueco_med: d.length ? +d[d.length >> 1].toFixed(0) : 0, hueco_p95: d.length ? +d[Math.floor(d.length * 0.95)].toFixed(0) : 0, hueco_max: d.length ? +d[d.length - 1].toFixed(0) : 0,
                KB_s: +(window._red.tam / 1024 / seg).toFixed(1), envios_s: +(window._red.envio / seg).toFixed(1), saltos_mi_heroe: window._mon.saltos, fps: +(V.renderer.info.render.frame / seg).toFixed(1), mi_vida: v && Math.round(v.vida), golpes_mios_confirmados: window._red['de' + V.YO] || 0, toques: V.MANDO.golpes || 0, interp: Math.round(V.INTERP)};}""")
            print(nombre, json.dumps(r))
        print(open('/tmp/sala.log').read()[-500:])
        await A.screenshot(path='/home/claude/pruebas/red_A.png'); await B.screenshot(path='/home/claude/pruebas/red_B.png')
        await b.close()
asyncio.run(main())
