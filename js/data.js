/* =========================================================
   Hero Chicken - data.js
   كل اللي بتغيره بإيدك (رقم الواتساب، الأسعار، الأصناف، النصوص)
   موجود هنا. ملف main.js مش محتاج تلمسه.
   ========================================================= */

/* ---------- 1) الإعدادات ---------- */
const CONFIG = {
  // رقم استقبال الطلبات: صيغة دولية بدون + وبدون صفر (01277666761 ← 201277666761)
  phone: "201277666761",
  currency: { ar: "ج.م", en: "EGP" },
  defaultLang: "ar",

  // مواعيد العمل (24:00 = 12 بالليل). المنطقة الزمنية مصر.
  hours: { open: "08:00", close: "24:00", tz: "Africa/Cairo" },

  // التوصيل: لكل منطقة fee (رسوم التوصيل، null = بتتحدد عند التأكيد) و min (الحد الأدنى للطلب)
  delivery: {
    minOrder: 30,                                   // الحد الأدنى الافتراضي
    areas: [
      { ar: "بنها", en: "Benha", fee: null, min: 30 },
      { ar: "خارج بنها", en: "Outside Benha", fee: null, min: 30 }
      // ضيف مناطقك هنا: { ar: "اسم المنطقة", en: "Area", fee: 15, min: 30 },
    ]
  },

  // بنر العروض (فاضي = مش بيظهر). bg: "green" أو "gold". ضيف عرض جديد بنفس الشكل.
  banners: [
    { ar: "فراخ فريش وكل أنواع الفراخ المتبلة الجاهزة بجميع الخلطات 🍗", en: "Fresh chicken and ready marinated chicken in every flavor 🍗", bg: "green" },
    { ar: "اطلب دلوقتي وإحنا نوصلهالك 🛵", en: "Order now and we will deliver it 🛵", bg: "gold" }
  ],

  // الإحصائيات (اختياري): كود GA4 زي "G-XXXXXXXXXX" و/أو توكن Cloudflare Web Analytics
  analytics: { ga4: "", cloudflareToken: "" },

  // طرق الدفع اللي بتظهر للعميل (امسح اللي مش بتقبله، و[] معناها مفيش اختيار دفع)
  payments: [
    { ar: "كاش عند الاستلام", en: "Cash on delivery" },
    { ar: "فودافون كاش", en: "Vodafone Cash" },
    { ar: "إنستاباي", en: "InstaPay" }
  ],

  // بيانات المحل لجوجل (بتتحول تلقائي لـ Schema.org). geo = إحداثيات المحل.
  business: { locality: "Benha", region: "Qalyubia", country: "EG", geo: { lat: 30.462833, lng: 31.185417 } },

  // أرقام الاتصال اللي بتظهر في الفوتر (الطلبات نفسها بتروح على phone فوق)
  phones: ["01277666761", "01029666494"],

  // العنوان (اختياري): سيبه فاضي لو مش عايزه يظهر. mapUrl رابط الموقع على خرائط جوجل
  address: { ar: "موقع المحل على الخريطة", en: "Shop location on the map", mapUrl: "https://www.google.com/maps?q=30.462833,31.185417" },

  // القائم على المشروع (url اختياري: رابط صفحتك أو واتسابك)
  developer: { ar: "أبو الياس", en: "Abu Elyas", url: "" }
};

/* ---------- السوشيال ميديا ----------
   حط الرابط الكامل في url (مثال: "https://facebook.com/herochicken").
   اللي رابطه فاضي مش بيظهر في الفوتر. الواتساب بيظهر لوحده دايماً. */
const SOCIAL = [
  { key: "facebook",  label: "Facebook",  url: "https://www.facebook.com/profile.php?id=61594980556785" },
  { key: "instagram", label: "Instagram", url: "" },
  { key: "tiktok",    label: "TikTok",    url: "" },
  { key: "youtube",   label: "YouTube",   url: "" }
];

