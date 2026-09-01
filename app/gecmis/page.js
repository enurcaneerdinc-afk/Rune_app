"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, clearHistory } from "../../lib/history-store";
import styles from "./page.module.css";

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

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
  const [records, setRecords] = useState(null); // null = henüz yüklenmedi (SSR/hydration için)
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  function handleClear() {
    const sure = window.confirm("Tüm geçmiş çekimler bu cihazdan silinecek. Emin misin?");
    if (!sure) return;
    clearHistory();
    setRecords([]);
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Geçmiş çekimlerin</h1>
          <p className={styles.subtitle}>
            Bu liste sadece bu tarayıcıda saklanıyor — henüz hesap sistemi yok.
          </p>
        </div>
        <Link href="/" className={styles.backLink}>
          ← Yeni çekim
        </Link>
      </div>

      {records === null && <p className={styles.loading}>Yükleniyor…</p>}

      {records !== null && records.length === 0 && (
        <div className={styles.empty}>
          <p>Henüz kayıtlı bir çekim yok.</p>
          <Link href="/" className={styles.backLink}>
            Ana sayfadan bir rune çek →
          </Link>
        </div>
      )}

      {records !== null && records.length > 0 && (
        <>
          <div className={styles.list}>
            {groupByDay(records).map(([day, dayRecords]) => (
              <section key={day} className={styles.dayGroup}>
                <h2 className={styles.dayHeading}>
                  {DATE_FORMATTER.format(new Date(`${day}T00:00:00Z`))}
                </h2>
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
                          <span className={styles.cardTime}>
                            {TIME_FORMATTER.format(new Date(r.createdAt))}
                          </span>
                          <span className={styles.cardTopic}>{r.topic}</span>
                        </div>
                        <div className={styles.cardRuneName}>
                          {r.drawnRune.name}
                          {r.drawnRune.reversed && <span className={styles.reversedTag}>ters</span>}
                        </div>
                      </button>

                      {isOpen && (
                        <div className={styles.cardBody}>
                          <dl className={styles.miniRows}>
                            <div>
                              <dt>Kişisel ana rune</dt>
                              <dd>{r.personalRune.name}</dd>
                            </div>
                            <div>
                              <dt>Yıllık rune</dt>
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
                            <p className={styles.noInterpretation}>
                              Bu çekim için kişisel yorum istenmemiş.
                            </p>
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
            Tüm geçmişi temizle
          </button>
        </>
      )}
    </main>
  );
}
