"use client";

import { useMemo, useState } from "react";
import runeEngine from "../lib/rune-engine";
import interpretationEngine from "../lib/interpretation-engine";
import RuneWheel from "./RuneWheel";
import RuneDraw from "./RuneDraw";
import styles from "./UserIntakeForm.module.css";

const { buildUserProfile } = runeEngine;
const { TOPIC_LENS } = interpretationEngine;

const TOPICS = Object.keys(TOPIC_LENS);

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const MIN_YEAR = 1920;

function isValidBirthDate(value) {
  if (!value) return false;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  if (d.getUTCFullYear() < MIN_YEAR) return false;
  if (value > TODAY_ISO) return false; // gelecekte bir tarih olamaz
  return true;
}

export default function UserIntakeForm() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [topic, setTopic] = useState(null);
  const [touched, setTouched] = useState(false);
  const [profile, setProfile] = useState(null);

  const nameError = touched && name.trim().length === 0;
  const dateError = touched && !isValidBirthDate(birthDate);
  const topicError = touched && !topic;

  const canSubmit = name.trim().length > 0 && isValidBirthDate(birthDate) && !!topic;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const birth = new Date(`${birthDate}T00:00:00Z`);
    const computed = buildUserProfile(birth);
    setProfile({
      ...computed,
      name: name.trim(),
      topic,
      birthTime: birthTime || null,
      birthPlace: birthPlace.trim() || null,
    });
  }

  function handleReset() {
    setProfile(null);
    setTouched(false);
  }

  const activeWheelId = profile ? profile.personal.id : null;
  const activeWheelLabel = profile ? profile.personal.name : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.wheelColumn}>
        <RuneWheel activeId={activeWheelId} label={activeWheelLabel} />
        <p className={styles.wheelCaption}>
          Kişisel ana rune, kaynakta belirtilen iki döneme (Fehu ve Uruz) dayanarak hesaplanan
          24 dilimlik bir takvimden geliyor — kesin bir gelenek değil, şeffaf bir varsayım.
        </p>
      </div>

      <div className={styles.formColumn}>
        {!profile ? (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div>
              <h1 className={styles.title}>Rune profiline başla</h1>
              <p className={styles.subtitle}>
                Adını ve doğum tarihini gir, bugün hangi konuya bakmak istediğini seç.
              </p>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>İsim</span>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adın"
                autoComplete="given-name"
              />
              {nameError && <span className={styles.error}>Lütfen bir isim gir.</span>}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Doğum tarihi</span>
              <input
                className={styles.input}
                type="date"
                value={birthDate}
                max={TODAY_ISO}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              {dateError && (
                <span className={styles.error}>
                  Lütfen geçerli bir doğum tarihi gir (bugünden ileri veya {MIN_YEAR}&apos;den önce olamaz).
                </span>
              )}
            </label>

            <button
              type="button"
              className={styles.optionalToggle}
              onClick={() => setShowOptional((v) => !v)}
              aria-expanded={showOptional}
            >
              {showOptional ? "− Doğum saati / yeri (opsiyonel)" : "+ Doğum saati / yeri ekle (opsiyonel)"}
            </button>

            {showOptional && (
              <div className={styles.optionalGroup}>
                <label className={styles.field}>
                  <span className={styles.label}>Doğum saati</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Doğum yeri</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Şehir, ülke"
                  />
                </label>
                <p className={styles.optionalNote}>
                  Bu bilgiler V1&apos;deki hesaplamayı etkilemiyor; ileride kullanılmak üzere
                  şimdiden saklanıyor.
                </p>
              </div>
            )}

            <fieldset className={styles.field} style={{ border: "none", padding: 0, margin: 0 }}>
              <legend className={styles.label}>Bugün hangi konuya bakmak istersin?</legend>
              <div className={styles.topicGrid}>
                {TOPICS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    className={`${styles.topicPill} ${topic === t ? styles.topicPillActive : ""}`}
                    onClick={() => setTopic(t)}
                    aria-pressed={topic === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {topicError && <span className={styles.error}>Lütfen bir konu seç.</span>}
            </fieldset>

            <button type="submit" className={styles.submit}>
              Profilimi gör
            </button>
          </form>
        ) : (
          <ProfileSummary profile={profile} onBack={handleReset} />
        )}
      </div>
    </div>
  );
}

function ProfileSummary({ profile, onBack }) {
  const [overviewPhase, setOverviewPhase] = useState("idle"); // idle | loading | done | error
  const [overviewResult, setOverviewResult] = useState(null);
  const [overviewMessage, setOverviewMessage] = useState(null);

  const rows = useMemo(
    () => [
      { label: "Kişisel ana rune", value: profile.personal.name },
      { label: "Karakter runesi", value: profile.character.name },
      { label: "Yıllık rune", value: profile.yearly.name },
      { label: "Aylık rune", value: profile.monthly.name },
      { label: "Günün titreşimi", value: profile.dailyVibration.name },
    ],
    [profile]
  );

  async function fetchOverview() {
    setOverviewPhase("loading");
    setOverviewMessage(null);
    try {
      const res = await fetch("/api/profile-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalRune: profile.personal,
          characterRune: profile.character,
          yearlyRune: profile.yearly,
          monthlyRune: profile.monthly,
          dailyVibrationRune: profile.dailyVibration,
          userName: profile.name,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setOverviewResult(data.data);
        setOverviewPhase("done");
      } else {
        setOverviewMessage(data.message || "Değerlendirme şu an oluşturulamadı.");
        setOverviewPhase("error");
      }
    } catch (err) {
      setOverviewMessage("Bağlantı kurulamadı. Lütfen internet bağlantını kontrol edip tekrar dene.");
      setOverviewPhase("error");
    }
  }

  return (
    <div className={styles.summary}>
      <div>
        <span className={styles.summaryEyebrow}>{profile.name} için profil hazır</span>
        <h1 className={styles.title}>{profile.topic}</h1>
        <p className={styles.subtitle}>{interpretationEngine.TOPIC_LENS[profile.topic]}</p>
      </div>

      <dl className={styles.rows}>
        {rows.map((r) => (
          <div className={styles.row} key={r.label}>
            <dt className={styles.rowLabel}>{r.label}</dt>
            <dd className={styles.rowValue}>{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.overviewBlock}>
        {overviewPhase === "idle" && (
          <button type="button" className={styles.overviewButton} onClick={fetchOverview}>
            Genel değerlendirmemi göster
          </button>
        )}
        {overviewPhase === "loading" && (
          <p className={styles.overviewLoading} aria-live="polite">
            Profilin değerlendiriliyor…
          </p>
        )}
        {overviewPhase === "error" && (
          <div className={styles.overviewError} role="alert">
            <p>{overviewMessage}</p>
            <button type="button" className={styles.overviewButton} onClick={fetchOverview}>
              Tekrar dene
            </button>
          </div>
        )}
        {overviewPhase === "done" && overviewResult && (
          <div className={styles.overviewResult}>
            <p>{overviewResult.opening}</p>
            <p>{overviewResult.connection}</p>
            <p>{overviewResult.guidance}</p>
            <p className={styles.overviewNote}>{overviewResult.note}</p>
          </div>
        )}
      </div>

      <RuneDraw
        topic={profile.topic}
        personalRune={profile.personal}
        yearlyRune={profile.yearly}
        userName={profile.name}
      />

      <button type="button" className={styles.optionalToggle} onClick={onBack}>
        ← Bilgileri değiştir
      </button>
    </div>
  );
}
