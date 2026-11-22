/* ALMA (22/11): BRILLO (bloom) Y COLOR, solo en calidad Alta. La escena se pinta en una imagen intermedia (con suavizado de bordes),
   lo que pasa de cierto brillo —neones, ventanas, jefes, efectos, plasma— se expande en un halo, y al final un toque de color
   (algo más de saturación y contraste y un viñeteado suave). En Baja y Media se pinta como siempre (no cuesta nada). */
const GRADO = {uniforms: {tDiffuse: {value: null}}, vertexShader: 'varying vec2 vUv; void main() {vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);}',
  fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main() {vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(0.299, 0.587, 0.114)); c.rgb = mix(vec3(l), c.rgb, 1.14); c.rgb = (c.rgb - 0.5) * 1.06 + 0.5; float d = distance(vUv, vec2(0.5)); c.rgb *= mix(1.0, 0.8, smoothstep(0.42, 0.9, d)); gl_FragColor = c;}'};
let POST = null;
function postAP() {
  if (GRAF.cal !== 'alta') {if (POST) {POST.comp.dispose(); POST = null;} return null;}
  if (!POST) {
    const rt = new THREE.WebGLRenderTarget(1, 1, {type: THREE.HalfFloatType, samples: 4});
    const comp = new EffectComposer(renderer, rt), bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.9);
    comp.addPass(new RenderPass(scene, camera)); comp.addPass(bloom); comp.addPass(new OutputPass()); comp.addPass(new ShaderPass(GRADO));
    POST = {comp, bloom, w: 0, h: 0, pr: 0};
  }
  const pr = renderer.getPixelRatio();
  if (POST.w !== VW || POST.h !== VH || POST.pr !== pr) {POST.w = VW; POST.h = VH; POST.pr = pr; POST.comp.setPixelRatio(pr); POST.comp.setSize(VW, VH);}
  return POST;
}
