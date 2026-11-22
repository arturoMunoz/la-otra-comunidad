# Variantes de luz en la Batalla (2v2): python3 t_luz.py  → /home/claude/pruebas/luz_<n>.png
# Cada variante: [sol color, sol intensidad, cielo, suelo, hemi intensidad, exposición]
import asyncio, json, os
from playwright.async_api import async_playwright
VAR = json.loads(os.environ.get('VAR', '[]')) or [None]
X, Z = [float(v) for v in os.environ.get('PUNTO', '-17,-20').split(',')]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 859, 'height': 396})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','%s');localStorage.setItem('auto.modo','%s')" % (os.environ.get('HEROE', 'enano'), os.environ.get('CAL', 'media'), os.environ.get('MODO', '2v2')))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(2000)
        await pg.evaluate("""([x, z]) => {const V = window._vado; for (let i = 0; i < 30*150; i++) V.paso(1/30);
          const yo = V.S.u.find(e => e.id === V.YO); yo.bot = false; yo.muerto = false; yo.vida = 5000; yo.x = x; yo.z = z; V.MIO.x = x; V.MIO.z = z;
          for (const q of V.S.u) if (q.k === 'h' && q.id !== V.YO) {q.x = x + 2.5; q.z = z + 1.5; q.muerto = false; q.vida = 5000;}}""", [X, Z])
        await pg.wait_for_timeout(4000)
        for n, v in enumerate(VAR):
            if v: await pg.evaluate("""(v) => {const V = window._vado, sc = V.scene; const sol = sc.children.find(q => q.isDirectionalLight), hemi = sc.children.find(q => q.isHemisphereLight);
                sol.color.set(v[0]); sol.intensity = v[1]; hemi.color.set(v[2]); hemi.groundColor.set(v[3]); hemi.intensity = v[4]; V.renderer.toneMappingExposure = v[5];}""", v)
            await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'/home/claude/pruebas/luz_{n}.png')
        await b.close()
asyncio.run(main())
