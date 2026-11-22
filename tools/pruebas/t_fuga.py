# Partida con reloj falso (50 ms por fotograma, todos bots) hasta MIN minutos: cuenta objetos de la escena por tipo, los que tienen posición NaN y saca foto.
# python3 t_fuga.py MIN modo heroe
import asyncio, sys
from playwright.async_api import async_playwright
MIN = float(sys.argv[1]); MODO = sys.argv[2]; H = sys.argv[3]
CUENTA = """() => {const V = window._vado, T = V.THREE, out = {}, w = new T.Vector3(); let nan = 0, tot = 0;
  V.scene.traverse((o) => {if (!(o.isMesh || o.isSprite || o.isPoints)) return; tot++; o.getWorldPosition(w); if (isNaN(w.x)) {nan++; const m = Array.isArray(o.material) ? o.material[0] : o.material;
    const src = m && m.map && m.map.source && m.map.source.data && m.map.source.data.src ? m.map.source.data.src.split('/').pop() : ''; const k = (o.name || (o.parent && o.parent.name) || o.type) + ' ' + src; out[k] = (out[k] || 0) + 1;}});
  return {t: V.S.t.toFixed(0), tot, nan, uds: V.S.u.length, top: Object.entries(out).sort((a,b)=>b[1]-a[1]).slice(0,8)};}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','%s')" % (H, MODO))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.click('#bBots'); await pg.wait_for_timeout(1000); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        await pg.evaluate("""() => {const V = window._vado; for (const h of V.S.u) if (h.k === 'h') h.bot = true;
          const R = V.renderer, RR = R.render.bind(R); let n = 0; window._pinta = false; R.render = (a, b) => {if (window._pinta || ++n % 15 === 0) RR(a, b);};
          let falso = performance.now(); performance.now = () => falso; window._para = false;
          window.requestAnimationFrame = (cb) => setTimeout(() => {if (!window._para) falso += 50; cb(falso);}, window._para ? 30 : 0);}""")
        nxt = 60
        while True:
            await pg.wait_for_timeout(2000)
            t = await pg.evaluate("window._vado.S.t")
            if t >= nxt: print(await pg.evaluate(CUENTA), flush=True); nxt += 60
            if t >= MIN * 60 or await pg.evaluate("window._vado.S.fin >= 0"): break
        await pg.evaluate("window._para = true; window._pinta = true"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/home/claude/pruebas/fuga_%s_%s.png' % (MODO, H))
        print(await pg.evaluate(CUENTA)); print('errores', errs[:5])
        await b.close()
asyncio.run(main())