/* ---------- اختيارات الأصناف (غيّرها زي ما تحب) ----------
   كل مجموعة ليها اختيارات. الاختيار ممكن يبقى له plus = زيادة في سعر الوحدة. */
const OPTS = {
  cut:   { ar: "التقطيع", en: "Cutting", choices: [
           { ar: "كاملة", en: "Whole" }, { ar: "نص فراخة", en: "Half" },
           { ar: "ربع", en: "Quarter" }, { ar: "8 قطع", en: "8 pieces" }] },
  skin:  { ar: "الجلد", en: "Skin", choices: [
           { ar: "بالجلد", en: "With skin" }, { ar: "من غير جلد", en: "Skinless" }] },
  slice: { ar: "الشكل", en: "Style", choices: [
           { ar: "قطعة كاملة", en: "Whole piece" }, { ar: "شرائح", en: "Slices" },
           { ar: "مكعبات", en: "Cubes" }, { ar: "مفروم", en: "Minced" }] },
  mix:   { ar: "الخلطة", en: "Marinade", choices: [
           { ar: "هندي", en: "Indian" }, { ar: "مكسيكي", en: "Mexican" },
           { ar: "مشوي", en: "Grill" }, { ar: "ثوم وليمون", en: "Garlic & lemon" }] }
};

/* أزرار الكميات السريعة */
const QUICK = { kg: [0.5, 1, 2, 3, 5], pc: [1, 2, 3, 4] };

