"use client";

import { useEffect, useRef, useState } from "react";
import runeEngine from "../lib/rune-engine";
import runesData from "../data/runes.json";
import { addDraw, attachInterpretation } from "../lib/history-store";
import styles from "./RuneDraw.module.css";

const { randomDraw, RUNE_NAMES } = runeEngine;

// Çekim animasyonu sırasında ekranda hızla değişen isimler için zamanlama.
// Süre arttıkça aralık uzuyor (yavaşlıyor) — bir "kilitlenme" hissi veriyor.
const CYCLE_SCHEDULE_MS = [70, 70, 80, 90, 100, 120, 140, 170, 210, 260, 320];

function randomName(excludeName) {
  let n = RUNE_NAMES[Math.floor(Math.random() * RUNE_NAMES.length)];
  if (n === excludeName) return randomName(excludeName);
  return n;
}

// Kaynak metinden kısa, ham bir alıntı (AI yorumu DEĞİL — bir sonraki modülde eklenecek).
function findSection(rune, title) {
  const s = rune.sections.find((sec) => sec.title === title);
  return s ? s.text : null;
}
function excerpt(text, maxChars = 220) {
  if (!text) return null;
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastDot = cut.lastIndexOf(". ");
  return (lastDot > 80 ? cut.slice(0, lastDot + 1) : cut) + " (…)";
}

export default function RuneDraw({ topic, personalRune, yearlyRune, userName }) {
  const [phase, setPhase] = useState("idle"); // idle | drawing | revealed
  const [displayName, setDisplayName] = useState(RUNE_NAMES[0]);
  const [result, setResult] = useState(null); // { id, name, reversed }
  const [interpretPhase, setInterpretPhase] = useState("idle"); // idle | loading | done | error
  const [interpretResult, setInterpretResult] = useState(null);
  const [interpretMessage, setInterpretMessage] = useState(null);
  const timeouts = useRef([]);
  const drawRecordId = useRef(null);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  function draw() {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];

    const target = randomDraw();
    setResult(null);
    setPhase("drawing");
    setInterpretPhase("idle");
    setInterpretResult(null);
    setInterpretMessage(null);
    drawRecordId.current = null;

    let elapsed = 0;
    let lastName = displayName;
    CYCLE_SCHEDULE_MS.forEach((delay) => {
      elapsed += delay;
      const id = setTimeout(() => {
        const n = randomName(lastName);
        lastName = n;
        setDisplayName(n);
      }, elapsed);
      timeouts.current.push(id);
    });

    const finalId = setTimeout(() => {
      setDisplayName(target.name);
      setResult(target);
      setPhase("revealed");
      drawRecordId.current = addDraw({
        userName,
        topic,
        drawnRune: target,
        personalRune,
        yearlyRune,
      });
    }, elapsed + 260);
    timeouts.current.push(finalId);
  }

  async function fetchInterpretation() {
    if (!result) return;
    setInterpretPhase("loading");
    setInterpretMessage(null);
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drawnRune: result,
          personalRune,
          yearlyRune,
          topic,
          userName,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setInterpretResult(data.data);
        setInterpretPhase("done");
        if (drawRecordId.current) {
          attachInterpretation(drawRecordId.current, data.data);
        }
      } else {
        setInterpretMessage(data.message || "Yorum şu an oluşturulamadı.");
        setInterpretPhase("error");
      }
    } catch (err) {
      setInterpretMessage("Bağlantı kurulamadı. Lütfen internet bağlantını kontrol edip tekrar dene.");
      setInterpretPhase("error");
    }
  }

  const runeRecord = result ? runesData.find((r) => r.id === result.id) : null;
  const preview = runeRecord ? excerpt(findSection(runeRecord, "Kehanet Mesajı")) : null;

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>{topic ? `"${topic}" için bir rune çek` : "Bir rune çek"}</p>

      <div className={styles.stage}>
        <span
          className={`${styles.nameDisplay} ${phase === "drawing" ? styles.cycling : ""}`}
          style={result && result.reversed ? { transform: "rotate(180deg)" } : undefined}
          aria-live="polite"
        >
          {phase === "idle" ? "—" : displayName}
        </span>
      </div>

      {phase === "revealed" && result && (
        <div className={styles.revealMeta}>
          <span className={styles.badge}>{result.reversed ? "Ters geldi" : "Düz geldi"}</span>
          {runeRecord && <p className={styles.subtitle}>{runeRecord.subtitle}</p>}
          {preview && (
            <p className={styles.preview}>
              <span className={styles.previewLabel}>Kaynak metinden (Kehanet Mesajı):</span> {preview}
            </p>
          )}
          <p className={styles.nextStepNote}>
            Aşağıdaki yorum yapay zeka tarafından, seçtiğin konu + yıllık rune'un + bu çekim
            birlikte değerlendirilerek üretiliyor.
          </p>

          {interpretPhase === "idle" && (
            <button type="button" className={styles.interpretButton} onClick={fetchInterpretation}>
              Kişisel yorumu göster
            </button>
          )}

          {interpretPhase === "loading" && (
            <p className={styles.interpretLoading} aria-live="polite">
              Yorum hazırlanıyor…
            </p>
          )}

          {interpretPhase === "error" && (
            <div className={styles.interpretError} role="alert">
              <p>{interpretMessage}</p>
              <button type="button" className={styles.interpretButton} onClick={fetchInterpretation}>
                Tekrar dene
              </button>
            </div>
          )}

          {interpretPhase === "done" && interpretResult && (
            <div className={styles.interpretResult}>
              <p>{interpretResult.opening}</p>
              <p>{interpretResult.connection}</p>
              <p>{interpretResult.guidance}</p>
              <p className={styles.interpretNote}>{interpretResult.note}</p>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.drawButton}
        onClick={draw}
        disabled={phase === "drawing"}
      >
        {phase === "idle" && "Rune çek"}
        {phase === "drawing" && "Çekiliyor…"}
        {phase === "revealed" && "Tekrar çek"}
      </button>
    </div>
  );
}
