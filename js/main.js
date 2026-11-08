/* =========================================================
   Hero Chicken - main.js
   بيقرا data.js ويرسم المنيو ويشغّل السلة وإرسال الواتساب.
   ========================================================= */

/* ---------- الحالة والدوال المساعدة ---------- */
let lang = CONFIG.defaultLang;
const cart = [];                               // أسطر السلة: {c, i, qty, opts, note}
const KEY = "hc-cart";                         // حفظ السلة لو الصفحة اتعمل لها ريلود
const saveCart = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
const validLine = (l) => { const it = l && CATEGORIES[l.c] && CATEGORIES[l.c].items[l.i];
  return it && !it.soldOut && (it.opts || []).length === l.opts.length && (it.opts || []).every((id, g) => OPTS[id].choices[l.opts[g]]); };
try { JSON.parse(localStorage.getItem(KEY) || "[]").forEach((l) => validLine(l) && cart.push(l)); } catch (e) {}
const norm = (x) => x.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
const esc = (x) => x.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

const $ = (id) => document.getElementById(id);
const txt = () => TEXT[lang];
const money = (n) => `${n} ${CONFIG.currency[lang]}`;
const stepOf = (unit) => (unit === "kg" ? 0.5 : 1);   // الكيلو بنص كيلو، القطعة بواحد
const fmt = (n) => (Number.isInteger(n) ? n : n.toFixed(1));
const keyOf = (c, i) => `${c}-${i}`;

/* ---------- أيقونات الفوتر (SVG بسيطة) ---------- */
const ICONS = {
  whatsapp:  '<path fill="currentColor" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>',
  facebook:  '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
  tiktok:    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  youtube:   '<rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10 9 16 12 10 15"/>',
  phone:     '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin:       '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
};
const svg = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const toIntl = (p) => "+20" + p.replace(/^0/, "");   // 0127... ← +20127...

/* ---------- 1) رسم الصفحة ---------- */
function renderStatic() {
  const t = txt();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  $("langBtn").textContent = t.switchTo;
  $("tagline").textContent = t.tagline;
  $("cartTitle").textContent = t.orderTitle;
  $("totalLabel").textContent = t.total;
  $("sendBtn").textContent = t.send;
  $("custName").placeholder = t.name;
  $("custPhone").placeholder = t.phone;
  $("custAddress").placeholder = t.address;
  $("custNotes").placeholder = t.notes;
  $("doneTitle").textContent = t.doneTitle;
  $("orderNoLabel").textContent = t.orderNo;
  $("doneText").textContent = t.doneText;
  $("reopenBtn").textContent = t.reopen;
  $("backBtn").textContent = t.back;
  renderFooter();
  renderStatus();
  renderBanner();
  if ($("waFab").firstChild) updateFab();
  $("search").placeholder = t.search;
  $("installBtn").textContent = t.install;
}

function renderFooter() {
  const t = txt();
  $("footTag").textContent = t.tagline;
  $("followTitle").textContent = t.followUs;
  $("contactTitle").textContent = t.contactUs;

  // السوشيال: الواتساب دايماً + اللي ليه رابط
  const links = [{ key: "whatsapp", label: "WhatsApp", url: `https://wa.me/${CONFIG.phone}` }]
    .concat(SOCIAL.filter((s) => s.url));
  $("social").innerHTML = links.map((s) =>
    `<a class="social__link" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}" title="${s.label}">${svg(s.key)}</a>`
  ).join("");

  // التواصل: الأرقام + العنوان (لو موجود)
  let rows = CONFIG.phones.map((p) =>
    `<li><a href="tel:${toIntl(p)}">${svg("phone")}<span dir="ltr">${p}</span></a></li>`).join("");
  const addr = CONFIG.address[lang];
  if (addr) {
    const inner = `${svg("pin")}<span>${addr}</span>`;
    rows += CONFIG.address.mapUrl
      ? `<li><a href="${CONFIG.address.mapUrl}" target="_blank" rel="noopener">${inner}</a></li>`
      : `<li><span class="contact__row">${inner}</span></li>`;
  }
  $("contact").innerHTML = rows;

  // الحقوق والقائم على المشروع
  $("copy").textContent = `© ${new Date().getFullYear()} Hero Chicken — ${t.rights}`;
  const dev = CONFIG.developer;
  $("credit").innerHTML = `${t.credit}: ` + (dev.url
    ? `<a href="${dev.url}" target="_blank" rel="noopener">${dev[lang]}</a>`
    : `<strong>${dev[lang]}</strong>`);
}

