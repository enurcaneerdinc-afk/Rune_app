/**
 * callClaude.js — Yorum motorunun (interpretation-engine.js) ürettiği
 * system prompt + user mesajını gerçekten Claude API'ye gönderen katman.
 *
 * PROJECT.md §6d'de "sıradaki adım" olarak bırakılan eksik parça budur.
 * interpretation-engine.js'e KASITLI OLARAK dokunulmadı; o modül sadece
 * metin üretir, bu modül sadece o metni API'ye taşır ve cevabı güvenli
 * şekilde işler. İki sorumluluk ayrı kalır (biri test edilebilir prompt
 * mantığı, diğeri ağ/hata yönetimi).
 *
 * NASIL ÇALIŞIR (özet):
 *   1) interpretation-engine.js'ten gelen systemPrompt + userMessage'ı alır
 *   2) Anthropic API'ye gönderir
 *   3) Gelen cevabı JSON olarak ayrıştırır ve beklenen şemaya
 *      (opening/connection/guidance/note) uyup uymadığını kontrol eder
 *   4) Bir şeyler ters giderse (ağ hatası, bozuk JSON, zaman aşımı) BİR KEZ
 *      otomatik tekrar dener; yine olmazsa kullanıcıya gösterilecek sade
 *      bir Türkçe hata mesajıyla birlikte "başarısız" sonucu döner.
 *
 * Bu modül asla "sessizce boş" dönmez — her çağrının sonucu ya net bir
 * başarı (ok: true) ya da nedeni belli bir başarısızlıktır (ok: false).
 */

const DEFAULT_MODEL = "claude-sonnet-5";
const DEFAULT_TIMEOUT_MS = 20000; // 20 saniye — bu süre geçerse "zaman aşımı" sayılır
const DEFAULT_MAX_RETRIES = 2; // ilk deneme + 2 tekrar deneme = toplam 3 deneme
const MAX_TOKENS = 1500; // yorum metni uzunsa JSON'un ortasında kesilmesini önlemek için pay bırakır

const REQUIRED_FIELDS = ["opening", "connection", "guidance", "note"];

// Kullanıcıya gösterilecek, teknik detay içermeyen mesajlar.
const USER_FACING_MESSAGES = {
  missing_api_key:
    "Yorum sistemine bağlanmak için gerekli ayar eksik. Lütfen site yöneticisiyle iletişime geçin.",
  network_error:
    "Şu an yorum sunucusuna ulaşılamıyor. Lütfen birazdan tekrar deneyin.",
  timeout:
    "Yorum oluşturulması normalden uzun sürdü ve zaman aşımına uğradı. Lütfen tekrar deneyin.",
  api_error:
    "Yorum şu an oluşturulamadı. Lütfen birazdan tekrar deneyin.",
  invalid_response:
    "Yorum beklenmedik bir biçimde geldi, bu yüzden gösterilemiyor. Lütfen tekrar deneyin.",
};

/**
 * AI'nin metin cevabından JSON'u ayıklar. Bazen model, JSON'u
 * ```json ... ``` gibi kod bloğu içine alabiliyor; bunu temizler.
 */
function extractJsonText(rawText) {
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  return text;
}

/**
 * Metni JSON olarak ayrıştırmayı dener. Doğrudan ayrıştırma başarısız
 * olursa (model istenmeden JSON'un öncesine/sonrasına açıklama eklemiş
 * olabilir — "Elbette, işte yorum: { ... }" gibi), metindeki İLK "{" ile
 * SON "}" arasını alıp bir kez daha dener. Bu, PROJECT.md §6d'deki "JSON
 * parse hatalarına karşı fallback davranışı" gereksinimini karşılıyor.
 */
function parseJsonWithFallback(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (firstErr) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return { ok: true, value: JSON.parse(text.slice(start, end + 1)) };
      } catch (secondErr) {
        return { ok: false, error: secondErr };
      }
    }
    return { ok: false, error: firstErr };
  }
}

/**
 * Ayrıştırılan JSON'un beklenen 4 alanı (opening/connection/guidance/note)
 * içerip içermediğini, hepsinin metin (string) olduğunu doğrular.
 */
