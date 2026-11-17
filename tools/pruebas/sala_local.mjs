// Imita Cloudflare en local para probar las partidas EN LÍNEA (La Brecha y A-6) con el código de verdad de worker.js:
//   node tools/pruebas/sala_local.mjs [PUERTO] [RETRASO_MS] [VAIVEN_MS]
// - Sirve public/ y abre /api/sala/CODIGO como WebSocket, metiendo cada conexión en la clase Sala de worker.js
//   (con un ctx falso: getWebSockets, acceptWebSocket, storage y serializeAttachment).
// - RETRASO_MS / VAIVEN_MS: retraso de cada mensaje en cada sentido (red de móvil: p. ej. 60 y 30).
// El orden de los mensajes se respeta (como en TCP). Sin dependencias (WebSocket escrito a mano: solo texto, sin compresión).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PUB = path.join(RAIZ, 'public');
const PUERTO = +(process.argv[2] || 8791), RET = +(process.argv[3] || 0), VAI = +(process.argv[4] || 0);
const espera = () => RET + Math.random() * VAI;

// lo que worker.js necesita de Cloudflare
let PENDIENTE = null;
globalThis.WebSocketPair = class {constructor() {this[0] = {}; this[1] = PENDIENTE;}};
class R {constructor(cuerpo, op = {}) {this.cuerpo = cuerpo; this.status = op.status || 200;}}
const {Sala} = await import(path.join(RAIZ, 'worker.js'));
globalThis.Response = R;

const SALAS = new Map();
function sala(codigo) {
  if (SALAS.has(codigo)) return SALAS.get(codigo);
  const socks = new Set(), alm = new Map();
  const ctx = {getWebSockets: () => [...socks], acceptWebSocket: (w) => socks.add(w), storage: {get: async (k) => alm.get(k), put: async (k, v) => {alm.set(k, v);}}};
  const s = new Sala(ctx, {}); s._socks = socks; SALAS.set(codigo, s); return s;
}

function trama(texto) {
  const datos = Buffer.from(texto), n = datos.length; let cab;
  if (n < 126) cab = Buffer.from([0x81, n]);
  else if (n < 65536) {cab = Buffer.alloc(4); cab[0] = 0x81; cab[1] = 126; cab.writeUInt16BE(n, 2);}
  else {cab = Buffer.alloc(10); cab[0] = 0x81; cab[1] = 127; cab.writeBigUInt64BE(BigInt(n), 2);}
  return Buffer.concat([cab, datos]);
}

const ESTAD = {enviados: 0, bytes: 0, recibidos: 0, t0: Date.now()};
const tipos = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json'};
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/estad') {res.end(JSON.stringify({...ESTAD, seg: (Date.now() - ESTAD.t0) / 1000})); return;}
  let f = path.join(PUB, decodeURIComponent(u.pathname)); if (!f.startsWith(PUB)) {res.writeHead(403); res.end(); return;}
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  fs.readFile(f, (e, d) => {if (e) {res.writeHead(404); res.end(); return;} res.writeHead(200, {'Content-Type': tipos[path.extname(f)] || 'application/octet-stream'}); res.end(d);});
});
srv.on('upgrade', async (req, sock) => {
  const u = new URL(req.url, 'http://x'), m = u.pathname.match(/^\/api\/sala\/([A-Z0-9]{3,8})$/);
  if (!m) {sock.destroy(); return;}
  const acept = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acept + '\r\n\r\n');
  sock.setNoDelay(true);
  const s = sala(m[1]); let adj = null;
  const w = {
    readyState: 1,
    send(t) {if (w.readyState !== 1) return; ESTAD.enviados++; ESTAD.bytes += t.length; w._s = Math.max(w._s || 0, Date.now() + espera()); setTimeout(() => {try {sock.write(trama(t));} catch (e) {}}, w._s - Date.now());},
    close() {if (w.readyState === 1) {w.readyState = 3; try {sock.end();} catch (e) {}} s._socks.delete(w);},
    serializeAttachment(a) {adj = a;}, deserializeAttachment() {return adj;},
  };
  let buf = Buffer.alloc(0);
  sock.on('data', (d) => {
    buf = Buffer.concat([buf, d]);
    while (buf.length >= 2) {
      const op = buf[0] & 15; let n = buf[1] & 127, o = 2;
      if (n === 126) {if (buf.length < 4) return; n = buf.readUInt16BE(2); o = 4;} else if (n === 127) {if (buf.length < 10) return; n = Number(buf.readBigUInt64BE(2)); o = 10;}
      if (buf.length < o + 4 + n) return;
      const masc = buf.slice(o, o + 4), dat = Buffer.alloc(n); for (let i = 0; i < n; i++) dat[i] = buf[o + 4 + i] ^ masc[i % 4];
      buf = buf.slice(o + 4 + n);
      if (op === 8) {w.readyState = 3; s._socks.delete(w); s.webSocketClose(w); sock.end(); return;}
      if (op === 1) {ESTAD.recibidos++; const t = dat.toString(); w._r = Math.max(w._r || 0, Date.now() + espera()); setTimeout(() => s.webSocketMessage(w, t), w._r - Date.now());}
    }
  });
  sock.on('close', () => {if (w.readyState === 1) {w.readyState = 3; s._socks.delete(w); s.webSocketClose(w);}});
  sock.on('error', () => {});
  PENDIENTE = w; await s.fetch({url: 'http://x' + req.url, headers: {get: (k) => (k === 'Upgrade' ? 'websocket' : null)}});
});
srv.listen(PUERTO, () => console.log('sala local en http://localhost:' + PUERTO + ' (retraso ' + RET + '+' + VAI + ' ms)'));
