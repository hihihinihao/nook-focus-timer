import { useTimer } from '../../hooks/useTimer';
import styles from './TimerControls.module.css';

export function TimerControls() {
  const { state, dispatch } = useTimer();
  const { phase } = state;

  const isIdle = phase === 'idle';
  const isRunning = phase === 'working' || phase === 'break';
  const isPaused = phase === 'paused';

  return (
    <div className={styles.controls}>
      {/* Reset — always visible when not idle */}
      {!isIdle && (
        <button
          className={`${styles.btn} ${styles.secondary}`}
          onClick={() => dispatch({ type: 'RESET' })}
        >
          Reset
        </button>
      )}

      {/* Main button: Start / Pause */}
      {isRunning && (
        <button
          className={`${styles.btn} ${styles.primary} ${styles.pause}`}
          onClick={() => dispatch({ type: 'PAUSE' })}
        >
          Pause
        </button>
      )}

      {(isIdle || isPaused) && (
        <button
          className={`${styles.btn} ${styles.primary} ${styles.start}`}
          onClick={() => dispatch({ type: 'START' })}
        >
          {isPaused ? 'Resume' : 'Start'}
        </button>
      )}

      {/* Skip — available during work or break */}
      {isRunning && (
        <button
          className={`${styles.btn} ${styles.skip}`}
          onClick={() => dispatch({ type: 'SKIP' })}
        >
          Skip
        </button>
      )}
    </div>
  );
}