function validateSchema(obj) {
  if (!obj || typeof obj !== "object") return false;
  return REQUIRED_FIELDS.every((key) => typeof obj[key] === "string" && obj[key].trim().length > 0);
}

/**
 * Tek bir API denemesi yapar (retry mantığı içermez — onu callClaude yönetir).
 * Başarılıysa { ok:true, data } döner; değilse { ok:false, reason, details } döner.
 * reason değerleri: 'network_error' | 'timeout' | 'api_error' | 'invalid_response'
 */
async function attemptOnce({ systemPrompt, userMessage, apiKey, model, timeoutMs, fetchFn }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetchFn("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && err.name === "AbortError") {
      return { ok: false, reason: "timeout", details: `İstek ${timeoutMs}ms içinde tamamlanmadı.` };
    }
    return { ok: false, reason: "network_error", details: String(err && err.message ? err.message : err) };
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch (_) {
      /* göz ardı edilebilir */
    }
    return {
      ok: false,
      reason: "api_error",
      details: `HTTP ${response.status}: ${bodyText.slice(0, 300)}`,
    };
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    return { ok: false, reason: "invalid_response", details: "Cevap gövdesi JSON değil." };
  }

  const textBlock = Array.isArray(data.content)
    ? data.content.find((block) => block.type === "text")
    : null;
  if (!textBlock || typeof textBlock.text !== "string") {
    return { ok: false, reason: "invalid_response", details: "Cevapta metin bloğu bulunamadı." };
  }

  const jsonText = extractJsonText(textBlock.text);
  const parseResult = parseJsonWithFallback(jsonText);
  if (!parseResult.ok) {
    return {
      ok: false,
      reason: "invalid_response",
      details: `JSON parse hatası (fallback da denendi): ${parseResult.error.message}`,
    };
  }
  const parsed = parseResult.value;

  if (!validateSchema(parsed)) {
    return { ok: false, reason: "invalid_response", details: "Beklenen alanlar (opening/connection/guidance/note) eksik veya boş." };
  }

  return { ok: true, data: parsed };
}

/**
 * @param {string} systemPrompt - interpretation-engine.js'ten gelen system prompt
 * @param {string} userMessage - interpretation-engine.js'ten gelen user mesajı
 * @param {object} [options]
 * @param {string} [options.apiKey] - varsayılan: process.env.ANTHROPIC_API_KEY
 * @param {string} [options.model] - varsayılan: "claude-sonnet-5"
 * @param {number} [options.timeoutMs] - varsayılan: 20000
 * @param {number} [options.maxRetries] - varsayılan: 1 (yani en fazla 2 deneme)
 * @param {Function} [options.fetchFn] - test edilebilirlik için; varsayılan: global fetch
 *
 * @returns {Promise<{ok:true,data:{opening,connection,guidance,note}} |
 *                    {ok:false,reason:string,message:string,details?:string}>}
 */
async function callClaude(systemPrompt, userMessage, options = {}) {
  const {
    apiKey = process.env.ANTHROPIC_API_KEY,
    model = DEFAULT_MODEL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    fetchFn = fetch,
  } = options;

  if (!apiKey) {
    return { ok: false, reason: "missing_api_key", message: USER_FACING_MESSAGES.missing_api_key };
  }

  let lastFailure = null;
  const totalAttempts = 1 + Math.max(0, maxRetries);

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    const result = await attemptOnce({ systemPrompt, userMessage, apiKey, model, timeoutMs, fetchFn });
    if (result.ok) {
      return { ok: true, data: result.data };
    }
    lastFailure = result;
    // Son deneme değilse bir sonrakine geç (basit, gecikmesiz retry — V1 için yeterli).
  }

  const message = USER_FACING_MESSAGES[lastFailure.reason] || USER_FACING_MESSAGES.api_error;
  return {
    ok: false,
    reason: lastFailure.reason,
    message,
    details: lastFailure.details,
  };
}

module.exports = { callClaude, USER_FACING_MESSAGES, DEFAULT_MODEL };
