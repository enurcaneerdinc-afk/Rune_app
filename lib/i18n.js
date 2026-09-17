/**
 * i18n.js — TR/EN arayüz metinleri için merkezi sözlük.
 *
 * ÖNEMLİ SINIRLAMA (kasıtlı): Rune verilerinin (data/runes.json) kaynak
 * metinleri ÇEVRİLMİYOR. Bunlar telifli bir kitaptan alınmış Türkçe
 * paragraflar; İngilizce modda bile Türkçe gösterilir, sadece bunun
 * "orijinal kaynak dili" olduğunu belirten bir not eklenir. Sadece arayüz
 * metinleri ve AI'nin ÜRETTİĞİ yorum (opening/connection/guidance/note)
 * dile göre değişir.
 *
 * TOPIC anahtarları (interpretation-engine.js'teki TOPIC_LENS ile birebir
 * aynı olmalı) her zaman Türkçe kalır — bunlar arayüzde gösterilen metin
 * değil, uygulamanın iç veri sözlüğüdür (history kayıtlarında, API
 * isteklerinde de aynen kullanılır). TOPIC_LABELS sadece EKRANDA
 * gösterilecek karşılığı sağlar.
 */

export const LANGUAGES = ["tr", "en"];
export const DEFAULT_LANG = "tr";

export const TOPIC_LABELS = {
  tr: {
    "Bugünün Runesi": "Bugünün Runesi",
    "Niyet Runem": "Niyet Runem",
    Para: "Para",
    Kariyer: "Kariyer",
    İlişkiler: "İlişkiler",
    "Karar Vermem Gerekiyor": "Karar Vermem Gerekiyor",
  },
  en: {
    "Bugünün Runesi": "Today's Rune",
    "Niyet Runem": "My Intention Rune",
    Para: "Money",
    Kariyer: "Career",
    İlişkiler: "Relationships",
    "Karar Vermem Gerekiyor": "I Need to Decide",
  },
};

// callClaude.js'ten dönen `reason` koduna göre, istemci tarafında dile
// uygun hata mesajı göstermek için. Sunucudaki Türkçe `message` alanı
// EN modunda kullanılmaz, bunun yerine `reason` ile burası eşleştirilir.
export const ERROR_MESSAGES = {
  tr: {
    missing_api_key: "Yorum sistemine bağlanmak için gerekli ayar eksik. Lütfen site yöneticisiyle iletişime geçin.",
    network_error: "Şu an yorum sunucusuna ulaşılamıyor. Lütfen birazdan tekrar deneyin.",
    timeout: "Yorum oluşturulması normalden uzun sürdü ve zaman aşımına uğradı. Lütfen tekrar deneyin.",
    api_error: "Yorum şu an oluşturulamadı. Lütfen birazdan tekrar deneyin.",
    invalid_response: "Yorum beklenmedik bir biçimde geldi, bu yüzden gösterilemiyor. Lütfen tekrar deneyin.",
    bad_request: "Eksik veya geçersiz bilgi gönderildi.",
    default: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
  },
  en: {
    missing_api_key: "The interpretation service isn't configured correctly. Please contact the site owner.",
    network_error: "Can't reach the interpretation server right now. Please try again shortly.",
    timeout: "Generating the interpretation took too long and timed out. Please try again.",
    api_error: "The interpretation couldn't be generated right now. Please try again shortly.",
    invalid_response: "The interpretation came back in an unexpected format, so it can't be shown. Please try again.",
    bad_request: "Missing or invalid information was sent.",
    default: "Something went wrong. Please try again.",
  },
};