/* ---------- 2) الأقسام والأصناف ----------
   كل صنف:
     ar    الاسم بالعربي
     en    الاسم بالإنجليزي
     price السعر (اكتب null لو هتسأل عن السعر)
     soldOut (اختياري) true = الصنف نفد (بيظهر "نفد اليوم" ومش بيتطلب)
     badge (اختياري) "top" الأكثر طلباً، "new" جديد، "offer" عرض
     oldPrice (اختياري) السعر قبل الخصم، بيظهر مشطوب
     opts  (اختياري) مجموعات الاختيارات من OPTS، مثال: opts: ["cut", "skin"]
     unit  الوحدة: kg كيلو، pc قطعة، tray طبق، box علبة، bag كيس، unit واحدة، pack عبوة
     img   مسار الصورة (اختياري)، مثال: "images/breasts.jpg"
           لو سيبته فاضي بيظهر إيموجي القسم
*/
const CATEGORIES = [
  {
    ar: "حي فريش", en: "Live & fresh", icon: "🐔",
    items: [
      { ar: "فراخ أبيض", en: "White chicken", price: 85, unit: "kg", img: "images/whole.jpg", opts: ["cut"] },
      { ar: "فراخ ساسو", en: "Sasso chicken", price: 130, unit: "kg", img: "images/sasso-chicken.jpg", opts: ["cut"] },
      { ar: "فراخ بلدي", en: "Baladi chicken", price: 140, unit: "kg", img: "images/grilled.jpg", opts: ["cut"] },
      { ar: "فراخ عتاقي", en: "Ataqi chicken", price: 100, unit: "kg", img: "images/ataqi-chicken.jpg", opts: ["cut"] },
      { ar: "فراخ هامر", en: "Hamer chicken", price: 120, unit: "kg", img: "images/hamer-chicken.jpg", opts: ["cut"] },
      { ar: "فراخ أبيض أورجانك", en: "Organic white chicken", price: 140, unit: "kg", img: "images/organic-white-chicken.jpg", opts: ["cut"] },
      { ar: "فراخ بلدي أورجانك", en: "Organic baladi chicken", price: 200, unit: "kg", img: "images/organic-baladi-chicken.jpg", opts: ["cut"] },
      { ar: "بط فرنساوي", en: "French duck", price: 120, unit: "kg", img: "images/french-duck.jpg" },
      { ar: "بط بلدي", en: "Baladi duck", price: 150, unit: "kg", img: "images/baladi-duck.jpg" }
    ]
  },
  {
    ar: "قطعيات أبيض سادة", en: "Plain white cuts", icon: "🍗",
    items: [
      { ar: "صدور بالعظم سادة", en: "Bone-in breasts", price: 150, unit: "kg", img: "images/breasts.jpg" },
      { ar: "بانية سادة", en: "Plain breast cutlets", price: 230, unit: "kg", img: "images/plain-breast-cutlets.jpg" },
      { ar: "استريبس سادة", en: "Plain strips", price: 220, unit: "kg", img: "images/plain-strips.jpg" },
      { ar: "شاورما سادة", en: "Plain shawarma", price: 210, unit: "kg", img: "images/plain-shawarma.jpg" },
      { ar: "أجنحة سادة", en: "Plain wings", price: 75, unit: "kg", img: "images/plain-wings.jpg" },
      { ar: "أوراك بالعضم سادة", en: "Bone-in thighs", price: 90, unit: "kg", img: "images/pieces.jpg" },
      { ar: "أوراك مخلية سادة", en: "Boneless thighs", price: 195, unit: "kg", img: "images/boneless-thighs.jpg" },
      { ar: "دبابيس سادة", en: "Plain drumsticks", price: 130, unit: "kg", img: "images/plain-drumsticks.jpg" },
      { ar: "شيش سادة", en: "Plain shish", price: 195, unit: "kg", img: "images/plain-shish.jpg" },
      { ar: "كوردن بلو", en: "Cordon bleu", price: 340, unit: "kg", img: "images/cordon-bleu.jpg" },
      { ar: "كبد", en: "Liver", price: 120, unit: "kg", img: "images/liver.jpg" },
      { ar: "قوانص", en: "Gizzards", price: 110, unit: "kg", img: "images/gizzards.jpg" },
      { ar: "رقبة", en: "Necks", price: 35, unit: "kg", img: "images/necks.jpg" },
      { ar: "هياكل", en: "Carcasses", price: 35, unit: "kg", img: "images/carcasses.jpg" }
    ]
  },
  {
    ar: "مفروم", en: "Minced & processed", icon: "🌭",
    items: [
      { ar: "برجر فراخ طبيعي", en: "Natural chicken burger", price: 299, unit: "kg", img: "images/natural-chicken-burger.jpg" },
      { ar: "لانشون فراخ طبيعي", en: "Natural chicken luncheon", price: 295, unit: "kg", img: "images/natural-chicken-luncheon.jpg" },
      { ar: "سوسيس فراخ طبيعي", en: "Natural chicken sausage", price: 295, unit: "kg", img: "images/natural-chicken-sausage.jpg" },
      { ar: "كفتة فراخ طبيعي", en: "Natural chicken kofta", price: 299, unit: "kg", img: "images/natural-chicken-kofta.jpg" },
      { ar: "مسحب فراخ طبيعي", en: "Natural pulled chicken", price: 299, unit: "kg", img: "images/natural-pulled-chicken.jpg" }
    ]
  },
  {
    ar: "بروست", en: "Broasted", icon: "🍟",
    items: [
      { ar: "دبابيس بروست", en: "Broasted drumsticks", price: 230, unit: "kg", img: "images/broasted-drumsticks.jpg" },
      { ar: "صدور بالعظم بروست", en: "Broasted bone-in breasts", price: 240, unit: "kg", img: "images/broasted-bone-in-breasts.jpg" },
      { ar: "بانية بروست", en: "Broasted cutlets", price: 299, unit: "kg", img: "images/broasted-cutlets.jpg" },
      { ar: "أجنحة بروست", en: "Broasted wings", price: 150, unit: "kg", img: "images/broasted-wings.jpg" },
      { ar: "فخذ بروست", en: "Broasted thigh", price: 150, unit: "kg", img: "images/broasted-thigh.jpg" }
    ]
  },
  {
    ar: "تتبيلة حاتي تركي", en: "Turkish marinade", icon: "🥙",
    items: [
      { ar: "فرخة كاملة متبلة تركي", en: "Turkish marinated whole chicken", price: 195, unit: "kg", img: "images/turkish-marinated-whole-chicken.jpg", opts: ["cut"] },
      { ar: "صدور بالعظم متبلة تركي", en: "Turkish marinated bone-in breasts", price: 270, unit: "kg", img: "images/turkish-marinated-bone-in-breasts.jpg" },
      { ar: "أوراك بالعظم متبلة تركي", en: "Turkish marinated bone-in thighs", price: 195, unit: "kg", img: "images/turkish-marinated-bone-in-thighs.jpg" },
      { ar: "شيش متبلة تركي", en: "Turkish marinated shish", price: 295, unit: "kg", img: "images/turkish-marinated-shish.jpg" },
      { ar: "سيخ شاورما تركي", en: "Turkish shawarma skewer", price: 330, unit: "kg", img: "images/turkish-shawarma-skewer.jpg" },
      { ar: "شاورما شرائح تركي", en: "Turkish shawarma slices", price: 299, unit: "kg", img: "images/turkish-shawarma-slices.jpg" }
    ]
  },
  {
    ar: "تتبيلة مكسيكي", en: "Mexican marinade", icon: "🌶️",
    items: [
      { ar: "أجنحة متبلة مكسيكي", en: "Mexican marinated wings", price: 170, unit: "kg", img: "images/mexican-marinated-wings.jpg" },
      { ar: "دبابيس متبلة مكسيكي", en: "Mexican marinated drumsticks", price: 240, unit: "kg", img: "images/mexican-marinated-drumsticks.jpg" },
      { ar: "صدور متبلة مكسيكي", en: "Mexican marinated breasts", price: 299, unit: "kg", img: "images/mexican-marinated-breasts.jpg" },
      { ar: "شيش متبلة مكسيكي", en: "Mexican marinated shish", price: 290, unit: "kg", img: "images/mexican-marinated-shish.jpg" },
      { ar: "فاهيتا مكسيكي", en: "Mexican fajita", price: 299, unit: "kg", img: "images/mexican-fajita.jpg" }
    ]
  },
  {
    ar: "تتبيلة يوناني أعشاب", en: "Greek herb marinade", icon: "🌿",
    items: [
      { ar: "دبابيس متبلة يوناني", en: "Greek marinated drumsticks", price: 240, unit: "kg", img: "images/greek-marinated-drumsticks.jpg" },
      { ar: "صدور متبلة يوناني", en: "Greek marinated breasts", price: 299, unit: "kg", img: "images/greek-marinated-breasts.jpg" },
      { ar: "شيش متبلة يوناني", en: "Greek marinated shish", price: 299, unit: "kg", img: "images/greek-marinated-shish.jpg" }
    ]
  },
  {
    ar: "تتبيلة سويت اند سور", en: "Sweet & sour marinade", icon: "🍯",
    items: [
      { ar: "أجنحة سويت اند سور", en: "Sweet & sour wings", price: 170, unit: "kg", img: "images/sweet-sour-wings.jpg" },
      { ar: "دبابيس سويت اند سور", en: "Sweet & sour drumsticks", price: 240, unit: "kg", img: "images/sweet-sour-drumsticks.jpg" },
      { ar: "بانية سويت اند سور", en: "Sweet & sour cutlets", price: 299, unit: "kg", img: "images/sweet-sour-cutlets.jpg" }
    ]
  },
  {
    ar: "بيض", en: "Eggs", icon: "🥚",
    items: [
      { ar: "بيض بلدي", en: "Baladi eggs", price: 165, unit: "tray", img: "images/baladi-eggs.jpg" },
      { ar: "بيض أبيض", en: "White eggs", price: 140, unit: "tray", img: "images/white-eggs.jpg" },
      { ar: "بيض أحمر", en: "Brown eggs", price: 155, unit: "tray", img: "images/brown-eggs.jpg" },
      { ar: "بيض مميز", en: "Premium eggs", price: 160, unit: "tray", img: "images/premium-eggs.jpg" },
      { ar: "بيض نباتي", en: "Vegetarian eggs", price: 170, unit: "tray", img: "images/vegetarian-eggs.jpg" },  // ⚠ سعر تقديري
      { ar: "بيض سمان", en: "Quail eggs", price: 95, unit: "tray", img: "images/quail-eggs.jpg" }  // ⚠ سعر تقديري
    ]
  },
  {
    ar: "صوص طبيعي", en: "Natural sauces", icon: "🥫",
    items: [
      { ar: "كاتشب طبيعي", en: "Natural ketchup", price: 45, unit: "box", img: "images/natural-ketchup.jpg" },
      { ar: "ثومية طبيعي", en: "Natural garlic sauce", price: 55, unit: "box", img: "images/natural-garlic-sauce.jpg" },  // ⚠ سعر تقديري
      { ar: "مايونيز طبيعي", en: "Natural mayonnaise", price: 55, unit: "box", img: "images/natural-mayonnaise.jpg" },
      { ar: "صوص باربكيو طبيعي", en: "Natural BBQ sauce", price: 75, unit: "box", img: "images/natural-bbq-sauce.jpg" },
      { ar: "صوص جبنة طبيعي", en: "Natural cheese sauce", price: 75, unit: "box", img: "images/natural-cheese-sauce.jpg" },
      { ar: "صوص رانش طبيعي", en: "Natural ranch sauce", price: 75, unit: "box", img: "images/natural-ranch-sauce.jpg" },
      { ar: "كول سلو طبيعي", en: "Natural coleslaw", price: 65, unit: "box", img: "images/natural-coleslaw.jpg" }  // ⚠ سعر تقديري
    ]
  },
  {
    ar: "خبز", en: "Bread", icon: "🥖",
    items: [
      { ar: "عيش سوري", en: "Syrian bread", price: 20, unit: "bag", img: "images/syrian-bread.jpg" },  // ⚠ سعر تقديري
      { ar: "عيش كيذر", en: "Kaiser bread", price: 25, unit: "bag", img: "images/kaiser-bread.jpg" },  // ⚠ سعر تقديري
      { ar: "عيش فينو", en: "Fino bread", price: 25, unit: "bag", img: "images/fino-bread.jpg" },  // ⚠ سعر تقديري
      { ar: "عيش فرنساوي", en: "French bread", price: 30, unit: "bag", img: "images/french-bread.jpg" }  // ⚠ سعر تقديري
    ]
  },
  {
    ar: "شواية بيتي", en: "Home grills", icon: "🔥",
    items: [
      { ar: "شواية بيتي صغيرة", en: "Home grill (small)", price: 300, unit: "unit", img: "images/home-grill-small.jpg" },
      { ar: "شواية بيتي كبيرة", en: "Home grill (large)", price: 450, unit: "unit", img: "images/home-grill-large.jpg" },
      { ar: "أعواد شوي", en: "Grill skewers", price: 25, unit: "bag", img: "images/grill-skewers.jpg" }
    ]
  },
  {
    ar: "أرز", en: "Rice", icon: "🍚",
    items: [
      { ar: "أرز بسمتي", en: "Basmati rice", price: 95, unit: "kg", img: "images/basmati-rice.jpg" },
      { ar: "أرز مصري", en: "Egyptian rice", price: 28, unit: "kg", img: "images/egyptian-rice.jpg" }
    ]
  },
  {
    ar: "توابل", en: "Spices", icon: "🧂",
    items: [
      { ar: "ملح أبيض ناعم", en: "Fine white salt", price: 15, unit: "box", img: "images/fine-white-salt.jpg" },  // ⚠ سعر تقديري
      { ar: "فلفل أسود ناعم", en: "Fine black pepper", price: 35, unit: "box", img: "images/fine-black-pepper.jpg" },  // ⚠ سعر تقديري
      { ar: "فلفل أبيض ناعم", en: "Fine white pepper", price: 35, unit: "box", img: "images/fine-white-pepper.jpg" },  // ⚠ سعر تقديري
      { ar: "كمون ناعم", en: "Fine cumin", price: 30, unit: "box", img: "images/fine-cumin.jpg" }  // ⚠ سعر تقديري
    ]
  },
  {
    ar: "بقالة", en: "Grocery", icon: "🛒",
    items: [
      { ar: "بطاطس مجمدة", en: "Frozen potatoes", price: 120, unit: "kg", img: "images/frozen-potatoes.jpg" },
      { ar: "ماشروم طازج", en: "Fresh mushrooms", price: 60, unit: "tray", img: "images/fresh-mushrooms.jpg" },  // ⚠ سعر تقديري
      { ar: "ماشروم علب", en: "Canned mushrooms", price: 55, unit: "pack", img: "images/canned-mushrooms.jpg" },  // ⚠ سعر تقديري
      { ar: "كريمة لباني", en: "Labani cream", price: 75, unit: "pack", img: "images/labani-cream.jpg" },  // ⚠ سعر تقديري
      { ar: "مخلل", en: "Pickles", price: 35, unit: "pack", img: "images/pickles.jpg" },  // ⚠ سعر تقديري
      { ar: "طبق خضار سلطة", en: "Salad vegetables tray", price: 40, unit: "tray", img: "images/salad-vegetables-tray.jpg" },  // ⚠ سعر تقديري
      { ar: "طبق خضار شوربة", en: "Soup vegetables tray", price: 40, unit: "tray", img: "images/soup-vegetables-tray.jpg" }  // ⚠ سعر تقديري
    ]
  }
];

