// ============================================================
// Pure TypeScript types — zero framework imports.
// These are shared between the timer engine, storage, and UI.
// ============================================================

/** Which phase the timer is currently in */
export type TimerPhase = 'idle' | 'working' | 'paused' | 'break';

/** User-configurable timer settings */
export interface TimerConfig {
  /** Work session duration in seconds (default 25 min = 1500) */
  workDuration: number;
  /** Break duration in seconds (default 5 min = 300) */
  breakDuration: number;
  /** Long break duration in seconds (default 15 min = 900) */
  longBreakDuration: number;
  /** Number of work sessions before a long break (default 4) */
  sessionsBeforeLongBreak: number;
}

export const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

/** A read-only snapshot of the timer's current state */
export interface TimerState {
  phase: TimerPhase;
  /** Seconds remaining in the current phase */
  remainingSeconds: number;
  /** Total seconds for the current phase (work or break) */
  totalSeconds: number;
  /** Number of work sessions completed today */
  completedSessions: number;
  /** Number of work sessions since last long break */
  sessionsSinceLongBreak: number;
  /** Active config snapshot */
  config: TimerConfig;
}

/** A completed Pomodoro session record */
export interface Session {
  /** ISO timestamp when the session ended */
  endedAt: string;
  /** Duration of the work session in seconds */
  duration: number;
}

/** Callback invoked on every state change */
export type TimerListener = (state: TimerState) => void;

/** Callback invoked on timer phase transitions */
export type TimerEventCallback = (event: TimerEvent) => void;

export type TimerEvent =
  | { type: 'started' }
  | { type: 'paused' }
  | { type: 'resumed' }
  | { type: 'reset' }
  | { type: 'work_complete'; session: Session }
  | { type: 'break_complete' }
  | { type: 'tick'; remainingSeconds: number };
