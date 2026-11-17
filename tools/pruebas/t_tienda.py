import asyncio, base64, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','elfo');localStorage.setItem('auto.cal','media')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(5000)
        for nombre, pos, mira in [('a', (0, 34, 62), (0, 0, 30)), ('b', (14, 9, 18), (0, 0, 0))]:
            d = await pg.evaluate("""([p,m]) => {const V=window._vado, T=V.THREE; const cam=new T.PerspectiveCamera(45,844/390,0.1,400); cam.position.set(...p); cam.lookAt(...m); V.renderer.render(V.scene,cam); return V.renderer.domElement.toDataURL('image/png');}""", [list(pos), list(mira)])
            open('/home/claude/pruebas/mapa_%s.png' % nombre,'wb').write(base64.b64decode(d.split(',')[1]))
        await pg.evaluate("document.getElementById('bTienda').classList.remove('hidden'); document.getElementById('bTienda').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); document.getElementById('bTienda').click()"); await pg.wait_for_timeout(1500); await pg.screenshot(path='/home/claude/pruebas/tienda.png')
        print('ERR', errs[:5])
        await b.close()
asyncio.run(main())
