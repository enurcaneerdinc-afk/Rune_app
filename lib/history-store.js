/**
 * history-store.js — Geçmiş çekim kayıtları için depo katmanı.
 *
 * V1'DE NEDEN localStorage?
 * PROJECT.md §6 madde 1'de "kullanıcı/çekim kayıtları için basit bir backend
 * (Supabase/Firebase)" öngörülüyor, ama bu henüz kurulmadı (hesap açma,
 * bağlantı bilgisi girme gibi adımlar kullanıcıyla birlikte yapılmalı).
 * V1'i test edilebilir tutmak için, çekimler şimdilik SADECE bu tarayıcıda
 * (bu cihazda) saklanıyor. Tarayıcı verilerini temizlerseniz veya başka bir
 * cihazdan girerseniz geçmişi görmezsiniz — bu, gerçek bir hesap sistemi
 * kurulana kadar geçerli, bilinen bir sınırlama.
 *
 * Bu modül "use client" bileşenlerinden çağrılmak üzere tasarlandı; sunucu
 * tarafında (SSR) çalıştırılırsa sessizce boş liste döner (window/localStorage
 * yoksa hata fırlatmaz).
 */

const STORAGE_KEY = "rune-app:history";
const MAX_RECORDS = 200; // sınırsız büyümeyi önlemek için basit bir tavan

function hasStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readAll() {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // Bozuk veri varsa geçmişi kaybetmek yerine boş liste döneriz;
    // uygulamanın çökmesindense sessizce sıfırdan başlaması daha güvenli.
    return [];
  }
}

function writeAll(records) {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
  } catch (err) {
    // Depolama dolu/kapalı olabilir; bu durumda sessizce yok sayıyoruz,
    // uygulamanın geri kalanı çalışmaya devam eder.
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Tüm geçmişi (en yeni en başta) döner. */
export function getHistory() {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Yeni bir çekim kaydı ekler ve kaydın id'sini döner (sonradan yorum
 * eklemek için gerekiyor).
 */
export function addDraw({ userName, topic, drawnRune, personalRune, yearlyRune }) {
  const record = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    userName: userName || null,
    topic,
    drawnRune,
    personalRune,
    yearlyRune,
    interpretation: null,
  };
  const all = readAll();
  all.unshift(record);
  writeAll(all);
  return record.id;
}

/** Bir çekim kaydına, sonradan alınan AI yorumunu ekler. */
export function attachInterpretation(id, interpretation) {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], interpretation };
  writeAll(all);
}

/** Tüm geçmişi siler. */
export function clearHistory() {
  writeAll([]);
}
