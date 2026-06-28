import { useState, useMemo } from 'react';
import type { Session, TodoItem } from '../../core/types';
import {
  getMonthGrid,
  MONTH_NAMES,
  DAY_HEADERS,
  type CalendarDay,
} from '../../core/statistics';
import styles from './CalendarHeatmap.module.css';

interface CalendarHeatmapProps {
  sessionsByDate: Map<string, Session[]>;
  todosByDate: Map<string, TodoItem[]>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
}

/** Compute focus minutes for a date from sessions */
function getMinutes(sessionsByDate: Map<string, Session[]>, dateKey: string): number {
  return (sessionsByDate.get(dateKey) ?? []).reduce((sum, s) => sum + s.duration, 0) / 60;
}

/** Return heat level 0-3 based on minutes */
function heatLevel(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  return 3;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function CalendarHeatmap({
  sessionsByDate,
  todosByDate,
  selectedDate,
  onSelectDate,
}: CalendarHeatmapProps) {
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1);

  const grid = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const goPrev = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className={styles.container}>
      {/* Month header */}
      <div className={styles.monthHeader}>
        <button className={styles.navBtn} onClick={goPrev}>
          ◀
        </button>
        <span className={styles.monthLabel}>
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button className={styles.navBtn} onClick={goNext}>
          ▶
        </button>
      </div>

      {/* Day headers */}
      <div className={styles.weekRow}>
        {DAY_HEADERS.map((h) => (
          <div key={h} className={styles.dayHeader}>
            {h}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.grid}>
        {grid.map((week, wi) => (
          <div key={wi} className={styles.weekRow}>
            {week.map((day, di) => (
              <DayCell
                key={di}
                day={day}
                minutes={getMinutes(sessionsByDate, day.dateKey)}
                hasTodos={(todosByDate.get(day.dateKey) ?? []).length > 0}
                isSelected={day.dateKey === selectedDate}
                onClick={() => onSelectDate(day.dateKey)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Selected day summary */}
      {selectedDate && (
        <div className={styles.selectedInfo}>
          {(() => {
            const mins = getMinutes(sessionsByDate, selectedDate);
            const todoCount = (todosByDate.get(selectedDate) ?? []).length;
            const parts: string[] = [];
            if (mins > 0) parts.push(`${formatMinutes(mins)} focus`);
            if (todoCount > 0) parts.push(`${todoCount} task${todoCount > 1 ? 's' : ''}`);
            return parts.length > 0
              ? `${parts.join(' · ')} — ${selectedDate}`
              : `No activity — ${selectedDate}`;
          })()}
        </div>
      )}
    </div>
  );
}

// ---- DayCell ----

function DayCell({
  day,
  minutes,
  hasTodos,
  isSelected,
  onClick,
}: {
  day: CalendarDay;
  minutes: number;
  hasTodos: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const level = heatLevel(minutes);
  const hasSession = level > 0;

  const classNames = [
    styles.cell,
    day.isCurrentMonth ? styles.currentMonth : styles.otherMonth,
    day.isToday ? styles.today : '',
    isSelected ? styles.selected : '',
    hasSession ? styles[`heat${level}`] : '',
    hasTodos ? styles.hasTodos : '',
  ]
    .filter(Boolean)
    .join(' ');

  const titleParts: string[] = [];
  if (hasSession) titleParts.push(`${formatMinutes(minutes)} focus`);
  if (hasTodos) titleParts.push('tasks pending');
  const title = titleParts.length > 0
    ? `${titleParts.join(' · ')} — ${day.dateKey}`
    : day.dateKey;

  return (
    <button
      className={classNames}
      onClick={day.isCurrentMonth ? onClick : undefined}
      disabled={!day.isCurrentMonth}
      title={title}
    >
      <span className={styles.dayNum}>{day.day}</span>
      <span className={styles.dots}>
        {hasSession && <span className={styles.dot} />}
        {hasTodos && <span className={styles.todoDot} />}
      </span>
    </button>
  );
}
