"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LANG, LANGUAGES } from "../lib/i18n";

const STORAGE_KEY = "rune-app:lang";

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  // Sayfa yüklendiğinde önceki seçimi tarayıcıdan hatırla.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.includes(saved)) {
        setLangState(saved);
      }
    } catch (err) {
      // localStorage yoksa/kapalıysa sessizce varsayılanda kal.
    }
  }, []);

  // ÖNEMLİ: <html lang="tr"> sabit kalırsa, tarayıcı CSS text-transform:
  // uppercase uygularken Türkçe'ye özel harf kurallarını kullanır (küçük
  // "i" büyütülünce "İ" olur, İngilizce'de olması gereken "I" değil). Bu,
  // EN modda "PROFİLE" gibi hatalı görünen kelimelere yol açar. Bu yüzden
  // gerçek <html> etiketinin lang'ını, seçilen dile göre senkron tutuyoruz.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  function setLang(next) {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      // göz ardı edilebilir
    }
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
