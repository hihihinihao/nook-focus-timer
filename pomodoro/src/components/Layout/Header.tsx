import styles from './Header.module.css';

export type Page = 'timer' | 'stats';
type Theme = 'dark' | 'warm' | 'light';

const THEME_ICON: Record<Theme, string> = {
  dark: '🌙',
  warm: '🔥',
  light: '☀️',
};

interface HeaderProps {
  activeTab: Page;
  onTabChange: (tab: Page) => void;
  theme: Theme;
  onThemeChange: () => void;
}

export function Header({ activeTab, onTabChange, theme, onThemeChange }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.icon}>🍅</span>
        <span className={styles.brand}>Nook</span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.themeBtn}
          onClick={onThemeChange}
          title={`Theme: ${theme}`}
        >
          {THEME_ICON[theme]}
        </button>

        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'timer' ? styles.active : ''}`}
            onClick={() => onTabChange('timer')}
          >
            ⏱ Timer
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
            onClick={() => onTabChange('stats')}
          >
            📊 Stats
          </button>
        </nav>
      </div>
    </header>
  );
}
