/* Hero Chicken - فحص ملف js/data.js قبل النشر
   بيشتغل تلقائي على GitHub (وتقدر تشغله على جهازك: node scripts/validate.js)
   أي "خطأ" بيوقف النشر، و"تنبيه" بيظهر بس من غير ما يوقف. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

/* 1) قراءة data.js (لو فيه غلطة كتابة، هنا بتظهر) */
let D;
try {
  const src = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
  D = vm.runInNewContext(src + "\n;({ CONFIG, SOCIAL, OPTS, QUICK, CATEGORIES, TEXT })", {}, { filename: "js/data.js" });
} catch (e) {
  console.error("\n❌ ملف js/data.js فيه غلطة كتابة ومش هيشتغل:\n   " + e.message);
  const m = /data\.js:(\d+)/.exec(e.stack || "");
  if (m) console.error("   قريب من السطر رقم " + m[1] + " (غالبًا فاصلة , ناقصة أو قوس أو علامة تنصيص)");
  process.exit(1);
}
const { CONFIG, SOCIAL, OPTS, CATEGORIES, TEXT } = D;

const isStr = (x) => typeof x === "string" && x.trim() !== "";
const isNum = (x) => typeof x === "number" && Number.isFinite(x);

/* 2) الإعدادات */
if (!/^20\d{10}$/.test(CONFIG.phone || "")) err('CONFIG.phone لازم يبقى بالشكل الدولي من غير + وصفر، مثال: "201277666761" (الحالي: ' + CONFIG.phone + ")");
const hhmm = /^([01]\d|2[0-4]):[0-5]\d$/;
const H = CONFIG.hours || {};
if (!hhmm.test(H.open || "") || !hhmm.test(H.close || "")) err('مواعيد العمل لازم بالشكل "09:00" و"22:00"');
else if (H.open >= H.close) err("وقت الفتح (" + H.open + ") لازم يكون قبل وقت القفل (" + H.close + ")");
(CONFIG.phones || []).forEach((p) => { if (!/^01\d{9}$/.test(p)) warn("رقم في CONFIG.phones مش بصيغة 01XXXXXXXXX: " + p); });
((CONFIG.delivery || {}).areas || []).forEach((a, i) => {
  if (!isStr(a.ar) || !isStr(a.en)) err("منطقة التوصيل رقم " + (i + 1) + " ناقصها الاسم (ar أو en)");
  if (a.fee !== null && !(isNum(a.fee) && a.fee >= 0)) err('رسوم التوصيل لـ "' + a.ar + '" لازم رقم أو null');
  if (a.min != null && !(isNum(a.min) && a.min >= 0)) err('الحد الأدنى لـ "' + a.ar + '" لازم يكون رقم');
});
(CONFIG.banners || []).forEach((b, i) => { if (!isStr(b.ar) || !isStr(b.en)) err("البنر رقم " + (i + 1) + " ناقصه نص ar أو en"); if (!["green", "gold"].includes(b.bg)) warn("البنر رقم " + (i + 1) + ': اللون bg لازم "green" أو "gold"'); });
(CONFIG.payments || []).forEach((p, i) => { if (!isStr(p.ar) || !isStr(p.en)) err("طريقة الدفع رقم " + (i + 1) + " ناقصها ar أو en"); });
(SOCIAL || []).forEach((s) => { if (s.url && !/^https:\/\//.test(s.url)) err(s.label + ": الرابط لازم يبدأ بـ https://  (الحالي: " + s.url + ")"); });
if (!TEXT || !TEXT.ar || !TEXT.en) err("TEXT لازم يحتوي ar و en");

/* 3) الأقسام والأصناف */
const UNITS = ["kg", "pc", "tray", "box", "bag", "unit", "pack"];
const BADGES = ["top", "new", "offer"];
if (!Array.isArray(CATEGORIES) || !CATEGORIES.length) err("CATEGORIES فاضية");
let total = 0, noPrice = 0;
(CATEGORIES || []).forEach((c, ci) => {
  const cn = "القسم " + (ci + 1) + " (" + (c.ar || "؟") + ")";
  if (!isStr(c.ar) || !isStr(c.en)) err(cn + ": ناقصه الاسم ar أو en");
  if (!isStr(c.icon)) warn(cn + ": مفيش icon");
  if (!Array.isArray(c.items) || !c.items.length) { err(cn + ": مفيهوش أصناف"); return; }
  const seen = new Set();
  c.items.forEach((it, ii) => {
    total++;
    const n = cn + " ← صنف " + (ii + 1) + " (" + (it.ar || "؟") + ")";
    if (!isStr(it.ar) || !isStr(it.en)) err(n + ": ناقصه الاسم ar أو en");
    if (seen.has(it.ar)) warn(n + ": الاسم مكرر في نفس القسم");
    seen.add(it.ar);
    if (it.price === null) noPrice++;
    else if (!(isNum(it.price) && it.price > 0)) err(n + ": السعر لازم رقم أكبر من صفر (أو null) من غير علامات تنصيص. الحالي: " + JSON.stringify(it.price));
    if (!UNITS.includes(it.unit)) err(n + ": الوحدة unit لازم تكون واحدة من: " + UNITS.join(", ") + ". الحالي: " + JSON.stringify(it.unit));
    if (it.oldPrice !== undefined && !(isNum(it.oldPrice) && isNum(it.price) && it.oldPrice > it.price)) err(n + ": oldPrice لازم رقم أكبر من السعر الحالي");
    if (it.badge !== undefined && !BADGES.includes(it.badge)) err(n + ': badge لازم "top" أو "new" أو "offer". الحالي: ' + JSON.stringify(it.badge));
    if (it.soldOut !== undefined && typeof it.soldOut !== "boolean") err(n + ": soldOut لازم true أو false من غير علامات تنصيص");
    if (it.opts !== undefined) {
      if (!Array.isArray(it.opts)) err(n + ": opts لازم تكون قايمة مثل [\"cut\"]");
      else it.opts.forEach((o) => { if (!OPTS[o]) err(n + ': opts فيها "' + o + '" وده مش موجود في OPTS'); });
    }
    if (it.img) {
      const f = path.join(ROOT, it.img);
      if (!/^images\/[A-Za-z0-9._-]+$/.test(it.img)) err(n + ': اسم الصورة "' + it.img + '" لازم يكون إنجليزي من غير مسافات وفي فولدر images/');
      else if (!fs.existsSync(f)) err(n + ': الصورة "' + it.img + '" مش موجودة في الـ repo (اتأكد من الاسم وحروف كبيرة/صغيرة، GitHub بيفرّق بينهم)');
      else if (fs.statSync(f).size > 300 * 1024) warn(n + ": الصورة حجمها " + Math.round(fs.statSync(f).size / 1024) + " كيلوبايت (يفضل أقل من 150)");
    }
  });
});

/* 4) النتيجة */
console.log("تم فحص " + (CATEGORIES || []).length + " قسم و" + total + " صنف" + (noPrice ? " (" + noPrice + " بدون سعر)" : ""));
if (warns.length) { console.log("\n⚠ تنبيهات (مش بتوقف النشر):"); warns.forEach((w) => console.log("  - " + w)); }
if (errors.length) {
  console.error("\n❌ لقيت " + errors.length + " خطأ، لازم يتصلحوا قبل النشر:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("\n✅ كل حاجة سليمة");