/* ---------- 3) النصوص (عربي / إنجليزي) ---------- */
const TEXT = {
  ar: {
    tagline: "طبيعي - طازج - جاهز للطبخ 💪",
    kg: "كيلو", pc: "قطعة", tray: "طبق", box: "علبة", bag: "كيس", unit: "واحدة", pack: "عبوة",
    add: "أضف",
    askPrice: "اسأل عن السعر",
    viewOrder: "عرض الطلب",
    itemsWord: "صنف",
    orderTitle: "طلبك",
    total: "الإجمالي",
    unpricedNote: "الأصناف اللي بدون سعر هيتم تأكيد سعرها معاك على واتساب.",
    name: "الاسم",
    phone: "رقم اتصال الدليفري",
    address: "العنوان",
    notes: "ملاحظات (اختياري)",
    send: "إرسال الطلب على واتساب",
    msgHeader: "طلب جديد من المنيو الإلكتروني",
    doneTitle: "طلبك جاهز للإرسال",
    orderNo: "رقم الطلب:",
    doneText: "اضغط «إرسال» داخل واتساب لتأكيد الطلب. أول ما يوصلنا هنرد عليك ونبدأ نجهزه، وهنأكد معاك السعر والتوصيل.",
    reopen: "فتح واتساب مرة تانية",
    back: "رجوع للمنيو",
    deliveryMode: "توصيل", pickupMode: "استلام من المحل",
    area: "المنطقة", locate: "📍 حدد موقعي على الخريطة",
    locWait: "جاري تحديد موقعك...", locOk: "✓ تم تحديد موقعك وهيتبعت مع الطلب",
    locFail: "ماقدرناش نحدد الموقع، اكتب العنوان بالتفصيل",
    subtotal: "مجموع الأصناف", deliveryFee: "رسوم التوصيل", feeLater: "بتتحدد عند التأكيد", free: "مجاني",
    minMsg: "الحد الأدنى للطلب {min}، فاضل {left}",
    needInfo: "من فضلك اكتب رقم الموبايل والعنوان",
    openNow: "مفتوح الآن", closedNow: "مغلق الآن", until: "حتى", opensAt: "نفتح",
    closedNote: "المحل مغلق حالياً، هنجهز طلبك أول ما نفتح الساعة",
    offHours: "طلب خارج مواعيد العمل",
    search: "ابحث عن صنف...", noResults: "مفيش أصناف بالاسم ده",
    install: "📲 ثبّت المنيو على موبايلك",
    badge_top: "الأكثر طلباً", badge_new: "جديد", badge_offer: "عرض",
    installIos: "من الآيفون: اضغط زر المشاركة (Share) في سفاري، ثم «إضافة إلى الشاشة الرئيسية».",
    installOther: "افتح قايمة المتصفح (⋮) واختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».",
    soldOut: "نفد اليوم", payTitle: "طريقة الدفع", forget: "مسح بياناتي المحفوظة",
    waHello: "السلام عليكم، عندي استفسار", toTop: "للأعلى",
    qtyTitle: "الكمية",
    itemNote: "ملاحظات على الصنف (اختياري)",
    addToCart: "أضف للسلة",
    followUs: "تابعنا",
    contactUs: "تواصل معنا",
    rights: "جميع الحقوق محفوظة",
    credit: "تصميم وتطوير",
    switchTo: "EN"
  },
  en: {
    tagline: "Natural - Fresh - Ready to cook 💪",
    kg: "kg", pc: "pc", tray: "tray", box: "box", bag: "bag", unit: "unit", pack: "pack",
    add: "Add",
    askPrice: "Ask for price",
    viewOrder: "View order",
    itemsWord: "items",
    orderTitle: "Your order",
    total: "Total",
    unpricedNote: "Items without a price will be confirmed with you on WhatsApp.",
    name: "Name",
    phone: "Delivery contact number",
    address: "Address",
    notes: "Notes (optional)",
    send: "Send order on WhatsApp",
    msgHeader: "New order from the online menu",
    doneTitle: "Your order is ready to send",
    orderNo: "Order no:",
    doneText: "Press Send inside WhatsApp to confirm. Once we receive it we will reply and start preparing it, and confirm the price and delivery with you.",
    reopen: "Open WhatsApp again",
    back: "Back to menu",
    deliveryMode: "Delivery", pickupMode: "Store pickup",
    area: "Area", locate: "📍 Share my location",
    locWait: "Getting your location...", locOk: "✓ Location saved, it will be sent with the order",
    locFail: "Couldn't get your location, please write the full address",
    subtotal: "Items total", deliveryFee: "Delivery fee", feeLater: "confirmed later", free: "Free",
    minMsg: "Minimum order is {min}, {left} to go",
    needInfo: "Please enter your phone number and address",
    openNow: "Open now", closedNow: "Closed now", until: "until", opensAt: "opens",
    closedNote: "We're closed now, we'll prepare your order when we open at",
    offHours: "Order outside working hours",
    search: "Search for an item...", noResults: "No items found",
    install: "📲 Install the menu on your phone",
    badge_top: "Best seller", badge_new: "New", badge_offer: "Offer",
    installIos: "On iPhone: tap the Share button in Safari, then \"Add to Home Screen\".",
    installOther: "Open the browser menu (⋮) and choose \"Install app\" or \"Add to Home screen\".",
    soldOut: "Sold out", payTitle: "Payment method", forget: "Clear my saved details",
    waHello: "Hello, I have a question", toTop: "Back to top",
    qtyTitle: "Quantity",
    itemNote: "Item notes (optional)",
    addToCart: "Add to cart",
    followUs: "Follow us",
    contactUs: "Contact us",
    rights: "All rights reserved",
    credit: "Designed & developed by",
    switchTo: "ع"
  }
};