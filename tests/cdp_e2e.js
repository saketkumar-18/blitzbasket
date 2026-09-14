// BlitzBasket E2E via raw CDP over WebSocket (no external deps).
// Usage: node cdp_e2e.js <url>  → JSON result; exit 0 = all pass
const http = require('http');
const crypto = require('crypto');

const URL_TARGET = process.argv[2] || 'http://localhost:8765';
const results = [];
let ws;          // global WebSocket
let msgId = 0;   // CDP message id
const pending = new Map(); // id -> {resolve, reject}
const events = [];        // raw CDP events

function fetchJson(url) {
  return new Promise((res, rej) => {
    http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- minimal RFC6455 client ---
function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const key = crypto.randomBytes(16).toString('base64');
    const req = http.request({
      hostname: u.hostname, port: u.port || 80,
      path: u.pathname + u.search, headers: {
        Connection: 'Upgrade', Upgrade: 'websocket',
        'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': 13,
      },
    });
    req.on('upgrade', (res, socket, head) => {
      // socket is the raw TCP socket — build frames ourselves
      const state = { buf: Buffer.alloc(0) };
      if (head) state.buf = head;
      socket.on('data', chunk => {
        state.buf = Buffer.concat([state.buf, chunk]);
        let frame;
        while ((frame = readFrame(state))) { handleFrame(frame); }
      });
      socket.on('error', reject);
      resolve({ socket, send: obj => socket.write(encodeFrame(JSON.stringify(obj))) });
    });
    req.on('error', reject);
    req.end();
  });
}
function encodeFrame(str) {
  const mask = crypto.randomBytes(4);
  const payload = Buffer.from(str, 'utf8');
  for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4]; // client→server frames MUST be masked
  const len = payload.length;
  let header;
  if (len < 126) { header = Buffer.alloc(2); header[1] = 0x80 | len; }
  else if (len < 65536) { header = Buffer.alloc(4); header[1] = 0x80 | 126; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2); }
  header[0] = 0x81;
  return Buffer.concat([header, mask, payload]);
}
function readFrame(state) {
  const b = state.buf;
  if (b.length < 2) return null;
  const len0 = b[1] & 0x7f; let off = 2; let len = len0;
  if (len0 === 126) { if (b.length < 4) return null; len = b.readUInt16BE(2); off = 4; }
  else if (len0 === 127) { if (b.length < 10) return null; len = Number(b.readBigUInt64BE(2)); off = 10; }
  const masked = (b[1] & 0x80) !== 0;
  if (masked) off += 4;
  if (b.length < off + len) return null;
  const payloadStart = off;
  if (masked) {
    const mask = b.slice(off - 4, off);
    for (let i = 0; i < len; i++) b[payloadStart + i] ^= mask[i % 4];
  }
  const payload = b.slice(payloadStart, payloadStart + len);
  const opcode = b[0] & 0x0f;
  state.buf = b.slice(payloadStart + len);
  if (opcode === 1) return { str: payload.toString('utf8') };
  if (opcode === 8) return { close: true };
  return {};
}
function handleFrame(f) {
  if (f.str) {
    let msg; try { msg = JSON.parse(f.str); } catch { return; }
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
    } else if (msg.method) events.push(msg);
  }
}
function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send({ id, method, params });
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(method + ' timeout')); } }, 15000);
  });
}
const Runtime = {
  eval: (expr, awaitPromise = false) => send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise }),
};

