import { useState, useEffect, useRef } from 'react';
import type { TodoItem } from '../../core/types';
import type { DockPosition } from '../../hooks/useDraggable';
import * as storage from '../../core/storage';
import styles from './TodoList.module.css';

let nextId = Date.now();
function genId(): string {
  return `todo_${nextId++}`;
}

interface TodoListProps {
  dragHandlers?: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
  isDragging?: boolean;
  dockPosition?: DockPosition;
  /** When set, new todos auto-assign this date and list filters to it */
  dueDate?: string;
}

export function TodoList({ dragHandlers, isDragging, dockPosition, dueDate }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>(() => storage.loadTodos());
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist on change
  useEffect(() => {
    storage.saveTodos(todos);
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const item: TodoItem = {
      id: genId(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
      ...(dueDate ? { dueDate } : {}),
    };
    setTodos((prev) => [item, ...prev]);
    setInput('');
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearDone = () => {
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  // Filter by dueDate when provided, otherwise show all
  const visibleTodos = dueDate
    ? todos.filter((t) => t.dueDate === dueDate)
    : todos;
  const doneCount = visibleTodos.filter((t) => t.done).length;
  const pendingCount = visibleTodos.length - doneCount;

  // Format date for display label
  const dateLabel = dueDate
    ? (() => {
        const [y, m, d] = dueDate.split('-');
        const date = new Date(+y, +m - 1, +d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })()
    : '';

  return (
    <div
      className={`${styles.panel} ${collapsed ? styles.collapsed : ''} ${isDragging ? styles.dragging : ''}`}
      data-dock={dockPosition ?? 'bottom'}
    >
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
          <span className={styles.headerIcon}>{dueDate ? '📅' : '📝'}</span>
          <span className={styles.headerTitle}>
            {dueDate ? `Tasks · ${dateLabel}` : 'Todo List'}
          </span>
        </span>
        <span className={styles.headerRight}>
          {visibleTodos.length > 0 && (
            <span className={styles.badge}>
              {pendingCount} pending
            </span>
          )}
          {dragHandlers && (
            <span
              className={styles.dragHandle}
              {...dragHandlers}
              title={`Dock: ${dockPosition ?? 'bottom'}`}
            >
              ⠿
            </span>
          )}
        </span>
      </button>

      {/* Collapsible body */}
      <div className={`${styles.body} ${!collapsed ? styles.bodyOpen : ''}`}>
        <div className={styles.bodyInner}>
          {/* Input */}
          <div className={styles.inputRow}>
            {dueDate && <span className={styles.dateLabel}>📅 {dateLabel}</span>}
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Add a task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className={styles.addBtn} onClick={addTodo}>
              Add
            </button>
          </div>

          {/* List */}
          {visibleTodos.length === 0 ? (
            <p className={styles.empty}>No tasks yet. Add one above!</p>
          ) : (
            <ul className={styles.list}>
              {visibleTodos.map((todo) => (
                <li key={todo.id} className={styles.item}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className={`${styles.text} ${todo.done ? styles.done : ''}`}>
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

          {/* Footer */}
          {visibleTodos.length > 0 && (
            <div className={styles.footer}>
              <span>
                {pendingCount} pending / {doneCount} done
              </span>
              {doneCount > 0 && (
                <button className={styles.clearBtn} onClick={clearDone}>
                  Clear done
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
