import { useState } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { WORK_PRESETS, DEFAULT_CONFIG } from '../../core/types';
import type { TimerMode } from '../../core/types';
import styles from './Settings.module.css';

function toMin(seconds: number): number {
  return Math.round(seconds / 60);
}

export function Settings() {
  const { state, dispatch } = useTimer();
  const { config, phase } = state;
  const [collapsed, setCollapsed] = useState(true);

  const isIdle = phase === 'idle';

  // ---- Handlers ----

  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    dispatch({ type: 'UPDATE_CONFIG', config: { workDuration: minutes * 60 } });
  };

  const handleBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    dispatch({ type: 'UPDATE_CONFIG', config: { breakDuration: minutes * 60 } });
  };

  const handleSessionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      config: { sessionsBeforeLongBreak: parseInt(e.target.value, 10) },
    });
  };

  const handleWorkMode = (mode: TimerMode) => {
    dispatch({ type: 'UPDATE_CONFIG', config: { workMode: mode } });
  };

  const handleBreakMode = (mode: TimerMode) => {
    dispatch({ type: 'UPDATE_CONFIG', config: { breakMode: mode } });
  };

  const handlePreset = (minutes: number) => {
    dispatch({ type: 'UPDATE_CONFIG', config: { workDuration: minutes * 60 } });
  };

  // ---- Render ----

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ''}`}>
      {/* Title bar — always visible, click to toggle */}
      <button
        className={styles.header}
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
      >
        <span className={styles.headerLeft}>
          <span className={`${styles.chevron} ${!collapsed ? styles.chevronOpen : ''}`}>
            ▶
          </span>
          <span className={styles.headerIcon}>⚙</span>
          <span className={styles.headerTitle}>Settings</span>
        </span>
        <span className={styles.headerBadge}>
          {toMin(config.workDuration)}m / {toMin(config.breakDuration)}m
        </span>
      </button>

      {/* Collapsible body */}
      <div className={`${styles.body} ${!collapsed ? styles.bodyOpen : ''}`}>
        <div className={styles.bodyInner}>
          {/* ---- Work mode toggle ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Work mode</span>
            </label>
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${config.workMode === 'countdown' ? styles.active : ''}`}
                onClick={() => handleWorkMode('countdown')}
                disabled={!isIdle}
              >
                ⏱ Countdown
              </button>
              <button
                className={`${styles.modeBtn} ${config.workMode === 'countup' ? styles.active : ''}`}
                onClick={() => handleWorkMode('countup')}
                disabled={!isIdle}
              >
                ⬆ Count up
              </button>
            </div>
          </div>

          {/* ---- Work auto-switch sub-option (only for countup) ---- */}
          {config.workMode === 'countup' && (
            <div className={styles.field}>
              <label className={styles.label}>
                <span>When reaching target</span>
              </label>
              <div className={styles.modeToggle}>
                <button
                  className={`${styles.modeBtn} ${config.workAutoSwitch ? styles.active : ''}`}
                  onClick={() => dispatch({ type: 'UPDATE_CONFIG', config: { workAutoSwitch: true } })}
                  disabled={!isIdle}
                >
                  ↱ Auto next
                </button>
                <button
                  className={`${styles.modeBtn} ${!config.workAutoSwitch ? styles.active : ''}`}
                  onClick={() => dispatch({ type: 'UPDATE_CONFIG', config: { workAutoSwitch: false } })}
                  disabled={!isIdle}
                >
                  → Keep going
                </button>
              </div>
            </div>
          )}

          {/* ---- Work duration presets ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Work duration</span>
              <span className={styles.value}>{toMin(config.workDuration)} min</span>
            </label>
            <div className={styles.presets}>
              {WORK_PRESETS.map((mins) => (
                <button
                  key={mins}
                  className={`${styles.presetBtn} ${toMin(config.workDuration) === mins ? styles.active : ''}`}
                  onClick={() => handlePreset(mins)}
                  disabled={!isIdle}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <input
              type="range"
              className={styles.range}
              min="5"
              max="60"
              step="5"
              value={toMin(config.workDuration)}
              onChange={handleWorkChange}
              disabled={!isIdle}
            />
          </div>

          {/* ---- Break mode toggle ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Break mode</span>
            </label>
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${config.breakMode === 'countdown' ? styles.active : ''}`}
                onClick={() => handleBreakMode('countdown')}
                disabled={!isIdle}
              >
                ⏱ Countdown
              </button>
              <button
                className={`${styles.modeBtn} ${config.breakMode === 'countup' ? styles.active : ''}`}
                onClick={() => handleBreakMode('countup')}
                disabled={!isIdle}
              >
                ⬆ Count up
              </button>
            </div>
          </div>

          {/* ---- Break auto-switch sub-option (only for countup) ---- */}
          {config.breakMode === 'countup' && (
            <div className={styles.field}>
              <label className={styles.label}>
                <span>When reaching target</span>
              </label>
              <div className={styles.modeToggle}>
                <button
                  className={`${styles.modeBtn} ${config.breakAutoSwitch ? styles.active : ''}`}
                  onClick={() => dispatch({ type: 'UPDATE_CONFIG', config: { breakAutoSwitch: true } })}
                  disabled={!isIdle}
                >
                  ↱ Auto next
                </button>
                <button
                  className={`${styles.modeBtn} ${!config.breakAutoSwitch ? styles.active : ''}`}
                  onClick={() => dispatch({ type: 'UPDATE_CONFIG', config: { breakAutoSwitch: false } })}
                  disabled={!isIdle}
                >
                  → Keep going
                </button>
              </div>
            </div>
          )}

          {/* ---- Break duration ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Break duration</span>
              <span className={styles.value}>{toMin(config.breakDuration)} min</span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="1"
              max="30"
              step="1"
              value={toMin(config.breakDuration)}
              onChange={handleBreakChange}
              disabled={!isIdle}
            />
          </div>

          {/* ---- Sessions before long break ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Sessions until long break</span>
              <span className={styles.value}>{config.sessionsBeforeLongBreak}</span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="2"
              max="8"
              step="1"
              value={config.sessionsBeforeLongBreak}
              onChange={handleSessionsChange}
              disabled={!isIdle}
            />
          </div>

          {/* ---- Auto-start toggle ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>🔄 Auto-start next focus</span>
              <span className={styles.toggleHint}>
                Break ends → start working
              </span>
            </label>
            <button
              className={`${styles.toggleBtn} ${config.autoStartWork ? styles.toggleOn : ''}`}
              onClick={() =>
                dispatch({
                  type: 'UPDATE_CONFIG',
                  config: { autoStartWork: !config.autoStartWork },
                })
              }
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {/* ---- Test helpers ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>🧪 Test helpers</span>
            </label>
            <div className={styles.presets}>
              <button
                className={styles.presetBtn}
                onClick={() =>
                  dispatch({ type: 'UPDATE_CONFIG', config: { workDuration: 1 } })
                }
                disabled={!isIdle}
              >
                Work 1s
              </button>
              <button
                className={styles.presetBtn}
                onClick={() =>
                  dispatch({ type: 'UPDATE_CONFIG', config: { breakDuration: 1 } })
                }
                disabled={!isIdle}
              >
                Break 1s
              </button>
              <button
                className={styles.presetBtn}
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_CONFIG',
                    config: {
                      workDuration: DEFAULT_CONFIG.workDuration,
                      breakDuration: DEFAULT_CONFIG.breakDuration,
                    },
                  })
                }
                disabled={!isIdle}
              >
                Reset
              </button>
            </div>
          </div>

          {/* ---- Notifications toggle ---- */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>🔔 Desktop notifications</span>
            </label>
            <button
              className={`${styles.toggleBtn} ${config.enableNotifications ? styles.toggleOn : ''}`}
              onClick={() =>
                dispatch({
                  type: 'UPDATE_CONFIG',
                  config: { enableNotifications: !config.enableNotifications },
                })
              }
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          <p className={styles.readonly}>
            Long break: {toMin(config.longBreakDuration)} min &nbsp;|&nbsp;
            Settings locked while timer is running
          </p>
        </div>
      </div>
    </div>
  );
}
