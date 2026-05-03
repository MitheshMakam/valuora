import { NextRequest, NextResponse } from "next/server";

// ─── Rate limiter ─────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; ts: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.ts > 60_000) {
    rateLimitMap.set(ip, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

// ─── URL helpers ──────────────────────────────────────────────────────────────
function detectPlatform(url: string) {
  if (url.includes("amazon.in"))  return "Amazon India";
  if (url.includes("amazon.com")) return "Amazon US";
  if (url.includes("flipkart"))   return "Flipkart";
  if (url.includes("myntra"))     return "Myntra";
  if (url.includes("snapdeal"))   return "Snapdeal";
  if (url.includes("meesho"))     return "Meesho";
  return "E-commerce";
}
function detectCurrency(url: string) {
  return url.includes("amazon.com") && !url.includes("amazon.in") ? "$" : "₹";
}
function detectCategory(url: string) {
  const l = url.toLowerCase();
  if (/headphone|earphone|airpod|earbud|wh-|xm5|buds/.test(l)) return "headphones";
  if (/laptop|macbook|notebook/.test(l))  return "laptop";
  if (/phone|galaxy|iphone|pixel|oneplus|redmi|poco|realme/.test(l)) return "smartphone";
  if (/watch|smartwatch/.test(l)) return "smartwatch";
  if (/tablet|ipad/.test(l))      return "tablet";
  if (/camera|dslr/.test(l))      return "camera";
  if (/\btv\b|television|qled|oled/.test(l)) return "television";
  if (/speaker|soundbar/.test(l)) return "speaker";
  return "electronics";
}
function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return ["amazon", "flipkart", "myntra", "snapdeal", "meesho"].some(h =>
      u.hostname.includes(h)
    );
  } catch { return false; }
}

// ─── Robust JSON extractor ────────────────────────────────────────────────────
// Gemini 2.5 Flash includes "thinking" text before the JSON — this strips it
function extractJSON(raw: string): string {
  // 1. Strip markdown fences
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();

  // 2. Find the LAST { ... } block (thinking text comes before JSON)
  let depth = 0;
  let start = -1;
  let end = -1;
  for (let i = raw.length - 1; i >= 0; i--) {
    if (raw[i] === "}") {
      if (depth === 0) end = i;
      depth++;
    } else if (raw[i] === "{") {
      depth--;
      if (depth === 0) { start = i; break; }
    }
  }
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1);

  // 3. Fallback: first { to last }
  const first = raw.indexOf("{");
  const last  = raw.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) return raw.slice(first, last + 1);

  throw new Error("No JSON object found in response");
}

// ─── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(url: string, platform: string, currency: string, category: string) {
  return `You are an expert e-commerce analyst. Analyze this product URL.

URL: ${url}
Platform: ${platform}
Currency: ${currency}
Category: ${category}

Respond with ONLY this JSON (no thinking text, no explanation, no markdown):

{"product":{"name":"product name from URL","platform":"${platform}","currentPrice":12999,"mrp":16999,"discountPercent":24,"rating":4.2,"reviewCount":3847,"currency":"${currency}","category":"${category}"},"priceAnalysis":{"deal":"Good Deal","dealScore":74,"allTimeHigh":18999,"allTimeLow":11499,"avgPrice30d":14200,"isFakeDiscount":false,"fakeDiscountNote":""},"aiReviewAnalysis":{"pros":["pro1","pro2","pro3","pro4","pro5"],"cons":["con1","con2","con3","con4"],"mostCommonComplaint":"main complaint","longTermIssue":"long term issue"},"decision":{"verdict":"BUY","confidence":78,"reason":"2-3 sentence reasoning with specific data points","priceScore":76,"reviewScore":82,"ratingScore":84},"pricePrediction":{"direction":"drop","targetPrice":11999,"timeframeDays":14,"reasoning":"reason for prediction","minPredicted":11499,"maxPredicted":13499},"smartAlternatives":[{"name":"alt1","price":10999,"reason":"why"},{"name":"alt2","price":13999,"reason":"why"},{"name":"alt3","price":15999,"reason":"why"}],"regretAnalysis":["regret1","regret2","regret3"],"trustScore":{"score":74,"label":"Trustworthy","fakeReviewPercent":12,"verifiedBuyerPercent":78,"sellerRating":"4.1/5","reviewConsistency":"High"}}

Replace ALL values with realistic data for this ${category} on ${platform} in ${currency}.
Rules: verdict=BUY|WAIT|AVOID, deal=Good Deal|Average|Overpriced, direction=drop|rise|stable, label=Highly Trustworthy|Trustworthy|Questionable|Suspicious, reviewConsistency=High|Medium|Low
IMPORTANT: Output ONLY the JSON object. Start your response with { and end with }. No other text.`;
}

