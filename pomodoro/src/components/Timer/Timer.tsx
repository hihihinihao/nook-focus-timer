import { useState, useEffect, useRef } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../core/timer-engine';
import styles from './Timer.module.css';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const WELCOME = [
  'Ready when you are.',
  'Welcome back.',
  'Let\'s begin.',
];

const PRAISE = [
  'Nice.',
  'Well done.',
  'Take a sip of water.',
  'Time to rest.',
  'Breathe.',
  'One step forward.',
  'You kept your promise.',
];

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

  const isIdle = phase === 'idle';
  const isBreak = phase === 'break';
  const isPaused = phase === 'paused';
  const isLongBreak =
    phase === 'break' && sessionsSinceLongBreak >= config.sessionsBeforeLongBreak;

  const mode = isBreak ? config.breakMode : config.workMode;
  const isCountUp = mode === 'countup';

  const displaySeconds = isCountUp ? elapsedSeconds : remainingSeconds;

  const progressRaw = totalSeconds > 0
    ? (isCountUp ? elapsedSeconds / totalSeconds : (totalSeconds - remainingSeconds) / totalSeconds)
    : 0;
  const progress = Math.min(progressRaw, 1);
  const isOvertime = isCountUp && progressRaw > 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const phaseLabel = (() => {
    switch (phase) {
      case 'idle': return 'Ready';
      case 'working': return isCountUp ? 'Focus ↑' : 'Focus';
      case 'paused': return 'Paused';
      case 'break': return isLongBreak ? 'Long Break' : 'Break';
    }
  })();

  const ringColorClass = isBreak
    ? styles.breakPhase
    : isOvertime
      ? styles.overtimePhase
      : '';

  // ---- Status message ----
  const [showCheck, setShowCheck] = useState(false);
  const [showPraise, setShowPraise] = useState(false);
  const [welcome] = useState(() => WELCOME[Math.floor(Math.random() * WELCOME.length)]);
  const [praise, setPraise] = useState('');
  const prevSessions = useRef(state.completedSessions);
  const prevPhase = useRef(phase);

  useEffect(() => {
    const workDone = state.completedSessions > prevSessions.current;
    const breakDone = prevPhase.current === 'break' && phase === 'idle';
    prevSessions.current = state.completedSessions;
    prevPhase.current = phase;

    if (workDone || breakDone) {
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      setShowCheck(true);
      setShowPraise(true);
      const t1 = setTimeout(() => setShowCheck(false), 800);
      const t2 = setTimeout(() => setShowPraise(false), 5000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [state.completedSessions, phase]);

  const statusText = showPraise ? praise : isIdle ? welcome : '';

  // Session dots
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
      <div className={`${styles.ring} ${showCheck ? styles.ringGlow : ''}`}>
        {/* Status message — floats above ring, never affects layout */}
        <div className={`${styles.statusMsg} ${statusText ? styles.statusShow : ''}`}>
          {statusText}
        </div>

        <svg className={styles.ringSvg} viewBox="0 0 280 280">
          <circle className={styles.ringBg} cx="140" cy="140" r={RADIUS} />
          {(phase === 'working' || phase === 'break') && (
            <circle
              className={`${styles.ringProgress} ${ringColorClass}`}
              cx="140" cy="140" r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          )}
        </svg>

        <div className={styles.countdown}>
          <span className={`${styles.time} ${showCheck ? styles.timeBright : ''}`}>
            {formatTime(displaySeconds)}
          </span>
          <span className={styles.phaseLabel}>{phaseLabel}</span>
          {/* Checkmark — absolute, outside flex flow */}
          <span className={`${styles.checkmark} ${showCheck ? styles.checkmarkShow : ''}`}>✓</span>
        </div>
      </div>

      <div className={styles.sessionInfo}>
        {dots}
      </div>
    </div>
  );
}
