"use client";

import { useLanguage } from "./LanguageProvider";

/**
 * RuneWheel — sayfanın "imza" görsel öğesi.
 *
 * Bu süslemelik bir grafik değil: rune-engine.js §1'deki 24 dilime bölünmüş
 * "doğum takvimi" varsayımının kendisini gösteriyor. activeId verilirse o
 * dilim aydınlanır (kullanıcının kişisel ana rune'u). Bu yüzden ejderha/
 * savaşçı imgeleri yerine, uygulamanın gerçek hesaplama mantığından doğan
 * bir görsel kullanıyoruz.
 */

const SLICE_COUNT = 24;
const SIZE = 420;
const CENTER = SIZE / 2;
const OUTER_R = 190;
const INNER_R = 128;

// rune-engine.js'teki RUNE_NAMES ile AYNI SIRA (1=Fehu ... 24=Othala).
// Gerçek Elder Futhark Unicode karakterleri. Her cihazda garanti doğru
// görünmesi için proje, bu karakterleri destekleyen "Noto Sans Runic"
// yazı tipini kendi içinde taşıyor (bkz. app/globals.css, --font-runic) —
// kullanıcının telefonunda bu yazı tipi kurulu olmasa bile çalışır.
const RUNE_GLYPHS = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ",
  "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ",
  "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ",
];

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sliceCenterAngle(index) {
  const anglePer = 360 / SLICE_COUNT;
  return index * anglePer + anglePer / 2;
}

function slicePath(index) {
  const anglePer = 360 / SLICE_COUNT;
  const startAngle = index * anglePer + 1; // aralarda ince boşluk için +1/-1
  const endAngle = (index + 1) * anglePer - 1;

  const p1 = polar(CENTER, CENTER, INNER_R, startAngle);
  const p2 = polar(CENTER, CENTER, OUTER_R, startAngle);
  const p3 = polar(CENTER, CENTER, OUTER_R, endAngle);
  const p4 = polar(CENTER, CENTER, INNER_R, endAngle);

  return [
    `M ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 0 1 ${p3.x} ${p3.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${INNER_R} ${INNER_R} 0 0 0 ${p1.x} ${p1.y}`,
    "Z",
  ].join(" ");
}

export default function RuneWheel({ activeId = null, label = null, maxWidth = 420 }) {
  const { lang } = useLanguage();
  const ariaLabel =
    lang === "en"
      ? label
        ? `${label} slice lit up on the birth calendar`
        : "24-slice rune birth calendar"
      : label
      ? `Doğum takviminde ${label} dilimi aydınlanmış`
      : "24 dilimlik rune doğum takvimi";
  const centerFallback = lang === "en" ? "24 slices" : "24 dilim";

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={ariaLabel}
      style={{ width: "100%", height: "auto", maxWidth }}
    >
      <circle cx={CENTER} cy={CENTER} r={OUTER_R + 6} fill="none" stroke="var(--line)" strokeWidth="1" />
      {Array.from({ length: SLICE_COUNT }).map((_, i) => {
        const id = i + 1;
        const isActive = activeId === id;
        return (
          <path
            key={id}
            d={slicePath(i)}
            fill={isActive ? "var(--wheat)" : "var(--ink-raised)"}
            stroke={isActive ? "var(--wheat)" : "var(--line)"}
            strokeWidth="1"
            opacity={isActive ? 1 : 0.9}
            style={{ transition: "fill 400ms ease, opacity 400ms ease" }}
          />
        );
      })}
      {Array.from({ length: SLICE_COUNT }).map((_, i) => {
        const id = i + 1;
        const isActive = activeId === id;
        const angle = sliceCenterAngle(i);
        const pos = polar(CENTER, CENTER, (OUTER_R + INNER_R) / 2, angle);
        return (
          <text
            key={id}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-runic)"
            fontSize="22"
            fill={isActive ? "var(--ink)" : "var(--paper-dim)"}
            style={{ transition: "fill 400ms ease", pointerEvents: "none" }}
          >
            {RUNE_GLYPHS[i]}
          </text>
        );
      })}
      <circle cx={CENTER} cy={CENTER} r={INNER_R - 4} fill="var(--ink)" stroke="var(--line)" strokeWidth="1" />
      {label ? (
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-display)"
          fontSize="30"
          fill="var(--paper)"
        >
          {label}
        </text>
      ) : (
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-mono)"
          fontSize="13"
          fill="var(--paper-dim)"
        >
          {centerFallback}
        </text>
      )}
    </svg>
  );
}
