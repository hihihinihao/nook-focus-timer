// ============================================================
// Convenience hook — pulls state and dispatch from TimerContext.
// Throws if used outside a <TimerProvider> (fail-fast).
// ============================================================

import { useContext } from 'react';
import { TimerContext, type TimerContextValue } from '../context/TimerContext';

export function useTimer(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimer() must be used inside a <TimerProvider>');
  }
  return ctx;
}
