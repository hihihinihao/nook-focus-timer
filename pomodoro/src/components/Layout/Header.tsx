import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.icon}>🍅</span>
        <span className={styles.brand}>Pomodoro</span>
      </div>
      <span className={styles.subtitle}>Stay focused</span>
    </header>
  );
}
