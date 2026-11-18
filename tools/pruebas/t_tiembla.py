# Mide si TU héroe tiembla en pantalla al andar, con un reloj falso de 60 fotogramas por segundo exactos
# (swiftshader va a ~4 fps: sin esto no se puede medir). python3 t_tiembla.py [fotogramas] [fps]
# Andando recto a velocidad fija tu héroe debería moverse en pantalla siempre lo mismo de un fotograma a otro.
import asyncio, sys, statistics as st
from playwright.async_api import async_playwright
N = int(sys.argv[1]) if len(sys.argv) > 1 else 90
FPS = float(sys.argv[2]) if len(sys.argv) > 2 else 60
RELOJ = """(() => {let t = 0, cola = [], real = performance.now.bind(performance); window._falso = false;
  const pn = performance.now.bind(performance); performance.now = () => window._falso ? t : (t = pn());
  const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (f) => {if (window._falso) {cola.push(f); return 1;} return raf(f);};
  window._paso = (ms) => {t += ms; const c = cola; cola = []; for (const f of c) f(t);};
  window._activaFalso = () => {window._falso = true;};})();"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 640, 'height': 300})
        await pg.add_init_script(RELOJ)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','hobbit');localStorage.setItem('auto.cal','media')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        await pg.evaluate("""() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.x = 0; h.z = -20; h.vida = 1e5; for (const u of V.S.u) if (u.id !== V.YO && u.heroe) {u.x = 30; u.z = 50;}
          window._reg = []; const r0 = V.renderer.render.bind(V.renderer), v3 = new V.THREE.Vector3();
          V.renderer.render = (s, c) => {r0(s, c); const o = V.VIS.get(V.YO); if (!o) return; v3.copy(o.raiz.position).project(c); window._reg.push([performance.now(), v3.x * 320, v3.y * 150, o.raiz.position.z, c.position.z]); if (window._fotos && window._fotos.length < 6 && window._reg.length > 60) window._fotos.push([V.renderer.domElement.toDataURL('image/png'), (v3.x + 1) / 2, (1 - v3.y) / 2]);}; window._fotos = [];
          V.MANDO.mx = 0; V.MANDO.mz = 1; window._activaFalso();}""")
        await pg.wait_for_timeout(300)
        import random; random.seed(3); VAIVEN = float(__import__('os').environ.get('VAIVEN', '0'))
        for i in range(N):
            await pg.evaluate("(ms) => window._paso(ms)", 1000 / FPS * (1 + VAIVEN * (random.random() * 2 - 1)))
        r = await pg.evaluate("window._reg")
        fotos = await pg.evaluate("window._fotos")
        import base64, io
        from PIL import Image
        tiras = []
        for i, (d, fx, fy) in enumerate(fotos):
            im = Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))); W, H = im.size; cx, cy = int(fx * W), int(fy * H)
            tiras.append(im.crop((cx - 60, cy - 110, cx + 60, cy + 40)).resize((240, 300)))
        if tiras:
            o = Image.new('RGB', (240 * len(tiras), 300)); [o.paste(t, (i * 240, 0)) for i, t in enumerate(tiras)]; o.save('/home/claude/pruebas/tiembla.png')
        await b.close()
    r = [q for q in r][-(N - 20):]
    dy = [r[i+1][2]-r[i][2] for i in range(len(r)-1)]; dzh = [r[i+1][3]-r[i][3] for i in range(len(r)-1)]; dzc = [r[i+1][4]-r[i][4] for i in range(len(r)-1)]
    print('fotogramas', len(r))
    print('héroe en el mundo, m por fotograma:', [round(x, 3) for x in dzh[:24]])
    print('cámara, m por fotograma:          ', [round(x, 3) for x in dzc[:24]])
    print("héroe en pantalla, px por fotograma (últimos):", [round(x, 2) for x in dy[-24:]])
    print('temblor en pantalla (desv. px/fot):', round(st.pstdev(dy), 3), ' héroe mundo desv:', round(st.pstdev(dzh), 4))
asyncio.run(main())