function renderMenu() {
  $("chips").innerHTML = CATEGORIES.map((cat, c) =>
    `<button class="chip" type="button" data-action="chip" data-c="${c}">
       <span class="chip__icon">${cat.icon}</span>${cat[lang]}
     </button>`).join("");

  $("menu").innerHTML = CATEGORIES.map((cat, c) =>
    `<section class="cat" id="cat-${c}" data-c="${c}">
       <h2 class="cat-title">${cat[lang]}</h2>
       <div class="grid">${cat.items.map((item, i) => cardHTML(cat, item, c, i)).join("")}</div>
     </section>`).join("");

  observeSections();
  updateChipArrows();
  applySearch();
}

/* ---------- حفظ بيانات العميل على موبايله ---------- */
const CKEY = "hc-cust";
function loadCust() {
  try {
    const c = JSON.parse(localStorage.getItem(CKEY) || "null");
    if (!c) return;
    $("custName").value = c.name || ""; $("custPhone").value = c.phone || ""; $("custAddress").value = c.address || "";
    if (AREAS[c.areaIdx]) areaIdx = c.areaIdx;
    if (c.payIdx < PAYS.length) payIdx = c.payIdx;
    if (c.mode === "pickup" || c.mode === "delivery") mode = c.mode;
  } catch (e) {}
}
function saveCust() {
  try {
    localStorage.setItem(CKEY, JSON.stringify({ name: $("custName").value.trim(), phone: $("custPhone").value.trim(),
      address: $("custAddress").value.trim(), areaIdx, payIdx, mode }));
  } catch (e) {}
}
function forgetCust() {
  try { localStorage.removeItem(CKEY); } catch (e) {}
  ["custName", "custPhone", "custAddress"].forEach((id) => { $(id).value = ""; });
}

/* ---------- البحث ---------- */
function applySearch() {
  const q = norm($("search").value.trim());
  let any = false;
  document.querySelectorAll(".cat").forEach((sec) => {
    let n = 0;
    sec.querySelectorAll(".card").forEach((cd) => { const ok = !q || cd.dataset.s.includes(q); cd.hidden = !ok; if (ok) n++; });
    sec.hidden = n === 0;
    if (n) any = true;
  });
  $("noResults").textContent = txt().noResults;
  $("noResults").hidden = any || !q;
}

/* ---------- أزرار جنب الشاشة (واتساب + لأعلى) ---------- */
function updateFab() {
  const t = txt();
  $("waFab").href = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(t.waHello)}`;
  $("waFab").setAttribute("aria-label", "WhatsApp");
  $("toTop").setAttribute("aria-label", t.toTop);
}
function setupFab() {
  $("waFab").innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.whatsapp}</svg>`;
  $("toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  const onScroll = () => {
    $("toTop").hidden = window.scrollY < 400;
    chipsWrap.classList.toggle("is-stuck", chipsWrap.getBoundingClientRect().top <= 1);   // خلفية للشريط وهو ثابت فوق
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); updateFab();
}

