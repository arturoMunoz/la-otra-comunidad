import asyncio, base64
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','orco');localStorage.setItem('auto.cal','alta')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        d = await pg.evaluate("""() => {const V=window._vado, T=V.THREE; const sc=new T.Scene(); sc.background=new T.Color('#556070'); sc.add(new T.HemisphereLight('#fff','#445',2.2)); const dl=new T.DirectionalLight('#fff',2); dl.position.set(3,6,8); sc.add(dl);
          const ns=['ap_brask','ap_vael','ap_grub','ap_ata','ap_birdie','ap_fu','ap_moha'], al=[2.45,2.05,1.25,2.05,2.05,2.05,2.05];
          ns.forEach((n,i)=>{const o=V.montar(n,al[i]); o.raiz.position.set((i-3)*1.7,0,0); if(o.clips.quieto){o.clips.quieto.play();o.mixer.update(0.4);} sc.add(o.raiz);});
          const cam=new T.PerspectiveCamera(35,844/390,0.1,100); cam.position.set(0,2.2,13); cam.lookAt(0,1.1,0);
          V.renderer.render(sc,cam); return V.renderer.domElement.toDataURL('image/png');}""")
        open('/home/claude/pruebas/foto_heroes.png','wb').write(base64.b64decode(d.split(',')[1]))
        await b.close()
asyncio.run(main())
