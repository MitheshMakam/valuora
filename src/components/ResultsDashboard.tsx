"use client";

import { useEffect, useRef } from "react";
import type { AnalysisResult } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import styles from "./ResultsDashboard.module.css";

interface Props { data: AnalysisResult }

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <div className={styles.scoreTrack}>
        <div className={styles.scoreFill} style={{ width: `${value}%`, background: color }} />
      </div>
      <span className={styles.scoreVal}>{value}</span>
    </div>
  );
}

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (circumference * value) / 100;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r="38" fill="none" stroke="var(--bg4)" strokeWidth="7" />
      <circle cx="48" cy="48" r="38" fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x="48" y="52" textAnchor="middle" fontFamily="var(--font-display)"
        fontWeight="800" fontSize="19" fill="var(--text)">{value}%</text>
    </svg>
  );
}

function Sparkline({ current, low, high, avg }: { current: number; low: number; high: number; avg: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 320;
    const H = 64;
    canvas.width = W; canvas.height = H;
    const pts: number[] = [];
    const base = avg || current;
    const range = high - low || current * 0.2;
    for (let i = 0; i < 30; i++) {
      const noise = (Math.random() - 0.5) * range * 0.22;
      pts.push(Math.max(low * 0.97, Math.min(high * 1.03, base + noise)));
    }
    pts[pts.length - 1] = current;
    const mn = Math.min(...pts), mx = Math.max(...pts), rng = mx - mn || 1;
    const gx = (i: number) => (i / (pts.length - 1)) * W;
    const gy = (v: number) => H - 8 - ((v - mn) / rng) * (H - 16);
    const isDark = !document.documentElement.getAttribute("data-theme");
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, isDark ? "rgba(124,106,255,0.22)" : "rgba(91,71,240,0.14)");
    grad.addColorStop(1, "rgba(124,106,255,0)");
    ctx.beginPath();
    pts.forEach((p, i) => { i === 0 ? ctx.moveTo(gx(i), gy(p)) : ctx.lineTo(gx(i), gy(p)); });
    ctx.lineTo(gx(pts.length - 1), H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => { i === 0 ? ctx.moveTo(gx(i), gy(p)) : ctx.lineTo(gx(i), gy(p)); });
    ctx.strokeStyle = isDark ? "rgba(124,106,255,0.85)" : "rgba(91,71,240,0.7)";
    ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
    const lx = gx(pts.length - 1), ly = gy(pts[pts.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "#7c6aff" : "#5b47f0"; ctx.fill();
  }, [current, low, high, avg]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 64, marginTop: 12 }} />;
}

