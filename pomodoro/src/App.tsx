import { useEffect } from 'react';
import { TimerProvider } from './context/TimerContext';
import { useTimer } from './hooks/useTimer';
import { formatTime } from './core/timer-engine';
import { Header } from './components/Layout/Header';
import { Timer } from './components/Timer/Timer';
import { TimerControls } from './components/Timer/TimerControls';
import { Settings } from './components/Settings/Settings';
import { SessionLog } from './components/SessionLog/SessionLog';
import styles from './App.module.css';

function AppContent() {
  const { state } = useTimer();
  const { phase, remainingSeconds } = state;

  // Update document title with remaining time
  useEffect(() => {
    const timeStr = formatTime(remainingSeconds);
    switch (phase) {
      case 'working':
        document.title = `🍅 ${timeStr} — Focus`;
        break;
      case 'break':
        document.title = `☕ ${timeStr} — Break`;
        break;
      case 'paused':
        document.title = `⏸ ${timeStr} — Paused`;
        break;
      default:
        document.title = '🍅 Pomodoro';
    }
  }, [phase, remainingSeconds]);

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Timer />
        <TimerControls />
        <div className={styles.sidePanels}>
          <Settings />
          <SessionLog />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TimerProvider>
      <AppContent />
    </TimerProvider>
  );
}
