import type { DockPosition } from '../../hooks/useDraggable';
import styles from './DockZone.module.css';

interface DockZoneProps {
  isDragging: boolean;
  activeZone: DockPosition | null;
  currentPosition: DockPosition;
}

const ZONES: { pos: DockPosition; label: string }[] = [
  { pos: 'left', label: 'Left' },
  { pos: 'bottom', label: 'Bottom' },
  { pos: 'right', label: 'Right' },
];

export function DockZone({ isDragging, activeZone, currentPosition }: DockZoneProps) {
  if (!isDragging) return null;

  return (
    <div className={styles.overlay}>
      {ZONES.map(({ pos, label }) => {
        const isActive = activeZone === pos;
        const isCurrent = currentPosition === pos;
        return (
          <div
            key={pos}
            className={`${styles.zone} ${styles[pos]} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.label}>
              {label}
              {isCurrent && <span className={styles.currentMark}> (current)</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
