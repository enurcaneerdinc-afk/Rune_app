"use client";

import { useRef, useState } from "react";
import runeEngine from "../lib/rune-engine";
import runesData from "../data/runes.json";
import { addDraw, attachInterpretation } from "../lib/history-store";
import RuneWheel from "./RuneWheel";
import styles from "./RuneDraw.module.css";

const { randomDraw } = runeEngine;

const SLICE_COUNT = 24;
const SLICE_ANGLE = 360 / SLICE_COUNT; // 15°
const SPIN_DURATION_MS = 1700;

function findSection(rune, title) {
  const s = rune.sections.find((sec) => sec.title === title);
  return s ? s.text : null;
}

// Metni bir cümle sonunda temiz şekilde keser — sarkan "..." bırakmaz.
// { short, full, truncated } döner; truncated true ise "Devamını oku" gösterilir.
function truncateToSentence(text, maxChars = 260) {
  if (!text) return null;
  if (text.length <= maxChars) return { short: text, full: text, truncated: false };
  const cut = text.slice(0, maxChars);
  const lastDot = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"));
  const short = lastDot > 60 ? cut.slice(0, lastDot + 1).trim() : cut.trim();
  return { short, full: text, truncated: true };
}

export default function RuneDraw({ topic, personalRune, yearlyRune, userName }) {
  const [phase, setPhase] = useState("idle"); // idle | drawing | revealed
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinTargetId, setSpinTargetId] = useState(null); // dönerken tekerleğin hedefi (görsel amaçlı, henüz açıklanmadı)
  const [result, setResult] = useState(null); // { id, name, reversed }
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [interpretPhase, setInterpretPhase] = useState("idle"); // idle | loading | done | error
  const [interpretResult, setInterpretResult] = useState(null);
  const [interpretMessage, setInterpretMessage] = useState(null);
  const timeouts = useRef([]);
  const drawRecordId = useRef(null);

  function draw() {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];

    const target = randomDraw();
    const targetIndex = target.id - 1;
    // Bu dilimin merkezi tekerleğin "üstüne" (0°, ibrenin durduğu yere) gelsin.
    const desiredMod = (((-(targetIndex * SLICE_ANGLE + SLICE_ANGLE / 2)) % 360) + 360) % 360;

    setResult(null);
    setPreviewExpanded(false);
    setPhase("drawing");
    setInterpretPhase("idle");
    setInterpretResult(null);
    setInterpretMessage(null);
    drawRecordId.current = null;

    setWheelRotation((prev) => {
      const currentMod = ((prev % 360) + 360) % 360;
      let delta = desiredMod - currentMod;
      if (delta <= 0) delta += 360;
      delta += 360 * 4; // birkaç tam tur ekleyerek gerçek bir "dönüş" hissi ver
      return prev + delta;
    });
    setSpinTargetId(target.id);

    const finalId = setTimeout(() => {
      setResult(target);
      setPhase("revealed");
      drawRecordId.current = addDraw({
        userName,
        topic,
        drawnRune: target,
        personalRune,
        yearlyRune,
      });
    }, SPIN_DURATION_MS);
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
        body: JSON.stringify({ drawnRune: result, personalRune, yearlyRune, topic, userName }),
      });
      const data = await res.json();
      if (data.ok) {
        setInterpretResult(data.data);
        setInterpretPhase("done");
        if (drawRecordId.current) attachInterpretation(drawRecordId.current, data.data);
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
  const preview = runeRecord ? truncateToSentence(findSection(runeRecord, "Kehanet Mesajı")) : null;

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>{topic ? `"${topic}" için bir rune çek` : "Bir rune çek"}</p>

      <div className={styles.wheelStage}>
        <div className={styles.pointer} aria-hidden="true" />
        <div
          className={styles.wheelSpin}
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transitionDuration: phase === "drawing" ? `${SPIN_DURATION_MS}ms` : "0ms",
          }}
        >
          <RuneWheel activeId={spinTargetId} maxWidth={220} />
        </div>
      </div>

      {phase === "revealed" && result && (
        <div className={styles.revealMeta}>
          <span
            className={styles.resultName}
            style={result.reversed ? { transform: "rotate(180deg)", display: "inline-block" } : undefined}
          >
            {result.name}
          </span>
          <span className={styles.badge}>{result.reversed ? "Ters geldi" : "Düz geldi"}</span>
          {runeRecord && <p className={styles.subtitle}>{runeRecord.subtitle}</p>}

          {preview && (
            <p className={styles.preview}>
              <span className={styles.previewLabel}>Kaynak metinden (Kehanet Mesajı):</span>{" "}
              {previewExpanded ? preview.full : preview.short}
              {preview.truncated && (
                <button
                  type="button"
                  className={styles.readMore}
                  onClick={() => setPreviewExpanded((v) => !v)}
                >
                  {previewExpanded ? " Daralt" : " Devamını oku"}
                </button>
              )}
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

      <button type="button" className={styles.drawButton} onClick={draw} disabled={phase === "drawing"}>
        {phase === "idle" && "Rune çek"}
        {phase === "drawing" && "Çekiliyor…"}
        {phase === "revealed" && "Tekrar çek"}
      </button>
    </div>
  );
}
