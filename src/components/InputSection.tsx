"use client";

import styles from "./InputSection.module.css";

const SAMPLES = [
  { label: "📱 Samsung S24 FE", url: "https://www.amazon.in/dp/B0CHX2DMQK" },
  { label: "💻 MacBook Air M2", url: "https://www.amazon.in/dp/B0B3BVWJ6X" },
  { label: "🎧 Sony WH-1000XM5", url: "https://www.amazon.in/dp/B09XS7JWHH" },
  { label: "⌚ Apple Watch SE", url: "https://www.amazon.in/dp/B0CHX3QNLT" },
  { label: "📺 Samsung 4K TV", url: "https://www.flipkart.com/samsung-108-cm-43-inch-ultra-hd-4k-led-smart-tizen-tv" },
  { label: "🖥️ Dell Monitor", url: "https://www.amazon.in/dp/B09TW5ZG6X" },
];

interface Props {
  url: string;
  onChange: (v: string) => void;
  onAnalyze: (url?: string) => void;
  disabled: boolean;
}

export default function InputSection({ url, onChange, onAnalyze, disabled }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.label}>🔗 PRODUCT URL</div>
        <div className={styles.inputRow}>
          <input
            type="url"
            className={styles.input}
            placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/..."
            value={url}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !disabled && onAnalyze()}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className={styles.btn}
            onClick={() => onAnalyze()}
            disabled={disabled}
          >
            {disabled ? (
              <span className={styles.spinner} />
            ) : (
              <span>⚡</span>
            )}
            {disabled ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        <div className={styles.supportedLabel}>Quick demos — click to load:</div>
        <div className={styles.samples}>
          {SAMPLES.map((s) => (
            <button
              key={s.url}
              className={styles.sampleChip}
              onClick={() => { onChange(s.url); onAnalyze(s.url); }}
              disabled={disabled}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.platforms}>
        <span className={styles.platformLabel}>Supported:</span>
        {["Amazon.in", "Amazon.com", "Flipkart", "Myntra", "Snapdeal", "Meesho"].map((p) => (
          <span key={p} className={styles.platformTag}>{p}</span>
        ))}
      </div>
    </div>
  );
}
