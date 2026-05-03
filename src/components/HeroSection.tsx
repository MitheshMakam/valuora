import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        Powered by Gemini AI · Free · Real-time Analysis
      </div>
      <h1 className={styles.h1}>
        Stop Guessing.<br />
        <em>Start Deciding.</em>
      </h1>
      <p className={styles.subtitle}>
        Paste any Amazon or Flipkart product URL and get an instant AI verdict —
        <strong> BUY, WAIT, or AVOID</strong> — backed by price intelligence, review analysis,
        and trust scoring.
      </p>
      <div className={styles.featurePills}>
        {["Price Intelligence", "AI Review Analysis", "Fake Review Detection", "Price Prediction", "Smart Alternatives", "Trust Score"].map((f) => (
          <span key={f} className={styles.pill}>{f}</span>
        ))}
      </div>
    </section>
  );
}
