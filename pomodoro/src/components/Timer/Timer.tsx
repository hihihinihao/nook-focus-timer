import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../core/timer-engine';
import styles from './Timer.module.css';

/** SVG ring constants */
const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~816.8

export function Timer() {
  const { state } = useTimer();
  const { phase, remainingSeconds, totalSeconds, completedSessions, sessionsSinceLongBreak, config } = state;

  // Progress: how much of the current phase is complete
  const elapsed = totalSeconds - remainingSeconds;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const isBreak = phase === 'break';
  const isPaused = phase === 'paused';
  const isLongBreak =
    phase === 'break' && sessionsSinceLongBreak >= config.sessionsBeforeLongBreak;

  // Phase label
  const phaseLabel = (() => {
    switch (phase) {
      case 'idle': return 'Ready';
      case 'working': return 'Focus';
      case 'paused': return 'Paused';
      case 'break': return isLongBreak ? 'Long Break' : 'Break';
    }
  })();

  // Session dots — show progress toward long break
  const dots = Array.from({ length: config.sessionsBeforeLongBreak }, (_, i) => {
    const done = i < sessionsSinceLongBreak;
    return (
      <div
        key={i}
        className={`${styles.sessionDot} ${done ? styles.completed : ''}`}
      />
    );
  });

  return (
    <div className={`${styles.container} ${isPaused ? styles.paused : ''}`}>
      {/* Circular progress ring */}
      <div className={styles.ring}>
        <svg className={styles.ringSvg} viewBox="0 0 280 280">
          <circle
            className={styles.ringBg}
            cx="140"
            cy="140"
            r={RADIUS}
          />
          <circle
            className={`${styles.ringProgress} ${isBreak ? styles.breakPhase : ''}`}
            cx="140"
            cy="140"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Countdown text */}
        <div className={styles.countdown}>
          <span className={styles.time}>{formatTime(remainingSeconds)}</span>
          <span className={styles.phaseLabel}>{phaseLabel}</span>
        </div>
      </div>

      {/* Session dots */}
      <div className={styles.sessionInfo}>
        {dots}
      </div>
    </div>
  );
}
