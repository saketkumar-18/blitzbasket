/* BlitzBasket — 10-minute grocery delivery web app (demo)
   Vanilla JS, no build step, data persisted in localStorage. */
'use strict';

/* ---------------- Catalog ---------------- */
const CATS = [
  { id: 'fruits',  name: 'Fruits & Veg',   emoji: '🥬' },
  { id: 'dairy',   name: 'Dairy & Bread',  emoji: '🥛' },
  { id: 'snacks',  name: 'Snacks',         emoji: '🍿' },
  { id: 'drinks',  name: 'Cold Drinks',    emoji: '🥤' },
  { id: 'staples', name: 'Atta & Staples', emoji: '🌾' },
  { id: 'home',    name: 'Home Care',      emoji: '🧹' },
  { id: 'personal',name: 'Personal Care', emoji: '🧼' },
];

const P = (id, cat, name, unit, price, mrp, emoji, kw) =>
  ({ id, cat, name, unit, price, mrp, emoji, kw: (kw || '') + ' ' + name.toLowerCase() });

const PRODUCTS = [
  // Fruits & Veg
  P('banana',   'fruits', 'Robusta Banana', '6 pcs', 28, 40, '🍌'),
  P('apple',    'fruits', 'Shimla Apple', '4 pcs (~500 g)', 120, 160, '🍎', 'seb'),
  P('tomato',   'fruits', 'Desi Tomato', '500 g', 24, 32, '🍅', 'tamatar'),
  P('onion',    'fruits', 'Onion', '1 kg', 35, 45, '🧅', 'pyaz'),
  P('potato',   'fruits', 'Potato', '1 kg', 30, 38, '🥔', 'aloo'),
  P('coriander','fruits', 'Fresh Coriander', '100 g', 10, 15, '🌿', 'dhania'),
  P('grape',    'fruits', 'Green Grapes', '500 g', 60, 80, '🍇', 'angoor'),
  P('pomegran','fruits', 'Pomegranate', '2 pcs', 90, 120, '🫐', 'anar'),
  P('lemon',    'fruits', 'Lemon', '4 pcs', 12, 18, '🍋', 'nimbu'),
  P('carrot',   'fruits', 'Ooty Carrot', '500 g', 30, 40, '🥕', 'gajar'),
  // Dairy
  P('milk',     'dairy', 'Amul Taaza Toned Milk', '500 ml', 27, 27, '🥛', 'doodh amul'),
  P('curd',     'dairy', 'Mother Dairy Curd', '400 g', 35, 40, '🍶', 'dahi'),
  P('paneer',   'dairy', 'Amul Malai Paneer', '200 g', 90, 99, '🧀', 'cottage cheese'),
  P('butter',   'dairy', 'Amul Butter', '100 g', 58, 60, '🧈', 'makhan'),
  P('bread',    'dairy', 'Britannia Milk Bread', '400 g', 45, 50, '🍞', 'double roti'),
  P('eggs',     'dairy', 'Farm Fresh Eggs', '6 pcs', 48, 60, '🥚', 'anda'),
  P('cheese',   'dairy', 'Go Cheese Slices', '10 pcs', 135, 150, '🧀'),
  P('lassi',    'dairy', 'Amul Lassi', '180 ml', 25, 30, '🥛'),
  // Snacks
  P('chips',    'snacks', 'Lay\'s Classic Salted', '52 g', 20, 20, '🍟', 'lays'),
  P('kurkure',  'snacks', 'Kurkure Masala Munch', '90 g', 20, 20, '🌽'),
  P('maggi',    'snacks', 'Maggi 2-Min Noodles', '8 pack', 96, 120, '🍜', 'noodles'),
  P('biscuit',  'snacks', 'Parle-G Gold', '500 g', 55, 60, '🍪', 'parle'),
  P('oreo',     'snacks', 'Oreo Biscuits', '120 g', 40, 50, '🥮'),
  P('haldiram', 'snacks', 'Haldiram Aloo Bhujia', '400 g', 85, 95, '🌶️', 'namkeen bhujia'),
  P('peanut',   'snacks', 'Roasted Peanuts', '200 g', 45, 55, '🥜', 'moongfali'),
  P('popcorn',  'snacks', 'Act II Microwave Popcorn', '70 g', 35, 45, '🍿'),
  // Drinks
  P('cola',     'drinks', 'Coca-Cola', '750 ml', 40, 40, '🥤', 'coke soda'),
  P('sprite',   'drinks', 'Sprite', '750 ml', 40, 40, '🥤', 'lemon soda'),
  P('orange',   'drinks', 'Fanta Orange', '600 ml', 38, 40, '🍊', 'fanta'),
  P('juice',    'drinks', 'Real Mixed Fruit Juice', '1 L', 110, 125, '🧃', 'juice'),
  P('water',    'drinks', 'Bisleri Pack Water', '5 × 1 L', 65, 80, '💧', 'pani mineral'),
  P('rede',     'drinks', 'Red Bull Energy Drink', '250 ml', 125, 150, '⚡', 'energy'),
  P('icedtea',  'drinks', 'Lipton Iced Tea', '400 ml', 40, 45, '🧊', 'lemon tea'),
  // Staples
  P('atta',     'staples', 'Aashirvaad Atta', '5 kg', 250, 300, '🌾', 'flour gehu'),
  P('rice',     'staples', 'India Gate Basmati Rice', '1 kg', 145, 180, '🍚', 'chawal'),
  P('dal',      'staples', 'Toor Dal Premium', '1 kg', 165, 190, '🫘', 'tur arhar'),
  P('oil',      'staples', 'Fortune Sunflower Oil', '1 L', 140, 160, '🛢️', 'tel'),
  P('sugar',    'staples', 'Madhur Sugar', '1 kg', 55, 60, '🍬', 'cheeni'),
  P('salt',     'staples', 'Tata Salt', '1 kg', 30, 30, '🧂', 'namak'),
  P('ghee',     'staples', 'Amul Ghee', '500 ml', 300, 325, '🫕'),
  // Home
  P('harpic',   'home', 'Harpic Bathroom Cleaner', '500 ml', 95, 105, '🚽'),
  P('lizol',    'home', 'Lizol Floor Cleaner', '975 ml', 190, 220, '🧴', 'floor phenyl'),
  P('vim',      'home', 'Vim Dishwash Bar', '3 × 150 g', 55, 60, '🧽', 'bartan'),
  P('dettol',   'home', 'Dettol Handwash', '750 ml', 135, 150, '🧼', 'soap hand wash'),
  P('tissue',   'home', 'Origami Kitchen Towel', '2 pcs', 70, 90, '🧻', 'paper napkin'),
  P('garbage',  'home', 'Garbage Bags Medium', '30 pcs', 99, 125, '🗑️', 'dustbin'),
  // Personal
  P('shampoo',  'personal', 'Head & Shoulders Shampoo', '650 ml', 415, 480, '🧴', 'hair'),
  P('soap',     'personal', 'Lux Body Wash', '600 ml', 285, 330, '🛁'),
  P('pastesoap','personal', 'Colgate MaxFresh Toothpaste', '150 g', 85, 99, '🪥', 'tooth brush paste'),
  P('deodorant','personal', 'Nivea Deodorant Roll-On', '50 ml', 175, 220, '💨'),
  P('facewash', 'personal', 'Himalaya Face Wash', '150 ml', 135, 165, '🧖', 'face'),
];

