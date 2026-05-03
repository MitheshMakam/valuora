import styles from "./ErrorBox.module.css";

export default function ErrorBox({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className={styles.box}>
      <span className={styles.icon}>⚠</span>
      <span className={styles.msg}>{message}</span>
      <button className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}
