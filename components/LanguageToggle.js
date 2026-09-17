"use client";

import { useLanguage } from "./LanguageProvider";
import styles from "./LanguageToggle.module.css";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className={styles.wrap} role="group" aria-label="Dil seçimi / Language">
      <button
        type="button"
        className={`${styles.option} ${lang === "tr" ? styles.active : ""}`}
        onClick={() => setLang("tr")}
        aria-pressed={lang === "tr"}
      >
        TR
      </button>
      <button
        type="button"
        className={`${styles.option} ${lang === "en" ? styles.active : ""}`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