const COUPONS = {
  SAVE50:  { type: 'flat',   value: 50, min: 199, desc: '₹50 off on orders above ₹199' },
  FREEDEL: { type: 'delivery',           min: 0,  desc: 'Free delivery on any order' },
  BLITZ10: { type: 'pct',   value: 10, min: 299, desc: '10% off (max ₹75) above ₹299' },
};
const DELIVERY_FEE = 25, FREE_DELIVERY_AT = 199, HANDLING = 4;
const STAGES = ['Order Placed', 'Packed', 'Out for Delivery', 'Delivered'];
const STAGE_SEC = 8; // demo-speed: each stage ~8s

/* ---------------- State ---------------- */
const store = {
  get cart() { try { return JSON.parse(localStorage.bb_cart || '{}'); } catch { return {}; } },
  set cart(v) { localStorage.bb_cart = JSON.stringify(v); },
  get orders() { try { return JSON.parse(localStorage.bb_orders || '[]'); } catch { return []; } },
  set orders(v) { localStorage.bb_orders = JSON.stringify(v); },
};
let coupon = { code: null };
let filterCat = 'all';

const $ = (s) => document.querySelector(s);
const inr = (n) => '₹' + Math.round(n);
const byId = (id) => PRODUCTS.find(p => p.id === id);
const cartQty = () => Object.values(store.cart).reduce((a, b) => a + b, 0);
const esc = (s) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- Bill ---------------- */
function bill() {
  const c = store.cart;
  let subtotal = 0;
  for (const id in c) { const p = byId(id); if (p) subtotal += p.price * c[id]; }
  let delivery = subtotal >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
  let discount = 0;
  const cp = coupon.code ? COUPONS[coupon.code] : null;
  if (cp && subtotal >= cp.min) {
    if (cp.type === 'flat') discount = cp.value;
    if (cp.type === 'pct') discount = Math.min(75, Math.round(subtotal * cp.value / 100));
    if (cp.type === 'delivery') delivery = 0;
  }
  const total = Math.max(0, subtotal - discount + delivery + (subtotal > 0 ? HANDLING : 0));
  return { subtotal, discount, delivery, handling: subtotal > 0 ? HANDLING : 0, total, freeDel: delivery === 0 && subtotal > 0 };
}

