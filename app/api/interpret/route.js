/**
 * /api/interpret — sunucu tarafı route.
 *
 * Bu dosya SADECE sunucuda çalışır (tarayıcıya hiç gönderilmez). Anthropic
 * API anahtarı (.env.local içindeki ANTHROPIC_API_KEY) burada, güvenle
 * kullanılır — tarayıcı koduna asla sızmaz.
 *
 * Akış: istemci (RuneDraw.js) çekilen rune + kişisel rune + yıllık rune +
 * konu bilgisini buraya POST eder -> interpretation-engine.js prompt'u
 * hazırlar -> callClaude.js API'yi çağırır -> sonuç (ya da dostane hata
 * mesajı) istemciye JSON olarak döner.
 */

import { NextResponse } from "next/server";
import interpretationEngineModule from "../../../lib/interpretation-engine";
import callClaudeModule from "../../../lib/callClaude";
import runesData from "../../../data/runes.json";

const { buildInterpretationPrompt } = interpretationEngineModule;
const { callClaude } = callClaudeModule;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: "bad_request", message: "İstek gövdesi okunamadı." },
      { status: 400 }
    );
  }

  const { drawnRune, personalRune, yearlyRune, topic, userName, lang } = body || {};

  if (!drawnRune || !personalRune || !yearlyRune || !topic) {
    return NextResponse.json(
      {
        ok: false,
        reason: "bad_request",
        message: "Eksik bilgi: çekilen rune, kişisel rune, yıllık rune ve konu gerekli.",
      },
      { status: 400 }
    );
  }

  let prompt;
  try {
    prompt = buildInterpretationPrompt({ drawnRune, personalRune, yearlyRune, topic, runesData, userName, lang });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "bad_request", message: err.message }, { status: 400 });
  }

  const result = await callClaude(prompt.systemPrompt, prompt.userMessage);

  if (!result.ok) {
    // callClaude.js zaten kullanıcıya gösterilecek dostane bir Türkçe mesaj hazırladı.
    const status = result.reason === "missing_api_key" ? 500 : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
