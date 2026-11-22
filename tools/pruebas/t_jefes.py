# Nasor y el lagarto en partida (2v2, adelanta 400 s y pone tu heroe al lado de cada uno). FUEGO=1 cambia el elemento del lagarto.
import asyncio, json, sys, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','enano');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','2v2')" + (";localStorage.setItem('t.fuego','1')" if os.environ.get('FUEGO') else ''))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800)
        await pg.evaluate("setTimeout(() => document.getElementById('eOk').click(), 10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 30*400; i++) V.paso(1/30);}")
        await pg.wait_for_timeout(3000)
        r = await pg.evaluate("""() => {const V = window._vado, out = [];
          for (const u of V.S.u) if (u.k === 'j' && (u.tipo === 'uruk' || u.tipo === 'draco')) {const o = V.VIS && V.VIS.get(u.id); let info = null;
            if (o) {const THREE = V.THREE; let n = 0, vis = 0; o.raiz.traverse((q) => {if (q.isMesh) {n++; if (q.visible) vis++;}}); const bb = THREE ? new THREE.Box3().setFromObject(o.raiz) : null;
              info = {pos: [o.raiz.position.x, o.raiz.position.y, o.raiz.position.z].map((v) => +v.toFixed(2)), vis: o.raiz.visible, enEscena: !!o.raiz.parent, mallas: n, mallasVis: vis, esc: +o.raiz.scale.x.toFixed(2), caja: bb ? [bb.min.toArray().map((v) => +v.toFixed(1)), bb.max.toArray().map((v) => +v.toFixed(1))] : null};}
            out.push({tipo: u.tipo, id: u.id, x: +u.x.toFixed(1), z: +u.z.toFixed(1), vida: Math.round(u.vida), muerto: u.muerto, enVista: !!(V.VISTA && V.VISTA.get(u.id)), info});}
          return {t: V.S.t, jefes: out, PIT: V.PIT, PIT2: V.PIT2};}""")
        print(json.dumps(r, indent=1)[:3000])
        for nom, k in [('uruk', 'PIT'), ('draco', 'PIT2')]:
            await pg.evaluate("""(nom) => {const V = window._vado, u = V.S.u.find((q) => q.k === 'j' && q.tipo === nom); const h = V.S.u.find(e => e.id === V.YO);
              if (u && h) {h.x = u.x + 3; h.z = u.z + 3; h.vida = 99999; h.muerto = false; V.MIO.x = h.x; V.MIO.z = h.z;}
              if (u && nom === 'draco' && localStorage.getItem('t.fuego')) {u.elem = u.elem === 'f' ? 'h' : 'f'; u.id += 100000;}}""", nom)
            await pg.wait_for_timeout(3500)
            await pg.screenshot(path=f'/home/claude/pruebas/jefe_{nom}.png')
        print(errs[:8])
        await b.close()
asyncio.run(main())