/* ---------------- Header bits ---------------- */
function syncHeader() {
  const n = cartQty();
  $('#cartN').textContent = n + (n === 1 ? ' item' : ' items');
  $('#cartBadge').hidden = n === 0;
  $('#cartBadge').textContent = n;
}

function renderChips() {
  const q = $('#q').value.trim().toLowerCase();
  $('#chips').innerHTML = [{ id: 'all', name: 'All' }, ...CATS].map(c =>
    `<button class="chip ${filterCat === c.id ? 'on' : ''}" data-cat="${c.id}">${c.id === 'all' ? '🛍️ ' : c.emoji + ' '}${esc(c.name)}</button>`
  ).join('');
  $('#chips').querySelectorAll('.chip').forEach(b => b.onclick = () => {
    filterCat = b.dataset.cat; $('#q').value = ''; renderChips(); renderHome();
  });
}

/* ---------------- Product card ---------------- */
function card(p) {
  const qty = store.cart[p.id] || 0;
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const catName = (CATS.find(c => c.id === p.cat) || {}).name || '';
  return `
  <div class="pcard" data-id="${p.id}">
    ${off ? `<div class="poff">${off}% OFF</div>` : ''}
    <div class="pcat">${esc(catName)}</div>
    <div class="pimg" style="font-size:64px;display:grid;place-items:center">${p.emoji}</div>
    <div class="stars">★ ${(4 + (p.id.length % 10) / 10).toFixed(1)}</div>
    <div class="pname">${esc(p.name)}</div>
    <div class="punit">${esc(p.unit)}</div>
    <div class="pprice">${inr(p.price)}${p.mrp > p.price ? `<s>${inr(p.mrp)}</s>` : ''}</div>
    <div class="pemb"></div>
    ${qty === 0
      ? `<button class="padd" data-add="${p.id}" aria-label="Add ${esc(p.name)}"><span class="plus">+</span></button>`
      : `<div class="qty"><button data-dec="${p.id}">−</button><span class="qn">${qty}</span><button data-inc="${p.id}">+</button></div>`}
  </div>`;
}

