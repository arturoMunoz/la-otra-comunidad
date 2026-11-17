# Fotos del menú y de elegir héroe de A-6 a un tamaño de móvil: python3 t_menu.py ANCHO ALTO
import asyncio, sys
from playwright.async_api import async_playwright
W, H = int(sys.argv[1]), int(sys.argv[2])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2, has_touch=True)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','orco');localStorage.setItem('auto.cal','baja')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(4000)
        await pg.screenshot(path=f'/home/claude/pruebas/menu_{W}x{H}.png')
        print(await pg.evaluate("() => {const r = []; for (const s of ['#menu', '.mAmigos', '#bAjM', '.mFila2']) {const e = document.querySelector(s); if (e) {const b = e.getBoundingClientRect(); r.push(s + ' ' + Math.round(b.top) + '-' + Math.round(b.bottom));}} return r.join(' | ') + ' | alto ' + innerHeight;}"))
        await pg.click('#bBots'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'/home/claude/pruebas/elige_{W}x{H}.png')
        await b.close()
asyncio.run(main())
