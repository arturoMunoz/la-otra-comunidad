# Mide dibujos y triángulos en una pelea de A-6 (y de qué son): python3 t_perf.py HEROE
import asyncio, sys, json
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'rohan'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 858, 'height': 396})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','media')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 30*75; i++) V.paso(1/30); const h = V.S.u.find(u => u.id === V.YO); const b = V.S.u.find(u => u.k === 'h' && u.eq !== h.eq); h.x = b.x; h.z = b.z + 3; if (V.MIO) {V.MIO.x = h.x; V.MIO.z = h.z;}}")
        await pg.wait_for_timeout(5000)
        r = await pg.evaluate("""() => {const V = window._vado, R = V.renderer; for (let i = V.FXP.length - 1; i >= 0; i--) {const p = V.FXP[i]; if (p.o) {p.o.parent && p.o.parent.remove(p.o); V.FXP.splice(i, 1);}} R.info.autoReset = false; R.info.reset(); R.render(V.scene, V.camera); const sh = R.shadowMap.enabled; R.shadowMap.enabled = false; R.info.reset(); R.render(V.scene, V.camera); const sinS = R.info.render.calls; R.shadowMap.enabled = sh; R.info.reset(); R.render(V.scene, V.camera); const inf = {calls: R.info.render.calls, tris: R.info.render.triangles, geos: R.info.memory.geometries, tex: R.info.memory.textures, progs: R.info.programs.length, sinSombra: sinS};
          const grupos = {}; V.scene.traverse((o) => {if (!(o.isMesh || o.isPoints || o.isSprite) || !o.visible) return; let v = true, q = o; while (q) {if (!q.visible) {v = false; break;} q = q.parent;} if (!v) return; let top = o; const cad = []; while (top.parent && top.parent !== V.scene) {cad.push(top.name || ''); top = top.parent;} const k = (top.name || top.type) + '/' + (cad.slice(-2).join('<') || o.name) + (o.castShadow ? '[sh]' : '') + (o.isInstancedMesh ? '[I]' : '') + (o.isSkinnedMesh ? '[S]' : ''); const g = o.geometry; const t = g ? (g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3 * (o.isInstancedMesh ? o.count : 1) : 0; grupos[k] = grupos[k] || [0, 0]; grupos[k][0]++; grupos[k][1] += t;});
          const cnt = {}; V.scene.traverse((o) => {if (o.isMesh || o.isSprite || o.isPoints) o.onBeforeRender = () => {let top = o, cad = []; while (top.parent && top.parent !== V.scene) {cad.push(top.name || ''); top = top.parent;} const k = (top.name || top.type) + '/' + (cad.slice(-2).join('<') || o.name) + ':' + o.type + ':' + (o.material && o.material.name || '') + ':' + (o.geometry && o.geometry.type) + ':' + (o.material && o.material.type) + ':' + (o.material && o.material.color ? o.material.color.getHexString() : '') + ':' + (o.isInstancedMesh ? 'I' + o.count : '') + ':' + (o.material && o.material.map && o.material.map.source.data && o.material.map.source.data.src ? o.material.map.source.data.src.split('/').pop().slice(0,24) : ''); cnt[k] = (cnt[k] || 0) + 1;};}); R.shadowMap.enabled = false; R.render(V.scene, V.camera); R.shadowMap.enabled = sh; inf.dibujados = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 25);
          R.info.autoReset = true; return [inf, Object.entries(grupos).sort((a, b) => b[1][1] - a[1][1]).slice(0, 40), V.PERF];}""")
        print(json.dumps(r[0])); 
        for x in r[1]: print(x)
        print('PERF', json.dumps(r[2])[:400])
        await b.close()
asyncio.run(main())
