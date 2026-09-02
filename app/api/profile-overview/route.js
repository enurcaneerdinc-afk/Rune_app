/**
 * /api/profile-overview — sunucu tarafı route.
 *
 * /api/interpret ile aynı desen: kullanıcının SABİT profil rune'larını
 * (belirli bir çekimle ilgili değil) alır, interpretation-engine.js ile
 * prompt'u hazırlar, callClaude.js ile API'yi çağırır.
 */

import { NextResponse } from "next/server";
import interpretationEngineModule from "../../../lib/interpretation-engine";
import callClaudeModule from "../../../lib/callClaude";
import runesData from "../../../data/runes.json";

const { buildProfileOverviewPrompt } = interpretationEngineModule;
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

  const { personalRune, characterRune, yearlyRune, monthlyRune, dailyVibrationRune, userName } = body || {};

  if (!personalRune || !characterRune || !yearlyRune || !monthlyRune || !dailyVibrationRune) {
    return NextResponse.json(
      { ok: false, reason: "bad_request", message: "Eksik bilgi: profildeki 5 rune'un hepsi gerekli." },
      { status: 400 }
    );
  }

  let prompt;
  try {
    prompt = buildProfileOverviewPrompt({
      personalRune,
      characterRune,
      yearlyRune,
      monthlyRune,
      dailyVibrationRune,
      runesData,
      userName,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "bad_request", message: err.message }, { status: 400 });
  }

  const result = await callClaude(prompt.systemPrompt, prompt.userMessage);

  if (!result.ok) {
    const status = result.reason === "missing_api_key" ? 500 : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
