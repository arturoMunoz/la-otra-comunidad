# ¿Qué se acumula en una partida larga? python3 t_largo.py MINUTOS [modo]
# Reloj falso: cada fotograma = 50 ms de partida; solo se pinta 1 de cada 20 (lo demás es igual que en el móvil).
import asyncio, sys, json
from playwright.async_api import async_playwright
MIN = float(sys.argv[1]) if len(sys.argv) > 1 else 10; MODO = sys.argv[2] if len(sys.argv) > 2 else '2v2'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc'])
        pg = await b.new_page(viewport={'width': 640, 'height': 300})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','visor');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','%s')" % MODO)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(120):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        await pg.evaluate("""() => {const V = window._vado; for (const h of V.S.u) if (h.k === 'h') h.bot = true;
          const R = V.renderer, RR = R.render.bind(R); let n = 0; R.render = (a, b) => {if (++n % 20 === 0) RR(a, b);};
          let falso = performance.now(); const pn = performance.now.bind(performance); const d0 = pn() - falso; performance.now = () => falso;
          window.requestAnimationFrame = (cb) => setTimeout(() => {falso += 50; const a = pn(); cb(falso); window._jsT = (window._jsT || []); window._jsT.push(pn() - a);}, 0);
          window._medir = () => {let obj = 0; V.scene.traverse(() => obj++); const t = window._jsT.splice(0); t.sort((a, b) => a - b);
            const r = {t: V.S.t.toFixed(0), obj, geo: R.info.memory.geometries, tex: R.info.memory.textures, prog: R.info.programs.length, dom: document.getElementsByTagName('*').length,
              heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : 0, uds: V.S.u.length, msMed: t.length ? t[t.length >> 1].toFixed(1) : 0, msP90: t.length ? t[Math.floor(t.length * .9)].toFixed(1) : 0};
            for (const k of Object.keys(V)) {try {const x = V[k]; if (Array.isArray(x) && x.length > 20) r['arr.' + k] = x.length; else if (x instanceof Map && x.size > 20) r['map.' + k] = x.size;} catch (e) {}}
            return r;};
        }""")
        for i in range(int(MIN * 2)):
            await pg.wait_for_timeout(1000)
            # esperar hasta que pasen 30 s de partida
            for _ in range(200):
                t = await pg.evaluate("window._vado.S.t")
                if t >= (i + 1) * 30 + 0: break
                await pg.wait_for_timeout(500)
            r = await pg.evaluate("window._medir()")
            print(json.dumps(r), flush=True)
            if await pg.evaluate("window._vado.S.fin >= 0"): print('FIN'); break
        print('errores', errs[:5])
        await b.close()
asyncio.run(main())
