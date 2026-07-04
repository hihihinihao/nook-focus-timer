# 🍅 Nook — Focus Timer

**A beautiful, privacy-first Pomodoro timer. No accounts, no cloud, just you and your focus.**

Nook helps you stay in flow with a clean circular timer, calendar heatmaps that show your rhythm over time, and a smart todo list that respects your workspace — drag it anywhere, or hide it entirely.

---

## ✨ What It Does

| | |
|---|---|
| ⏱ **Pomodoro Engine** | Work → Short Break → Long Break, auto-cycling. Countdown or countup, per-phase. |
| 📊 **Calendar Heatmap** | See every focused minute at a glance. Click any day for a detailed breakdown. |
| 📝 **Dockable Todo List** | Drag to bottom, left, or right edge. Links to calendar dates. Stays out of your way. |
| 🔔 **Smart Notifications** | Alerts when a phase ends. Silent during countup work — no interruption unless you want it. |
| 🎨 **Three Themes** | Dark, Warm, and Light. One click to cycle. |
| ⌨️ **Custom Shortcuts** | Bind any key combo to Start/Pause or Skip. |
| 📱 **Mobile Ready** | Responsive from 320px up. Touch-friendly targets. |
| ♿ **Runtime Lock** | Settings disable while the timer runs — no accidental config changes mid-focus. |

---

## 🚀 Quick Start

```bash
git clone https://github.com/hihihinihao/nook-focus-timer.git
cd nook-focus-timer/pomodoro
npm install
npm run dev
```

Open **http://localhost:5173** and start your first session.

---

## 🧱 Architecture

```
pomodoro/src/
├── core/                       # Pure TypeScript — zero framework imports
│   ├── types.ts                # All type definitions + default constants
│   ├── timer-engine.ts         # NookTimer state machine (idle → working → paused → break)
│   ├── storage.ts              # localStorage persistence (config, sessions, todos)
│   ├── statistics.ts           # Aggregation, heatmap data, CSV export
│   ├── notifications.ts        # Desktop Notification API wrapper
│   └── audio.ts                # SoundPlayer interface + HTMLAudio / WebAudio / noop
│
├── context/
│   └── TimerContext.tsx         # React Context + useReducer bridge to the timer engine
│
├── hooks/
│   ├── useTimer.ts             # Convenience hook consuming TimerContext
│   ├── useDraggable.ts         # Pointer-event drag logic for the todo dock
│   └── useGlobalShortcuts.ts   # Keyboard shortcut recorder + dispatcher
│
├── components/
│   ├── Layout/Header.tsx       # 🍅 Nook brand, theme toggle (🌙/🔥/☀️), Timer / Stats tabs
│   ├── Timer/                  # Circular SVG progress ring + time display
│   ├── TimerControls/          # Start, Pause, Skip, Reset buttons
│   ├── Settings/               # Collapsible panel — durations, modes, notifications, shortcuts
│   ├── TodoList/               # Drag-to-dock todos with calendar date linking
│   ├── CalendarHeatmap/        # Monthly focus heatmap grid + DayDetail popover
│   ├── StatsBar/               # Stat cards (today, streak, week total, best day)
│   ├── SessionLog/             # Scrollable list of today's completed sessions
│   ├── ExportButton/           # One-click CSV download
│   ├── DockZone/               # Drop-zone overlay shown during drag
│   ├── Popover/                # Generic anchored popover
│   ├── CollapsibleSection/     # Reusable collapse/expand wrapper
│   └── ui/                     # Design system primitives
│       ├── Button.tsx          # primary / secondary / ghost / icon
│       ├── Toggle.tsx          # On/off switch
│       ├── Badge.tsx           # Count badge
│       ├── Card.tsx            # Uniform card container
│       └── ui.module.css       # Shared design tokens
│
└── App.tsx                     # Root — theme provider, dock state, tab routing
```

The core layer is **framework-agnostic**. You could drop `core/` into a CLI, a Tauri app, or a VS Code extension without touching a single import.

---

## ⚙️ Configuration

| Setting | Range | Default |
|---------|-------|---------|
| Work Duration | 5–60 min | 25 min |
| Work Mode | countdown / countup | countdown |
| Break Duration | 1–30 min | 5 min |
| Break Mode | countdown / countup | countdown |
| Long Break Duration | 5–45 min | 15 min |
| Sessions Before Long Break | 2–8 | 4 |
| Auto-start Next Focus | on / off | off |
| Desktop Notifications | on / off | on |

---

## ⌨️ Default Shortcuts

| Combo | Action |
|-------|--------|
| `Ctrl + 1` | Start / Pause |
| `Ctrl + 2` | Skip / Next |

Click any shortcut in Settings to **record a custom binding**.

---

## 🧪 Test Mode

Settings includes quick-test buttons at the bottom:

- **Work 1s** — set work to 1 second for rapid testing
- **Break 1s** — set break to 1 second
- **Reset** — restore defaults

---

## 📦 Stack

| Layer | Tech |
|-------|------|
| UI | React 19 |
| Language | TypeScript 5 |
| Bundler | Vite 8 |
| State | Context + useReducer |
| Storage | localStorage |
| Notifications | Web Notification API |
| Audio | Web Audio API / HTMLAudio fallback |

No state management library. No CSS framework. No backend.

---

## 🔮 Roadmap

- [x] v0.1 — Core timer engine
- [x] v0.2 — Todo list, calendar heatmap, stats, themes, notifications
- [x] v0.3 — Design system primitives, keyboard shortcuts
- [x] v0.4 — Motion design, session completion feedback
- [x] v0.5 — Mobile responsive polish
- [ ] v0.6 — Interaction guards (reset confirmation, lock tooltips) + sound themes
- [ ] v1.0 — PWA, routing, unit tests, stable release

Check `ROADMAP.md` (local only) for upcoming plans and the "won't do" list.

---

## 🧡 Design Principles

1. **Local first** — your data never leaves your device
2. **Pure core** — business logic has zero framework dependencies
3. **Depth over breadth** — one excellent timer beats ten mediocre features
4. **Mobile as first-class** — not an afterthought
5. **No accounts, no cloud, no tracking** — ever
