import { useTimer } from '../../hooks/useTimer';
import styles from './Settings.module.css';

/** Convert seconds to minutes for display */
function toMin(seconds: number): number {
  return Math.round(seconds / 60);
}

export function Settings() {
  const { state, dispatch } = useTimer();
  const { config, phase } = state;

  const isIdle = phase === 'idle';

  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    dispatch({
      type: 'UPDATE_CONFIG',
      config: { workDuration: minutes * 60 },
    });
  };

  const handleBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    dispatch({
      type: 'UPDATE_CONFIG',
      config: { breakDuration: minutes * 60 },
    });
  };

  const handleSessionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      config: { sessionsBeforeLongBreak: parseInt(e.target.value, 10) },
    });
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Settings</h3>

      {/* Work duration */}
      <div className={styles.field}>
        <label className={styles.label}>
          <span>Work duration</span>
          <span className={styles.value}>{toMin(config.workDuration)} min</span>
        </label>
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

      {/* Break duration */}
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

      {/* Sessions before long break */}
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

      <p className={styles.readonly}>
        Long break: {toMin(config.longBreakDuration)} min &nbsp;|&nbsp;
        Settings locked while timer is running
      </p>
    </div>
  );
}
