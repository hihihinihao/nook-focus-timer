import { useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShortcutBindings {
  startPause: string;   // default: 'Ctrl+1'
  skipNext: string;     // default: 'Ctrl+2'
}

export const DEFAULT_BINDINGS: ShortcutBindings = {
  startPause: 'Ctrl+1',
  skipNext: 'Ctrl+2',
};

type ShortcutAction = 'startPause' | 'skipNext';

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'nook_keybindings';

export function loadBindings(): ShortcutBindings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_BINDINGS, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return { ...DEFAULT_BINDINGS };
}

export function saveBindings(bindings: ShortcutBindings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
  } catch { /* noop */ }
}

// ---------------------------------------------------------------------------
// Parse key string → match keyboard event
// ---------------------------------------------------------------------------

function parseShortcut(shortcut: string): { ctrl: boolean; shift: boolean; key: string } {
  const parts = shortcut.split('+').map((s) => s.trim());
  const ctrl = parts.includes('Ctrl');
  const shift = parts.includes('Shift');
  const key = parts.filter((p) => p !== 'Ctrl' && p !== 'Shift').join('+');
  return { ctrl, shift, key };
}

function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parsed = parseShortcut(shortcut);
  // Normalize digit keys
  let eventKey = e.key;
  if (e.code.startsWith('Digit')) {
    eventKey = e.code.replace('Digit', '');
  }
  return (
    e.ctrlKey === parsed.ctrl &&
    e.shiftKey === parsed.shift &&
    eventKey.toLowerCase() === parsed.key.toLowerCase()
  );
}

// ---------------------------------------------------------------------------
// Check if user is typing in an input
// ---------------------------------------------------------------------------

function isEditing(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = (el as HTMLElement).tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseGlobalShortcutsOptions {
  bindings: ShortcutBindings;
  onStartPause: () => void;
  onSkipNext: () => void;
}

export function useGlobalShortcuts({
  bindings,
  onStartPause,
  onSkipNext,
}: UseGlobalShortcutsOptions) {
  // Stash callbacks in refs to avoid re-binding
  const onStartPauseRef = useCallback(onStartPause, [onStartPause]);
  const onSkipNextRef = useCallback(onSkipNext, [onSkipNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditing()) return;

      if (matchesShortcut(e, bindings.startPause)) {
        e.preventDefault();
        onStartPauseRef();
      } else if (matchesShortcut(e, bindings.skipNext)) {
        e.preventDefault();
        onSkipNextRef();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bindings.startPause, bindings.skipNext, onStartPauseRef, onSkipNextRef]);
}
