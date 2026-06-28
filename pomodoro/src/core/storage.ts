// ============================================================
// localStorage persistence — pure functions, no framework imports.
// Swap this file out for Unity PlayerPrefs or file I/O when porting.
// ============================================================

import type { TimerConfig, Session, TodoItem } from './types';
import { DEFAULT_CONFIG } from './types';

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

const CONFIG_KEY = 'nook_config';
const SESSIONS_PREFIX = 'nook_sessions_'; // + dateKey

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export function loadConfig(): TimerConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    // Merge with defaults to fill any missing keys (forward-compat)
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: TimerConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/** Load sessions for a given date key (YYYY-MM-DD) */
export function loadSessions(dateKey: string): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_PREFIX + dateKey);
    if (!raw) return [];
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

/** Save sessions for a given date key */
export function saveSessions(dateKey: string, sessions: Session[]): void {
  try {
    localStorage.setItem(SESSIONS_PREFIX + dateKey, JSON.stringify(sessions));
  } catch {
    // Silently ignore
  }
}

/** Append a single session to today's list */
export function appendSession(dateKey: string, session: Session): void {
  const sessions = loadSessions(dateKey);
  sessions.push(session);
  saveSessions(dateKey, sessions);
}

// ---------------------------------------------------------------------------
// Todos
// ---------------------------------------------------------------------------

const TODOS_KEY = 'nook_todos';

export function loadTodos(): TodoItem[] {
  try {
    const raw = localStorage.getItem(TODOS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TodoItem[];
  } catch {
    return [];
  }
}

export function saveTodos(todos: TodoItem[]): void {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch {
    // silently ignore
  }
}

/** Return all date keys that have stored sessions, sorted chronologically */
export function getAllDateKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SESSIONS_PREFIX)) {
      keys.push(key.slice(SESSIONS_PREFIX.length));
    }
  }
  keys.sort();
  return keys;
}
