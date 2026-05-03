import styles from "./LoadingState.module.css";

const STEPS = [
  { icon: "🔍", label: "Fetching product data from URL" },
  { icon: "💰", label: "Analyzing price history & deals" },
  { icon: "🧠", label: "Processing reviews with AI" },
  { icon: "⚡", label: "Computing decision scores" },
  { icon: "✓",  label: "Generating final verdict" },
];

export default function LoadingState({ step }: { step: number }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.orb}>
        <div className={styles.orbRing1} />
        <div className={styles.orbRing2} />
        <div className={styles.orbCore}>⚡</div>
      </div>
      <p className={styles.title}>Analyzing product…</p>
      <p className={styles.subtitle}>Claude is researching price, reviews, and trust signals</p>
      <div className={styles.steps}>
        {STEPS.map((s, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "active" : "pending";
          return (
            <div key={i} className={`${styles.step} ${styles[state]}`}>
              <span className={styles.stepIcon}>
                {state === "done" ? "✓" : s.icon}
              </span>
              <span className={styles.stepLabel}>{s.label}</span>
              {state === "active" && <span className={styles.stepSpinner} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