// ─── Sleep ────────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Gemini models to try in order ───────────────────────────────────────────
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

// ─── Call Gemini ──────────────────────────────────────────────────────────────
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const reqBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,     // lower = more predictable JSON
      maxOutputTokens: 2048,
      // Disable thinking for 2.5-flash so it doesn't add pre-JSON text
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`[Gemini] ${model} attempt ${attempt}`);

      let res: Response;
      try {
        res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: reqBody });
      } catch (e) {
        throw new Error(`NETWORK_ERROR: ${String(e)}`);
      }

      if (res.status === 503) {
        console.warn(`[Gemini] 503 overloaded, waiting ${attempt * 4}s`);
        if (attempt < 3) { await sleep(attempt * 4000); continue; }
        break; // try next model
      }
      if (res.status === 404) { console.warn(`[Gemini] ${model} 404`); break; }
      if (res.status === 429) {
        console.warn(`[Gemini] 429 rate limit, waiting 12s`);
        await sleep(12000);
        if (attempt < 3) continue;
        break;
      }
      if (res.status === 401 || res.status === 403) {
        const b = await res.text();
        throw new Error(`API_KEY_ERROR:${res.status}: ${b.slice(0, 200)}`);
      }
      if (!res.ok) {
        const b = await res.text();
        console.warn(`[Gemini] ${model} HTTP ${res.status}: ${b.slice(0, 80)}`);
        break;
      }

      const json = await res.json();

      // Collect ALL text parts (thinking model may return multiple parts)
      const parts: string[] = (json?.candidates?.[0]?.content?.parts ?? [])
        .map((p: { text?: string }) => p.text ?? "")
        .filter(Boolean);

      const fullText = parts.join("\n").trim();

      if (!fullText) {
        console.warn(`[Gemini] ${model} empty response`);
        break;
      }

      console.log(`[Gemini] ✓ ${model} responded (${fullText.length} chars)`);
      return fullText;
    }
  }

  throw new Error("OVERLOADED: All Gemini models busy. Please try again in 30 seconds.");
}

// ─── Main route handler ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "Too many requests. Wait 1 minute." }, { status: 429 });
  }

  let body: { url?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const url = (body.url ?? "").trim();
  if (!url) return NextResponse.json({ success: false, error: "URL is required." }, { status: 400 });
  if (!isValidUrl(url)) {
    return NextResponse.json({ success: false, error: "Unsupported store. Use Amazon, Flipkart, Myntra, Snapdeal, or Meesho." }, { status: 400 });
  }

  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey || !apiKey.startsWith("AIza")) {
    return NextResponse.json({ success: false, error: "GEMINI_API_KEY missing or invalid. Check .env.local and restart." }, { status: 500 });
  }

  const platform = detectPlatform(url);
  const currency  = detectCurrency(url);
  const category  = detectCategory(url);

  try {
    const rawText = await callGemini(buildPrompt(url, platform, currency, category), apiKey);

    let jsonStr: string;
    try {
      jsonStr = extractJSON(rawText);
    } catch {
      console.error("[parse] Could not extract JSON from:\n", rawText.slice(0, 500));
      return NextResponse.json({ success: false, error: "AI returned unexpected format. Please try again." }, { status: 502 });
    }

    let data: unknown;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("[parse] JSON.parse failed:", parseErr, "\nInput:", jsonStr.slice(0, 300));
      return NextResponse.json({ success: false, error: "AI returned malformed JSON. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyze] Error:", msg);

    if (msg.startsWith("API_KEY_ERROR"))  return NextResponse.json({ success: false, error: "Gemini API key invalid. Get a new one at https://aistudio.google.com/app/apikey" }, { status: 401 });
    if (msg.startsWith("NETWORK_ERROR"))  return NextResponse.json({ success: false, error: "Cannot reach Google servers. Check internet." }, { status: 503 });
    if (msg.startsWith("OVERLOADED"))     return NextResponse.json({ success: false, error: "Gemini is overloaded right now. Wait 30 seconds and try again." }, { status: 503 });
    return NextResponse.json({ success: false, error: `Error: ${msg.slice(0, 150)}` }, { status: 500 });
  }
}
