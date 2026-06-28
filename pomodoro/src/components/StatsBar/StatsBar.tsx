import { useMemo } from 'react';
import { useTimer } from '../../hooks/useTimer';
import * as storage from '../../core/storage';
import {
  computeStats,
  computeWeeklyTrend,
  loadSessionsForDates,
  getCurrentWeekDates,
  type StatsData,
  type DayBar,
} from '../../core/statistics';
import styles from './StatsBar.module.css';

function formatHours(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function StatsBar() {
  const { state } = useTimer();

  // Recompute whenever sessions change
  const trigger = state.completedSessions;

  const { stats, trend } = useMemo(() => {
    // Load all date keys and this week's data
    const allKeys = storage.getAllDateKeys();
    const weekKeys = getCurrentWeekDates();
    // Merge: all keys + ensure week keys are covered
    const keysToLoad = [...new Set([...allKeys, ...weekKeys])];

    const sessionsByDate = loadSessionsForDates(keysToLoad);
    const stats = computeStats(sessionsByDate);
    const trend = computeWeeklyTrend(sessionsByDate);

    return { stats, trend };
  }, [trigger]);

  const trendMax = Math.max(120, ...trend.map((d) => d.minutes));

  return (
    <div className={styles.container}>
      {/* ---- Stat cards ---- */}
      <div className={styles.cards}>
        <StatCard
          icon="🍅"
          value={`${stats.todayCount}`}
          sub={formatHours(stats.todayMinutes)}
          label="Today"
        />
        <StatCard
          icon="🔥"
          value={`${stats.streak}d`}
          sub="Streak"
          label="Consecutive"
        />
        <StatCard
          icon="📊"
          value={formatHours(stats.weeklyTotalMinutes)}
          sub="Total"
          label="This week"
        />
        <StatCard
          icon="⭐"
          value={stats.bestDay ? `${stats.bestDay.dayLabel}` : '—'}
          sub={stats.bestDay ? formatHours(stats.bestDay.minutes) : 'No data'}
          label="Best day"
        />
      </div>

      {/* ---- Weekly trend bars ---- */}
      <div className={styles.trend}>
        <div className={styles.trendTitle}>This Week</div>
        <div className={styles.bars}>
          {trend.map((day) => (
            <BarColumn key={day.dateKey} day={day} maxMinutes={trendMax} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function StatCard({
  icon,
  value,
  sub,
  label,
}: {
  icon: string;
  value: string;
  sub: string;
  label: string;
}) {
  return (
    <div className={styles.card}>
      <span className={styles.cardIcon}>{icon}</span>
      <span className={styles.cardValue}>{value}</span>
      <span className={styles.cardSub}>{sub}</span>
      <span className={styles.cardLabel}>{label}</span>
    </div>
  );
}

function BarColumn({ day, maxMinutes }: { day: DayBar; maxMinutes: number }) {
  const heightPct = maxMinutes > 0 ? Math.min((day.minutes / maxMinutes) * 100, 100) : 0;

  return (
    <div className={styles.barCol}>
      <span className={styles.barValue}>
        {day.minutes > 0 ? formatHours(day.minutes) : ''}
      </span>
      <div className={styles.barWrapper}>
        <div
          className={`${styles.bar} ${day.isToday ? styles.today : ''}`}
          style={{ height: `${Math.max(heightPct, 2)}%` }}
        />
      </div>
      <span
        className={`${styles.barLabel} ${day.isToday ? styles.todayLabel : ''}`}
      >
        {day.dayLabel}
      </span>
    </div>
  );
}
