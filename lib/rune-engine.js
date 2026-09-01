/**
 * Rune Motoru — deterministik hesaplama fonksiyonları
 *
 * Bu modül AI çağrısı içermez. Tüm fonksiyonlar saf (pure), aynı girdi için
 * her zaman aynı çıktıyı üretir. Rune verisi data/runes.json içindeki 24 rune
 * ile aynı sırayı (1=Fehu ... 24=Othala) kullanır.
 */

const RUNE_NAMES = [
  "Fehu", "Uruz", "Thurisaz", "Ansuz", "Raidho", "Kenaz", "Gebo", "Wunjo",
  "Hagalaz", "Nauthiz", "Isa", "Jera", "Eihwaz", "Perthro", "Algiz", "Sowilo",
  "Tiwaz", "Berkana", "Ehwaz", "Mannaz", "Laguz", "Ingwaz", "Dagaz", "Othala"
];

const RUNE_COUNT = 24;

/** id (1-24) -> isim */
function runeName(id) {
  return RUNE_NAMES[(id - 1 + RUNE_COUNT) % RUNE_COUNT];
}

// --- Yardımcı: yılın kaçıncı günü (1-365/366) ---
function dayOfYear(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000) + 1;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 1) KİŞİSEL ANA RUNE — doğum tarihinden
 *
 * KAYNAK NOTU: PDF sadece iki dönemi açıkça belirtiyor:
 *   Fehu  = 29 Haziran – 14 Temmuz
 *   Uruz  = 14 Temmuz – 29 Temmuz
 * Bu, yılın 29 Haziran'dan başlayarak 24 eşit dilime (365/24 ≈ 15.21 gün)
 * bölündüğü ve Elder Futhark sırasının (Fehu→Othala) bu dilimlere sırayla
 * atandığı bir "yıllık rune takvimi" olduğunu gösteriyor. Diğer 22 rune için
 * aralıklar KAYNAKTA YAZMIYOR — burada aynı mantıkla enterpole edilmiştir.
 * Bu varsayım PROJECT.md'de ayrıca not edilmelidir.
 */
function personalRune(birthDate) {
  const year = birthDate.getUTCFullYear();
  const anchor = new Date(Date.UTC(year, 5, 29)); // 29 Haziran (ay index 5)
  let diffDays = Math.floor((birthDate.getTime() - anchor.getTime()) / 86400000);
  const yearLength = isLeapYear(year) ? 366 : 365;
  if (diffDays < 0) diffDays += yearLength; // yıl başından önceyse bir önceki 29 Haziran'a göre say
  const periodLength = yearLength / RUNE_COUNT; // ~15.2 gün
  const index = Math.floor(diffDays / periodLength) % RUNE_COUNT;
  const id = index + 1;
  return { id, name: runeName(id) };
}

/**
 * 2) KARAKTER RUNESİ — doğum GÜNÜNDEN (ayın kaçıncı günü, 1-31)
 * Basit ve şeffaf: gün numarası 1-24 aralığına döngüsel eşlenir.
 */
function characterRune(birthDate) {
  const day = birthDate.getUTCDate(); // 1-31
  const id = ((day - 1) % RUNE_COUNT) + 1;
  return { id, name: runeName(id) };
}

/**
 * 3) YILLIK RUNE — içinde bulunulan (veya sorgulanan) yıldan
 * Yıl sayısı 1-24 aralığına döngüsel eşlenir. Böylece her yıl döngüsel
 * olarak bir sonraki rune'a geçer (2025→id X, 2026→id X+1, ...).
 */
function yearlyRune(year) {
  const id = ((year - 1) % RUNE_COUNT) + 1;
  return { id, name: runeName(id) };
}

/**
 * 4) AYLIK RUNE — yıl + ay kombinasyonundan
 * Sadece "ay" kullanılırsa 1-12 aralığında kalıp 24 rune'un yarısı hiç
 * çıkmaz; bu yüzden yıl bilgisiyle birlikte hesaplanır ki zamanla tüm
 * rune seti kullanılabilsin.
 */
function monthlyRune(year, month /* 1-12 */) {
  const linearIndex = year * 12 + (month - 1);
  const id = (linearIndex % RUNE_COUNT) + 1;
  return { id, name: runeName(id) };
}

/**
 * 5) GÜNÜN TİTREŞİMİ — bugünün tarihinden (personalRune ile aynı yıllık
 * takvim mantığını, doğum tarihi yerine "bugün" için kullanır)
 */
function dailyVibration(today) {
  return personalRune(today);
}

/**
 * 6) RASTGELE ÇEKİM — mesaj runesi (kullanıcı "çek" dediğinde)
 * %25 ihtimalle ters (reversed) gelir — bu oran ürün kararı olarak
 * PROJECT.md'de belirtilmeli; burada sabit bir sabit olarak tutulur.
 *
 * @param {() => number} rng - 0 (dahil) ile 1 (hariç) arası rastgele sayı
 *   üreten fonksiyon. Test edilebilirlik için dışarıdan verilebilir;
 *   verilmezse Math.random kullanılır.
 */
const REVERSED_PROBABILITY = 0.25;

function randomDraw(rng = Math.random) {
  const id = Math.floor(rng() * RUNE_COUNT) + 1;
  const reversed = rng() < REVERSED_PROBABILITY;
  return { id, name: runeName(id), reversed };
}

/**
 * Bir kullanıcı için tam profil: kişisel + karakter + yıllık + aylık +
 * günün titreşimi, hepsi bir arada. Yorum motoru (AI) bu objeyi alıp
 * seçilen konuya göre yorum üretir.
 */
function buildUserProfile(birthDate, referenceDate = new Date()) {
  return {
    personal: personalRune(birthDate),
    character: characterRune(birthDate),
    yearly: yearlyRune(referenceDate.getUTCFullYear()),
    monthly: monthlyRune(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1),
    dailyVibration: dailyVibration(referenceDate),
  };
}

module.exports = {
  RUNE_NAMES,
  RUNE_COUNT,
  runeName,
  personalRune,
  characterRune,
  yearlyRune,
  monthlyRune,
  dailyVibration,
  randomDraw,
  buildUserProfile,
};
