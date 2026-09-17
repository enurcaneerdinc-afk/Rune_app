"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getHistory, clearHistory } from "../../lib/history-store";
import { t, topicLabel } from "../../lib/i18n";
import { useLanguage } from "../../components/LanguageProvider";
import styles from "./page.module.css";

function groupByDay(records) {
  const groups = new Map();
  for (const r of records) {
    const dayKey = r.createdAt.slice(0, 10); // YYYY-MM-DD
    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey).push(r);
  }
  return Array.from(groups.entries()); // zaten en yeni en başta (getHistory sıralıyor)
}

export default function HistoryPage() {
  const { lang } = useLanguage();
  const [records, setRecords] = useState(null); // null = henüz yüklenmedi (SSR/hydration için)
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(t(lang, "dateLocale"), { day: "numeric", month: "long", year: "numeric" }),
    [lang]
  );
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(t(lang, "dateLocale"), { hour: "2-digit", minute: "2-digit" }),
    [lang]
  );

  function handleClear() {
    const sure = window.confirm(t(lang, "historyClearConfirm"));
    if (!sure) return;
    clearHistory();
    setRecords([]);
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t(lang, "historyTitle")}</h1>
          <p className={styles.subtitle}>{t(lang, "historySubtitle")}</p>
        </div>
        <Link href="/" className={styles.backLink}>
          {t(lang, "historyNewDraw")}
        </Link>
      </div>

      {records === null && <p className={styles.loading}>{t(lang, "historyLoading")}</p>}

      {records !== null && records.length === 0 && (
        <div className={styles.empty}>
          <p>{t(lang, "historyEmpty")}</p>
          <Link href="/" className={styles.backLink}>
            {t(lang, "historyEmptyCta")}
          </Link>
        </div>
      )}

      {records !== null && records.length > 0 && (
        <>
          <div className={styles.list}>
            {groupByDay(records).map(([day, dayRecords]) => (
              <section key={day} className={styles.dayGroup}>
                <h2 className={styles.dayHeading}>{dateFormatter.format(new Date(`${day}T00:00:00Z`))}</h2>
                {dayRecords.map((r) => {
                  const isOpen = expandedId === r.id;
                  return (
                    <article key={r.id} className={styles.card}>
                      <button
                        type="button"
                        className={styles.cardHeader}
                        onClick={() => setExpandedId(isOpen ? null : r.id)}
                        aria-expanded={isOpen}
                      >
                        <div>
                          <span className={styles.cardTime}>{timeFormatter.format(new Date(r.createdAt))}</span>
                          <span className={styles.cardTopic}>{topicLabel(lang, r.topic)}</span>
                        </div>
                        <div className={styles.cardRuneName}>
                          {r.drawnRune.name}
                          {r.drawnRune.reversed && <span className={styles.reversedTag}>{t(lang, "reversedTag")}</span>}
                        </div>
                      </button>

                      {isOpen && (
                        <div className={styles.cardBody}>
                          <dl className={styles.miniRows}>
                            <div>
                              <dt>{t(lang, "historyRowPersonal")}</dt>
                              <dd>{r.personalRune.name}</dd>
                            </div>
                            <div>
                              <dt>{t(lang, "historyRowYearly")}</dt>
                              <dd>{r.yearlyRune.name}</dd>
                            </div>
                          </dl>
                          {r.interpretation ? (
                            <div className={styles.interpretation}>
                              <p>{r.interpretation.opening}</p>
                              <p>{r.interpretation.connection}</p>
                              <p>{r.interpretation.guidance}</p>
                              <p className={styles.interpretationNote}>{r.interpretation.note}</p>
                            </div>
                          ) : (
                            <p className={styles.noInterpretation}>{t(lang, "historyNoInterpretation")}</p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            ))}
          </div>

          <button type="button" className={styles.clearButton} onClick={handleClear}>
            {t(lang, "historyClear")}
          </button>
        </>
      )}
    </main>
  );
}
