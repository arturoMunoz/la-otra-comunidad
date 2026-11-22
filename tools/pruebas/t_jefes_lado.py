# Foto de lado de Nasor, el lagarto y un héroe a la escala del juego (sin el juego encima).
# Uso: python3 t_jefes_lado.py [salida.png]   (servidor en public:8799)
import asyncio, json, sys, base64
from playwright.async_api import async_playwright
SAL = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/pruebas/jefes_lado.png'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','enano');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','2v2')")
        import os
        if os.environ.get('VAR'): await pg.add_init_script("localStorage.setItem('t.var', " + json.dumps(os.environ['VAR']) + ")")
        if os.environ.get('CAM'): await pg.add_init_script("localStorage.setItem('t.cam', " + json.dumps(os.environ['CAM']) + ")")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800)
        await pg.evaluate("setTimeout(() => document.getElementById('eOk').click(), 10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(2000)
        r = await pg.evaluate("""() => {const V = window._vado, T = V.THREE, out = {};
          const sc = new T.Scene(); sc.background = new T.Color('#6d7a86'); const SOL = localStorage.getItem('t.sol') || '#ffe6c8';
          sc.add(new T.HemisphereLight('#dfe8ff', '#4a4038', 1.6)); const d = new T.DirectionalLight(SOL, 2.2); d.position.set(5, 9, 6); sc.add(d);
          const suelo = new T.Mesh(new T.PlaneGeometry(40, 20), new T.MeshLambertMaterial({color: '#3a3d42'})); suelo.rotation.x = -Math.PI / 2; sc.add(suelo);
          const VAR = JSON.parse(localStorage.getItem('t.var') || '[]');
          const tinta = (o, col, cfg) => {const c = new T.Color(col); o.raiz.traverse((q) => {if (!q.isMesh) return; const m = q.material; if (m.name === 'energia' || m.name === 'brillo') {m.emissive.set(cfg.luz || col); m.emissiveIntensity = cfg.li || 3.5; m.color.set(cfg.luz || col); return;}
            m.color.lerp(c, cfg.l).multiplyScalar(cfg.m); m.emissive.copy(c); m.emissiveIntensity = cfg.e; if (cfg.r !== undefined) m.roughness = cfg.r; if (cfg.mt !== undefined) m.metalness = cfg.mt;});};
          const lista = VAR.length ? VAR : [['ap_brask', V.HEROES.enano.alto || 2.05, 1.28, -5], ['ap_nasor', 4.5, 1, 0], ['ap_lagarto', 2.1, 1, 6]];
          for (const [n, h, e, x, col, cfg] of lista) {const o = V.montar(n, h); o.raiz.scale.multiplyScalar(e); if (col) tinta(o, col, cfg); o.raiz.position.set(x, 0, 0); o.raiz.rotation.y = n === 'ap_lagarto' ? -Math.PI / 2 : 0.5; sc.add(o.raiz);
            const c = o.clips.quieto || Object.values(o.todos)[0]; if (c) c.play(); o.mixer.update(0.3); o.raiz.updateMatrixWorld(true);
            const bb = new T.Box3().setFromObject(o.raiz, true); out[n] = {alto: +V.alto(n).toFixed(2), esc: +o.raiz.scale.x.toFixed(3), caja: [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map((v) => +v.toFixed(2)),
              mats: []}; o.raiz.traverse((q) => {if (q.isMesh) for (const m of [].concat(q.material)) out[n].mats.push([m.type, m.name, '#' + m.color.getHexString(), m.emissive ? '#' + m.emissive.getHexString() : null, m.emissiveIntensity, !!m.map, !!m.emissiveMap, m.metalness, m.roughness]);});}
          const cam = new T.PerspectiveCamera(35, 844 / 390, 0.1, 200); const CP = JSON.parse(localStorage.getItem('t.cam') || '[0.5,3.2,19,0.5,1.8,0]'); cam.position.set(CP[0], CP[1], CP[2]); cam.lookAt(CP[3], CP[4], CP[5]);
          V.renderer.render(sc, cam); out.png = V.renderer.domElement.toDataURL('image/png'); return out;}""")
        open(SAL, 'wb').write(base64.b64decode(r.pop('png').split(',')[1]))
        print(json.dumps({k: v['caja'] for k, v in r.items()})); print(errs[:5])
        await b.close()
asyncio.run(main())
