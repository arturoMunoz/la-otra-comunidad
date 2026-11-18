# Tirones en una pelea 2v2 de A-6: python3 t_lag.py SEG [PR]
# Los 4 héroes (bots) en mitad de un carril con las oleadas; se mide cada fotograma (JS + envío a la gráfica)
# y, en los picos, qué ha cambiado: sombreadores nuevos, objetos nuevos en escena, texturas nuevas.
import asyncio, sys, json, os
from playwright.async_api import async_playwright
SEG = float(sys.argv[1]) if len(sys.argv) > 1 else 20; PR = float(sys.argv[2]) if len(sys.argv) > 2 else 0.25
PAG = os.environ.get('PAG', 'autopista.html'); PRE = 'auto' if 'autopista' in PAG else 'vado'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script(f"localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({{at:'x',rt:'x',exp:9e15}}));localStorage.setItem('{PRE}.heroe','visor');localStorage.setItem('{PRE}.cal','media');localStorage.setItem('{PRE}.modo','2v2');localStorage.setItem('{PRE}.fps','60')")
        await pg.goto('http://localhost:8799/batalla/' + PAG); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(120):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        await pg.evaluate(r"""async () => {const T = await import('three'); window._T = T; window._disp = {}; const d0 = T.Texture.prototype.dispose; T.Texture.prototype.dispose = function () {const st = (new Error().stack || '').split('\n').slice(2, 6).map(l => (l.match(/at (\S+)/) || [])[1] + ':' + ((l.match(/:(\d+):\d+\)?$/) || [])[1])).join(' < '); const k = (this.image && this.image.src ? this.image.src.split('/').pop().split('?')[0] : 'sin') + ' ' + st; window._disp[k] = (window._disp[k] || 0) + 1; return d0.call(this);};
          const md = T.Material.prototype.dispose; T.Material.prototype.dispose = function () {const st = (new Error().stack || '').split('\n').slice(2, 5).map(l => (l.match(/at (\S+)/) || [])[1] + ':' + ((l.match(/:(\d+):\d+\)?$/) || [])[1])).join(' < '); const k = 'MAT ' + this.type + ' ' + (this.map && this.map.image && this.map.image.src ? this.map.image.src.split('/').pop().split('?')[0] : '') + ' ' + st; window._disp[k] = (window._disp[k] || 0) + 1; return md.call(this);};}""")
        await pg.evaluate("(c) => {window._calienta = c;}", int(os.environ.get("CALIENTA", "0")))
        await pg.evaluate(r"""async (pr) => {const V = window._vado; for (let i = 0; i < 30*95; i++) V.paso(1/30);
          for (let i = V.FXP.length - 1; i >= 0; i--) {const p = V.FXP[i]; if (p.o) {p.o.parent && p.o.parent.remove(p.o); V.FXP.splice(i, 1);}}
          V.renderer.setPixelRatio(pr);
          /* punto de pelea: donde están los súbditos del carril 0 */
          const s = V.S.u.filter(u => u.k === 's' && !u.muerto); let cx = 0, cz = 0; for (const u of s) {cx += u.x; cz += u.z;} cx /= s.length || 1; cz /= s.length || 1;
          window._pc = [cx, cz];
          for (const h of V.S.u) if (h.k === 'h') {h.bot = true; h.x = cx + (h.eq ? 2 : -2) + Math.random(); h.z = cz + (h.eq ? 2 : -2);}
          window._vivo = setInterval(() => {for (const h of V.S.u) if (h.k === 'h') {h.vida = Math.max(h.vida, 300); if (h.muerto) {h.muerto = false; h.x = cx; h.z = cz;}}}, 500);
          await new Promise((r) => setTimeout(r, +(window._calienta || 0)));
          /* espías en WebGL: subidas de texturas, compilaciones y búferes por fotograma */
          const gl = V.renderer.getContext(), SP = window._sp = {tex: 0, texPx: 0, comp: 0, buf: 0, bufB: 0, nombres: []};
          const ti = gl.texImage2D.bind(gl); gl.texImage2D = (...a) => {SP.tex++; const im = a[a.length - 1]; const w = (im && (im.width || im.videoWidth)) || a[3] || 0, h = (im && im.height) || a[4] || 0; SP.texPx += w * h; if (w * h > 60000) SP.nombres.push((im && im.src ? im.src.split('/').pop() : (im && im.constructor && im.constructor.name)) + ' ' + w + 'x' + h); return ti(...a);};
          const ts = gl.texSubImage2D.bind(gl); gl.texSubImage2D = (...a) => {SP.tex++; return ts(...a);};
          Error.stackTraceLimit = 60; SP.geos = new Set(); SP.mats = new Set(); SP.texs = new Set(); SP.nG = {}; SP.nM = {}; SP.nT = {}; SP.pilas = {}; const pila = (k) => {const st = (new Error().stack || '').split('\n').filter(l => /autopista|juego\.js/.test(l)).slice(0, 5).map(l => (l.match(/at (\S+)/) || [])[1] + ':' + ((l.match(/:(\d+):\d+\)?$/) || [])[1])).join(' < '); SP.pilas[k + ' ' + st] = (SP.pilas[k + ' ' + st] || 0) + 1;};
          const PG = V.renderer.properties.get.bind(V.renderer.properties); let ultTex = null; let ultMat = null; V.renderer.properties.get = (o) => {if (o && o.isTexture) ultTex = o; if (o && o.isMaterial) ultMat = o; return PG(o);};
          const ct = gl.createTexture.bind(gl); gl.createTexture = () => {const t = ultTex; const k = 'TEXGL ' + (t ? ((t.image && t.image.src ? t.image.src.split('/').pop().split('?')[0] : t.constructor.name + (t.image ? ' ' + t.image.width + 'x' + t.image.height : '')) + ' clave=' + [t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.anisotropy, t.format, t.type, t.generateMipmaps, t.premultiplyAlpha, t.flipY, t.colorSpace].join(',')) : '?'); SP.pilas[k] = (SP.pilas[k] || 0) + 1; return ct();};
          const cb2 = gl.createBuffer.bind(gl); gl.createBuffer = () => {pila('BUF'); return cb2();};
          const cp = gl.createProgram.bind(gl); gl.createProgram = () => {const m = ultMat; let quien = ''; if (m) V.scene.traverse((o) => {if (!quien && o.material === m) {let q = o, c = []; while (q && q !== V.scene) {c.push((q.name || q.type) + (q.geometry ? '/' + q.geometry.type + (q.geometry.attributes.position ? q.geometry.attributes.position.count : '') : '')); q = q.parent;} quien = c.join('<') + ' transp=' + m.transparent + ' map=' + (m.map && m.map.image && m.map.image.src ? m.map.image.src.split('/').pop() : !!m.map);}}); const k = 'PROGGL ' + quien + ' ' + (m ? m.type + ' ' + (m.name || '') + ' blend' + m.blending + (m.map && m.map.image && m.map.image.src ? ' ' + m.map.image.src.split('/').pop() : '') + ' ' + (m.customProgramCacheKey ? m.customProgramCacheKey() : '') + ' skin?' : '?'); SP.pilas[k] = (SP.pilas[k] || 0) + 1; return cp();};
          const cs = gl.compileShader.bind(gl); gl.compileShader = (x) => {SP.comp++; return cs(x);};
          const bd = gl.bufferData.bind(gl); gl.bufferData = (t, d, u) => {SP.buf++; SP.bufB += (d && d.byteLength) || (typeof d === 'number' ? d : 0); return bd(t, d, u);};
          /* medidor por fotograma */ const RR = V.renderer.render.bind(V.renderer); window._rT = 0; V.renderer.render = (a, b) => {const t = performance.now(); RR(a, b); window._rT += performance.now() - t;};
          const R = V.renderer, M = window._med = [], raf0 = window.requestAnimationFrame.bind(window);
          let ultO = 0, ultP = R.info.programs.length, ultT = R.info.memory.textures, ultG = R.info.memory.geometries;
          window.requestAnimationFrame = (cb) => raf0((t) => {const a = performance.now(); cb(t); const d = performance.now() - a;
            if (cb.name === 'bucle') {let n = 0; V.scene.traverse((o) => {n++; if (!o.isMesh && !o.isSprite && !o.isPoints) return; const nom = (o.name || o.type) + '<' + (o.parent && (o.parent.name || o.parent.type)) + '>';
                if (o.geometry && !SP.geos.has(o.geometry.uuid)) {SP.geos.add(o.geometry.uuid); if (SP.listo) {const kk = nom + ' ' + o.geometry.type + ' v' + (o.geometry.attributes.position ? o.geometry.attributes.position.count : 0); SP.nG[kk] = (SP.nG[kk] || 0) + 1;}}
                for (const m of [].concat(o.material || [])) {if (!SP.mats.has(m.uuid)) {SP.mats.add(m.uuid); if (SP.listo) {const k = nom + ' ' + m.type + (m.map && m.map.image && m.map.image.src ? ' ' + m.map.image.src.split('/').pop().split('?')[0] : ''); SP.nM[k] = (SP.nM[k] || 0) + 1;}}
                  for (const t of [m.map, m.alphaMap, m.emissiveMap]) if (t && !SP.texs.has(t.uuid)) {SP.texs.add(t.uuid); if (SP.listo) {const k = nom + ' ' + (t.image && t.image.src ? t.image.src.split('/').pop().split('?')[0] : (t.image && t.image.constructor.name)); SP.nT[k] = (SP.nT[k] || 0) + 1;}}}});
              SP.listo = true; const np = R.info.programs.length;
              M.push([d, np - ultP, n - ultO, R.info.memory.textures - ultT, R.info.memory.geometries - ultG, R.info.render.calls, (V.FXP||[]).length, SP.tex, SP.texPx, SP.comp, SP.buf, SP.bufB, SP.nombres.join(' | '), window._rT, V.PERF.sim - (window._ps || 0), V.PERF.dib - (window._pd || 0), V.PERF.hud - (window._ph || 0)]); window._rT = 0; window._ps = V.PERF.sim; window._pd = V.PERF.dib; window._ph = V.PERF.hud; SP.tex = SP.texPx = SP.comp = SP.buf = SP.bufB = 0; SP.nombres = [];
              ultP = np; ultO = n; ultT = R.info.memory.textures; ultG = R.info.memory.geometries;}});
        }""", PR)
        cat = await pg.evaluate(r"""async () => {const T = window._T, V = window._vado, cam = V.camera, fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
          const tipoDe = new Map(); for (const [id, o] of V.VIS) {const v = V.VISTA.get(id); if (v && o.raiz) tipoDe.set(o.raiz, v.k + ':' + (v.tipo || ''));}
          const g = {}; let tot = 0, sombra = 0; V.scene.traverse((o) => {if (!(o.isMesh || o.isSprite || o.isPoints)) return; let v = true, q = o, top = o; while (q) {if (!q.visible) {v = false; break;} if (q.parent === V.scene) top = q; q = q.parent;} if (!v) return;
            if (o.frustumCulled && !o.isInstancedMesh) {const bs = (o.isSkinnedMesh && o.boundingSphere) ? o.boundingSphere.clone().applyMatrix4(o.matrixWorld) : (o.geometry && (o.geometry.boundingSphere || (o.geometry.computeBoundingSphere(), o.geometry.boundingSphere)) ? o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld) : null); if (bs && !fr.intersectsSphere(bs)) return;}
            let nm = tipoDe.get(top) || (top.name || top.type); if (!tipoDe.get(top)) {let q2 = o; const cad = []; while (q2 && q2 !== top) {cad.push(q2.name || q2.type + (q2.isInstancedMesh ? '[I' + q2.count + ']' : '')); q2 = q2.parent;} nm += ' > ' + cad.reverse().slice(0, 2).join(' > ');} const mats = Array.isArray(o.material) ? o.material.length : 1; g[nm] = (g[nm] || 0) + mats; tot += mats; if (o.castShadow) sombra += mats;});
          return [tot, sombra, Object.entries(g).sort((a, b) => b[1] - a[1]).slice(0, 40)];}""")
        im = await pg.evaluate(r"""() => {const V = window._vado, r = {}; V.scene.traverse((o) => {if (!o.isInstancedMesh || !o.visible) return; const k = (o.userData.tipo || o.name || '') + ' tris' + Math.round((o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3) + ' mat:' + (o.material.name || o.material.type) + ' sombra:' + o.castShadow; r[k] = r[k] || [0, 0]; r[k][0]++; r[k][1] += o.count;}); return Object.entries(r).sort((a, b) => b[1][0] - a[1][0]).slice(0, 20);}""")
        print('INSTANCIADOS (nombre, mallas, copias)'); [print('   ', x) for x in im]
        print('DIBUJOS en cámara', cat[0], 'que echan sombra', cat[1]); [print('   ', x) for x in cat[2]]
        cdp = await pg.context.new_cdp_session(pg)
        await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 250}); await cdp.send('Profiler.start')
        await pg.wait_for_timeout(int(SEG * 1000))
        prof = (await cdp.send('Profiler.stop'))['profile']
        pil = await pg.evaluate("() => window._sp.pilas"); nuevos = await pg.evaluate("() => [window._sp.nT, window._sp.nM, window._sp.nG]")
        r = await pg.evaluate("() => window._med")
        r = r[5:]
        ds = sorted(x[0] for x in r); n = len(ds)
        q = lambda f: round(ds[min(n - 1, int(f * n))], 1)
        print('fotogramas', n, 'mediana', q(.5), 'p90', q(.9), 'p99', q(.99), 'max', round(ds[-1], 1))
        med = q(.5)
        picos = [x for x in r if x[0] > max(3 * med, med + 12)]
        print('picos', len(picos), '| con sombreador nuevo', sum(1 for x in picos if x[1] > 0), '| con textura nueva', sum(1 for x in picos if x[3] > 0), '| con geometría nueva', sum(1 for x in picos if x[4] > 0))
        print('sombreadores nuevos en total', sum(x[1] for x in r), ' texturas nuevas', sum(x[3] for x in r), ' geometrías nuevas', sum(x[4] for x in r))
        print('medianas render %.1f sim %.1f dibuja %.1f hud %.1f' % tuple(sorted(x[i] for x in r)[len(r)//2] for i in (13, 14, 15, 16))); [print('  pico %.1f ms: render %.1f  sim %.1f  dibuja %.1f  hud %.1f' % (x[0], x[13], x[14], x[15], x[16])) for x in sorted(picos, key=lambda x: -x[0])[:8]]
        for x in sorted(picos, key=lambda x: -x[0])[:15]: print('  %.1f ms  prog+%d obj%+d tex%+d geo%+d llamadas %d fxp %d | subidas %d (%d kpx) compila %d bufs %d (%d KB) %s' % (*x[:7], x[7], x[8]//1000, x[9], x[10], x[11]//1024, x[12][:200]))
        tot = lambda i: sum(x[i] for x in r)
        print('TOTAL subidas de textura', tot(7), 'Mpx', round(tot(8)/1e6, 1), 'compilaciones', tot(9), 'bufferData', tot(10), 'MB', round(tot(11)/1e6, 1))
        import collections; c = collections.Counter(nm for x in r for nm in x[12].split(' | ') if nm); print('texturas grandes subidas:', c.most_common(12))
        for k, v in sorted(pil.items(), key=lambda kv: -kv[1])[:25]: print('  %4d  %s' % (v, k))
        for nm, d in zip(['TEXTURAS nuevas', 'MATERIALES nuevos', 'GEOMETRÍAS nuevas'], nuevos):
            print(nm); [print('  %4d  %s' % (v, k)) for k, v in sorted(d.items(), key=lambda kv: -kv[1])[:15]]
        dd = await pg.evaluate("() => window._disp")
        print('DISPOSE'); [print('  %4d  %s' % (v, k[:220])) for k, v in sorted(dd.items(), key=lambda kv: -kv[1])[:20]]
        import collections
        nodes = {nn['id']: nn for nn in prof['nodes']}; cuenta = collections.Counter(prof['samples']); tot = sum(cuenta.values())
        par = {}
        for nn in prof['nodes']:
            for ch in nn.get('children', []): par[ch] = nn['id']
        propio = collections.Counter(); incl = collections.Counter()
        nombre = lambda i: (nodes[i]['callFrame']['functionName'] or '(anon)') + ':' + str(nodes[i]['callFrame']['lineNumber'] + 1) + ' ' + nodes[i]['callFrame']['url'].split('/')[-1].split('?')[0]
        for nid, c in cuenta.items():
            propio[nombre(nid)] += c; vistos = set(); x = nid
            while x is not None:
                k = nombre(x)
                if k not in vistos: incl[k] += c; vistos.add(k)
                x = par.get(x)
        print('PROPIO'); [print('  %5.1f%%  %s' % (100 * c / tot, k)) for k, c in propio.most_common(18)]
        print('INCLUSIVO (autopista.js)'); [print('  %5.1f%%  %s' % (100 * c / tot, k)) for k, c in incl.most_common(80) if 'autopista' in k][:0] or [print('  %5.1f%%  %s' % (100 * c / tot, k)) for k, c in [kc for kc in incl.most_common(200) if 'autopista' in kc[0]][:22]]
        print('errores', errs[:5])
        await b.close()
asyncio.run(main())
