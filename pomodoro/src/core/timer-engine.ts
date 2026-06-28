// ============================================================
// NookTimer — pure TypeScript state machine.
// ZERO imports from React, DOM, or any framework.
// Supports both countdown and countup modes per phase.
// ============================================================

import type {
  TimerConfig,
  TimerState,
  TimerListener,
  TimerEventCallback,
  Session,
  TimerMode,
} from './types';
import { DEFAULT_CONFIG } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// NookTimer
// ---------------------------------------------------------------------------

export class PomodoroTimer {
  private _config: TimerConfig;
  private _phase: TimerState['phase'] = 'idle';
  private _remainingSeconds: number;
  private _elapsedSeconds = 0;
  private _completedSessions = 0;
  private _sessionsSinceLongBreak = 0;
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
      elapsedSeconds: this._elapsedSeconds,
      totalSeconds: this._getPhaseTotal(),
      completedSessions: this._completedSessions,
      sessionsSinceLongBreak: this._sessionsSinceLongBreak,
      config: { ...this._config },
    };
  }

  // ---- public: subscribe / unsubscribe ----

  subscribe(listener: TimerListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  onEvent(cb: TimerEventCallback): () => void {
    this._eventCallbacks.add(cb);
    return () => {
      this._eventCallbacks.delete(cb);
    };
  }

  // ---- public: actions ----

  start(): void {
    if (this._phase === 'working' || this._phase === 'break') return;

    if (this._phase === 'paused') {
      this._transitionTo(this._pausedFrom);
      this._emitEvent({ type: 'resumed' });
      this._startTicking();
      return;
    }

    // Fresh start from idle — set up for work phase
    this._elapsedSeconds = 0;
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('working');
    this._emitEvent({ type: 'started' });
    this._startTicking();
  }

  pause(): void {
    if (this._phase !== 'working' && this._phase !== 'break') return;
    this._pausedFrom = this._phase;
    this._stopTicking();
    this._transitionTo('paused');
    this._emitEvent({ type: 'paused' });
  }

  reset(): void {
    this._stopTicking();
    this._elapsedSeconds = 0;
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('idle');
    this._emitEvent({ type: 'reset' });
  }

  /**
   * Complete the current phase manually.
   * In count-up mode this is the primary way to end a session.
   * In countdown mode this acts as "skip" (same as before).
   */
  complete(): void {
    if (this._phase === 'working') {
      this._stopTicking();
      this._completedSessions++;
      this._sessionsSinceLongBreak++;

      const workMode = this._config.workMode;
      const duration = workMode === 'countup'
        ? this._elapsedSeconds
        : this._config.workDuration - this._remainingSeconds;

      const session: Session = {
        endedAt: new Date().toISOString(),
        duration,
      };
      this._emitEvent({ type: 'work_complete', session });
      this._startBreak();
    } else if (this._phase === 'break') {
      this._stopTicking();
      this._emitEvent({ type: 'break_complete' });
      this._transitionToIdle();
      if (this._config.autoStartWork) {
        this.start();
      }
    }
  }

  /** Alias — skip is the same as complete */
  skip(): void {
    this.complete();
  }

  updateConfig(partial: Partial<TimerConfig>): void {
    this._stopTicking();
    this._config = { ...this._config, ...partial };
    this._elapsedSeconds = 0;
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('idle');
  }

  destroy(): void {
    this._stopTicking();
    this._listeners.clear();
    this._eventCallbacks.clear();
  }

  // ---- private: ticking ----

  private _startTicking(): void {
    this._stopTicking();
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

    const mode = this._currentMode();

    if (mode === 'countdown') {
      this._remainingSeconds--;
      if (this._remainingSeconds <= 0) {
        this._remainingSeconds = 0;
        this._stopTicking();
        this._onPhaseEnd();
      }
    } else {
      // countup
      this._elapsedSeconds++;

      // Check if auto-switch is enabled and we've reached the target
      const autoSwitch = this._phase === 'working'
        ? this._config.workAutoSwitch
        : this._config.breakAutoSwitch;

      if (autoSwitch && this._elapsedSeconds >= this._getPhaseTotal()) {
        this._stopTicking();
        this._onPhaseEnd();
      }
    }

    this._notifyListeners();
    this._emitEvent({
      type: 'tick',
      remainingSeconds: this._remainingSeconds,
      elapsedSeconds: this._elapsedSeconds,
    });
  }

  private _onPhaseEnd(): void {
    if (this._phase === 'working') {
      this._completedSessions++;
      this._sessionsSinceLongBreak++;
      const duration = this._config.workMode === 'countup'
        ? this._elapsedSeconds
        : this._config.workDuration;
      const session: Session = {
        endedAt: new Date().toISOString(),
        duration,
      };
      this._emitEvent({ type: 'work_complete', session });
      this._startBreak();
    } else {
      this._emitEvent({ type: 'break_complete' });
      this._transitionToIdle();
      if (this._config.autoStartWork) {
        this.start();
      }
    }
  }

  private _startBreak(): void {
    const isLongBreak =
      this._sessionsSinceLongBreak >= this._config.sessionsBeforeLongBreak;
    this._elapsedSeconds = 0;
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
    this._elapsedSeconds = 0;
    this._remainingSeconds = this._config.workDuration;
    this._transitionTo('idle');
  }

  // ---- private: helpers ----

  private _currentMode(): TimerMode {
    if (this._phase === 'break') return this._config.breakMode;
    return this._config.workMode;
  }

  private _transitionTo(phase: TimerState['phase']): void {
    this._phase = phase;
    this._notifyListeners();
  }

  private _notifyListeners(): void {
    const state = this.getState();
    for (const listener of this._listeners) {
      try { listener(state); } catch { /* swallow */ }
    }
  }

  private _emitEvent(event: import('./types').TimerEvent): void {
    for (const cb of this._eventCallbacks) {
      try { cb(event); } catch { /* swallow */ }
    }
  }

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