/* ---------- بنر العروض ---------- */
let bannerIdx = 0, bannerTimer;
function renderBanner() {
  const list = CONFIG.banners || [], el = $("banner");
  el.hidden = !list.length;
  clearInterval(bannerTimer); bannerIdx = 0;
  if (!list.length) return;
  el.innerHTML = `<div class="banner__track" id="bannerTrack">` +
    list.map((b) => `<div class="banner__slide banner--${b.bg || "green"}">${b[lang]}</div>`).join("") + `</div>`;
  if (list.length > 1) bannerTimer = setInterval(() => {
    const tr = $("bannerTrack");
    bannerIdx = (bannerIdx + 1) % list.length;
    tr.scrollTo({ left: bannerIdx * tr.clientWidth * (document.documentElement.dir === "rtl" ? -1 : 1), behavior: "smooth" });
  }, 4500);
}

/* ---------- بيانات المحل لجوجل (Schema.org) ---------- */
function injectSchema() {
  if (!/^https?:$/.test(location.protocol)) return;
  const B = CONFIG.business, H = CONFIG.hours, base = location.origin + location.pathname.replace(/[^/]*$/, "");
  const desc = (document.querySelector('meta[name="description"]') || {}).content || "";
  const data = {
    "@context": "https://schema.org", "@type": "GroceryStore",
    name: "Hero Chicken", alternateName: "دجاج هيرو", description: desc,
    url: base, image: base + "images/logo.png", logo: base + "images/logo.png",
    telephone: toIntl(CONFIG.phones[0]),
    address: { "@type": "PostalAddress", addressLocality: B.locality, addressRegion: B.region, addressCountry: B.country },
    geo: { "@type": "GeoCoordinates", latitude: B.geo.lat, longitude: B.geo.lng },
    hasMap: CONFIG.address.mapUrl,
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: H.open, closes: H.close === "24:00" ? "23:59" : H.close }],
    areaServed: B.locality,
    paymentAccepted: (CONFIG.payments || []).map((p) => p.en).join(", "),
    sameAs: SOCIAL.filter((s) => s.url).map((s) => s.url)
  };
  const el = document.createElement("script");
  el.type = "application/ld+json"; el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

/* ---------- الإحصائيات (من غير بيانات شخصية) ---------- */
function loadAnalytics() {
  const A = CONFIG.analytics || {};
  if (/^G-[A-Z0-9]+$/.test(A.ga4 || "")) {
    const g = document.createElement("script");
    g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + A.ga4; document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", A.ga4);
  }
  if (/^[a-f0-9]{16,64}$/i.test(A.cloudflareToken || "")) {
    const c = document.createElement("script");
    c.defer = true; c.src = "https://static.cloudflareinsights.com/beacon.min.js";
    c.setAttribute("data-cf-beacon", JSON.stringify({ token: A.cloudflareToken })); document.head.appendChild(c);
  }
}
const track = (name, params) => { if (window.gtag) window.gtag("event", name, params); };

/* ---------- تثبيت المنيو كتطبيق (PWA) ---------- */
let installEvt = null;
function setupPWA() {
  const ok = location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname);
  if (ok && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  const btn = $("installBtn");
  const standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  btn.hidden = !!standalone;                         // الزر ثابت، ويختفي بس لو المنيو مفتوح كتطبيق
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; });
  btn.addEventListener("click", async () => {
    if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);   // لو المتصفح مش بيدعم التثبيت المباشر نوريه الخطوات
    $("installHint").textContent = ios ? txt().installIos : txt().installOther;
    $("installHint").hidden = false;
  });
  window.addEventListener("appinstalled", () => { btn.hidden = true; $("installHint").hidden = true; track("pwa_installed"); });
}

