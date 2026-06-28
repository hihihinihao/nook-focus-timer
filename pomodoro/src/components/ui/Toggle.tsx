import styles from './ui.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}
