/* La Otra Comunidad · Worker: sirve la web (public/) y manda los avisos al móvil (Web Push).
   - Cada 15 min (cron) y cuando el Máster envía algo (POST /api/avisos) pide a Supabase los avisos pendientes
     (loc_push_pendientes, protegida con PUSH_SECRETO) y los manda cifrados a cada móvil suscrito.
   - Secretos en Cloudflare (no en el repo): VAPID_JWK (clave privada) y PUSH_SECRETO. */

const enc = new TextEncoder();

function b64u(buf) {
  const b = new Uint8Array(buf); let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function deB64u(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  const r = atob(s), o = new Uint8Array(r.length);
  for (let i = 0; i < r.length; i++) o[i] = r.charCodeAt(i);
  return o;
}
function junta(...partes) {
  const n = partes.reduce((a, p) => a + p.length, 0), o = new Uint8Array(n); let k = 0;
  for (const p of partes) { o.set(p, k); k += p.length; }
  return o;
}
async function hmac(clave, datos) {
  const k = await crypto.subtle.importKey('raw', clave, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, datos));
}

/* Firma VAPID (JWT ES256) para el servidor de avisos del móvil. */
async function vapid(endpoint, jwk) {
  const aud = new URL(endpoint).origin;
  const cab = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cuerpo = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'https://la-otra-comunidad.benbarek1903.workers.dev' })));
  const k = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', d: jwk.d, x: jwk.x, y: jwk.y, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k, enc.encode(cab + '.' + cuerpo));
  const pub = junta(new Uint8Array([4]), deB64u(jwk.x), deB64u(jwk.y));
  return 'vapid t=' + cab + '.' + cuerpo + '.' + b64u(firma) + ', k=' + b64u(pub);
}

/* Cifrado del mensaje (RFC 8291, aes128gcm). */
export async function cifra(texto, p256dh, auth) {
  const ua = deB64u(p256dh), secreto = deB64u(auth);
  const efimera = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const as = new Uint8Array(await crypto.subtle.exportKey('raw', efimera.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, efimera.privateKey, 256));
  const prkKey = await hmac(secreto, ecdh);
  const ikm = await hmac(prkKey, junta(enc.encode('WebPush: info\0'), ua, as, new Uint8Array([1])));
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(sal, ikm);
  const cek = (await hmac(prk, junta(enc.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, junta(enc.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);
  const k = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, k, junta(enc.encode(texto), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return junta(sal, rs, new Uint8Array([as.length]), as, cifrado);
}

export async function mandaUno(sub, datos, jwk) {
  const cuerpo = await cifra(JSON.stringify(datos), sub.p256dh, sub.auth);
  const r = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { Authorization: await vapid(sub.endpoint, jwk), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'high' },
    body: cuerpo,
  });
  return r.status;
}

async function supa(env, fn, body) {
  const r = await fetch(env.SUPA_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST', headers: { apikey: env.SUPA_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(fn + ' ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.status === 204 ? null : r.json();
}

async function reparte(env) {
  if (!env.VAPID_JWK || !env.PUSH_SECRETO) return { error: 'faltan los secretos VAPID_JWK y PUSH_SECRETO en Cloudflare' };
  const jwk = JSON.parse(env.VAPID_JWK);
  const filas = await supa(env, 'loc_push_pendientes', { p_secreto: env.PUSH_SECRETO }) || [];
  let ok = 0, mal = 0;
  await Promise.all(filas.map(async (f) => {
    try {
      const st = await mandaUno(f, { titulo: f.titulo, texto: f.texto, tag: 'loc-' + f.aviso }, jwk);
      if (st === 404 || st === 410) { await supa(env, 'loc_push_baja', { p_secreto: env.PUSH_SECRETO, p_endpoint: f.endpoint }); mal++; }
      else if (st < 300) ok++; else mal++;
    } catch (e) { mal++; }
  }));
  return { enviados: ok, fallidos: mal };
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/api/avisos') {
      if (req.method !== 'POST') return new Response('usa POST', { status: 405 });
      try { return Response.json(await reparte(env)); } catch (e) { return Response.json({ error: String(e.message || e) }, { status: 500 }); }
    }
    return env.ASSETS.fetch(req);
  },
  async scheduled(ev, env, ctx) { ctx.waitUntil(reparte(env).catch(() => {})); },
};