function cardHTML(cat, item, c, i) {
  const t = txt();
  const price = item.price === null ? `<small>${t.askPrice}</small>` : `${item.oldPrice ? `<s>${item.oldPrice}</s> ` : ""}${money(item.price)} <small>/ ${t[item.unit]}</small>`;
  const badge = item.soldOut ? `<span class="badge badge--out">${t.soldOut}</span>` : item.badge ? `<span class="badge badge--${item.badge}">${t["badge_" + item.badge]}</span>` : "";
  const img = item.img ? `<img src="${item.img}" alt="" loading="lazy" data-fb="${cat.icon}" onerror="this.parentNode.textContent=this.dataset.fb">` : cat.icon;
  return `<article class="card${item.soldOut ? " card--out" : ""}" data-s="${norm(item.ar + " " + item.en)}">${badge}
      <div class="card__img">${img}</div>
      <div class="card__name">${item[lang]}</div>
      <div class="card__price">${price}</div>
      <div class="card__ctl" id="ctl-${c}-${i}">${ctlHTML(c, i)}</div>
    </article>`;
}
function ctlHTML(c, i) {
  if (CATEGORIES[c].items[i].soldOut) return `<button class="add-btn" type="button" disabled>${txt().soldOut}</button>`;
  const q = cart.filter((l) => l.c === c && l.i === i).reduce((s, l) => s + l.qty, 0);
  return (q ? `<div class="in-cart">✓ ${fmt(q)} ${txt()[CATEGORIES[c].items[i].unit]}</div>` : "") +
    `<button class="add-btn" type="button" data-action="open" data-c="${c}" data-i="${i}">${txt().add}</button>`;
}
function refreshCtl(c, i) { const el = $(`ctl-${c}-${i}`); if (el) el.innerHTML = ctlHTML(c, i); }

/* ---------- نافذة اختيار الصنف ---------- */
let cur = null;
const unitPrice = (it, opts) => it.price + (it.opts || []).reduce((s, id, g) => s + (OPTS[id].choices[opts[g]].plus || 0), 0);

function openItem(c, i) {
  if (CATEGORIES[c].items[i].soldOut) return;
  cur = { c, i, qty: 1, opts: (CATEGORIES[c].items[i].opts || []).map(() => 0), note: "" };
  renderItem(); $("itemSheet").classList.add("is-open");
}
function closeItem() { $("itemSheet").classList.remove("is-open"); cur = null; }

function renderItem() {
  const note = $("itemNote"); if (note) cur.note = note.value;
  const it = CATEGORIES[cur.c].items[cur.i], t = txt();
  const groups = (it.opts || []).map((id, g) =>
    `<div class="opt"><h4>${OPTS[id][lang]}</h4><div class="opt__row">` +
    OPTS[id].choices.map((ch, k) => `<button type="button" class="pill${cur.opts[g] === k ? " is-on" : ""}" data-action="opt" data-g="${g}" data-k="${k}">${ch[lang]}${ch.plus ? ` (+${ch.plus})` : ""}</button>`).join("") +
    `</div></div>`).join("");
  const quick = (QUICK[it.unit] || QUICK.pc).map((q) => `<button type="button" class="pill${cur.qty === q ? " is-on" : ""}" data-action="q" data-q="${q}">${fmt(q)}</button>`).join("");
  const total = it.price === null ? t.askPrice : money(unitPrice(it, cur.opts) * cur.qty);
  $("itemPanel").innerHTML = `<button class="panel__close" type="button" data-action="closeItem" aria-label="×">×</button>
    <h2 class="panel__title">${it[lang]}</h2>${groups}
    <div class="opt"><h4>${t.qtyTitle} (${t[it.unit]})</h4><div class="opt__row">${quick}</div>
      <div class="qty qty--big"><button type="button" data-action="qdec" aria-label="-">−</button><span>${fmt(cur.qty)} ${t[it.unit]}</span><button type="button" data-action="qinc" aria-label="+">+</button></div></div>
    <textarea class="field" id="itemNote" rows="2" placeholder="${t.itemNote}">${esc(cur.note)}</textarea>
    <button class="send-btn add-line" type="button" data-action="addLine">${t.addToCart} — ${total}</button>`;
}
function addLine() {
  const note = $("itemNote"); cur.note = note ? note.value.trim() : "";
  const same = cart.find((l) => l.c === cur.c && l.i === cur.i && l.note === cur.note && l.opts.join() === cur.opts.join());
  if (same) same.qty += cur.qty; else cart.push({ c: cur.c, i: cur.i, qty: cur.qty, opts: [...cur.opts], note: cur.note });
  track("add_to_cart", { item_name: CATEGORIES[cur.c].items[cur.i].en });
  const { c, i } = cur; closeItem(); refreshCtl(c, i); updateCartBar();
}