export const UI = {
  tr: {
    navAbout: "Rune nedir? →",
    navHistory: "Geçmiş çekimlerim →",

    formTitle: "Rune profiline başla",
    formSubtitle: "Adını ve doğum tarihini gir, bugün hangi konuya bakmak istediğini seç.",
    labelName: "İsim",
    placeholderName: "Adın",
    errorName: "Lütfen bir isim gir.",
    labelBirthDate: "Doğum tarihi",
    errorBirthDate: (minYear) => `Lütfen geçerli bir doğum tarihi gir (bugünden ileri veya ${minYear}'den önce olamaz).`,
    optionalToggleOpen: "− Doğum saati / yeri (opsiyonel)",
    optionalToggleClosed: "+ Doğum saati / yeri ekle (opsiyonel)",
    labelBirthTime: "Doğum saati",
    labelBirthPlace: "Doğum yeri",
    placeholderBirthPlace: "Şehir, ülke",
    optionalNote: "Bu bilgiler V1'deki hesaplamayı etkilemiyor; ileride kullanılmak üzere şimdiden saklanıyor.",
    labelTopicQuestion: "Bugün hangi konuya bakmak istersin?",
    errorTopic: "Lütfen bir konu seç.",
    submit: "Profilimi gör",

    wheelCaption:
      "Kişisel ana rune, kaynakta belirtilen iki döneme (Fehu ve Uruz) dayanarak hesaplanan 24 dilimlik bir takvimden geliyor — kesin bir gelenek değil, şeffaf bir varsayım.",

    summaryEyebrow: (name) => `${name} için profil hazır`,
    rowPersonal: "Kişisel ana rune",
    rowCharacter: "Karakter runesi",
    rowYearly: "Yıllık rune",
    rowMonthly: "Aylık rune",
    rowDaily: "Günün titreşimi",

    overviewShow: "Genel değerlendirmemi göster",
    overviewLoading: "Profilin değerlendiriliyor…",
    overviewRetry: "Tekrar dene",
    overviewFetchError: "Bağlantı kurulamadı. Lütfen internet bağlantını kontrol edip tekrar dene.",

    backToEdit: "← Bilgileri değiştir",

    drawEyebrow: (topic) => `"${topic}" için bir rune çek`,
    drawEyebrowDefault: "Bir rune çek",
    drawButtonIdle: "Rune çek",
    drawButtonDrawing: "Çekiliyor…",
    drawButtonDone: "Tekrar çek",
    badgeReversed: "Ters geldi",
    badgeUpright: "Düz geldi",
    sourcePreviewLabel: "Kaynak metinden (Kehanet Mesajı):",
    readMore: " Devamını oku",
    readLess: " Daralt",
    interpretIntro:
      "Aşağıdaki yorum yapay zeka tarafından, seçtiğin konu + yıllık rune'un + bu çekim birlikte değerlendirilerek üretiliyor.",
    interpretShow: "Kişisel yorumu göster",
    interpretLoading: "Yorum hazırlanıyor…",
    interpretRetry: "Tekrar dene",
    interpretFetchError: "Bağlantı kurulamadı. Lütfen internet bağlantını kontrol edip tekrar dene.",

    historyTitle: "Geçmiş çekimlerin",
    historySubtitle: "Bu liste sadece bu tarayıcıda saklanıyor — henüz hesap sistemi yok.",
    historyNewDraw: "← Yeni çekim",
    historyLoading: "Yükleniyor…",
    historyEmpty: "Henüz kayıtlı bir çekim yok.",
    historyEmptyCta: "Ana sayfadan bir rune çek →",
    historyRowPersonal: "Kişisel ana rune",
    historyRowYearly: "Yıllık rune",
    historyNoInterpretation: "Bu çekim için kişisel yorum istenmemiş.",
    historyClear: "Tüm geçmişi temizle",
    historyClearConfirm: "Tüm geçmiş çekimler bu cihazdan silinecek. Emin misin?",
    reversedTag: "ters",

    aboutBack: "← Ana sayfa",
    aboutTitle: "Rune nedir?",
    aboutHeading1: "Bir yazı sistemi olarak",
    aboutP1: `Rüneler, aslında bir alfabe. "Elder Futhark" adı verilen 24 karakterlik bu yazı sistemi, MS 2. yüzyıl civarında Cermen halkları arasında ortaya çıktı ve günümüzün Almanca, İngilizce, İskandinav dilleri gibi dillerin atası olan Cermen dillerini yazmak için kullanıldı. İsmini oluşturan "futhark" kelimesi, alfabenin ilk altı harfinin (F, U, Th, A, R, K) sesinden geliyor — tıpkı bizim "alfabe" kelimesinin Yunanca'nın ilk iki harfinden (alfa, beta) gelmesi gibi.`,
    aboutP2: "Karakterlerin köşeli, çoğunlukla düz çizgilerden oluşan görünümü tesadüf değil: ahşap veya taşa oyularak yazıldıkları için eğri çizgilerden kaçınılmış.",
    aboutHeading2: "Kehanet aracı olarak",
    aboutP3: `Rünelerin bir alfabe olmanın ötesinde sembolik/kehanet amaçlı kullanıldığına dair tarihi kayıtlar sınırlı ve tartışmalı. Bugün bildiğimiz "rune falı" pratiği, büyük ölçüde 20. yüzyılda modern ezoterik hareketler içinde şekillenip popülerleşti. Bu uygulama da bu modern geleneği takip ediyor — rünelerin bininlerce yıllık bir kehanet sistemi olduğunu iddia etmiyoruz; onları kendini tanıma ve düşünme aracı olarak sunuyoruz.`,
    aboutHeading3: "Bu uygulamadaki yorumlar nereden geliyor?",
    aboutP4: "24 rünenin anlamları, yayımlanmış bir kaynak eserden alınmıştır. Kişiselleştirilmiş yorumları üreten yapay zeka, bu kaynak metnin dışına çıkıp kendi kafasından yeni bir anlam uydurmuyor — sadece kaynaktaki metni, senin doğum tarihinden hesaplanan profilinle ve seçtiğin konuyla birlikte okuyup birleştiriyor.",
    aboutNote: "Kişisel ana rune hesaplaması (bkz. ana sayfadaki 24 dilimlik takvim), kaynakta açıkça belirtilen sadece iki döneme dayanan bir enterpolasyondur — kesin, yerleşik bir gelenek olarak sunulmuyor.",
    aboutCta: "Profiline bak →",

    dateLocale: "tr-TR",
  },
  en: {
    navAbout: "What are runes? →",
    navHistory: "My draw history →",

    formTitle: "Start your rune profile",
    formSubtitle: "Enter your name and birth date, then pick what you want to focus on today.",
    labelName: "Name",
    placeholderName: "Your name",
    errorName: "Please enter a name.",
    labelBirthDate: "Birth date",
    errorBirthDate: (minYear) => `Please enter a valid birth date (not in the future, not before ${minYear}).`,
    optionalToggleOpen: "− Birth time / place (optional)",
    optionalToggleClosed: "+ Add birth time / place (optional)",
    labelBirthTime: "Birth time",
    labelBirthPlace: "Birth place",
    placeholderBirthPlace: "City, country",
    optionalNote: "This info doesn't affect the V1 calculation yet; it's saved for future use.",
    labelTopicQuestion: "What do you want to focus on today?",
    errorTopic: "Please choose a topic.",
    submit: "See my profile",

    wheelCaption:
      "Your personal rune comes from a 24-slice calendar based on the two periods stated in the source (Fehu and Uruz) — a transparent assumption, not an established tradition.",

    summaryEyebrow: (name) => `Profile ready for ${name}`,
    rowPersonal: "Personal rune",
    rowCharacter: "Character rune",
    rowYearly: "Yearly rune",
    rowMonthly: "Monthly rune",
    rowDaily: "Today's vibration",

    overviewShow: "Show my general reading",
    overviewLoading: "Reading your profile…",
    overviewRetry: "Try again",
    overviewFetchError: "Couldn't connect. Please check your internet connection and try again.",

    backToEdit: "← Edit details",

    drawEyebrow: (topic) => `Draw a rune for "${topic}"`,
    drawEyebrowDefault: "Draw a rune",
    drawButtonIdle: "Draw a rune",
    drawButtonDrawing: "Drawing…",
    drawButtonDone: "Draw again",
    badgeReversed: "Reversed",
    badgeUpright: "Upright",
    sourcePreviewLabel: "From the source text (original Turkish, untranslated):",
    readMore: " Read more",
    readLess: " Show less",
    interpretIntro:
      "The reading below is generated by AI, combining your chosen topic, your yearly rune, and this draw.",
    interpretShow: "Show my personal reading",
    interpretLoading: "Preparing your reading…",
    interpretRetry: "Try again",
    interpretFetchError: "Couldn't connect. Please check your internet connection and try again.",

    historyTitle: "Your draw history",
    historySubtitle: "This list is only stored in this browser — there's no account system yet.",
    historyNewDraw: "← New draw",
    historyLoading: "Loading…",
    historyEmpty: "No draws recorded yet.",
    historyEmptyCta: "Draw a rune from the home page →",
    historyRowPersonal: "Personal rune",
    historyRowYearly: "Yearly rune",
    historyNoInterpretation: "No personal reading was requested for this draw.",
    historyClear: "Clear all history",
    historyClearConfirm: "All draw history on this device will be deleted. Are you sure?",
    reversedTag: "reversed",

    aboutBack: "← Home",
    aboutTitle: "What are runes?",
    aboutHeading1: "As a writing system",
    aboutP1: `Runes are, at their core, an alphabet. This 24-character writing system, called the "Elder Futhark," emerged among Germanic peoples around the 2nd century CE and was used to write the Germanic languages — the ancestors of languages like German, English, and the Scandinavian languages spoken today. The name "futhark" comes from the sounds of the alphabet's first six letters (F, U, Th, A, R, K) — the same way our word "alphabet" comes from the first two Greek letters (alpha, beta).`,
    aboutP2: "The angular, mostly straight-line look of the characters isn't a coincidence: since they were carved into wood or stone, curved lines were avoided.",
    aboutHeading2: "As a divination tool",
    aboutP3: `Historical records of runes being used symbolically or for divination, beyond being an alphabet, are limited and debated. The "rune reading" practice we know today largely took shape and became popular within 20th-century modern esoteric movements. This app follows that modern tradition too — we're not claiming runes are a thousands-year-old divination system; we're offering them as a tool for self-reflection and thought.`,
    aboutHeading3: "Where do this app's readings come from?",
    aboutP4: "The meanings of the 24 runes are taken from a published source work. The AI that generates the personalized readings doesn't step outside this source text or invent a new meaning of its own — it only reads the source text together with your birth-date profile and your chosen topic, and synthesizes them.",
    aboutNote: "The personal rune calculation (see the 24-slice calendar on the home page) is an interpolation based on only two periods explicitly stated in the source — it isn't presented as a fixed, established tradition.",
    aboutCta: "Check your profile →",

    dateLocale: "en-US",
  },
};

export function t(lang, key, ...args) {
  const dict = UI[lang] || UI[DEFAULT_LANG];
  const value = dict[key];
  if (typeof value === "function") return value(...args);
  return value !== undefined ? value : UI[DEFAULT_LANG][key];
}

export function topicLabel(lang, topicKey) {
  const map = TOPIC_LABELS[lang] || TOPIC_LABELS[DEFAULT_LANG];
  return map[topicKey] || topicKey;
}

export function errorMessage(lang, reason) {
  const map = ERROR_MESSAGES[lang] || ERROR_MESSAGES[DEFAULT_LANG];
  return map[reason] || map.default;
}
