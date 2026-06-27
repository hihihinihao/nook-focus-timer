import { useTimer } from '../../hooks/useTimer';
import styles from './SessionLog.module.css';

/** Format an ISO timestamp to a readable time (e.g. "14:32") */
function formatTimeFromISO(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '--:--';
  }
}

/** Format seconds as "Xm" or "Xm Ys" */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export function SessionLog() {
  const { todaySessions } = useTimer();

  const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Today's Sessions</h3>

      {todaySessions.length === 0 ? (
        <p className={styles.empty}>No sessions yet. Start your first Pomodoro!</p>
      ) : (
        <>
          <ul className={styles.list}>
            {todaySessions.map((s, i) => (
              <li key={i} className={styles.item}>
                <span>#{i + 1}</span>
                <span className={styles.itemTime}>{formatTimeFromISO(s.endedAt)}</span>
                <span className={styles.itemDuration}>{formatDuration(s.duration)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.summary}>
            <span>Total focus time</span>
            <span className={styles.summaryCount}>
              {Math.round(totalMinutes)} min
            </span>
          </div>
        </>
      )}
    </div>
  );
}
