// ============================================================
// Pure TypeScript types — zero framework imports.
// These are shared between the timer engine, storage, and UI.
// ============================================================

/** Which phase the timer is currently in */
export type TimerPhase = 'idle' | 'working' | 'paused' | 'break';

/** Counting direction for a phase */
export type TimerMode = 'countdown' | 'countup';

/** User-configurable timer settings */
export interface TimerConfig {
  /** Work session duration in seconds (default 25 min = 1500) */
  workDuration: number;
  /** Counting mode for work phase */
  workMode: TimerMode;
  /** Break duration in seconds (default 5 min = 300) */
  breakDuration: number;
  /** Counting mode for break phase */
  breakMode: TimerMode;
  /** In count-up work mode: auto-switch to break when reaching target? */
  workAutoSwitch: boolean;
  /** In count-up break mode: auto-switch to idle when reaching target? */
  breakAutoSwitch: boolean;
  /** Long break duration in seconds (default 15 min = 900) */
  longBreakDuration: number;
  /** Number of work sessions before a long break (default 4) */
  sessionsBeforeLongBreak: number;
  /** Show desktop notifications on phase transitions */
  enableNotifications: boolean;
  /** Auto-start next focus session after break ends */
  autoStartWork: boolean;
}

export const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25 * 60,
  workMode: 'countdown',
  workAutoSwitch: true,
  breakDuration: 5 * 60,
  breakMode: 'countdown',
  breakAutoSwitch: true,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  enableNotifications: true,
  autoStartWork: false,
};

/** Work duration presets (in minutes) for quick-select */
export const WORK_PRESETS = [15, 25, 45, 60];

/** A read-only snapshot of the timer's current state */
export interface TimerState {
  phase: TimerPhase;
  /** Seconds remaining in the current phase (countdown) */
  remainingSeconds: number;
  /** Seconds elapsed in the current phase (countup) */
  elapsedSeconds: number;
  /** Total seconds for the current phase (target duration) */
  totalSeconds: number;
  /** Number of work sessions completed today */
  completedSessions: number;
  /** Number of work sessions since last long break */
  sessionsSinceLongBreak: number;
  /** Active config snapshot */
  config: TimerConfig;
}

/** A single todo item */
export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  /** Optional due date (YYYY-MM-DD) for calendar integration */
  dueDate?: string;
}

/** A completed Nook focus session record */
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
  | { type: 'tick'; remainingSeconds: number; elapsedSeconds: number };
