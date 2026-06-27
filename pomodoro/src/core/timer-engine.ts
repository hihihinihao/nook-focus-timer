// ============================================================
// PomodoroTimer — pure TypeScript state machine.
// ZERO imports from React, DOM, or any framework.
// Portable to any JS runtime (browser, WebView, Node).
// ============================================================

import type {
  TimerConfig,
  TimerState,
  TimerListener,
  TimerEventCallback,
  Session,
} from './types';
import { DEFAULT_CONFIG } from './types';

// ---------------------------------------------------------------------------
// Helpers (also exported — framework-free utility functions)
// ---------------------------------------------------------------------------

/** Return the date key for today (YYYY-MM-DD) */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Format seconds as MM:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// PomodoroTimer
// ---------------------------------------------------------------------------

export class PomodoroTimer {
  // ---- private state ----
  private _config: TimerConfig;
  private _phase: TimerState['phase'] = 'idle';
  private _remainingSeconds: number;
  private _completedSessions = 0;
  private _sessionsSinceLongBreak = 0;
  /** Remember which phase was active when we paused, so resume can restore it */
  private _pausedFrom: 'working' | 'break' = 'working';

  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _listeners = new Set<TimerListener>();
  private _eventCallbacks = new Set<TimerEventCallback>();

  // ---- constructor ----

  constructor(config?: Partial<TimerConfig>) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._remainingSeconds = this._config.workDuration;
  }

  // ---- public: get snapshot ----

  getState(): TimerState {
    return {
      phase: this._phase,
      remainingSeconds: this._remainingSeconds,
      totalSeconds: this._getPhaseTotal(),
      completedSessions: this._completedSessions,
      sessionsSinceLongBreak: this._sessionsSinceLongBreak,
      config: { ...this._config },
    };
  }

  // ---- public: subscribe / unsubscribe ----

  /** Subscribe to every state change. Returns an unsubscribe function. */
  subscribe(listener: TimerListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  /** Subscribe to named events (started, paused, work_complete, etc.) */
  onEvent(cb: TimerEventCallback): () => void {
    this._eventCallbacks.add(cb);
    return () => {
      this._eventCallbacks.delete(cb);
    };
  }

  // ---- public: actions ----

  /** Start a new work session from idle, or resume from paused */
  start(): void {
    if (this._phase === 'working' || this._phase === 'break') return;

    if (this._phase === 'paused') {
      // Resume to whatever phase we paused from
      this._transitionTo(this._pausedFrom);
      this._emitEvent({ type: 'resumed' });
      this._startTicking();
      return;
    }

    // Start fresh from idle
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('working');
    this._emitEvent({ type: 'started' });
    this._startTicking();
  }

  /** Pause the current work or break session */
  pause(): void {
    if (this._phase !== 'working' && this._phase !== 'break') return;
    this._pausedFrom = this._phase;
    this._stopTicking();
    this._transitionTo('paused');
    this._emitEvent({ type: 'paused' });
  }

  /** Reset timer to idle (from any state) */
  reset(): void {
    this._stopTicking();
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('idle');
    this._emitEvent({ type: 'reset' });
  }

  /** Skip the current phase — complete work early or skip break */
  skip(): void {
    if (this._phase === 'working') {
      this._stopTicking();
      this._completedSessions++;
      this._sessionsSinceLongBreak++;
      const session: Session = {
        endedAt: new Date().toISOString(),
        duration: this._config.workDuration - this._remainingSeconds,
      };
      this._emitEvent({ type: 'work_complete', session });
      this._startBreak();
    } else if (this._phase === 'break') {
      this._stopTicking();
      this._emitEvent({ type: 'break_complete' });
      this._transitionToIdle();
    }
  }

  /** Update config — resets timer to idle with new settings */
  updateConfig(partial: Partial<TimerConfig>): void {
    this._stopTicking();
    this._config = { ...this._config, ...partial };
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('idle');
  }

  /** Clean up the interval. Call before discarding the instance. */
  destroy(): void {
    this._stopTicking();
    this._listeners.clear();
    this._eventCallbacks.clear();
  }

  // ---- private: ticking ----

  private _startTicking(): void {
    if (this._intervalId !== null) return;
    this._intervalId = setInterval(() => this._tick(), 1000);
  }

  private _stopTicking(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  private _tick(): void {
    if (this._phase !== 'working' && this._phase !== 'break') {
      this._stopTicking();
      return;
    }

    this._remainingSeconds--;

    if (this._remainingSeconds <= 0) {
      this._remainingSeconds = 0;
      this._stopTicking();

      if (this._phase === 'working') {
        this._completedSessions++;
        this._sessionsSinceLongBreak++;
        const session: Session = {
          endedAt: new Date().toISOString(),
          duration: this._config.workDuration,
        };
        this._emitEvent({ type: 'work_complete', session });
        this._startBreak();
      } else {
        this._emitEvent({ type: 'break_complete' });
        this._transitionToIdle();
      }
    }

    // Always notify listeners on tick
    this._notifyListeners();
    this._emitEvent({ type: 'tick', remainingSeconds: this._remainingSeconds });
  }

  private _startBreak(): void {
    const isLongBreak =
      this._sessionsSinceLongBreak >= this._config.sessionsBeforeLongBreak;
    this._remainingSeconds = isLongBreak
      ? this._config.longBreakDuration
      : this._config.breakDuration;
    if (isLongBreak) {
      this._sessionsSinceLongBreak = 0;
    }
    this._transitionTo('break');
    this._startTicking();
  }

  private _transitionToIdle(): void {
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('idle');
  }

  // ---- private: notify ----

  private _transitionTo(phase: TimerState['phase']): void {
    this._phase = phase;
    this._notifyListeners();
  }

  private _notifyListeners(): void {
    const state = this.getState();
    for (const listener of this._listeners) {
      try {
        listener(state);
      } catch {
        // Swallow — one bad listener shouldn't break the timer
      }
    }
  }

  private _emitEvent(event: import('./types').TimerEvent): void {
    for (const cb of this._eventCallbacks) {
      try {
        cb(event);
      } catch {
        // Swallow
      }
    }
  }

  // ---- private: helpers ----

  private _getPhaseTotal(): number {
    switch (this._phase) {
      case 'working':
        return this._config.workDuration;
      case 'break': {
        const isLongBreak =
          this._sessionsSinceLongBreak >= this._config.sessionsBeforeLongBreak;
        return isLongBreak
          ? this._config.longBreakDuration
          : this._config.breakDuration;
      }
      default:
        return this._config.workDuration;
    }
  }
}
