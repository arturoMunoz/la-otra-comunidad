# Mirar el mapa con el minimapa: dedo en el minimapa → la cámara va allí; al soltar vuelve. python3 t_peek.py [modo] [ancho alto]
import asyncio, sys
from playwright.async_api import async_playwright
MODO = sys.argv[1] if len(sys.argv) > 1 else '2v2'; W = int(sys.argv[2]) if len(sys.argv) > 2 else 844; H = int(sys.argv[3]) if len(sys.argv) > 3 else 390
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': W, 'height': H}, has_touch=True)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','elfo');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','%s')" % MODO)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.click('#bBots'); await pg.wait_for_timeout(1000); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(4000)
        cam = "(() => {const c = window._vado.camera.position; const yo = window._vado.S.u.find(q => q.id === window._vado.YO); return [+c.x.toFixed(1), +c.z.toFixed(1), +yo.x.toFixed(1), +yo.z.toFixed(1)];})()"
        print('antes', await pg.evaluate(cam))
        r = await pg.evaluate("(() => {const r = document.getElementById('mini').getBoundingClientRect(); return [r.left, r.top, r.width, r.height];})()")
        print('minimapa', r)
        await pg.screenshot(path='/home/claude/pruebas/peek0.png')
        for fx, fy, n in ((0.5, 0.5, 'centro'), (0.9, 0.5, 'derecha'), (0.15, 0.2, 'izq_arriba')):
            x, y = r[0] + r[2] * fx, r[1] + r[3] * fy
            await pg.mouse.move(x, y); await pg.mouse.down(); await pg.wait_for_timeout(1500)
            print(n, await pg.evaluate(cam)); await pg.screenshot(path='/home/claude/pruebas/peek_%s.png' % n)
            await pg.mouse.up(); await pg.wait_for_timeout(1200)
            print('  suelto', await pg.evaluate(cam))
        print('errores', errs)
        await b.close()
asyncio.run(main())