export default function ResultsDashboard({ data }: Props) {
  const { product: p, priceAnalysis: pa, aiReviewAnalysis: ai, decision: d,
          pricePrediction: pp, smartAlternatives: alts, regretAnalysis, trustScore: ts } = data;

  const v = d.verdict.toLowerCase() as "buy" | "wait" | "avoid";
  const verdictColors = { buy: "var(--green)", wait: "var(--amber)", avoid: "var(--red)" };
  const verdictEmoji  = { buy: "✓ BUY", wait: "⏳ WAIT", avoid: "✗ AVOID" };
  const dealCls = { "Good Deal": styles.good, "Average": styles.avg, "Overpriced": styles.over };
  const cur = p.currency || "₹";

  return (
    <div className={styles.wrapper}>

      {/* ── VERDICT ── */}
      <div className={`${styles.verdictCard} ${styles[v]}`}>
        <div className={styles.verdictTop}>
          <div className={styles.verdictLeft}>
            <div className={styles.verdictMeta}>FINAL VERDICT · {p.platform}</div>
            <div className={`${styles.verdictBadge} ${styles[v]}`}>{verdictEmoji[v]}</div>
            <p className={styles.verdictReason}>{d.reason}</p>
            <div className={styles.scoreBars}>
              <ScoreBar label="Price Score"  value={d.priceScore}  color="var(--blue)" />
              <ScoreBar label="Review Score" value={d.reviewScore} color="var(--accent)" />
              <ScoreBar label="Rating Score" value={d.ratingScore} color="var(--green)" />
            </div>
          </div>
          <div className={styles.ringWrap}>
            <ConfidenceRing value={d.confidence} color={verdictColors[v]} />
            <div className={styles.ringLabel}>CONFIDENCE</div>
          </div>
        </div>
      </div>

      {/* ── ROW: PRODUCT + PRICE ── */}
      <div className={styles.grid2}>
        {/* Product */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>📦</span> PRODUCT INFO</div>
          <div className={styles.productName}>{p.name}</div>
          <div className={styles.platformTag}>🛒 {p.platform}</div>
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(p.currentPrice, cur)}</span>
            {p.mrp > p.currentPrice && (
              <>
                <span className={styles.mrp}>{formatPrice(p.mrp, cur)}</span>
                <span className={styles.discount}>{p.discountPercent || Math.round((p.mrp - p.currentPrice) / p.mrp * 100)}% off</span>
              </>
            )}
          </div>
          <div className={styles.ratingRow}>
            <span className={styles.stars}>{"★".repeat(Math.floor(p.rating))}{p.rating % 1 >= 0.5 ? "½" : ""}</span>
            <span className={styles.ratingVal}>{p.rating}</span>
            <span className={styles.ratingCount}>({p.reviewCount.toLocaleString()} reviews)</span>
          </div>
          <div className={styles.categoryTag}>{p.category}</div>
        </div>

        {/* Price Intelligence */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>💰</span> PRICE INTELLIGENCE</div>
          <div className={`${styles.dealBadge} ${dealCls[pa.deal as keyof typeof dealCls] || styles.avg}`}>{pa.deal}</div>
          <div className={styles.priceStatGrid}>
            {[
              ["All-time Low",  formatPrice(pa.allTimeLow, cur)],
              ["All-time High", formatPrice(pa.allTimeHigh, cur)],
              ["30-day Avg",    formatPrice(pa.avgPrice30d, cur)],
              ["Deal Score",    `${pa.dealScore}/100`],
            ].map(([k, v2]) => (
              <div key={k} className={styles.priceStat}>
                <div className={styles.priceStatLabel}>{k}</div>
                <div className={styles.priceStatVal} style={k === "Deal Score" ? { color: "var(--accent)" } : {}}>{v2}</div>
              </div>
            ))}
          </div>
          {pa.isFakeDiscount && (
            <div className={styles.fakeNote}><span>⚠</span> {pa.fakeDiscountNote}</div>
          )}
          <Sparkline current={p.currentPrice} low={pa.allTimeLow} high={pa.allTimeHigh} avg={pa.avgPrice30d} />
          <div className={styles.sparkLabel}>30-day price trend</div>
        </div>
      </div>

      {/* ── AI REVIEWS ── */}
      <div className={styles.card} style={{ marginBottom: 20 }}>
        <div className={styles.cardTitle}><span>💬</span> AI REVIEW ANALYSIS</div>
        <div className={styles.proscons}>
          <div>
            <div className={styles.sectionTitle} style={{ color: "var(--green)" }}>↑ PROS</div>
            <ul className={styles.prosList}>
              {ai.pros.map((pr, i) => <li key={i}>{pr}</li>)}
            </ul>
          </div>
          <div>
            <div className={styles.sectionTitle} style={{ color: "var(--red)" }}>↓ CONS</div>
            <ul className={styles.consList}>
              {ai.cons.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
            {ai.longTermIssue && (
              <div className={styles.infoNote}><span>⏳</span> <strong>Long-term:</strong> {ai.longTermIssue}</div>
            )}
          </div>
        </div>
        {ai.mostCommonComplaint && (
          <div className={styles.complaintNote}><span>⚠</span> <strong>Most common complaint:</strong> {ai.mostCommonComplaint}</div>
        )}
      </div>

      {/* ── ROW 3: TRUST + PREDICTION + FAKE ── */}
      <div className={styles.grid3}>
        {/* Trust Score */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>🛡</span> TRUST SCORE</div>
          <div className={styles.trustBig} style={{ color: ts.score >= 75 ? "var(--green)" : ts.score >= 50 ? "var(--amber)" : "var(--red)" }}>
            {ts.score}
          </div>
          <div className={styles.trustLabel}>{ts.label}</div>
          {[
            ["Fake Reviews",      ts.fakeReviewPercent + "%"],
            ["Verified Buyers",   ts.verifiedBuyerPercent + "%"],
            ["Seller Rating",     ts.sellerRating],
            ["Consistency",       ts.reviewConsistency],
          ].map(([k, v2]) => (
            <div key={k} className={styles.trustRow}>
              <span>{k}</span><span className={styles.trustVal}>{v2}</span>
            </div>
          ))}
        </div>

        {/* Price Prediction */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>📈</span> PRICE PREDICTION</div>
          <div className={`${styles.predBadge} ${styles[pp.direction]}`}>
            {{ drop: "↓ Price likely to DROP", rise: "↑ Price likely to RISE", stable: "→ Price STABLE" }[pp.direction]}
          </div>
          <p className={styles.predText}>{pp.reasoning}</p>
          <div className={styles.predMeta}>
            <span className={styles.predMetaLabel}>Target</span>
            <span className={styles.predTarget}>{formatPrice(pp.targetPrice, cur)}</span>
          </div>
          <div className={styles.predRange}>
            Range: {formatPrice(pp.minPredicted, cur)} – {formatPrice(pp.maxPredicted, cur)}
          </div>
          <div className={styles.predWindow}>{pp.timeframeDays}-day forecast</div>
        </div>

        {/* Review Authenticity */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>🔎</span> REVIEW AUTHENTICITY</div>
          <div className={styles.authMeter}>
            <div className={styles.authFill} style={{ width: `${ts.verifiedBuyerPercent}%` }} />
          </div>
          <div className={styles.authLabels}>
            <span style={{ color: "var(--green)" }}>{ts.verifiedBuyerPercent}% Verified</span>
            <span style={{ color: "var(--red)" }}>{ts.fakeReviewPercent}% Suspicious</span>
          </div>
          <div className={styles.authNotes}>
            <div className={styles.authNote}>
              <span>📊</span> Review consistency is <strong>{ts.reviewConsistency}</strong>
            </div>
            <div className={styles.authNote}>
              <span>🏪</span> Seller rated <strong>{ts.sellerRating}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 4: REGRET + ALTERNATIVES ── */}
      <div className={styles.grid2}>
        {/* Buyer Regrets */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>⚠</span> BUYER REGRETS</div>
          <div className={styles.regretList}>
            {regretAnalysis.length > 0
              ? regretAnalysis.map((r, i) => <div key={i} className={styles.regretItem}>{r}</div>)
              : <div className={styles.noRegret}>✓ No major regrets reported by buyers.</div>}
          </div>
        </div>

        {/* Smart Alternatives */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span>🔄</span> SMART ALTERNATIVES</div>
          <div className={styles.altList}>
            {alts.map((a, i) => (
              <div key={i} className={styles.altItem}>
                <div className={styles.altRank}>{i + 1}</div>
                <div className={styles.altInfo}>
                  <div className={styles.altName}>{a.name}</div>
                  <div className={styles.altReason}>{a.reason}</div>
                </div>
                <div className={styles.altPrice}>{formatPrice(a.price, cur)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
