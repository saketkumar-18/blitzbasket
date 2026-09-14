# ⚡ BlitzBasket

Grocery delivery web app in the spirit of **Blinkit / Zepto / Instamart** — pure vanilla HTML/CSS/JS, no build step, no dependencies.

**Live:** https://blitzbasket.vercel.app

## Features
- 🛍️ 50+ products across 7 categories (Fruits & Veg, Dairy, Snacks, Drinks, Staples, Home, Personal Care)
- 🔍 Live search + category filter chips
- 🛒 Cart drawer with quantity steppers, persisted in `localStorage`
- 💰 Bill math: delivery fee (free above ₹199), handling charge, MRP discounts
- 🎟️ Coupons: `SAVE50` (₹50 off >₹199), `BLITZ10` (10% off >₹299), `FREEDEL` (free delivery)
- ✅ Checkout with validation (name / 10-digit phone / address) + UPI/Card/COD (simulated)
- 📦 Order tracking: Placed → Packed → Out for Delivery → Delivered (demo speed ~8s/stage), survives reload

## Run locally
```bash
cd blitzbasket
python -m http.server 8765   # → http://localhost:8765
```

## E2E test (13 checks, zero deps — raw CDP over WebSocket)
```bash
# needs a Chrome on CDP :9223 with the app open
node tests/cdp_e2e.js http://localhost:8765
```
Covers: title, search, add-to-cart, bill math, coupon min-spend rejection + apply, phone validation, order placement, live status progression, reload persistence.

## Deploy
Static site — the `vercel.json` just enables clean URLs. `app.js`, `styles.css`, `index.html` are the whole app.

---
Demo app: payments and delivery are simulated; orders live only in your browser's localStorage.
