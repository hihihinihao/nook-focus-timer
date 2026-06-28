import { useState, useMemo, useRef, useEffect } from 'react';
import type { TodoItem, Session } from '../../core/types';
import * as storage from '../../core/storage';
import styles from './DayDetail.module.css';

// ---- Inline Todo helpers ----

let nextId = Date.now();
function genId(): string {
  return `todo_${nextId++}`;
}

function formatDateTitle(dateKey: string): string {
  const [y, m, d] = dateKey.split('-');
  const date = new Date(+y, +m - 1, +d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---- Session formatting ----

function formatTimeFromISO(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '--:--';
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

// ---- Props ----

interface DayDetailProps {
  dateKey: string;
  onClose: () => void;
  /** Callback when todos change (to refresh calendar dots) */
  onTodosChange?: () => void;
}

export function DayDetail({ dateKey, onClose, onTodosChange }: DayDetailProps) {
  // Sessions for this date
  const sessions = useMemo(() => storage.loadSessions(dateKey), [dateKey]);

  // Todos: load all, then filter + inline add for this date
  const [allTodos, setAllTodos] = useState<TodoItem[]>(() => storage.loadTodos());
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist todos
  useEffect(() => {
    storage.saveTodos(allTodos);
    onTodosChange?.();
  }, [allTodos, onTodosChange]);

  const dateTodos = allTodos.filter((t) => t.dueDate === dateKey);
  const doneCount = dateTodos.filter((t) => t.done).length;
  const pendingCount = dateTodos.length - doneCount;

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const item: TodoItem = {
      id: genId(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
      dueDate: dateKey,
    };
    setAllTodos((prev) => [item, ...prev]);
    setInput('');
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setAllTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    setAllTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearDone = () => {
    setAllTodos((prev) => prev.filter((t) => !(t.dueDate === dateKey && t.done)));
  };

  const sessionMinutes = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>📅 {formatDateTitle(dateKey)}</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      {/* ---- Tasks ---- */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>📝 Tasks</span>
          {dateTodos.length > 0 && (
            <span className={styles.badge}>
              {pendingCount} pending / {doneCount} done
            </span>
          )}
        </div>

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Add a task for this date..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
          />
          <button className={styles.addBtn} onClick={addTodo}>
            Add
          </button>
        </div>

        {dateTodos.length === 0 ? (
          <p className={styles.empty}>No tasks for this date yet.</p>
        ) : (
          <ul className={styles.todoList}>
            {dateTodos.map((todo) => (
              <li key={todo.id} className={styles.todoItem}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span
                  className={`${styles.todoText} ${todo.done ? styles.todoDone : ''}`}
                >
                  {todo.text}
                </span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteTodo(todo.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {doneCount > 0 && (
          <button className={styles.clearBtn} onClick={clearDone}>
            Clear done
          </button>
        )}
      </div>

      {/* ---- Sessions ---- */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>📊 Focus sessions</span>
          {sessions.length > 0 && (
            <span className={styles.badge}>{Math.round(sessionMinutes)} min</span>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className={styles.empty}>No sessions on this date.</p>
        ) : (
          <>
            <ul className={styles.sessionList}>
              {sessions.map((s, i) => (
                <li key={i} className={styles.sessionItem}>
                  <span className={styles.sessionIdx}>#{i + 1}</span>
                  <span className={styles.sessionTime}>
                    {formatTimeFromISO(s.endedAt)}
                  </span>
                  <span className={styles.sessionDuration}>
                    {formatDuration(s.duration)}
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.sessionTotal}>
              Total focus time: {Math.round(sessionMinutes)} min
            </div>
          </>
        )}
      </div>
    </div>
  );
}
