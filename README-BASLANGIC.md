# Rune Uygulaması — Nasıl Çalıştırılır

Bu bir Next.js (React tabanlı) web uygulamasıdır.

## Bilgisayarınızda çalıştırmak için

1. Terminali (komut satırı) açın ve bu klasöre gidin.
2. Aşağıdaki komutu bir kere çalıştırın (gerekli paketleri indirir):
   ```
   npm install
   ```
3. Uygulamayı başlatmak için:
   ```
   npm run dev
   ```
4. Tarayıcınızda şu adresi açın: http://localhost:3000

## Klasör yapısı (özet)

- `app/` → sayfalar (şu an sadece ana sayfa var)
- `components/` → ekran parçaları (`RuneWheel` = tekerlek grafiği, `UserIntakeForm` = giriş formu)
- `lib/` → daha önce onayladığımız modüller (rune-engine, interpretation-engine, callClaude)
- `data/runes.json` → normalize edilmiş 24 rune verisi

## Bu adımda (Modül 3) ne yapıldı

- İsim + doğum tarihi girişi (+ opsiyonel saat/yer)
- Konu seçimi (6 seçenek)
- "Profilimi gör" dediğinizde, `rune-engine.js` kullanılarak kişisel/karakter/yıllık/aylık
  rune'lar hesaplanıyor ve ekranda gösteriliyor
- Sayfanın imza görseli, kişisel ana rune hesaplamasının dayandığı 24 dilimlik takvimin
  kendisi (`RuneWheel` bileşeni) — süs değil, gerçek hesaplama mantığını gösteriyor

## Modül 4'te ne eklendi

- Profilini gördükten sonra artık bir **"Rune çek"** butonu var
- Butona basınca isimler hızlıca değişip yavaşlayarak bir rune üzerinde "kilitleniyor"
  (`components/RuneDraw.js`) — bu, `rune-engine.js`'teki gerçek `randomDraw()` fonksiyonunu
  kullanıyor, sonuç baştan belli, animasyon sadece görsel
- Rune ters geldiyse (%25 ihtimal) isim ters (180°) gösteriliyor, altında "Ters geldi" etiketi
  net şekilde yazıyor
- Çekilen rune'un kaynak kitaptaki "Kehanet Mesajı" bölümünden kısa bir alıntı gösteriliyor
  (bu AI yorumu DEĞİL, ham kaynak metin — etiketiyle belirtiliyor)

## AI yorumu bağlandı (Modül 4.5)

- `.env.local.example` dosyasını `.env.local` olarak kopyalayıp kendi Anthropic API
  anahtarınızı girin (bu dosya git'e eklenmez, gizli kalır):
  ```
  cp .env.local.example .env.local
  ```
  sonra `.env.local` içindeki `ANTHROPIC_API_KEY=...` satırını kendi anahtarınızla değiştirin.
- Rune çektikten sonra artık **"Kişisel yorumu göster"** butonu çıkıyor. Buna basınca:
  - Tarayıcı, `app/api/interpret/route.js` adlı **sunucu tarafı** route'a istek atıyor
    (API anahtarı tarayıcıya hiç gönderilmiyor, sadece sunucuda kalıyor)
  - O route, `interpretation-engine.js` ile prompt'u hazırlayıp `callClaude.js` ile
    gerçek API çağrısını yapıyor
  - Sonuç (opening/connection/guidance/note) ekranda gösteriliyor
- **API anahtarı eksikse veya bir hata olursa**, ekranda "Şu an yorum sunucusuna
  ulaşılamıyor, lütfen tekrar deneyin" gibi anlaşılır bir mesaj çıkıyor ve bir
  "Tekrar dene" butonu beliriyor — hiçbir zaman sessiz/boş ekran göstermiyor.
  Bunu API anahtarı olmadan test ettim, 4 farklı hata senaryosunun hepsi doğru çalıştı.

## Modül 5 — Geçmiş kayıtları

- Her rune çektiğinizde, kayıt otomatik olarak **bu tarayıcıya** kaydediliyor
  (`lib/history-store.js`, tarayıcının `localStorage`'ını kullanıyor).
- "Kişisel yorumu göster"e basıp AI yorumu geldiğinde, o yorum da aynı kayda ekleniyor.
- Ana sayfanın sağ üstündeki **"Geçmiş çekimlerim →"** linkinden `/gecmis` sayfasına
  gidebilirsiniz. Orada çekimler tarihe göre gruplanmış olarak listeleniyor; her karta
  tıklayınca kişisel rune, yıllık rune ve (varsa) AI yorumu açılıyor.
- **Önemli sınırlama (bilerek, şeffaf şekilde):** Bu geçmiş şu an SADECE bu tarayıcıda/
  cihazda saklanıyor — henüz gerçek bir hesap sistemi (Supabase/Firebase) kurmadık.
  Tarayıcı verilerini temizlerseniz veya başka bir cihazdan girerseniz geçmişi
  göremezsiniz. Gerçek bir hesap sistemi kurmak isterseniz bir sonraki adım olabilir.
- "Tüm geçmişi temizle" butonu var, basmadan önce onay soruyor.

## V1 kapsamı tamamlandı 🎉

PROJECT.md §2'de V1 için listelenen 6 modülün hepsi (veri motoru, rune motoru, kullanıcı
ekranı, çekim animasyonu, yorum motoru + AI bağlantısı, geçmiş kayıtları) artık çalışıyor.
Sırada, isterseniz: gerçek bir hesap sistemi (geçmişi cihazlar arası senkronlamak için),
PWA'ya çevirme (ana ekrana eklenebilir hale getirme) gibi V1-sonrası konular olabilir.