/* ---------- 2) السلة ---------- */
function changeLine(idx, dir) {
  const l = cart[idx], it = CATEGORIES[l.c].items[l.i];
  l.qty += dir * stepOf(it.unit);
  if (l.qty <= 0) cart.splice(idx, 1);
  refreshCtl(l.c, l.i); updateCartBar(); renderCart();
}

function cartLines() {
  let total = 0, hasUnpriced = false;
  const lines = cart.map((l, idx) => {
    const it = CATEGORIES[l.c].items[l.i];
    const sub = it.price === null ? null : unitPrice(it, l.opts) * l.qty;
    if (sub === null) hasUnpriced = true; else total += sub;
    return { ...l, idx, name: it[lang], unit: txt()[it.unit], sub,
             extra: (it.opts || []).map((id, g) => OPTS[id].choices[l.opts[g]][lang]) };
  });
  return { lines, total, hasUnpriced };
}

function updateCartBar() {
  const { lines, total } = cartLines();
  saveCart();
  document.body.classList.toggle("has-cart", lines.length > 0);
  $("cartBar").classList.toggle("is-visible", lines.length > 0);
  $("cartCount").textContent = `${txt().viewOrder} (${lines.length} ${txt().itemsWord})`;
  $("cartTotal").textContent = total ? money(total) : "";
}

function renderCart() {
  const { lines, total, hasUnpriced } = cartLines();
  if (!lines.length) return closeCart();
  $("cartList").innerHTML = lines.map((l) =>
    `<div class="cart-row">
       <div class="cart-row__name">${l.name}${l.extra.length ? `<small>${l.extra.join(" • ")}</small>` : ""}${l.note ? `<small>📝 ${esc(l.note)}</small>` : ""}</div>
       <span>${fmt(l.qty)} ${l.unit}</span>
       <span>${l.sub === null ? "—" : money(l.sub)}</span>
       <div class="qty">
         <button type="button" data-action="cdec" data-idx="${l.idx}" aria-label="-">−</button>
         <button type="button" data-action="cinc" data-idx="${l.idx}" aria-label="+">+</button>
       </div>
     </div>`).join("");
  renderDelivery();
}

/* ---------- مواعيد العمل ---------- */
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
function nowMin() {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: CONFIG.hours.tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (x) => Number(p.find((q) => q.type === x).value);
  return g("hour") * 60 + g("minute");
}
const isOpenNow = () => { const n = nowMin(); return n >= toMin(CONFIG.hours.open) && n < toMin(CONFIG.hours.close); };
function fmtTime(hhmm) {
  const hr = Math.floor(toMin(hhmm) / 60) % 24, mn = toMin(hhmm) % 60;
  const suf = lang === "ar" ? (hr < 12 ? "ص" : "م") : (hr < 12 ? "AM" : "PM");
  return `${hr % 12 || 12}${mn ? ":" + String(mn).padStart(2, "0") : ""} ${suf}`;
}
function renderStatus() {
  const t = txt(), o = isOpenNow(), H = CONFIG.hours, el = $("status");
  el.className = "status " + (o ? "is-open" : "is-closed");
  el.innerHTML = `<i></i>` + (o ? `${t.openNow} • ${t.until} ${fmtTime(H.close)}` : `${t.closedNow} • ${t.opensAt} ${fmtTime(H.open)}`);
}

/* ---------- التوصيل والحد الأدنى والموقع ---------- */
const AREAS = CONFIG.delivery.areas;
let mode = "delivery", areaIdx = 0, locState = "none", geo = null;
const PAYS = CONFIG.payments || [];
let payIdx = 0;

