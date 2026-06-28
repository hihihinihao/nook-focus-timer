import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../core/timer-engine';
import styles from './Timer.module.css';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Timer() {
  const { state } = useTimer();
  const {
    phase,
    remainingSeconds,
    elapsedSeconds,
    totalSeconds,
    sessionsSinceLongBreak,
    config,
  } = state;

  const isWorking = phase === 'working';
  const isBreak = phase === 'break';
  const isPaused = phase === 'paused';
  const isLongBreak =
    phase === 'break' && sessionsSinceLongBreak >= config.sessionsBeforeLongBreak;

  // Determine current mode and display value
  const mode = isBreak ? config.breakMode : config.workMode;
  const isCountUp = mode === 'countup';

  // Display seconds: elapsed in countup, remaining in countdown
  const displaySeconds = isCountUp ? elapsedSeconds : remainingSeconds;

  // Progress ring: how much of the target is covered
  // In countup mode, clamp to 1.0 for the ring (overtime shown via color)
  const progressRaw = totalSeconds > 0
    ? (isCountUp ? elapsedSeconds / totalSeconds : (totalSeconds - remainingSeconds) / totalSeconds)
    : 0;
  const progress = Math.min(progressRaw, 1);
  const isOvertime = isCountUp && progressRaw > 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Phase label
  const phaseLabel = (() => {
    switch (phase) {
      case 'idle': return 'Ready';
      case 'working': return isCountUp ? 'Focus ↑' : 'Focus';
      case 'paused': return 'Paused';
      case 'break': return isLongBreak ? 'Long Break' : 'Break';
    }
  })();

  // Ring color classes
  const ringColorClass = isBreak
    ? styles.breakPhase
    : isOvertime
      ? styles.overtimePhase
      : '';

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
          {(phase === 'working' || phase === 'break') && (
            <circle
              className={`${styles.ringProgress} ${ringColorClass}`}
              cx="140"
              cy="140"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          )}
        </svg>

        {/* Time display */}
        <div className={styles.countdown}>
          <span className={styles.time}>
            {formatTime(displaySeconds)}
          </span>
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
