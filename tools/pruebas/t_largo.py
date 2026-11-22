# ¿Qué se acumula en una partida larga? python3 t_largo.py MINUTOS [modo]
# GEO=1: además apunta cada geometría que pasa por la escena y al final agrupa las que se han quitado de la escena SIN borrarlas de la gráfica
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
        import os
        if os.environ.get('GL'):
            await pg.add_init_script(r'''(() => {Error.stackTraceLimit = 80; const VIVOS = new Map(); window._GL = VIVOS; window._glT0 = 0;
              const pila = () => (new Error().stack || '').split('\n').slice(2).filter((l) => /autopista\.js/.test(l)).slice(0, 5).map((l) => l.trim().replace(/^at /, '').replace(/\(?https?:[^)]*autopista\.js:(\d+):\d+\)?/, ':$1')).join(' < ');
              for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {const P = C.prototype;
                for (const [cre, del, tipo] of [['createTexture', 'deleteTexture', 'tex'], ['createBuffer', 'deleteBuffer', 'buf']]) {const c0 = P[cre], d0 = P[del];
                  P[cre] = function () {const o = c0.apply(this, arguments); if (o) VIVOS.set(o, {tipo, t: performance.now(), p: pila()}); return o;};
                  P[del] = function (o) {VIVOS.delete(o); return d0.apply(this, arguments);};}}
              window._glResumen = (desde) => {const g = {}; for (const v of VIVOS.values()) if (v.t >= desde) {const k = v.tipo + ' | ' + v.p; g[k] = (g[k] || 0) + 1;} return Object.entries(g).sort((a, b) => b[1] - a[1]).slice(0, 25);};
            })()''')
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
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
            if i == 1: await pg.evaluate("window._glDesde = performance.now()")
            if os.environ.get('GEO') and i == 1:
                await pg.evaluate(r'''() => {const V = window._vado, GEOS = new Map(); window._GEOS = GEOS;
                  const desc = (o) => {const g = o.geometry; let n = o.name || ''; let p = o.parent, k = 0; while (p && k < 3 && !n) {n = p.name || ''; p = p.parent; k++;} const m = Array.isArray(o.material) ? o.material[0] : o.material, src = m && m.map && m.map.source && m.map.source.data && m.map.source.data.src ? m.map.source.data.src.split('/').pop().split('?')[0] : ''; return g.type + (() => {try {return g.parameters ? JSON.stringify(g.parameters).slice(0, 40) : '';} catch (e) {return '';}})() + ' | ' + (o.isSkinnedMesh ? 'skin ' : o.isInstancedMesh ? 'inst ' : '') + n + ' | ' + src + ' | v' + (g.attributes.position ? g.attributes.position.count : 0);};
                  const apunta = (raiz) => raiz.traverse((o) => {const g = o.geometry; if (!g || GEOS.has(g)) return; GEOS.set(g, desc(o)); g.addEventListener('dispose', () => GEOS.delete(g));});
                  const add0 = V.scene.add.bind(V.scene); V.scene.add = (...os) => {const r = add0(...os); for (const o of os) apunta(o); return r;};
                  apunta(V.scene); const R = V.renderer, r0 = R.render.bind(R); R.render = (a, b) => {apunta(a); return r0(a, b);}; /* solo se sube a la gráfica lo que está en la escena al pintar */
                  window._geoResumen = () => {const en = new Set(); V.scene.traverse((o) => {if (o.geometry) en.add(o.geometry);}); const g = {'(en la escena ahora)': en.size, '(apuntadas sin borrar)': GEOS.size, '(en la gráfica)': R.info.memory.geometries}; for (const [geo, d] of GEOS) if (!en.has(geo)) g[d] = (g[d] || 0) + 1; return Object.entries(g).sort((a, b) => b[1] - a[1]).slice(0, 25);};}''')
            r = await pg.evaluate("window._medir()")
            print(json.dumps(r), flush=True)
            if await pg.evaluate("window._vado.S.fin >= 0"): print('FIN'); break
        if os.environ.get('GEO'):
            for k, n in await pg.evaluate("window._geoResumen()"): print('%5d  %s' % (n, k))
        if os.environ.get('GL'):
            for k, n in await pg.evaluate("window._glResumen(window._glDesde || 0)"): print('%5d  %s' % (n, k))
        print('errores', errs[:5])
        await b.close()
asyncio.run(main())
