# Foto de la pantalla de elegir héroe contra la máquina (con la fila del rival): python3 t_elige.py [autopista|index]
import asyncio, sys
from playwright.async_api import async_playwright
P = sys.argv[1] if len(sys.argv) > 1 else 'autopista'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, has_touch=True)
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('vado.cal','baja');localStorage.setItem('auto.cal','baja')")
        await pg.goto('http://localhost:8799/batalla/%s.html' % P); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(1200)
        await pg.click('.eRival [data-r="hobbit"]'); await pg.wait_for_timeout(400)
        await pg.screenshot(path='/home/claude/pruebas/elige_%s.png' % P)
        sc = await pg.evaluate("() => {const e = document.querySelector('#elige .eDer') || document.getElementById('elige'); return [e.scrollHeight, e.clientHeight];}")
        await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        r = await pg.evaluate("() => window._vado.S.u.filter((u) => u.k === 'h').map((u) => [u.slot, u.tipo, u.bot, u.nombre])")
        print('scroll', sc, 'héroes', r, 'errores', err[:3])
        await b.close()
asyncio.run(main())
