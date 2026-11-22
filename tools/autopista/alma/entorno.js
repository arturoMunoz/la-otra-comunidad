/* ALMA (22/11): ENTORNO PARA LOS REFLEJOS. Sin él, todo lo metálico (torres, núcleos, armaduras, coches) salía casi negro: un metal sin
   nada que reflejar no tiene color. Se hace una vez por mapa: una cúpula con el degradado del cielo (arriba, horizonte, suelo), un panel
   brillante donde está el sol y dos de relleno, y three.js la convierte en mapa de reflejos (PMREM). Es luz, no un dibujo. */
const ENT = {rt: null, k: ''};
function entornoAP(ciudad) {
  const k = ciudad ? 'ciudad' : 'dia'; if (ENT.k === k) return; ENT.k = k;
  const C = ciudad ? {arriba: '#6f86c4', horiz: '#ffb98a', suelo: '#3b2f3a', sol: '#ffd1a0', relleno: '#8fb0ff'} : {arriba: '#7fb2ec', horiz: '#e9f1f6', suelo: '#5d6157', sol: '#fff1d8', relleno: '#cfe2ff'};
  const sc = new THREE.Scene(), g = new THREE.SphereGeometry(40, 32, 16), col = [], a = new THREE.Color(C.arriba), h = new THREE.Color(C.horiz), s = new THREE.Color(C.suelo), t = new THREE.Color();
  const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) {const y = pos.getY(i) / 40; if (y >= 0) t.copy(h).lerp(a, Math.pow(y, 0.6)); else t.copy(h).lerp(s, Math.min(1, -y * 3)); col.push(t.r, t.g, t.b);}
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); sc.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide})));
  const panel = (c, k_, w, hh, x, y, z) => {const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({color: new THREE.Color(c).multiplyScalar(k_), side: THREE.DoubleSide})); m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m);};
  const d = new THREE.Vector3(12, 30, 10).normalize().multiplyScalar(30); panel(C.sol, ciudad ? 7 : 8, 9, 9, d.x, d.y, d.z);
  panel(C.relleno, 1.6, 26, 12, -d.x, 14, -d.z); panel(C.horiz, 1.3, 30, 8, d.z, 6, -d.x);
  const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(sc, 0.04); pm.dispose(); sc.traverse((q) => {if (q.geometry) q.geometry.dispose(); if (q.material) q.material.dispose();});
  if (ENT.rt) ENT.rt.dispose(); ENT.rt = rt; scene.environment = rt.texture; scene.environmentIntensity = ciudad ? 0.55 : 0.5;
}
