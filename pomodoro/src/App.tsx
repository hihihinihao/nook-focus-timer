import { useState, useEffect, useMemo } from 'react';
import { TimerProvider } from './context/TimerContext';
import { useTimer } from './hooks/useTimer';
import { useDraggable, type DockPosition } from './hooks/useDraggable';
import { formatTime } from './core/timer-engine';
import { Header, type Page } from './components/Layout/Header';
import { StatsBar } from './components/StatsBar/StatsBar';
import { TodoList } from './components/TodoList/TodoList';
import { Timer } from './components/Timer/Timer';
import { TimerControls } from './components/Timer/TimerControls';
import { Settings } from './components/Settings/Settings';
import { SessionLog } from './components/SessionLog/SessionLog';
import { ExportButton } from './components/ExportButton/ExportButton';
import { DockZone } from './components/DockZone/DockZone';
import { CalendarHeatmap } from './components/CalendarHeatmap/CalendarHeatmap';
import { DayDetail } from './components/CalendarHeatmap/DayDetail';
import * as storage from './core/storage';
import { loadSessionsForDates } from './core/statistics';
import type { TodoItem } from './core/types';
import styles from './App.module.css';

const DOCK_STORAGE_KEY = 'nook_dock_position';

function loadDockPosition(): DockPosition {
  try {
    const stored = localStorage.getItem(DOCK_STORAGE_KEY);
    if (stored === 'left' || stored === 'right' || stored === 'bottom') return stored;
  } catch { /* noop */ }
  return 'bottom';
}

function saveDockPosition(pos: DockPosition) {
  try {
    localStorage.setItem(DOCK_STORAGE_KEY, pos);
  } catch { /* noop */ }
}

function useMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return mobile;
}

type Theme = 'dark' | 'warm' | 'light';
const THEME_KEY = 'nook_theme';
const THEME_CYCLE: Theme[] = ['dark', 'warm', 'light'];

function loadTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'dark' || v === 'warm' || v === 'light') return v;
  } catch { /* noop */ }
  return 'dark';
}

function saveTheme(t: Theme) {
  try { localStorage.setItem(THEME_KEY, t); } catch { /* noop */ }
}

function AppContent() {
  const { state } = useTimer();
  const { phase, remainingSeconds, elapsedSeconds, config } = state;
  const [activeTab, setActiveTab] = useState<Page>('timer');
  const [dockPosition, setDockPosition] = useState<DockPosition>(loadDockPosition);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [todosVersion, setTodosVersion] = useState(0);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const isMobile = useMobile();
  const dragEnabled = !isMobile;

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  // Load all session data for calendar & stats
  const allSessionsByDate = useMemo(() => {
    const keys = storage.getAllDateKeys();
    return loadSessionsForDates(keys);
  }, [state.completedSessions]);

  // Build todos-by-date map for calendar dots
  const todosByDate = useMemo(() => {
    const map = new Map<string, TodoItem[]>();
    const allTodos = storage.loadTodos();
    for (const t of allTodos) {
      if (t.dueDate) {
        const list = map.get(t.dueDate) || [];
        list.push(t);
        map.set(t.dueDate, list);
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todosVersion, state.completedSessions]);

  const { isDragging, activeZone, dragHandlers } = useDraggable({
    position: dockPosition,
    onDock: (pos) => {
      setDockPosition(pos);
      saveDockPosition(pos);
    },
    enabled: dragEnabled,
  });

  // Update document title — show count-up time when in that mode
  useEffect(() => {
    const isWorkCountUp = config.workMode === 'countup';
    const isBreakCountUp = config.breakMode === 'countup';
    const displaySeconds =
      (phase === 'working' && isWorkCountUp) || (phase === 'break' && isBreakCountUp)
        ? elapsedSeconds
        : remainingSeconds;
    const timeStr = formatTime(displaySeconds);
    const arrow = ((phase === 'working' && isWorkCountUp) || (phase === 'break' && isBreakCountUp))
      ? '↑'
      : '';

    switch (phase) {
      case 'working':
        document.title = `🍅 ${timeStr}${arrow} — Focus`;
        break;
      case 'break':
        document.title = `☕ ${timeStr}${arrow} — Break`;
        break;
      case 'paused':
        document.title = `⏸ ${timeStr} — Paused`;
        break;
      default:
        document.title = '🍅 Nook';
    }
  }, [phase, remainingSeconds, elapsedSeconds, config.workMode, config.breakMode]);

  return (
    <div className={styles.app}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onThemeChange={cycleTheme}
      />

      {/* Dock zone overlay (shown during drag) */}
      <DockZone
        isDragging={isDragging}
        activeZone={activeZone}
        currentPosition={dockPosition}
      />

      {activeTab === 'timer' ? (
        /* ---- Timer page ---- */
        <main
          className={`${styles.main} ${styles[`dock_${dockPosition}`]}`}
        >
          <div className={styles.timerArea}>
            <Timer />
            <TimerControls />
            <Settings />
          </div>
          <TodoList
            dragHandlers={dragEnabled ? dragHandlers : undefined}
            isDragging={isDragging}
            dockPosition={dockPosition}
          />
        </main>
      ) : (
        /* ---- Stats page ---- */
        <main className={styles.main}>
          <StatsBar />
          <CalendarHeatmap
            sessionsByDate={allSessionsByDate}
            todosByDate={todosByDate}
            selectedDate={selectedDate}
            onSelectDate={(dk) =>
              setSelectedDate((prev) => (prev === dk ? null : dk))
            }
          />
          {selectedDate && (
            <DayDetail
              dateKey={selectedDate}
              onClose={() => setSelectedDate(null)}
              onTodosChange={() => setTodosVersion((v) => v + 1)}
            />
          )}
          <SessionLog />
          <ExportButton />
        </main>
      )}
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
