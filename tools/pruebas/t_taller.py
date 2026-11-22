# Fotos del Taller (la tienda) en el móvil de Henar (859x396): python3 t_taller.py [HEROE] [ANCHO ALTO]  (servidor en public:8799)
# Fotos en /home/claude/pruebas/taller_*.png: recomendado, ataque, un legendario con la receta a medias, encantamientos.
import asyncio, sys, os
from playwright.async_api import async_playwright
HEROE = sys.argv[1] if len(sys.argv) > 1 else 'hobbit'; W = int(sys.argv[2]) if len(sys.argv) > 2 else 859; H = int(sys.argv[3]) if len(sys.argv) > 3 else 396
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': W, 'height': H}, has_touch=True, device_scale_factor=2)
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000); await pg.evaluate("() => {const g = document.getElementById('guia'); if (g) g.remove();}")
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.oro = 2300; h.inv = ['hoja']; h.nivel = 5;}")
        await pg.wait_for_timeout(1200)
        await pg.evaluate("() => document.getElementById('bTienda').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}))")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/home/claude/pruebas/taller_rec.png')
        cats = await pg.evaluate("() => [...document.querySelectorAll('#tienda [data-cat]')].map(b => b.dataset.cat)")
        if len(cats) > 1:
            await pg.click('#tienda [data-cat="%s"]' % cats[1]); await pg.wait_for_timeout(600); await pg.screenshot(path='/home/claude/pruebas/taller_cat.png')
        leg = await pg.evaluate("() => {const b = [...document.querySelectorAll('#tienda .tI.leg')][0]; return b ? b.dataset.id : null;}")
        if leg:
            await pg.click('#tienda .tI.leg[data-id="%s"]' % leg); await pg.wait_for_timeout(600); await pg.screenshot(path='/home/claude/pruebas/taller_leg.png')
        if 'enc' in cats:
            await pg.click('#tienda [data-cat="enc"]'); await pg.wait_for_timeout(600); await pg.screenshot(path='/home/claude/pruebas/taller_enc.png')
        # vender lo que llevas y deshacerlo
        await pg.click('#tienda [data-cat="rec"]'); await pg.wait_for_timeout(400)
        oro0 = await pg.evaluate("() => window._vado.VISTA.get(window._vado.YO).oro")
        await pg.click('#tienda .tHueco.lleno'); await pg.wait_for_timeout(500); await pg.screenshot(path='/home/claude/pruebas/taller_vender.png')
        await pg.click('#tVender'); await pg.wait_for_timeout(700)
        oro1, inv1 = await pg.evaluate("() => {const v = window._vado.VISTA.get(window._vado.YO); return [v.oro, v.inv.join(',')];}")
        await pg.screenshot(path='/home/claude/pruebas/taller_vendido.png')
        await pg.click('#tDesh'); await pg.wait_for_timeout(700)
        oro2, inv2 = await pg.evaluate("() => {const v = window._vado.VISTA.get(window._vado.YO); return [v.oro, v.inv.join(',')];}")
        print('vender: oro', oro0, '->', oro1, 'inv', inv1, '| deshacer: oro', oro2, 'inv', inv2)
        info = await pg.evaluate("() => {const t = document.getElementById('tienda'), q = (s) => {const e = t.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), e.scrollHeight > e.clientHeight + 2 ? 'scroll' : ''];}; return {cab: q('.tCab'), cats: q('.tCats'), lista: q('.tLista'), det: q('.tDet'), buy: q('#tComprar')};}")
        print(cats, info); print('errores', err[:5])
        await b.close()
asyncio.run(main())
