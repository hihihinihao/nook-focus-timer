import { useState } from 'react';
import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.section} ${open ? styles.open : ''}`}>
      <button
        className={styles.header}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className={styles.headerLeft}>
          <span className={`${styles.chevron} ${open ? styles.rotated : ''}`}>
            ▶
          </span>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.title}>{title}</span>
        </span>
        {badge !== undefined && badge > 0 && (
          <span className={styles.badge}>{badge}</span>
        )}
      </button>
      <div className={`${styles.body} ${open ? styles.bodyOpen : ''}`}>
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}