function orderCalc() {
  const { total, hasUnpriced } = cartLines(), a = AREAS[areaIdx], del = mode === "delivery";
  const min = del ? (a.min ?? CONFIG.delivery.minOrder) : 0;
  const fee = del ? a.fee : 0;                                   // null = بتتحدد عند التأكيد
  return { total, hasUnpriced, a, del, min, fee, grand: total + (fee || 0), left: min - total,
           blocked: del && !hasUnpriced && total < min, pending: hasUnpriced || (del && fee === null) };
}
const feeText = (a) => a.fee === null ? txt().feeLater : a.fee ? money(a.fee) : txt().free;

function renderDelivery() {
  const t = txt(), o = orderCalc();
  $("modeDel").textContent = "🛵 " + t.deliveryMode;
  $("modePick").textContent = "🏪 " + t.pickupMode;
  $("modeDel").classList.toggle("is-on", o.del);
  $("modePick").classList.toggle("is-on", !o.del);
  $("deliveryBox").hidden = !o.del;
  $("area").innerHTML = AREAS.map((a, k) => `<option value="${k}">${a[lang]} — ${feeText(a)}</option>`).join("");
  $("area").value = areaIdx;
  $("locBtn").textContent = t.locate;
  $("locStatus").textContent = { none: "", wait: t.locWait, ok: t.locOk, fail: t.locFail }[locState];
  $("feeRows").innerHTML = `<div class="fee-row"><span>${t.subtotal}</span><span>${money(o.total)}</span></div>` +
    (o.del ? `<div class="fee-row"><span>${t.deliveryFee}</span><span>${feeText(o.a)}</span></div>` : "");
  $("totalValue").textContent = money(o.grand) + (o.pending ? " +" : "");
  $("cartNote").textContent = o.hasUnpriced ? t.unpricedNote : "";
  $("formMsg").textContent = o.blocked ? t.minMsg.replace("{min}", money(o.min)).replace("{left}", money(o.left)) : "";
  $("hoursNote").textContent = isOpenNow() ? "" : `${t.closedNote} ${fmtTime(CONFIG.hours.open)}`;
  $("paySec").hidden = !PAYS.length;
  $("payTitle").textContent = t.payTitle;
  $("payRow").innerHTML = PAYS.map((p, k) => `<button type="button" class="pill${k === payIdx ? " is-on" : ""}" data-action="pay" data-k="${k}">${p[lang]}</button>`).join("");
  $("forgetBtn").textContent = t.forget;
  $("sendBtn").disabled = o.blocked;
  $("custPhone").placeholder = t.phone + (o.del ? " *" : "");
  $("custAddress").placeholder = t.address + (o.del ? " *" : "");
}

function locate() {
  if (!navigator.geolocation) { locState = "fail"; return renderDelivery(); }
  locState = "wait"; renderDelivery();
  navigator.geolocation.getCurrentPosition(
    (p) => { geo = { lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) }; locState = "ok"; renderDelivery(); },
    () => { locState = "fail"; renderDelivery(); },
    { enableHighAccuracy: true, timeout: 10000 });
}

function openCart() { showForm(); renderCart(); if (cart.length) $("sheet").classList.add("is-open"); }
function closeCart() { $("sheet").classList.remove("is-open"); }

/* التبديل بين نموذج الطلب وشاشة الشكر */
function showForm() { $("orderForm").hidden = false; $("done").hidden = true; }
function showDone(orderNo) {
  $("orderNo").textContent = orderNo;
  $("orderForm").hidden = true;
  $("done").hidden = false;
}

/* رقم الطلب: HC- + 4 أرقام عشوائية */
const newOrderNo = () => "HC-" + (Math.floor(Math.random() * 9000) + 1000);
let lastLink = "";

/* رجوع للمنيو: بنفضي السلة بعد ما العميل خلّص */
function finishOrder() {
  cart.length = 0;
  closeCart(); showForm(); renderMenu(); updateCartBar();
}

