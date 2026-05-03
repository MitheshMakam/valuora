import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();

  if (!apiKey) {
    return NextResponse.json({ ok: false, step: "env", error: "GEMINI_API_KEY is not set in .env.local" });
  }
  if (!apiKey.startsWith("AIza")) {
    return NextResponse.json({ ok: false, step: "env", error: `Key looks wrong — starts with '${apiKey.slice(0, 6)}...', should start with 'AIza'` });
  }

  // Step 1: List available models
  let models: string[] = [];
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`
    );
    if (listRes.status === 403 || listRes.status === 401) {
      return NextResponse.json({ ok: false, step: "list-models", error: `API key rejected (HTTP ${listRes.status}). Get a new key at https://aistudio.google.com/app/apikey` });
    }
    if (!listRes.ok) {
      return NextResponse.json({ ok: false, step: "list-models", error: `HTTP ${listRes.status} when listing models` });
    }
    const data = await listRes.json();
    models = (data.models ?? [])
      .map((m: { name: string }) => m.name.replace("models/", ""))
      .filter((n: string) => n.startsWith("gemini"));
  } catch (e) {
    return NextResponse.json({ ok: false, step: "list-models", error: `Network error: ${String(e)}` });
  }

  // Step 2: Try a real generation call
  const preferred = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
  const testModel = preferred.find(m => models.includes(m)) ?? models[0] ?? "gemini-2.5-flash";

  const genRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Reply with just the word: WORKING" }] }] }),
    }
  );

  const genBody = await genRes.json();
  const genText: string = genBody?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return NextResponse.json({
    ok: genRes.ok && genText.includes("WORKING"),
    step: "generate",
    keyPrefix: apiKey.slice(0, 10) + "...",
    modelTested: testModel,
    generationStatus: genRes.status,
    generationResponse: genText || genBody?.error?.message || "no text returned",
    availableGeminiModels: models,
    verdict: genRes.ok ? "✅ Your API key is working!" : "❌ Generation failed — see generationResponse for details",
  });
}
