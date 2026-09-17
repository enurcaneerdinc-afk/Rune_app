"use client";

import Link from "next/link";
import RuneWheel from "../../components/RuneWheel";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../components/LanguageProvider";
import { t } from "../../lib/i18n";
import styles from "./page.module.css";

export default function AboutContent() {
  const { lang } = useLanguage();

  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          {t(lang, "aboutBack")}
        </Link>
        <LanguageToggle />
      </div>

      <div className={styles.wheelHolder}>
        <RuneWheel maxWidth={220} />
      </div>

      <h1 className={styles.title}>{t(lang, "aboutTitle")}</h1>

      <section className={styles.section}>
        <h2 className={styles.heading}>{t(lang, "aboutHeading1")}</h2>
        <p>{t(lang, "aboutP1")}</p>
        <p>{t(lang, "aboutP2")}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{t(lang, "aboutHeading2")}</h2>
        <p>{t(lang, "aboutP3")}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{t(lang, "aboutHeading3")}</h2>
        <p>{t(lang, "aboutP4")}</p>
        <p className={styles.note}>{t(lang, "aboutNote")}</p>
      </section>

      <Link href="/" className={styles.ctaLink}>
        {t(lang, "aboutCta")}
      </Link>
    </main>
  );
}
