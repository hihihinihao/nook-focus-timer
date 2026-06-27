# slow — Pomodoro Timer · 开发日志

## 项目信息

| 项 | 值 |
|---|-----|
| **项目名称** | slow |
| **本地路径** | `E:\600project\slow\` |
| **GitHub 仓库** | https://github.com/hihihinihao/slow |
| **可见性** | Private |
| **技术栈** | React 19 + TypeScript 6 + Vite 8 |
| **代码风格** | Pure TS core（框架无关）+ React UI 层 |

---

## 架构概述

```
pomodoro/
├── src/
│   ├── core/                  # 纯 TypeScript，零框架依赖，可移植到任意 JS 运行时
│   │   ├── types.ts           # 类型定义 & 默认配置常量
│   │   ├── timer-engine.ts    # PomodoroTimer 状态机（idle→working→paused→break）
│   │   ├── storage.ts         # localStorage 持久化（配置 + 每日会话记录）
│   │   └── audio.ts           # 抽象 SoundPlayer 接口 + 浏览器/WebAudio/Noop 实现
│   ├── context/TimerContext.tsx # React Context 桥接 timer engine ↔ UI
│   ├── hooks/useTimer.ts      # 消费 Context 的 hook
│   ├── components/
│   │   ├── Layout/Header.tsx   # 顶栏
│   │   ├── Timer/Timer.tsx     # 倒计时显示
│   │   ├── Timer/TimerControls.tsx # 开始/暂停/跳过/重置 按钮
│   │   ├── Settings/Settings.tsx   # 滑块调节参数
│   │   └── SessionLog/SessionLog.tsx # 今日完成的番茄列表
│   └── App.tsx                # 根组件，动态 document.title
```

---

## 功能清单

### 🍅 番茄钟核心
- **工作 / 短休息 / 长休息** 三阶段自动流转
- 工作时间结束 → 自动进入休息；休息结束 → 回到 idle
- 每 N 次工作后触发长休息（默认 4 次）
- **暂停 / 继续**：记忆暂停前是 work 还是 break
- **跳过**：提前结束当前阶段（work → 直接进休息，break → 回 idle）
- **重置**：任意状态回到 idle，时间重置为 work duration
- **每秒 tick** 事件 + 状态变更通知（listener 模式）

### ⚙️ 可调参数（Settings 面板）
| 参数 | 范围 | 默认 |
|------|------|------|
| Work Duration | 5–60 min（步长 5） | 25 min |
| Break Duration | 1–30 min（步长 1） | 5 min |
| Long Break | 固定 15 min，面板只读展示 | 15 min |
| Sessions before Long Break | 2–8 次 | 4 次 |

> 运行时锁定：timer 非 idle 时滑块 disabled，防止误触。

### 🔊 提示音
- 抽象 `SoundPlayer` 接口（可移植到 Unity 等平台）
- **Browser 实现**：HTMLAudioElement 播放音频文件
- **Web Audio API Beep**：无需音频文件，正弦波 800Hz 0.3s
- **Noop 实现**：静默回退，提示音不是关键路径

### 📋 今日记录（Session Log）
- 每次完成工作 session 自动保存到 `localStorage`
- 显示编号、完成时间、持续时长
- 底部汇总当日总专注时间

### 🏷️ 浏览器标题栏
- `🍅 MM:SS — Focus`（工作中）
- `☕ MM:SS — Break`（休息中）
- `⏸ MM:SS — Paused`（暂停中）
- `🍅 Pomodoro`（idle）

---

## 更新日志

### 2026-06-28 — 初始版本
- [x] 项目初始化：Vite + React 19 + TypeScript 6
- [x] `PomodoroTimer` 纯 TS 状态机
- [x] Timer 显示 + 控制按钮（开始/暂停/跳过/重置）
- [x] Settings 面板（work/break/sessionsBeforeLongBreak 滑块）
- [x] SessionLog 今日记录面板
- [x] localStorage 持久化（config + daily sessions）
- [x] 提示音系统（HTMLAudio + Web Audio beep + noop fallback）
- [x] 动态 document.title
- [x] Git 初始化，推送到 GitHub private repo
