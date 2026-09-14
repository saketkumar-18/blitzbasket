// Verify QR decodes to expected URL using Chrome's BarcodeDetector via CDP.
const http = require('http'), crypto = require('crypto'), fs = require('fs');
const QR_PATH = process.argv[2], EXPECT = process.argv[3];
function fetchJson(url) { return new Promise((res, rej) => { http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej); }); }
function wsConnect(url) { return new Promise((resolve, reject) => { const u = new URL(url); const key = crypto.randomBytes(16).toString('base64');
  const req = http.request({ hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search, headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': 13 } });
  req.on('upgrade', (res, socket, head) => { const state = { buf: head || Buffer.alloc(0) }; socket.on('data', c => { state.buf = Buffer.concat([state.buf, c]); let f; while ((f = readFrame(state))) handleFrame(f); }); socket.on('error', reject); resolve({ socket, send: o => socket.write(encodeFrame(JSON.stringify(o))) }); });
  req.on('error', reject); req.end(); }); }
function encodeFrame(str) { const mask = crypto.randomBytes(4); const p = Buffer.from(str, 'utf8'); for (let i = 0; i < p.length; i++) p[i] ^= mask[i % 4];
  const len = p.length; let h; if (len < 126) { h = Buffer.alloc(2); h[1] = 0x80 | len; } else if (len < 65536) { h = Buffer.alloc(4); h[1] = 0x80 | 126; h.writeUInt16BE(len, 2); } else { h = Buffer.alloc(10); h[1] = 0x80 | 127; h.writeBigUInt64BE(BigInt(len), 2); } h[0] = 0x81; return Buffer.concat([h, mask, p]); }
function readFrame(s) { const b = s.buf; if (b.length < 2) return null; const l0 = b[1] & 0x7f; let off = 2, len = l0;
  if (l0 === 126) { if (b.length < 4) return null; len = b.readUInt16BE(2); off = 4; } else if (l0 === 127) { if (b.length < 10) return null; len = Number(b.readBigUInt64BE(2)); off = 10; }
  if ((b[1] & 0x80) !== 0) off += 4; if (b.length < off + len) return null;
  const ps = off; if ((b[1] & 0x80) !== 0) { const m = b.slice(off - 4, off); for (let i = 0; i < len; i++) b[ps + i] ^= m[i % 4]; }
  const payload = b.slice(ps, ps + len); s.buf = b.slice(ps + len); const op = b[0] & 0x0f; return op === 1 ? { str: payload.toString('utf8') } : (op === 8 ? { close: true } : {}); }
let ws, msgId = 0; const pending = new Map();
function handleFrame(f) { if (f.str) { let m; try { m = JSON.parse(f.str); } catch { return; } if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } } }
function send(method, params = {}) { const id = ++msgId; return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); ws.send({ id, method, params }); setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(method + ' timeout')); } }, 15000); }); }
(async () => {
  const target = (await fetchJson('http://127.0.0.1:9223/json')).find(t => t.type === 'page');
  ws = await wsConnect(target.webSocketDebuggerUrl);
  await send('Runtime.enable');
  const b64 = fs.readFileSync(QR_PATH).toString('base64');
  const res = await send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
    const img = new Image(); img.src = 'data:image/png;base64,${b64}';
    await new Promise(r => img.onload = r);
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    if (!('BarcodeDetector' in window)) return { error: 'no BarcodeDetector' };
    const bd = new BarcodeDetector({ formats: ['qr_code'] });
    const codes = await bd.detect(c);
    return { decoded: codes.map(x => x.rawValue) };
  })()` });
  const v = res.result.value;
  if (v.error) { console.error('DECODE-ERR', v.error); process.exit(2); }
  const ok = v.decoded[0] === EXPECT;
  console.log((ok ? 'QR-OK ' : 'QR-MISMATCH ') + JSON.stringify(v.decoded));
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('FATAL', e.message); process.exit(2); });
