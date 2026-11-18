# Ficha de estadísticas (elegir héroe) y efecto de un objeto en la tienda: python3 t_ficha.py [autopista|index] HEROE OBJETO
import asyncio, sys
from playwright.async_api import async_playwright
PAG = sys.argv[1] if len(sys.argv) > 1 else 'autopista'; H = sys.argv[2] if len(sys.argv) > 2 else 'gandalf'; OB = sys.argv[3] if len(sys.argv) > 3 else 'tomo'
P = 'auto' if PAG == 'autopista' else 'vado'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('%s.heroe','%s');localStorage.setItem('%s.cal','baja');localStorage.setItem('vado.heroe','%s')" % (P,H,P,H))
        await pg.goto('http://localhost:8799/batalla/%s.html' % PAG); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(900)
        await pg.screenshot(path='/home/claude/pruebas/ficha_elige_%s.png' % PAG)
        await pg.click('#eInfo'); await pg.wait_for_timeout(600)
        await pg.screenshot(path='/home/claude/pruebas/ficha_%s.png' % PAG)
        await pg.evaluate("document.querySelector('#fichaH .fIn').scrollTop = 9999"); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/home/claude/pruebas/ficha_%s_b.png' % PAG)
        await pg.click('#fX'); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(1500)
        await pg.evaluate("document.getElementById('bTienda').classList.remove('hidden'); document.getElementById('bTienda').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); document.getElementById('bTienda').click()"); await pg.wait_for_timeout(900)
        await pg.evaluate("(o) => {const b = document.querySelector('#tienda [data-cat=atq]'); b.click(); const c = document.querySelector('#tienda .tLista [data-id=' + o + ']') || document.querySelector('#tienda [data-cat=def]'); c.click(); const d = document.querySelector('#tienda .tLista [data-id=' + o + ']'); if (d) d.click();}", OB); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/home/claude/pruebas/tienda_%s.png' % PAG)
        await pg.click('#tAyuda'); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/home/claude/pruebas/tienda_ayuda_%s.png' % PAG)
        print('ERR', errs[:5])
        await b.close()
asyncio.run(main())
