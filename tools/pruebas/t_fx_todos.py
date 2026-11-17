import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 500, 'height': 240})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and 'supabase' not in str(m.location) and errs.append(m.text[:300]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','hobbit');localStorage.setItem('auto.cal','baja')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        for t in ['enano','gandalf','orco','elfo','hobbit','gollum','rohan']:
            for k in 'qwer':
                r = await pg.evaluate("""([t,k]) => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.tipo = t; h.muerto = 0; h.vida = 9999; h.rk = {q:1,w:1,e:1,r:1}; h.mana = 999; h.aturd = 0; for (const c of 'qwer') h.cd[c] = 0; return V.usaHab(h, k, 0, -1, h.x, h.z - 5);}""", [t, k])
                await pg.wait_for_timeout(700)
                print(t, k, r, end=' | ')
        await pg.wait_for_timeout(3000)
        print('\nERR', errs[:6]); await b.close()
asyncio.run(main())