/* ---------------- Views ---------------- */
function productsMatching(q) {
  q = q.trim().toLowerCase();
  return PRODUCTS.filter(p => (filterCat === 'all' || p.cat === filterCat) &&
    (!q || p.kw.includes(q) || q.split(' ').some(w => w && p.kw.includes(w))));
}

function renderHome() {
  const q = $('#q').value;
  const view = $('#view');
  if (q.trim()) {
    const list = productsMatching(q);
    view.innerHTML = list.length
      ? `<div class="sec"><div class="sec-h"><h2>Results for “${esc(q.trim())}”</h2><span class="see">${list.length} products</span></div>
         <div class="grid">${list.map(card).join('')}</div></div>`
      : `<div class="empty"><div class="big">🔍</div><h3>Nothing found for “${esc(q.trim())}”</h3><p>Try “milk”, “maggie”, “chips”…</p></div>`;
  } else {
    view.innerHTML = `
      <section class="hero">
        <div class="hero-in">
          <div class="h1">Groceries in <em>10 minutes</em>.<br/>Fresh, fast, at your door.</div>
          <div class="h2">Fruits, dairy, snacks, atta & 50+ daily essentials picked from your nearest dark store.</div>
          <div class="pills"><span class="pill">⚡ 10-min delivery</span><span class="pill">🥬 Farm-fresh quality</span><span class="pill">💰 Best prices</span></div>
          <div class="cta"><button onclick="document.getElementById('q').focus()">Start shopping →</button><button class="ghost" onclick="location.hash='#/orders'">My orders</button></div>
          <div class="stats"><div class="stat"><b>${PRODUCTS.length}+</b><span>products</span></div><div class="stat"><b>10 min</b><span>avg delivery</span></div><div class="stat"><b>4.8★</b><span>1L+ ratings</span></div></div>
        </div>
      </section>
      <div class="search-strip">
        <span style="font-weight:700;font-size:13px;color:var(--mut)">Popular:</span>
        ${['milk', 'maggi', 'chips', 'banana', 'cola', 'atta'].map(s => `<button class="chip2" data-quick="${s}">${s}</button>`).join('')}
      </div>
      ${filterCat === 'all' ? CATS.map(c => {
        const items = PRODUCTS.filter(p => p.cat === c.id);
        return `<div class="sec"><div class="sec-h"><h2>${c.emoji} ${esc(c.name)}</h2><span class="see" data-cat-link="${c.id}">see all</span></div>
        <div class="grid">${items.map(card).join('')}</div></div>`;
      }).join('') : (() => {
        const items = productsMatching('');
        return `<div class="sec"><div class="sec-h"><h2>${(CATS.find(c => c.id === filterCat) || {}).emoji || ''} ${(CATS.find(c => c.id === filterCat) || {}).name}</h2><span class="see">${items.length} products</span></div>
        <div class="grid">${items.map(card).join('')}</div></div>`;
      })()}`;
    view.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => { $('#q').value = b.dataset.quick; renderChips(); renderHome(); $('#q').focus(); });
    view.querySelectorAll('[data-cat-link]').forEach(s => s.onclick = () => { filterCat = s.dataset.catLink; renderChips(); renderHome(); window.scrollTo({ top: 0 }); });
  }
}

function stageOf(o) {
  const el = (Date.now() - o.placedAt) / 1000;
  return Math.min(3, Math.floor(el / STAGE_SEC));
}

