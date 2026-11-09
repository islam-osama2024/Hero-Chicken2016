/* Service worker: بيخلي المنيو يتثبت كتطبيق ويفتح لو النت ضعيف.
   الصفحة والكود (html / js / css) بنسأل السيرفر عنهم في كل مرة (no-cache)،
   فلو اتغيروا بيجيبوا النسخة الجديدة فورًا، ولو ما اتغيروش السيرفر بيرد "ما اتغيرش" (304) وبيوفّر التحميل.
   الصور والفيديو بتتاخد من الكاش العادي عشان السرعة. ولو مفيش نت بنستخدم آخر نسخة محفوظة. */
const CACHE = "hc-v2";
const CORE = ["./", "index.html", "css/style.css", "js/data.js", "js/main.js", "images/logo.png", "manifest.webmanifest"];
const CODE = /\.(?:html|js|css|json|webmanifest)$/i;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== "GET" || url.origin !== location.origin) return;

  const fresh = r.mode === "navigate" || CODE.test(url.pathname) || url.pathname.endsWith("/");
  e.respondWith(
    (fresh ? fetch(r, { cache: "no-cache" }) : fetch(r))
      .then((res) => {
        if (res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); }
        return res;
      })
      .catch(() => caches.match(r).then((hit) => hit || caches.match("index.html")))
  );
});
