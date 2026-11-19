# Mide si los pies resbalan al correr: velocidad del pie apoyado frente a la del héroe. python3 t_pies.py HEROE...
import asyncio, sys, json
from playwright.async_api import async_playwright
async def uno(p, H):
    b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = await b.new_page(viewport={'width': 300, 'height': 300})
    await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % H)
    await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
    await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
    for i in range(60):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
    await pg.evaluate("() => {const V = window._vado; V.S.u.find((u) => u.id === V.YO).bot = true;}"); await pg.wait_for_timeout(6000)
    r = await pg.evaluate("""async () => {const V = window._vado, h = V.S.u.find((u) => u.id === V.YO), o = V.VIS.get(h.id); let pieL = null, pieR = null;
      o.raiz.traverse((q) => {if (q.isBone && /^footl$|foot\\.l|footL/.test(q.name)) pieL = q; if (q.isBone && /^footr$|foot\\.r|footR/.test(q.name)) pieR = q;});
      const T = new V.THREE.Vector3(), out = []; let pr = null;
      for (let i = 0; i < 90; i++) {await new Promise((r) => setTimeout(r, 33)); o.raiz.updateMatrixWorld(true); const a = pieL.getWorldPosition(T.clone()), bb = pieR.getWorldPosition(T.clone()), c = o.raiz.position.clone(), t = performance.now();
        out.push([t, c.x, c.z, a.x, a.y, a.z, bb.x, bb.y, bb.z]);}
      return {nombre: pieL && pieL.name, ts: o.clips.correr && o.clips.correr.timeScale, out};}""")
    await b.close()
    o = r['out']; vc = []; vp = []
    for i in range(1, len(o)):
        dt = (o[i][0] - o[i-1][0]) / 1000
        if dt <= 0: continue
        v = ((o[i][1]-o[i-1][1])**2 + (o[i][2]-o[i-1][2])**2) ** .5 / dt
        for k in (3, 6):
            y = o[i][k+1]; ys = [q[k+1] for q in o]; mn = min(ys)
            if y < mn + 0.04:
                vp.append((((o[i][k]-o[i-1][k])**2 + (o[i][k+2]-o[i-1][k+2])**2) ** .5 / dt) / max(v, 0.01))
        vc.append(v)
    vm = sum(vc)/len(vc); print(H, 'hueso', r['nombre'], 'timeScale', round(r['ts'] or 0, 2), 'vel héroe', round(vm, 2), 'pie apoyado / héroe', round(sum(vp)/max(1,len(vp)), 2) if vp else '-')
async def main():
    async with async_playwright() as p:
        for H in sys.argv[1:]: await uno(p, H)
asyncio.run(main())