function renderOrders() {
  const orders = [...store.orders].reverse();
  $('#view').innerHTML = `
    <div class="orders-h"><h1>My Orders</h1><p>${orders.length ? orders.length + ' order(s) — demo delivery simulation runs at 4× speed' : ''}</p></div>
    ${orders.length ? orders.map(o => {
      const st = stageOf(o);
      return `<div class="ocard" data-oid="${o.id}">
        <div class="row">
          <div><div class="oid">#${o.id}</div><div class="odate">${esc(o.date)} · ${esc(o.payLabel)} · ${esc(o.name)}, ${esc(o.addr)}</div></div>
          <span class="status ${st === 3 ? 'delivered' : 'placed'}"><span class="dot"></span>${STAGES[st]}</span>
        </div>
        <div class="oitems">${o.items.map(it => `<span class="oitem">${it.emoji} ${esc(it.name)} × ${it.qty}</span>`).join('')}</div>
        <div class="row"><b>${inr(o.total)}</b><span style="color:var(--mut);font-size:12.5px">ETA ${o.eta}</span></div>
        <div class="progress"><div class="pbar">${STAGES.map((_, i) => `<div class="step ${i <= st ? 'done' : ''}"></div>`).join('')}</div>
        <div class="pstages">${STAGES.map(s => `<span>${s}</span>`).join('')}</div></div>
      </div>`;
    }).join('') : `<div class="empty"><div class="big">🧾</div><h3>No orders yet</h3><p>Your orders will show up here.</p><p style="margin-top:14px"><button class="checkout-btn" style="width:auto;padding:11px 22px" onclick="location.hash='#/';window.scrollTo(0,0)">Start shopping</button></p></div>`}`;
}

/* ---------------- Drawer (cart) ---------------- */
function openDrawer() { $('#drawer').classList.add('show'); $('#backdrop').classList.add('show'); renderDrawer(); }
function closeDrawer() { $('#drawer').classList.remove('show'); $('#backdrop').classList.remove('show'); }

function renderDrawer() {
  const c = store.cart, ids = Object.keys(c).filter(id => c[id] > 0);
  $('#dCount').textContent = ids.length ? `· ${cartQty()} items` : '';
  if (!ids.length) {
    $('#dBody').innerHTML = `<div class="d-empty"><div class="big">🛒</div><b>Your cart is empty</b><p>Add items to get them delivered in 10 minutes.</p>
      <p style="margin-top:14px"><button class="checkout-btn" style="width:auto;padding:11px 22px" id="dBrowse">Browse products</button></p></div>`;
    $('#dBrowse').onclick = () => { closeDrawer(); window.scrollTo(0, 0); };
    $('#dFoot').innerHTML = '';
    return;
  }
  const b = bill();
  const cp = coupon.code ? COUPONS[coupon.code] : null;
  $('#dBody').innerHTML = ids.map(id => {
    const p = byId(id), q = c[id];
    return `<div class="citem">
      <div class="pimg" style="width:64px;height:64px;font-size:36px;display:grid;place-items:center;border-radius:10px;background:#f1f1f1">${p.emoji}</div>
      <div class="cinfo"><div class="cname">${esc(p.name)}</div><div class="cunit">${esc(p.unit)} · ${inr(p.price)}</div>
        <div class="crow"><b class="cprice">${inr(p.price * q)}</b>
        <div class="qty" style="position:static"><button data-dec="${id}">−</button><span class="qn">${q}</span><button data-inc="${id}">+</button></div></div></div>
    </div>`;
  }).join('');
  $('#dFoot').innerHTML = `
    <div class="coupon-row">
      <input id="cIn" placeholder="Coupon: SAVE50 / FREEDEL / BLITZ10" value="${coupon.code || ''}">
      <button class="btn-login" style="padding:10px 16px" id="cApply">Apply</button>
    </div>
    ${cp ? `<div class="billrow" style="color:var(--green);font-weight:700">✓ ${coupon.code}: ${esc(cp.desc)}</div>` : ''}
    <div class="billrow"><span>Item total</span><span>${inr(b.subtotal)}</span></div>
    ${b.discount ? `<div class="billrow" style="color:var(--green)"><span>Coupon discount</span><span>−${inr(b.discount)}</span></div>` : ''}
    <div class="billrow"><span>Delivery fee ${b.freeDel ? '' : `(free above ${inr(FREE_DELIVERY_AT)})`}</span><span class="${b.freeDel ? 'free' : ''}">${b.freeDel ? 'FREE' : inr(b.delivery)}</span></div>
    <div class="billrow"><span>Handling charge</span><span>${inr(b.handling)}</span></div>
    <div class="billrow total"><span>To pay</span><span>${inr(b.total)}</span></div>
    <button class="checkout-btn" id="checkout">Proceed to Checkout →</button>
    <div class="d-note">Demo app — payment is simulated, no real charge.</div>`;
  $('#cApply').onclick = () => {
    const code = $('#cIn').value.trim().toUpperCase();
    if (!code) { coupon = { code: null }; renderDrawer(); return; }
    if (!COUPONS[code]) { toast('❌ Invalid coupon: ' + code); return; }
    const cpn = COUPONS[code];
    if (bill().subtotal < cpn.min) { toast(`Add ${inr(cpn.min - bill().subtotal)} more for ${code}`); return; }
    coupon = { code }; toast('✓ ' + code + ' applied'); renderDrawer();
  };
  $('#checkout').onclick = openCheckout;
}

