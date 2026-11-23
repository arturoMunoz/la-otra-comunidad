# Volver a la partida: dos móviles en línea (sala_local.mjs), a Henar se le corta la conexión y luego cierra la página. python3 t_recon.py
import asyncio, sys, json
from playwright.async_api import async_playwright
SEG = int(sys.argv[1]) if len(sys.argv) > 1 else 40
MODO_SRV = sys.argv[2] if len(sys.argv) > 2 else 'nube'
URL = 'http://localhost:8791/batalla/autopista.html'
ESPIA = """(() => {const W = window.WebSocket; window._red = {fotos: [], tam: 0, envio: 0};
  window.WebSocket = function (u, p) {const ws = new W(u, p); ws.addEventListener('message', (m) => {try {const o = JSON.parse(m.data); if (o.t === 'foto') {window._red.fotos.push(performance.now()); window._red.tam += m.data.length; for (const e of (o.f && o.f.ev) || []) if (e[0] === 'g') {const k = 'de' + e[2]; window._red[k] = (window._red[k] || 0) + 1;}}} catch (e) {}}); const s = ws.send.bind(ws); ws.send = (d) => {window._red.envio++; s(d);}; return ws;};
  window.WebSocket.prototype = W.prototype; Object.assign(window.WebSocket, {OPEN: 1, CLOSED: 3, CONNECTING: 0, CLOSING: 2});})();"""
async def abre(b, nombre, heroe):
    ctx = await b.new_context(viewport={'width': 640, 'height': 300}); pg = await ctx.new_page()
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

        await A.wait_for_timeout(6000)
        nom = "() => {const V = window._vado; const v = [...V.VISTA.values()].filter(q => q.k === 'h').map(q => q.nombre); return v;}"
        print('nombres vistos por Arturo', await A.evaluate(nom))
        # 1) se corta la conexión de Henar
        await B.evaluate("() => window._vado.NET.ws.close()")
        await B.wait_for_timeout(1500); await B.screenshot(path='/home/claude/pruebas/recon_cortado.png')
        print('Arturo ve (cortada):', await A.evaluate(nom))
        for i in range(30):
            await B.wait_for_timeout(1000)
            if not await B.evaluate("() => !!document.getElementById('reconV')"): break
        f0 = await B.evaluate("() => window._red.fotos.length"); await B.wait_for_timeout(3000); f1 = await B.evaluate("() => window._red.fotos.length")
        print('Henar de vuelta tras', i + 1, 's · fotos en 3 s:', f1 - f0, '· ESTADO', await B.evaluate("() => window._vado.ESTADO"))
        print('Arturo ve (vuelta):', await A.evaluate(nom))
        await B.screenshot(path='/home/claude/pruebas/recon_vuelta.png')
        # 2) Henar cierra la página y la vuelve a abrir
        ctx = B.context; B2 = await ctx.new_page()
        await B.close(); await A.wait_for_timeout(3000); B = B2
        print('Arturo ve (página cerrada):', await A.evaluate(nom))
        B.on('pageerror', lambda e: print('Henar2 ERROR', str(e)[:200]))
        await B.goto(URL); await B.wait_for_timeout(3500)
        hay = await B.evaluate("() => !!document.getElementById('bRetoma')"); print('botón Volver a la partida:', hay)
        await B.screenshot(path='/home/claude/pruebas/recon_menu.png')
        if hay:
            await B.click('#bRetoma')
            for i in range(60):
                await B.wait_for_timeout(1000)
                if await B.evaluate("() => window._vado.ESTADO") == 'juego': break
            await B.wait_for_timeout(5000)
            print('Henar2 ESTADO', await B.evaluate("() => window._vado.ESTADO"), 'YO', await B.evaluate("() => window._vado.YO"))
            print('Arturo ve (retomada):', await A.evaluate(nom))
            await B.screenshot(path='/home/claude/pruebas/recon_retoma.png')
        await b.close()
asyncio.run(main())
