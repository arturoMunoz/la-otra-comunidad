# Perfil de CPU (JS) durante una pelea de A-6, con el lienzo diminuto para que no cuente el pintado: python3 t_prof.py HEROE SEG
# MODO=2v2 ADELANTO=600: en la Batalla y con la partida adelantada 10 min (todos bots), para ver lo que pesa a mitad de partida
import asyncio, sys, json, collections, os
MODO = os.environ.get('MODO', '1v1'); ADEL = int(os.environ.get('ADELANTO', '75'))
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'rohan'; SEG = float(sys.argv[2]) if len(sys.argv) > 2 else 8
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 858, 'height': 396})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','%s')" % (H, MODO))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("(n) => {const V = window._vado; for (const u of V.S.u) if (u.k === 'h' && u.id !== V.YO) u.bot = true; for (let i = 0; i < 30*n; i++) V.paso(1/30); for (let i = V.FXP.length - 1; i >= 0; i--) {const p = V.FXP[i]; if (p.o) {p.o.parent && p.o.parent.remove(p.o); V.FXP.splice(i, 1);}} const h = V.S.u.find(u => u.id === V.YO); const b = V.S.u.find(u => u.k === 'h' && u.eq !== h.eq); h.x = b.x; h.z = b.z + 3; h.vida = 1e5; h.ataca = true; if (V.MIO) {V.MIO.x = h.x; V.MIO.z = h.z;}}", ADEL)
        print('unidades', await pg.evaluate("() => window._vado.S.u.length"), 'soldados', await pg.evaluate("() => window._vado.S.u.filter(u => u.k === 's').length"))
        # lienzo diminuto: el pintado (swiftshader) deja de mandar y se ve el JS
        await pg.evaluate("() => {const V = window._vado; V.renderer.setPixelRatio(0.05); window._pr = true;}")
        await pg.wait_for_timeout(1500)
        cdp = await pg.context.new_cdp_session(pg)
        await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 200}); await cdp.send('Profiler.start')
        f0 = await pg.evaluate("() => window._vado.renderer.info.render.frame")
        await pg.wait_for_timeout(int(SEG * 1000))
        f1 = await pg.evaluate("() => window._vado.renderer.info.render.frame")
        prof = (await cdp.send('Profiler.stop'))['profile']
        nodes = {n['id']: n for n in prof['nodes']}; cuenta = collections.Counter(prof['samples'])
        dt = prof['endTime'] - prof['startTime']; tot = sum(cuenta.values())
        por = collections.Counter()
        for nid, c in cuenta.items():
            cf = nodes[nid]['callFrame']; por[(cf['functionName'] or '(anon)') + ' ' + cf['url'].split('/')[-1].split('?')[0] + ':' + str(cf['lineNumber'] + 1)] += c
        print('fotogramas', f1 - f0, 'en', SEG, 's  => ms por fotograma (todo):', round(SEG * 1000 / max(1, f1 - f0), 1))
        js = sum(c for k, c in por.items() if not k.startswith('(program)') and not k.startswith('(idle)'))
        print('JS de verdad (sin el pintado de swiftshader ni la espera): %.1f ms por fotograma' % (dt / 1000 * js / tot / max(1, f1 - f0)))
        por_f = collections.Counter()
        for k, c in por.items(): por_f[k.split(' ')[1].split(':')[0]] += c
        print('por archivo:', ', '.join('%s %.1f ms' % (f, dt / 1000 * c / tot / max(1, f1 - f0)) for f, c in por_f.most_common(6)))
        for k, c in por.most_common(30): print('%5.1f%%  %6.2f ms/fot  %s' % (100 * c / tot, dt / 1000 * c / tot / max(1, f1 - f0), k))
        await b.close()
asyncio.run(main())
