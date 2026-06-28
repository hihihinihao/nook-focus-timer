import { useCallback } from 'react';
import * as storage from '../../core/storage';
import {
  generateCSV,
  loadSessionsForDates,
} from '../../core/statistics';
import styles from './ExportButton.module.css';

export function ExportButton() {
  const handleExport = useCallback(() => {
    const dateKeys = storage.getAllDateKeys();
    const sessionsByDate = loadSessionsForDates(dateKeys);
    const csv = generateCSV(sessionsByDate);

    // Trigger download via temporary link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    a.download = `nook_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <button className={styles.btn} onClick={handleExport}>
      ⬇ Export CSV
    </button>
  );
}
