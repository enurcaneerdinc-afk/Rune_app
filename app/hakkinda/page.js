import Link from "next/link";
import RuneWheel from "../../components/RuneWheel";
import styles from "./page.module.css";

export const metadata = {
  title: "Rune nedir? — Rune",
  description: "Elder Futhark rünleri hakkında kısa bir bilgi ve bu uygulamadaki yorumların kaynağı.",
};

export default function AboutPage() {
  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Ana sayfa
        </Link>
      </div>

      <div className={styles.wheelHolder}>
        <RuneWheel maxWidth={220} />
      </div>

      <h1 className={styles.title}>Rune nedir?</h1>

      <section className={styles.section}>
        <h2 className={styles.heading}>Bir yazı sistemi olarak</h2>
        <p>
          Rüneler, aslında bir alfabe. "Elder Futhark" adı verilen 24 karakterlik bu yazı
          sistemi, MS 2. yüzyıl civarında Cermen halkları arasında ortaya çıktı ve
          günümüzün Almanca, İngilizce, İskandinav dilleri gibi dillerin atası olan
          Cermen dillerini yazmak için kullanıldı. İsmini oluşturan "futhark" kelimesi,
          alfabenin ilk altı harfinin (F, U, Th, A, R, K) sesinden geliyor — tıpkı bizim
          "alfabe" kelimesinin Yunanca'nın ilk iki harfinden (alfa, beta) gelmesi gibi.
        </p>
        <p>
          Karakterlerin köşeli, çoğunlukla düz çizgilerden oluşan görünümü tesadüf değil:
          ahşap veya taşa oyularak yazıldıkları için eğri çizgilerden kaçınılmış.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Kehanet aracı olarak</h2>
        <p>
          Rünelerin bir alfabe olmanın ötesinde sembolik/kehanet amaçlı kullanıldığına dair
          tarihi kayıtlar sınırlı ve tartışmalı. Bugün bildiğimiz "rune falı" pratiği,
          büyük ölçüde 20. yüzyılda modern ezoterik hareketler içinde şekillenip
          popülerleşti. Bu uygulama da bu modern geleneği takip ediyor — rünelerin
          bininlerce yıllık bir kehanet sistemi olduğunu iddia etmiyoruz; onları kendini
          tanıma ve düşünme aracı olarak sunuyoruz.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Bu uygulamadaki yorumlar nereden geliyor?</h2>
        <p>
          24 rünenin anlamları, yayımlanmış bir kaynak eserden alınmıştır.
          Kişiselleştirilmiş yorumları üreten yapay zeka, bu kaynak metnin dışına çıkıp
          kendi kafasından yeni bir anlam uydurmuyor — sadece kaynaktaki metni, senin
          doğum tarihinden hesaplanan profilinle ve seçtiğin konuyla birlikte okuyup
          birleştiriyor.
        </p>
        <p className={styles.note}>
          Kişisel ana rune hesaplaması (bkz. ana sayfadaki 24 dilimlik takvim), kaynakta
          açıkça belirtilen sadece iki döneme dayanan bir enterpolasyondur — kesin,
          yerleşik bir gelenek olarak sunulmuyor.
        </p>
      </section>

      <Link href="/" className={styles.ctaLink}>
        Profiline bak →
      </Link>
    </main>
  );
}
