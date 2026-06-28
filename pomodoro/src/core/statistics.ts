// ============================================================
// Statistics — pure computation, zero framework imports.
// All data access delegates to storage.ts.
// ============================================================

import type { Session } from './types';
import * as storage from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatsData {
  todayCount: number;
  todayMinutes: number;
  streak: number;
  weeklyTotalMinutes: number;
  bestDay: { dayLabel: string; minutes: number } | null;
}

export interface DayBar {
  dayLabel: string;   // 'Mon', 'Tue', etc.
  dateKey: string;    // 'YYYY-MM-DD'
  minutes: number;
  isToday: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayLabel(d: Date): string {
  return DAY_LABELS[d.getDay()];
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function totalMinutes(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
}

function formatSessionTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Get dates for current week (Mon–Sun)
// ---------------------------------------------------------------------------

export function getCurrentWeekDates(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(dateKey(d));
  }
  return dates;
}

// ---------------------------------------------------------------------------
// Month calendar helpers
// ---------------------------------------------------------------------------

export interface CalendarDay {
  day: number;          // 1-31
  dateKey: string;      // 'YYYY-MM-DD'
  isToday: boolean;
  isCurrentMonth: boolean;
}

/** Generate a 2D grid (weeks × 7 days) for calendar rendering */
export function getMonthGrid(year: number, month: number): CalendarDay[][] {
  const today = dateKey(new Date());

  // First day of the month
  const firstDay = new Date(year, month - 1, 1);
  // Last day of the month
  const lastDay = new Date(year, month, 0);

  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const grid: CalendarDay[][] = [];
  let week: CalendarDay[] = [];

  // Pad days before the 1st (previous month)
  const prevMonthLast = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLast - i;
    const dk = dateKey(new Date(year, month - 2, d));
    week.push({ day: d, dateKey: dk, isToday: dk === today, isCurrentMonth: false });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dk = dateKey(new Date(year, month - 1, d));
    week.push({ day: d, dateKey: dk, isToday: dk === today, isCurrentMonth: true });
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  // Pad days after the last day (next month)
  if (week.length > 0) {
    let nextD = 1;
    while (week.length < 7) {
      const dk = dateKey(new Date(year, month, nextD));
      week.push({ day: nextD, dateKey: dk, isToday: dk === today, isCurrentMonth: false });
      nextD++;
    }
    grid.push(week);
  }

  return grid;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---------------------------------------------------------------------------
// Data loading (delegates to storage)
// ---------------------------------------------------------------------------

export function loadSessionsForDates(
  dateKeys: string[],
): Map<string, Session[]> {
  const map = new Map<string, Session[]>();
  for (const dk of dateKeys) {
    map.set(dk, storage.loadSessions(dk));
  }
  return map;
}

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

export function computeStats(
  sessionsByDate: Map<string, Session[]>,
): StatsData {
  const today = dateKey(new Date());
  const weekDates = getCurrentWeekDates();

  // Today
  const todaySessions = sessionsByDate.get(today) ?? [];
  const todayCount = todaySessions.length;
  const todayMinutes = totalMinutes(todaySessions);

  // Weekly total
  let weeklyTotalMinutes = 0;
  for (const dk of weekDates) {
    weeklyTotalMinutes += totalMinutes(sessionsByDate.get(dk) ?? []);
  }

  // Best day this week
  let bestDay: StatsData['bestDay'] = null;
  for (const dk of weekDates) {
    const mins = totalMinutes(sessionsByDate.get(dk) ?? []);
    if (mins > 0 && (!bestDay || mins > bestDay.minutes)) {
      bestDay = { dayLabel: dayLabel(parseDateKey(dk)), minutes: mins };
    }
  }

  // Streak: consecutive days (including today) with ≥1 session
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const dk = dateKey(cursor);
    const sessions = sessionsByDate.get(dk) ?? storage.loadSessions(dk);
    if (sessions.length > 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { todayCount, todayMinutes, streak, weeklyTotalMinutes, bestDay };
}

// ---------------------------------------------------------------------------
// Weekly trend (for bar chart)
// ---------------------------------------------------------------------------

export function computeWeeklyTrend(
  sessionsByDate: Map<string, Session[]>,
): DayBar[] {
  const weekDates = getCurrentWeekDates();
  const today = dateKey(new Date());

  return weekDates.map((dk) => ({
    dayLabel: dayLabel(parseDateKey(dk)),
    dateKey: dk,
    minutes: totalMinutes(sessionsByDate.get(dk) ?? []),
    isToday: dk === today,
  }));
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export function generateCSV(sessionsByDate: Map<string, Session[]>): string {
  const lines: string[] = ['date,time,duration_min'];

  const sortedDates = [...sessionsByDate.keys()].sort();

  for (const dk of sortedDates) {
    const sessions = sessionsByDate.get(dk) ?? [];
    for (const s of sessions) {
      const time = formatSessionTime(s.endedAt);
      const durationMin = Math.round(s.duration / 60);
      lines.push(`${dk},${time},${durationMin}`);
    }
  }

  return lines.join('\n');
}