/* ---------------- Checkout ---------------- */
function openCheckout() {
  const b = bill();
  // Show payment method selection first
  const modal = document.createElement('div');
  modal.className = 'modal'; modal.id = 'ckModal';
  modal.innerHTML = `<div class="mcard">
    <div class="mtitle">Checkout</div>
    <div class="field"><label>Full name</label><input id="ckName" placeholder="Saket Kumar" autocomplete="name"></div>
    <div class="field"><label>Phone number</label><input id="ckPhone" placeholder="98XXXXXXXX" inputmode="tel" maxlength="10"></div>
    <div class="field"><label>Delivery address</label><input id="ckAddr" placeholder="Flat 204, Green Residency, HSR Layout"></div>
    <div class="field"><label>Payment method</label>
      <div class="pay-opts">
        <div class="pay-opt on" data-pay="UPI">📲 UPI (GPay / PhonePe)</div>
        <div class="pay-opt" data-pay="Card">💳 Credit / Debit card</div>
        <div class="pay-opt" data-pay="COD">💵 Cash on Delivery</div>
      </div>
    </div>
    <div class="mtotal"><span>To pay</span><span>${inr(b.total)}</span></div>
    <div class="mfoot"><button class="cancel" id="ckCancel">Cancel</button><button class="ok" id="ckOk">Place Order</button></div>
  </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
  let pay = 'UPI';
  modal.querySelectorAll('.pay-opt').forEach(o => o.onclick = () => {
    modal.querySelectorAll('.pay-opt').forEach(x => x.classList.remove('on'));
    o.classList.add('on'); pay = o.dataset.pay;
  });
  const close = () => { modal.classList.remove('show'); setTimeout(() => modal.remove(), 150); };
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  $('#ckCancel').onclick = close;

  $('#ckOk').onclick = async () => {
    const name = $('#ckName').value.trim(), phone = $('#ckPhone').value.trim(), addr = $('#ckAddr').value.trim();
    if (name.length < 2) return toast('Please enter your name');
    if (!/^\d{10}$/.test(phone)) return toast('Enter a valid 10-digit phone number');
    if (addr.length < 8) return toast('Please enter your full delivery address');

    // For COD, just save order directly
    if (pay === 'COD') {
      const orders = store.orders;
      const id = String(Date.now()).slice(-6);
      const c = store.cart;
      orders.push({
        id, name, phone, addr, payLabel: pay,
        date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
        placedAt: Date.now(), eta: '10 mins',
        items: Object.keys(c).filter(k => c[k] > 0).map(k => ({ name: byId(k).name, emoji: byId(k).emoji, qty: c[k], price: byId(k).price })),
        total: b.total,
      });
      store.orders = orders;
      store.cart = {}; coupon = { code: null };
      syncHeader(); closeDrawer(); close(); renderHome();
      location.hash = '#/orders';
      toast('✓ Order placed! COD order — Rider assigned — arriving in 10 minutes');
      return;
    }

    // Razorpay flow for UPI/Card
    const cpn = COUPONS[coupon.code] || { type: 'flat', value: 0, min: 0 };
    const orderAmount = b.total; // amount in INR (paise will be multiplied by 100 in API)
    
    // Create Razorpay order
    const createRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: orderAmount })
    });
    const orderData = await createRes.json();
    if (!orderData.id) {
      toast('❌ Could not create Razorpay order: ' + (orderData.error || 'unknown'));
      return;
    }

    // Initialize Razorpay client
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      // Fetch publishable key from our minimal API (keeps secret secure)
      fetch('/api/razorpay/key').then(async r => {
        const { key_id } = await r.json();
        const rzp = new Razorpay({ key_id });
        rzp.open({
          order_id: orderData.id,
          currency: 'INR',
          amount: orderAmount * 100, // Razorpay expects paise
          receipt: orderData.receipt,
          handler: function (response) {
            // Verify payment signature
            fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            }).then(async verRes => {
              const verData = await verRes.json();
              if (verData.status === 'valid') {
                // Save order to localStorage
                const orders = store.orders;
                const id = String(Date.now()).slice(-6);
                const c = store.cart;
                orders.push({
                  id, name, phone, addr, payLabel: pay,
                  date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
                  placedAt: Date.now(), eta: '10 mins',
                  items: Object.keys(c).filter(k => c[k] > 0).map(k => ({ name: byId(k).name, emoji: byId(k).emoji, qty: c[k], price: byId(k).price })),
                  total: b.total,
                });
                store.orders = orders;
                store.cart = {}; coupon = { code: null };
                syncHeader(); closeDrawer(); close(); renderHome();
                location.hash = '#/orders';
                toast('✓ Payment successful! Order placed — Rider assigned — arriving in 10 minutes');
              } else {
                toast('❌ Payment verification failed. Please try again.');
              }
            }).catch(e => {
              toast('❌ Error verifying payment');
              console.error(e);
            });
          },
          prefill: {
            name: name,
            email: name.toLowerCase() + '@example.com',
            contact: phone
          },
          notes: {
            address: addr,
            merchant_order_id: id
          }
        });
      });
    };
    document.body.appendChild(script);
  };
}

/* ---------------- Toast ---------------- */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------------- Cart ops ---------------- */
function add(id) { const c = store.cart; c[id] = (c[id] || 0) + 1; store.cart = c; syncHeader(); rerender(); }
function inc(id) { add(id); }
function dec(id) {
  const c = store.cart;
  if (c[id] > 1) c[id]--; else delete c[id];
  store.cart = c; syncHeader(); rerender();
}
function rerender() {
  renderHome();
  if ($('#drawer').classList.contains('show')) renderDrawer();
}

/* ---------------- Router ---------------- */
function route() {
  if (location.hash === '#/orders') renderOrders();
  else { renderHome(); }
  window.scrollTo({ top: 0 });
}

/* ---------------- Live order progress ---------------- */
setInterval(() => {
  if (location.hash === '#/orders' && store.orders.length) {
    const done = store.orders.every(o => stageOf(o) === 3);
    if (!done) renderOrders();
  }
}, 1000);

/* ---------------- Boot ---------------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-add],[data-inc],[data-dec]');
  if (!t) return;
  if (t.dataset.add) { add(t.dataset.add); toast('Added to cart'); }
  else if (t.dataset.inc) inc(t.dataset.id || t.dataset.inc);
  else if (t.dataset.dec) dec(t.dataset.dec);
});
$('#q').addEventListener('input', () => { renderChips(); renderHome(); });
$('#cartBtn').onclick = openDrawer;
$('#dClose').onclick = closeDrawer;
$('#backdrop').onclick = closeDrawer;
$('#loginBtn').onclick = () => toast('Demo app — login not required 🙂');
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') window.scrollTo({ top: 220, behavior: 'smooth' }); });
window.addEventListener('hashchange', route);

syncHeader(); renderChips(); route();
