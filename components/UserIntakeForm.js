"use client";

import { useMemo, useState } from "react";
import runeEngine from "../lib/rune-engine";
import interpretationEngine from "../lib/interpretation-engine";
import { t, topicLabel, errorMessage } from "../lib/i18n";
import { useLanguage } from "./LanguageProvider";
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
  const { lang } = useLanguage();
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
        <p className={styles.wheelCaption}>{t(lang, "wheelCaption")}</p>
      </div>

      <div className={styles.formColumn}>
        {!profile ? (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div>
              <h1 className={styles.title}>{t(lang, "formTitle")}</h1>
              <p className={styles.subtitle}>{t(lang, "formSubtitle")}</p>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>{t(lang, "labelName")}</span>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(lang, "placeholderName")}
                autoComplete="given-name"
              />
              {nameError && <span className={styles.error}>{t(lang, "errorName")}</span>}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>{t(lang, "labelBirthDate")}</span>
              <input
                className={styles.input}
                type="date"
                value={birthDate}
                max={TODAY_ISO}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              {dateError && <span className={styles.error}>{t(lang, "errorBirthDate", MIN_YEAR)}</span>}
            </label>

            <button
              type="button"
              className={styles.optionalToggle}
              onClick={() => setShowOptional((v) => !v)}
              aria-expanded={showOptional}
            >
              {showOptional ? t(lang, "optionalToggleOpen") : t(lang, "optionalToggleClosed")}
            </button>

            {showOptional && (
              <div className={styles.optionalGroup}>
                <label className={styles.field}>
                  <span className={styles.label}>{t(lang, "labelBirthTime")}</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>{t(lang, "labelBirthPlace")}</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder={t(lang, "placeholderBirthPlace")}
                  />
                </label>
                <p className={styles.optionalNote}>{t(lang, "optionalNote")}</p>
              </div>
            )}

            <fieldset className={styles.field} style={{ border: "none", padding: 0, margin: 0 }}>
              <legend className={styles.label}>{t(lang, "labelTopicQuestion")}</legend>
              <div className={styles.topicGrid}>
                {TOPICS.map((topicKey) => (
                  <button
                    type="button"
                    key={topicKey}
                    className={`${styles.topicPill} ${topic === topicKey ? styles.topicPillActive : ""}`}
                    onClick={() => setTopic(topicKey)}
                    aria-pressed={topic === topicKey}
                  >
                    {topicLabel(lang, topicKey)}
                  </button>
                ))}
              </div>
              {topicError && <span className={styles.error}>{t(lang, "errorTopic")}</span>}
            </fieldset>

            <button type="submit" className={styles.submit}>
              {t(lang, "submit")}
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
  const { lang } = useLanguage();
  const [overviewPhase, setOverviewPhase] = useState("idle"); // idle | loading | done | error
  const [overviewResult, setOverviewResult] = useState(null);
  const [overviewReason, setOverviewReason] = useState(null);

  const rows = useMemo(
    () => [
      { label: t(lang, "rowPersonal"), value: profile.personal.name },
      { label: t(lang, "rowCharacter"), value: profile.character.name },
      { label: t(lang, "rowYearly"), value: profile.yearly.name },
      { label: t(lang, "rowMonthly"), value: profile.monthly.name },
      { label: t(lang, "rowDaily"), value: profile.dailyVibration.name },
    ],
    [profile, lang]
  );

  const lensText =
    lang === "en"
      ? interpretationEngine.TOPIC_LENS_EN[profile.topic] || interpretationEngine.TOPIC_LENS[profile.topic]
      : interpretationEngine.TOPIC_LENS[profile.topic];

  async function fetchOverview() {
    setOverviewPhase("loading");
    setOverviewReason(null);
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
          lang,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setOverviewResult(data.data);
        setOverviewPhase("done");
      } else {
        setOverviewReason(data.reason || "default");
        setOverviewPhase("error");
      }
    } catch (err) {
      setOverviewReason("network_error");
      setOverviewPhase("error");
    }
  }

  return (
    <div className={styles.summary}>
      <div>
        <span className={styles.summaryEyebrow}>{t(lang, "summaryEyebrow", profile.name)}</span>
        <h1 className={styles.title}>{topicLabel(lang, profile.topic)}</h1>
        <p className={styles.subtitle}>{lensText}</p>
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
            {t(lang, "overviewShow")}
          </button>
        )}
        {overviewPhase === "loading" && (
          <p className={styles.overviewLoading} aria-live="polite">
            {t(lang, "overviewLoading")}
          </p>
        )}
        {overviewPhase === "error" && (
          <div className={styles.overviewError} role="alert">
            <p>{errorMessage(lang, overviewReason)}</p>
            <button type="button" className={styles.overviewButton} onClick={fetchOverview}>
              {t(lang, "overviewRetry")}
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
        {t(lang, "backToEdit")}
      </button>
    </div>
  );
}
