import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        print(await pg.evaluate("""() => {const V = window._vado, S = V.S; const yo = S.u.find(h=>h.k==='h' && h.eq===0); if (yo) {yo.x = 0; yo.z = -20;} return Object.keys(S).slice(0,40).join(',') + ' | ' + !!yo;}"""))
        await pg.wait_for_timeout(2500)
        print(await pg.evaluate("""() => {const V=window._vado; const o=V.VIS.get(V.YO); if(!o) return "sin"; const r=o.raiz; let ms=[]; r.traverse(q=>{if(q.isMesh) ms.push(q.visible+"|"+q.material.opacity+"|"+q.material.transparent);}); o.ms=ms.slice(0,4); return JSON.stringify({vis:r&&r.visible, sc:r&&r.scale.x, pos:r&&r.position.toArray().map(x=>+x.toFixed(1)), ms:o.ms, act:o.actual&&o.actual._clip.name, ws:r.getWorldScale(new V.THREE.Vector3()).x});}"""))
        await pg.screenshot(path='/home/claude/pruebas/ver_%s.png' % H)
        await b.close()
asyncio.run(main())
