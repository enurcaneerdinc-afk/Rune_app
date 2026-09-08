const { callClaude } = require("./lib/callClaude");

function ok(text) {
  return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text }] }) };
}
function httpErr(status) {
  return { ok: false, status, text: async () => "sunucu hatası" };
}

async function run(name, fn) {
  const result = await fn();
  console.log(`[${result.pass ? "GEÇTİ" : "BAŞARISIZ"}] ${name}`);
  if (!result.pass) console.log("   ->", JSON.stringify(result.got));
}

const VALID_JSON = JSON.stringify({
  opening: "Merhaba.",
  connection: "Bağlantı burada.",
  guidance: "Rehberlik burada.",
  note: "Not burada.",
});

async function main() {
  await run("Başarılı, temiz JSON cevap", async () => {
    const fetchFn = async () => ok(VALID_JSON);
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 0 });
    return { pass: res.ok === true && res.data.opening === "Merhaba.", got: res };
  });

  await run("```json ... ``` bloğu doğru temizleniyor", async () => {
    const fetchFn = async () => ok("```json\n" + VALID_JSON + "\n```");
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 0 });
    return { pass: res.ok === true && res.data.note === "Not burada.", got: res };
  });

  // YENİ: model, JSON'un ÖNÜNE açıklama eklerse (gerçek hayatta görülen hata)
  await run("JSON öncesi fazladan metin varsa yine ayrıştırılıyor", async () => {
    const fetchFn = async () => ok("Elbette, işte kişisel yorum:\n" + VALID_JSON);
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 0 });
    return { pass: res.ok === true && res.data.opening === "Merhaba.", got: res };
  });

  // YENİ: model, JSON'un SONUNA fazladan metin eklerse
  await run("JSON sonrası fazladan metin varsa yine ayrıştırılıyor", async () => {
    const fetchFn = async () => ok(VALID_JSON + "\n\nUmarım yardımcı olmuştur!");
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 0 });
    return { pass: res.ok === true && res.data.note === "Not burada.", got: res };
  });

  // YENİ: hem önce hem sonra fazladan metin
  await run("JSON öncesi VE sonrası fazladan metin varsa yine ayrıştırılıyor", async () => {
    const fetchFn = async () => ok("Tabii:\n" + VALID_JSON + "\nTeşekkürler.");
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 0 });
    return { pass: res.ok === true && res.data.guidance === "Rehberlik burada.", got: res };
  });

  await run("İlk deneme bozuk, retry ile kurtarılıyor", async () => {
    let callCount = 0;
    const fetchFn = async () => {
      callCount += 1;
      return callCount === 1 ? ok("bozuk-json-degil") : ok(VALID_JSON);
    };
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 1 });
    return { pass: res.ok === true && callCount === 2, got: { res, callCount } };
  });

  await run("Israrla bozuk JSON -> dostane hata mesajı", async () => {
    const fetchFn = async () => ok("bu hiç JSON değil ve süslü parantez de yok");
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 1 });
    return {
      pass: res.ok === false && res.reason === "invalid_response" && typeof res.message === "string",
      got: res,
    };
  });

  await run("Ağ hatası -> retry dener, sonra dostane hata", async () => {
    let callCount = 0;
    const fetchFn = async () => {
      callCount += 1;
      throw new Error("ECONNRESET");
    };
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 1 });
    return { pass: res.ok === false && res.reason === "network_error" && callCount === 2, got: { res, callCount } };
  });

  await run("API anahtarı eksik -> anında net hata, ağ çağrısı yok", async () => {
    let called = false;
    const fetchFn = async () => {
      called = true;
      return ok(VALID_JSON);
    };
    const res = await callClaude("sys", "user", { apiKey: "", fetchFn, maxRetries: 1 });
    return { pass: res.ok === false && res.reason === "missing_api_key" && called === false, got: res };
  });

  await run("Eksik alanlı JSON (şema hatası) reddediliyor", async () => {
    const badSchema = JSON.stringify({ opening: "sadece bu var" });
    const fetchFn = async () => ok(badSchema);
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 0 });
    return { pass: res.ok === false && res.reason === "invalid_response", got: res };
  });

  await run("HTTP 500 -> api_error", async () => {
    const fetchFn = async () => httpErr(500);
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn, maxRetries: 0 });
    return { pass: res.ok === false && res.reason === "api_error", got: res };
  });

  // YENİ: varsayılan retry sayısı artık 2 (toplam 3 deneme) — 2 kez bozuk,
  // 3.'de düzelirse yine başarıyla dönmeli
  await run("Varsayılan ayarla: 2 kez bozuk, 3. denemede kurtarılıyor", async () => {
    let callCount = 0;
    const fetchFn = async () => {
      callCount += 1;
      return callCount <= 2 ? ok("hâlâ bozuk") : ok(VALID_JSON);
    };
    const res = await callClaude("sys", "user", { apiKey: "test", fetchFn }); // maxRetries verilmedi -> varsayılan (2)
    return { pass: res.ok === true && callCount === 3, got: { res, callCount } };
  });
}

main();
