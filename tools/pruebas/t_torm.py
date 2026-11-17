import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader'])
        pg = await b.new_page(viewport={'width': 780, 'height': 360}, device_scale_factor=2)
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','hobbit')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2000)
        await pg.screenshot(path='/home/claude/pruebas/torm_a.png')
        for i in range(40):
            await pg.wait_for_timeout(100)
            if await pg.evaluate("() => +getComputedStyle(document.querySelector('#mFondo .tL')).opacity > 0.8"): break
        await pg.wait_for_timeout(40); await pg.screenshot(path='/home/claude/pruebas/torm_b.png'); print(errs)
        await b.close()
asyncio.run(main())
