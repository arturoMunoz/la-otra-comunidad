# Foto de cerca de los mandos de A-6 (habilidades aprendidas): python3 t_mandos.py HEROE
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'elfo'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 859, 'height': 396}, device_scale_factor=3, has_touch=True)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*100; i++) V.paso(1/30);}""")
        for k in ['bQ','bW','bE','bR']:
            await pg.evaluate("(k) => {const m = document.querySelector('#' + k + ' .mas'); if (m) for (const t of ['pointerdown','pointerup','click']) m.dispatchEvent(new PointerEvent(t, {bubbles: true}));}", k)
            await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 20; i++) V.paso(1/30);}")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("() => {for (const k of ['bQ','bW','bR']) {const b = document.getElementById(k); b.classList.add('pronta'); b.classList.remove('sinAprender','bloq');}}")
        await pg.screenshot(path='/home/claude/pruebas/mandos_'+sys.argv[1]+'.png')
        print(await pg.evaluate("() => ['bQ','bW','bE','bR'].map(k => {const r = document.getElementById(k).getBoundingClientRect(); return k + ' ' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width)}).join(' | ')"))
        await b.close()
asyncio.run(main())