/* ---------- 3) إرسال الطلب على واتساب ---------- */
function sendOrder() {
  const t = txt();
  const { lines } = cartLines();
  if (!lines.length) return;
  const o = orderCalc();
  if (o.blocked) return;
  if (o.del && (!$("custPhone").value.trim() || !$("custAddress").value.trim())) {
    $("formMsg").textContent = t.needInfo;
    ["custPhone", "custAddress"].forEach((id) => $(id).classList.toggle("is-bad", !$(id).value.trim()));
    return;
  }
  ["custPhone", "custAddress"].forEach((id) => $(id).classList.remove("is-bad"));
  saveCust();
  const orderNo = newOrderNo();
  let msg = `*${t.msgHeader}* 🐔\n*${t.orderNo}* ${orderNo}\n\n`;
  msg += lines.map((l) =>
    `• ${l.name}${l.extra.length ? ` (${l.extra.join("، ")})` : ""}: ${fmt(l.qty)} ${l.unit}` +
    (l.sub === null ? ` (${t.askPrice})` : ` = ${money(l.sub)}`) + (l.note ? `\n   📝 ${l.note}` : "")
  ).join("\n");
  msg += "\n\n" + (o.del
    ? `🛵 *${t.deliveryMode}* — ${o.a[lang]}` + (o.fee === null ? ` (${t.deliveryFee}: ${t.feeLater})` : o.fee ? ` (${t.deliveryFee}: ${money(o.fee)})` : "")
    : `🏪 *${t.pickupMode}*`);
  msg += `\n*${t.total}:* ${money(o.grand)}${o.pending ? " +" : ""}`;
  if (PAYS.length) msg += `\n💳 ${t.payTitle}: ${PAYS[payIdx][lang]}`;
  if (o.del && geo) msg += `\n📍 https://maps.google.com/?q=${geo.lat},${geo.lng}`;
  if (!isOpenNow()) msg += `\n⏰ ${t.offHours}`;

  const name = $("custName").value.trim();
  const phone = $("custPhone").value.trim();
  const address = $("custAddress").value.trim();
  const notes = $("custNotes").value.trim();
  if (name) msg += `\n${t.name}: ${name}`;
  if (phone) msg += `\n${t.phone}: ${phone}`;
  if (address) msg += `\n${t.address}: ${address}`;
  if (notes) msg += `\n${t.notes}: ${notes}`;

  lastLink = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(msg)}`;
  window.open(lastLink, "_blank");
  track("send_order", { value: o.grand, currency: "EGP", delivery: o.del });
  showDone(orderNo);
}

/* ---------- شريط الأقسام: سحب + عجلة الماوس + أسهم ---------- */
const chipsEl = $("chips"), chipsWrap = $("chipsWrap");
let dragged = false;

function updateChipArrows() {
  const max = chipsEl.scrollWidth - chipsEl.clientWidth;
  const pos = document.documentElement.dir === "rtl" ? max + chipsEl.scrollLeft : chipsEl.scrollLeft; // المسافة من الشمال
  chipsWrap.classList.toggle("can-l", pos > 2);
  chipsWrap.classList.toggle("can-r", pos < max - 2);
}
function startChip(ch) {                     // نخلي القسم الحالي في أول الشريط (يمين في العربي)
  const a = ch.getBoundingClientRect(), b = chipsEl.getBoundingClientRect(), pad = 16;
  const delta = document.documentElement.dir === "rtl" ? a.right - b.right + pad : a.left - b.left - pad;
  chipsEl.scrollBy({ left: delta, behavior: "smooth" });
}
function setupChips() {
  chipsEl.addEventListener("scroll", updateChipArrows, { passive: true });
  window.addEventListener("resize", updateChipArrows);
  $("chipsL").addEventListener("click", () => chipsEl.scrollBy({ left: -260, behavior: "smooth" }));
  $("chipsR").addEventListener("click", () => chipsEl.scrollBy({ left: 260, behavior: "smooth" }));
  chipsEl.addEventListener("wheel", (e) => {            // العجلة العادية تحرك الشريط أفقياً
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    chipsEl.scrollBy({ left: e.deltaY * (document.documentElement.dir === "rtl" ? -1 : 1) });
  }, { passive: false });
  let down = false, startX = 0, startLeft = 0;           // السحب بالماوس
  chipsEl.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; dragged = false; startX = e.clientX; startLeft = chipsEl.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { dragged = true; chipsEl.classList.add("is-dragging"); }
    if (dragged) chipsEl.scrollLeft = startLeft - dx;
  });
  window.addEventListener("pointerup", () => { down = false; chipsEl.classList.remove("is-dragging"); });
  chipsEl.addEventListener("click", (e) => {            // بعد السحب منعدّيش الضغطة
    if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; }
  }, true);
}

/* ---------- 4) تمييز القسم الحالي أثناء النزول ---------- */
let observer;
function observeSections() {
  if (observer) observer.disconnect();
  if (!("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      document.querySelectorAll(".chip").forEach((ch) => {
        const on = ch.dataset.c === en.target.dataset.c;
        ch.classList.toggle("is-active", on);
        if (on && !dragged ) startChip(ch);
      });
    });
  }, { rootMargin: "-120px 0px -65% 0px" });
  document.querySelectorAll(".cat").forEach((s) => observer.observe(s));
}

/* ---------- 5) الأحداث ---------- */
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const d = el.dataset, a = d.action;
  if (a === "open") openItem(Number(d.c), Number(d.i));
  else if (a === "chip") $(`cat-${d.c}`).scrollIntoView({ behavior: "smooth", block: "start" });
  else if (a === "cdec") changeLine(Number(d.idx), -1);
  else if (a === "cinc") changeLine(Number(d.idx), 1);
  else if (a === "mode") { mode = d.m; renderCart(); }
  else if (a === "pay") { payIdx = Number(d.k); renderDelivery(); }
  else if (a === "closeItem") closeItem();
  else if (a === "addLine") addLine();
  else if (cur) {                                   // أزرار نافذة الصنف
    const unit = CATEGORIES[cur.c].items[cur.i].unit;
    if (a === "opt") cur.opts[Number(d.g)] = Number(d.k);
    else if (a === "q") cur.qty = Number(d.q);
    else if (a === "qinc") cur.qty += stepOf(unit);
    else if (a === "qdec") cur.qty = Math.max(stepOf(unit), cur.qty - stepOf(unit));
    renderItem();
  }
});
$("itemSheet").addEventListener("click", (e) => { if (e.target === $("itemSheet")) closeItem(); });

$("langBtn").addEventListener("click", () => {
  lang = lang === "ar" ? "en" : "ar";
  renderStatic(); renderMenu(); updateCartBar();
});
$("cartBar").addEventListener("click", openCart);
$("closeBtn").addEventListener("click", closeCart);
$("sheet").addEventListener("click", (e) => { if (e.target === $("sheet")) closeCart(); });
$("sendBtn").addEventListener("click", sendOrder);
$("search").addEventListener("input", applySearch);
$("locBtn").addEventListener("click", locate);
$("forgetBtn").addEventListener("click", forgetCust);
$("area").addEventListener("change", (e) => { areaIdx = Number(e.target.value); renderCart(); });
$("reopenBtn").addEventListener("click", () => window.open(lastLink, "_blank"));
$("backBtn").addEventListener("click", finishOrder);

/* ---------- فيديو الهيدر ---------- */
function setupHeroVideo() {
  const v = document.querySelector(".hero__video");
  if (!v) return;
  v.muted = true;                                          // ضروري عشان التشغيل التلقائي
  const src = v.querySelector("source");
  if (src) src.addEventListener("error", () => v.remove()); // لو الملف مش موجود نشيله
  const p = v.play && v.play();
  if (p && p.catch) p.catch(() => {});
}

/* ---------- تشغيل ---------- */
loadCust();
setupChips();
setupFab();
injectSchema();
loadAnalytics();
setupPWA();
setupHeroVideo();
setInterval(renderStatus, 60000);
renderStatic();
renderMenu();
updateCartBar();