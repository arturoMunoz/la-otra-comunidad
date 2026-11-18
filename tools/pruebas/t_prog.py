# Lista los sombreadores compilados que contienen un texto (para ver en qué se diferencian): python3 t_prog.py TEXTO
import asyncio, sys, json
from playwright.async_api import async_playwright
Q = sys.argv[1] if len(sys.argv) > 1 else 'rimA6'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','visor');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','2v2')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(120):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(1500)
        a = await pg.evaluate("(q) => window._vado.renderer.info.programs.filter(p => p.cacheKey.includes(q)).map(p => p.cacheKey)", Q)
        await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 30*95; i++) V.paso(1/30); const s = V.S.u.filter(u => u.k === 's'); let cx = 0, cz = 0; for (const u of s) {cx += u.x; cz += u.z;} cx /= s.length; cz /= s.length; for (const h of V.S.u) if (h.k === 'h') {h.bot = true; h.x = cx; h.z = cz;}}")
        await pg.wait_for_timeout(15000)
        c = await pg.evaluate("(q) => window._vado.renderer.info.programs.filter(p => p.cacheKey.includes(q)).map(p => p.cacheKey)", Q)
        nuevos = [k for k in c if k not in a]
        print('al empezar', len(a), 'después', len(c), 'nuevos', len(nuevos))
        for k in nuevos:
            # compara con el más parecido de los de antes
            pa = k.split(','); mejor = min(a, key=lambda x: sum(1 for i, j in zip(x.split(','), pa) if i != j)) if a else ''
            dif = [(i, x, y) for i, (x, y) in enumerate(zip(mejor.split(','), pa)) if x != y]
            print('NUEVO', k[:90].replace(chr(10),' '), '| difiere en', dif[:8])
        await b.close()
asyncio.run(main())
