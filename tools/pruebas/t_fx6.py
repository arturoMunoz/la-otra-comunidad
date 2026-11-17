# Congela los efectos de hoja a mitad de animación y saca una foto: python3 t_fx4.py <clave> <tecla>
import asyncio, sys, base64
from playwright.async_api import async_playwright
HEROE = sys.argv[1]; K = sys.argv[2]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.x = 0; h.z = 2; if (V.MIO) {V.MIO.x = 0; V.MIO.z = 2;}}"); await pg.wait_for_timeout(4000)
        d = await pg.evaluate("""(k) => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.rk = {q:1,w:1,e:1,r:1}; h.mana = 999; for (const c of 'qwer') h.cd[c] = 0;
          V.FXP.length = 0; V.usaHab(h, k, 1, 0, h.x + 9, h.z); return 1;}""", K)
        await pg.wait_for_timeout(int(__import__("os").environ.get("ESPERA","900")))
        for i in range(40):
            if await pg.evaluate("() => window._vado.FXP.some(p => p.tipo === 'tiro' || p.tipo === 'proy')"): break
            await pg.wait_for_timeout(50)
        d = await pg.evaluate("""() => {const V = window._vado, nom = [];
          for (const p of V.FXP) if (p.tipo === 'tiro' || p.tipo === 'proy') {nom.push('PROY ' + p.k + ' rotY=' + p.o.rotation.y.toFixed(2)); p.o.scale.multiplyScalar(2);}
          for (const p of V.FXP) if (p.flip) {const {c, r} = p.flip, i = Math.floor(p.flip.n * 0.4); p.o.material.map.offset.set((i % c) / c, 1 - (Math.floor(i / c) + 1) / r); p.o.material.opacity = 1; p.o.scale.setScalar(p.esc); p.t = -99; nom.push(p.o.material.map.source.data && p.o.material.map.source.data.src ? p.o.material.map.source.data.src.split('/').pop() : '?');}
          V.renderer.render(V.scene, V.camera); return [nom, V.renderer.domElement.toDataURL('image/png')];}""")
        print('hojas', d[0]); open('/home/claude/pruebas/fx4_%s_%s.png' % (HEROE, K), 'wb').write(base64.b64decode(d[1].split(',')[1]))
        await b.close()
asyncio.run(main())
