import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','orco');localStorage.setItem('auto.cal','baja')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        print(await pg.evaluate("""() => {const V=window._vado, r={}; for (const n of ['ap_grub','ap_brask','ap_ata','hobbit_kk','enano_kk']) {if(!V.M[n]) {r[n]='no';continue;} const o=V.montar(n,2); let ms=[]; o.raiz.traverse(q=>{if(q.isMesh) ms.push(q.name+':'+q.visible+':'+(q.isSkinnedMesh?'S':''));}); if(o.clips.quieto){o.clips.quieto.play(); o.mixer.update(0.3);} o.raiz.updateMatrixWorld(true); const bb=new V.THREE.Box3().setFromObject(o.raiz,true); r[n]=[bb.min.toArray().map(x=>+x.toFixed(2)),bb.max.toArray().map(x=>+x.toFixed(2))];} return JSON.stringify(r);}"""))
        await b.close()
asyncio.run(main())
