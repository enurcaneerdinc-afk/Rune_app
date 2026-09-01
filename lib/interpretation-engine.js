/**
 * Yorum Motoru — AI çağrısı için prompt oluşturma
 *
 * Bu modül AI'yı ÇAĞIRMAZ; sadece PROJECT.md'deki kurallara uygun bir
 * system prompt + user mesajı üretir. Gerçek API çağrısı ayrı bir katmanda
 * (örn. callClaude fonksiyonu) yapılır, böylece prompt mantığı test edilebilir
 * ve API'den bağımsız kalır.
 */

// --- Konuya göre hangi bölümlerin öne çıkarılacağı ---
// NOT: Kaynakta rune başına ayrık "Para/Kariyer/İlişki" bölümü yok (bkz.
// PROJECT.md §3). Bu yüzden konu, HANGİ bölümlerin çekileceğini değil,
// AI'nın mevcut içeriği HANGİ AÇIDAN yorumlayacağını belirler.
const TOPIC_LENS = {
  "Bugünün Runesi": "günlük genel rehberlik",
  "Niyet Runem": "kişinin niyetiyle uyum ve manevi rehberlik",
  "Para": "maddi bolluk, kazanç ve kaynak yönetimi",
  "Kariyer": "iş, üretkenlik ve profesyonel yönelim",
  "İlişkiler": "bağlantılar, iletişim ve duygusal denge",
  "Karar Vermem Gerekiyor": "bir seçim veya karar anındaki bakış açısı",
};

const CORE_SECTIONS = ["Kehanet Mesajı", "Günlük Rehberlik", "Kehanet ve Spiritüel Anlam"];

function findSection(rune, title) {
  const s = rune.sections.find((sec) => sec.title === title);
  return s ? s.text : null;
}

// Bir metni belirli bir karakter sınırına kadar, cümle sonunda keserek kısaltır.
function excerpt(text, maxChars = 500) {
  if (!text || text.length <= maxChars) return text || "";
  const cut = text.slice(0, maxChars);
  const lastDot = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"));
  return (lastDot > 100 ? cut.slice(0, lastDot + 1) : cut) + " (…)";
}

function shortEssence(rune) {
  const myth = findSection(rune, "Mitolojik Hikâyesi ve Anlamı") || "";
  return excerpt(myth, 220);
}

/**
 * @param {object} params
 * @param {{id:number,name:string,reversed?:boolean}} params.drawnRune - kullanıcının çektiği rune (id/name)
 * @param {{id:number,name:string}} params.personalRune - kişisel ana rune
 * @param {{id:number,name:string}} params.yearlyRune - yıllık rune
 * @param {string} params.topic - TOPIC_LENS anahtarlarından biri
 * @param {Array} params.runesData - data/runes.json içeriği (tam liste)
 * @param {string} [params.userName] - opsiyonel, kişiselleştirme için
 */
function buildInterpretationPrompt({ drawnRune, personalRune, yearlyRune, topic, runesData, userName }) {
  const byId = (id) => runesData.find((r) => r.id === id);
  const drawn = byId(drawnRune.id);
  const personal = byId(personalRune.id);
  const yearly = byId(yearlyRune.id);

  if (!drawn) throw new Error(`Çekilen rune veri setinde bulunamadı: id=${drawnRune.id}`);
  const lens = TOPIC_LENS[topic];
  if (!lens) throw new Error(`Bilinmeyen konu: ${topic}. Beklenen: ${Object.keys(TOPIC_LENS).join(", ")}`);

  const systemPrompt = `Sen bir rune yorumlama asistanısın. Görevin, SANA VERİLEN veriyi
kullanıcının kişisel bağlamıyla birleştirip akıcı, sıcak ama abartısız bir yorum üretmektir.

KESİN KURALLAR:
- Sana verilmeyen hiçbir rune anlamını, sembolü veya "geleneği" uydurma. Sadece verilen
  metinleri temel al.
- Kesin, geri dönüşü olmayan hayat kararları önerme (işini bırak, ilişkiyi bitir, vb.).
- Sağlık, hukuk veya finansal yatırım tavsiyesi verme.
- Evet/Hayır sorularına tek kelimelik kesin cevap verme; eğilim ve perspektif sun.
- Kesinlik iddia eden dil kullanma ("kesinlikle olacak" değil, "bu enerji ... işaret
  edebilir" gibi).
- İskandinav klişelerinden (savaşçı/ejderha imgeleri, kalıp mistik jargon) kaçın; modern,
  sade ve samimi bir üslup kullan.
- Yanıtını SADECE şu JSON şemasıyla ver, başka hiçbir şey ekleme:
  { "opening": string, "connection": string, "guidance": string, "note": string }
  - opening: 1-2 cümlelik karşılama/çerçeveleme
  - connection: kişisel rune, yıllık rune ve çekilen rune'un o konudaki kesişimi (2-4 cümle)
  - guidance: konuya özel, düşündürücü ama yönlendirici olmayan öneri (2-3 cümle)
  - note: kısa, tek cümlelik bir günün notu / hatırlatma`;

  const userMessage = `Kullanıcı${userName ? ` (${userName})` : ""} bugün "${topic}" konusunu seçti.
Bu konuyu şu açıdan ele al: ${lens}.

ÇEKİLEN RUNE: ${drawn.name}${drawnRune.reversed ? " (TERS geldi)" : " (düz geldi)"}
- Kehanet Mesajı: ${excerpt(findSection(drawn, "Kehanet Mesajı"), 700)}
- Günlük Rehberlik: ${excerpt(findSection(drawn, "Günlük Rehberlik"), 500)}
- Kehanet ve Spiritüel Anlam: ${excerpt(findSection(drawn, "Kehanet ve Spiritüel Anlam"), 500)}

KİŞİNİN ANA RUNESİ: ${personal.name}
- Özü: ${shortEssence(personal)}

${new Date().getFullYear()} YIL RUNESİ: ${yearly.name}
- Özü: ${shortEssence(yearly)}

Yukarıdaki üç rune'u "${topic}" bağlamında birleştirerek JSON formatında yorum üret.`;

  return { systemPrompt, userMessage };
}

module.exports = { buildInterpretationPrompt, TOPIC_LENS };
