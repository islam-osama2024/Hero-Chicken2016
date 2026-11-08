/* Service worker: بيخلي المنيو يتثبت كتطبيق ويفتح لو النت ضعيف.
   بيجيب الملفات من النت الأول (عشان تعديلاتك تظهر فوراً) ولو مفيش نت بيستخدم النسخة المحفوظة. */
const CACHE = "hc-v1";
const CORE = ["./", "index.html", "css/style.css", "js/data.js", "js/main.js", "images/logo.png", "manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then((res) => {
      if (res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); }
      return res;
    }).catch(() => caches.match(r))
  );
});
