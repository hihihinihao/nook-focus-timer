// ============================================================
// React Context + useReducer wrapper around PomodoroTimer.
// This is the ONLY place the timer engine instance lives.
// All UI components consume state through this context.
// ============================================================

import {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { PomodoroTimer, todayKey } from '../core/timer-engine';
import type { TimerState, TimerConfig, Session } from '../core/types';
import * as storage from '../core/storage';
import {
  createBeepSoundPlayer,
  type SoundPlayer,
} from '../core/audio';
import { DEFAULT_CONFIG } from '../core/types';

// ---------------------------------------------------------------------------
// Actions that the UI can dispatch
// ---------------------------------------------------------------------------

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'UPDATE_CONFIG'; config: Partial<TimerConfig> };

// ---------------------------------------------------------------------------
// Extended context value (state + actions + derived data)
// ---------------------------------------------------------------------------

export interface TimerContextValue {
  state: TimerState;
  dispatch: (action: TimerAction) => void;
  /** Today's completed sessions (loaded from localStorage) */
  todaySessions: Session[];
  /** Add a session to today's log */
  addSession: (session: Session) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const TimerContext = createContext<TimerContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TimerProvider({ children }: { children: ReactNode }) {
  // ---- mutable refs (survive re-renders) ----
  const timerRef = useRef<PomodoroTimer | null>(null);
  const soundRef = useRef<SoundPlayer>(createBeepSoundPlayer());

  // ---- React state (triggers re-renders) ----
  const [state, setState] = useState<TimerState>(() => {
    const config = storage.loadConfig();
    timerRef.current = new PomodoroTimer(config);
    return timerRef.current.getState();
  });

  const [todaySessions, setTodaySessions] = useState<Session[]>(() => {
    return storage.loadSessions(todayKey());
  });

  // ---- Subscribe to timer engine ----
  useEffect(() => {
    const timer = timerRef.current!;

    const unsub = timer.subscribe((newState) => {
      setState(newState);
    });

    // Listen for work_complete to play sound and persist session
    const unsubEvent = timer.onEvent((event) => {
      if (event.type === 'work_complete') {
        soundRef.current.play();
        addSession(event.session);
      } else if (event.type === 'break_complete') {
        soundRef.current.play();
      }
    });

    return () => {
      unsub();
      unsubEvent();
    };
  }, []);

  // ---- Persist config on change ----
  useEffect(() => {
    storage.saveConfig(state.config);
  }, [state.config]);

  // ---- Actions ----

  const addSession = useCallback((session: Session) => {
    const key = todayKey();
    storage.appendSession(key, session);
    // Re-read to keep React state in sync
    setTodaySessions(storage.loadSessions(key));
  }, []);

  const dispatch = useCallback(
    (action: TimerAction) => {
      const timer = timerRef.current;
      if (!timer) return;

      switch (action.type) {
        case 'START':
          timer.start();
          break;
        case 'PAUSE':
          timer.pause();
          break;
        case 'RESET':
          timer.reset();
          break;
        case 'SKIP':
          timer.skip();
          break;
        case 'UPDATE_CONFIG':
          timer.updateConfig(action.config);
          break;
      }
    },
    []
  );

  // ---- Provide ----

  return (
    <TimerContext.Provider value={{ state, dispatch, todaySessions, addSession }}>
      {children}
    </TimerContext.Provider>
  );
}