(async () => {
  const ver = await fetchJson('http://127.0.0.1:9223/json/version');
  const target = (await fetchJson('http://127.0.0.1:9223/json')).find(t => t.type === 'page' && t.url.includes('localhost:8765'));
  ws = await wsConnect(target.webSocketDebuggerUrl);
  await send('Runtime.enable');

  const T = (name, ok, detail) => { results.push({ name, pass: !!ok, detail: detail === undefined ? '' : String(detail) }); console.error((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined && detail !== '' ? ' :: ' + detail : '')); };

  const title = (await Runtime.eval('document.title')).result.value;
  T('title', title.includes('BlitzBasket'), title);

  // fresh state for this run
  await Runtime.eval("localStorage.removeItem('bb_cart'); localStorage.removeItem('bb_orders')");

  // search
  await Runtime.eval(`document.getElementById('q').value='milk'; document.getElementById('q').dispatchEvent(new Event('input'))`);
  await sleep(300);
  let n = (await Runtime.eval('document.querySelectorAll(".pcard").length')).result.value;
  T('search milk', n >= 1, n + ' results');

  // add 3 items
  await Runtime.eval(`document.getElementById('q').value=''; document.getElementById('q').dispatchEvent(new Event('input'))`);
  await sleep(400);
  const added = await Runtime.eval(`(function(){
    ['milk','maggi','banana'].forEach(id=>{const b=document.querySelector('[data-add="'+id+'"]'); if(b) b.click();});
    return document.getElementById('cartN').textContent;
  })()`);
  T('add 3 items', /3 items/.test(added.result.value), added.result.value);

  // cart bill
  await Runtime.eval('document.getElementById("cartBtn").click()');
  await sleep(400);
  const billTxt = await Runtime.eval(`Array.from(document.querySelectorAll('.billrow')).map(r=>r.textContent.replace(/\\s+/g,' ').trim()).join(' | ')`);
  T('cart bill rows', /Item total/.test(billTxt.result.value), billTxt.result.value.slice(0, 160));
  const subtotal = (await Runtime.eval(`(function(){let s=0;const c=JSON.parse(localStorage.bb_cart);for(const k in c){const p=null;} return document.querySelectorAll('.billrow')[0].textContent.match(/\\d+/)[0];})()`)).result.value;
  T('subtotal = 152 (27+96+28+1 handling? item total only)', subtotal === '151', 'item total ' + subtotal); // milk27+maggi96+banana28=151

  // coupon FAIL path (below min 199)
  await Runtime.eval(`document.getElementById('cIn').value='SAVE50'; document.getElementById('cApply').click()`);
  await sleep(300);
  const toast1 = (await Runtime.eval('document.getElementById("toast").textContent')).result.value;
  T('coupon below-min rejected', /Add .* more/.test(toast1), toast1);

  // add cola to cross 199 (151+40=191... still short; add cola + curd 35 => 226)
  await Runtime.eval(`document.getElementById('dClose').click()`);
  await sleep(200);
  await Runtime.eval(`(function(){['cola','curd'].forEach(id=>{const b=document.querySelector('[data-add="'+id+'"]'); if(b) b.click();});})()`);
  await sleep(200);
  await Runtime.eval(`document.getElementById('cartBtn').click()`);
  await sleep(400);
  await Runtime.eval(`document.getElementById('cIn').value='SAVE50'; document.getElementById('cApply').click()`);
  await sleep(300);
  const bill2 = await Runtime.eval(`Array.from(document.querySelectorAll('.billrow')).map(r=>r.textContent.replace(/\\s+/g,' ').trim()).join(' | ')`);
  T('SAVE50 applied', /Coupon discount/.test(bill2.result.value), bill2.result.value.slice(0, 200));

  // checkout validation: bad phone
  await Runtime.eval(`document.getElementById('checkout').click()`);
  await sleep(300);
  await Runtime.eval(`document.getElementById('ckName').value='Test User'; document.getElementById('ckPhone').value='123'; document.getElementById('ckAddr').value='Flat 204, Green Residency, HSR Layout'`);
  await Runtime.eval(`document.getElementById('ckOk').click()`);
  await sleep(300);
  const toast2 = (await Runtime.eval('document.getElementById("toast").textContent')).result.value;
  T('bad phone rejected', /valid 10-digit/.test(toast2), toast2);

  // valid checkout
  await Runtime.eval(`document.getElementById('ckPhone').value='9876543210'; document.getElementById('ckOk').click()`);
  await sleep(500);
  const hash = (await Runtime.eval('location.hash')).result.value;
  T('moved to orders page', hash === '#/orders', hash);
  const ocard = (await Runtime.eval('document.querySelectorAll(".ocard").length')).result.value;
  T('order card rendered', ocard === 1, ocard + ' card(s)');
  const stage0 = (await Runtime.eval('document.querySelector(".status").textContent.trim()')).result.value;
  T('status = Order Placed', stage0 === 'Order Placed', stage0);

  // wait 8.5s -> stage should advance to Packed
  await sleep(8600);
  const stage1 = (await Runtime.eval('document.querySelector(".status").textContent.trim()')).result.value;
  T('progressed to Packed (8s/stage)', stage1 === 'Packed', stage1);

  // refresh persistence
  await send('Page.reload');
  await sleep(600);
  const persist = (await Runtime.eval('document.querySelectorAll(".ocard").length')).result.value;
  T('order persists after reload', persist === 1, persist + ' card(s)');

  const pass = results.filter(r => r.pass).length;
  console.log(JSON.stringify({ url: URL_TARGET, total: results.length, passed: pass, failed: results.length - pass, results }, null, 2));
  process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error('E2E FATAL', e.message); process.exit(2); });
