# Foto cenital de todo el mapa de la Batalla 2v2 de A-6 (cámara ortográfica desde arriba): python3 t_cenital.py [salida.png]
import asyncio, sys, base64
from playwright.async_api import async_playwright
SAL = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/pruebas/cenital.png'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 900, 'height': 900}); pg.on('console', lambda m: m.type in ('error','warning') and print('C', m.text[:300]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','enano');localStorage.setItem('auto.modo','2v2');localStorage.setItem('auto.cal','alta')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(() => document.getElementById('eOk').click(), 10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(6000); print(await pg.evaluate('window._errs||0'))
        url = await pg.evaluate("""() => {const V = window._vado, T = V.THREE, c = new T.OrthographicCamera(-42, 42, 66, -66, 1, 400);
          c.position.set(0, 150, 0); c.up.set(0, 0, -1); c.lookAt(0, 0, 0); c.updateMatrixWorld(); c.updateProjectionMatrix();
          V.scene.fog = null; V.scene.traverse((im) => {const c = im.userData && im.userData.cull; if (!c) return; im.instanceMatrix.array.set(c.todo.subarray(0, c.xs.length * 16)); im.count = c.xs.length; im.visible = true; im.instanceMatrix.clearUpdateRanges(); im.instanceMatrix.needsUpdate = true;});
          const r = V.renderer; r.setSize(480, 840, false); r.render(V.scene, c); return r.domElement.toDataURL('image/png');}""")
        open(SAL, 'wb').write(base64.b64decode(url.split(',')[1]))
        await b.close()
asyncio.run(main())
