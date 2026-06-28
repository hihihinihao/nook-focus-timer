import { useTimer } from '../../hooks/useTimer';
import { Button } from '../ui/Button';
import styles from './TimerControls.module.css';

export function TimerControls() {
  const { state, dispatch } = useTimer();
  const { phase, config } = state;

  const isIdle = phase === 'idle';
  const isRunning = phase === 'working' || phase === 'break';
  const isPaused = phase === 'paused';
  const isBreak = phase === 'break';

  const mode = isBreak ? config.breakMode : config.workMode;
  const isCountUp = mode === 'countup';

  return (
    <div className={styles.controls}>
      {!isIdle && (
        <Button variant="secondary" onClick={() => dispatch({ type: 'RESET' })}>
          Reset
        </Button>
      )}

      {isRunning && (
        <Button variant="primary" className={styles.pause} onClick={() => dispatch({ type: 'PAUSE' })}>
          Pause
        </Button>
      )}

      {(isIdle || isPaused) && (
        <Button variant="primary" onClick={() => dispatch({ type: 'START' })}>
          {isPaused ? 'Resume' : 'Start'}
        </Button>
      )}

      {isRunning && (
        <Button variant="ghost" onClick={() => dispatch({ type: isCountUp ? 'COMPLETE' : 'SKIP' })}>
          {isCountUp ? 'Complete' : 'Skip'}
        </Button>
      )}
    </div>
  );
}
