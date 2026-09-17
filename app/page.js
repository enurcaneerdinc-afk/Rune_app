"use client";

import Link from "next/link";
import UserIntakeForm from "../components/UserIntakeForm";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../components/LanguageProvider";
import { t } from "../lib/i18n";

const navLinkStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
  color: "var(--verdigris)",
  textDecoration: "none",
};

export default function Home() {
  const { lang } = useLanguage();
  return (
    <main>
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "1.5rem 1.5rem 0",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <LanguageToggle />
        <Link href="/hakkinda" style={navLinkStyle}>
          {t(lang, "navAbout")}
        </Link>
        <Link href="/gecmis" style={navLinkStyle}>
          {t(lang, "navHistory")}
        </Link>
      </div>
      <UserIntakeForm />
    </main>
  );
}
