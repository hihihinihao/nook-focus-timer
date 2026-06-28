# Nook — Focus Timer · 开发日志

## 项目信息

| 项 | 值 |
|---|-----|
| **项目名称** | Nook |
| **本地路径** | `E:\600project\slow\` |
| **GitHub 仓库** | https://github.com/hihihinihao/nook |
| **可见性** | Private |
| **技术栈** | React 19 + TypeScript 6 + Vite 8 |
| **代码风格** | Pure TS core（框架无关）+ React UI 层 |

---

## 架构概述

```
pomodoro/
├── src/
│   ├── core/                       # 纯 TypeScript，零框架依赖，可移植到任意 JS 运行时
│   │   ├── types.ts                # 类型定义 & 默认配置常量
│   │   ├── timer-engine.ts         # NookTimer 状态机（idle→working→paused→break）
│   │   ├── storage.ts              # localStorage 持久化（配置 + 每日会话 + Todo）
│   │   ├── statistics.ts           # 统计计算（日报/周趋势/月历/CSV导出）
│   │   ├── notifications.ts        # 桌面通知（权限请求 + 发送）
│   │   └── audio.ts                # 抽象 SoundPlayer 接口 + 浏览器/WebAudio/Noop 实现
│   ├── context/TimerContext.tsx     # React Context 桥接 timer engine ↔ UI
│   ├── hooks/
│   │   ├── useTimer.ts             # 消费 Context 的 hook
│   │   └── useDraggable.ts         # 拖拽停靠 hook（TodoList 位置拖动）
│   ├── components/
│   │   ├── Layout/Header.tsx        # 顶栏（品牌 + 主题切换 + 页面Tab）
│   │   ├── Timer/Timer.tsx          # 圆形进度环 + 时间显示
│   │   ├── Timer/TimerControls.tsx  # 开始/暂停/跳过/重置 按钮
│   │   ├── Settings/Settings.tsx    # 可折叠设置面板（参数 + 通知 + 自动下一轮）
│   │   ├── TodoList/TodoList.tsx    # 可折叠待办列表（支持日历关联 + 拖拽停靠）
│   │   ├── CalendarHeatmap/
│   │   │   ├── CalendarHeatmap.tsx  # 月历热力图（专注热度 + 待办标记）
│   │   │   └── DayDetail.tsx        # 日期详情面板（当日待办 + 专注记录）
│   │   ├── StatsBar/StatsBar.tsx    # 统计卡片 + 周趋势柱状图
│   │   ├── SessionLog/SessionLog.tsx # 今日会话记录
│   │   ├── ExportButton/ExportButton.tsx # CSV 导出
│   │   ├── DockZone/DockZone.tsx    # 拖拽停靠区域遮罩
│   │   ├── Popover/Popover.tsx      # 通用弹出面板
│   │   └── CollapsibleSection/     # 通用折叠面板（预留）
│   └── App.tsx                      # 根组件，主题/停靠/日历状态管理
```

---

## 功能清单

### 🍅 专注计时核心
- 工作 / 短休息 / 长休息 三阶段自动流转
- 倒计时 & 正计时 两种模式，每阶段独立切换
- 每 N 次工作后触发长休息（默认 4 次）
- 暂停 / 继续 / 跳过 / 重置
- Auto-start next focus：休息结束自动开始下一轮专注
- 运行时锁定：timer 非 idle 时设置项 disabled

### ⚙️ 可调参数（Settings 面板）
| 参数 | 范围 | 默认 |
|------|------|------|
| Work Duration | 5–60 min | 25 min |
| Work Mode | countdown / countup | countdown |
| Break Duration | 1–30 min | 5 min |
| Break Mode | countdown / countup | countdown |
| Auto-start next focus | on / off | off |
| Sessions until Long Break | 2–8 | 4 |

### 🔊 桌面通知
- 纯函数 `notifications.ts`，无框架依赖
- Work 完成 → `"🍅 Focus done! Time for a 5min break ☕"`
- Break 完成 → `"☕ Break over. Ready for another focus?"`
- 正计时不自动切换时**不弹窗**，避免打扰
- 权限被拒 → 静默降级，不反复请求
- Settings 面板支持开关

### 📝 TodoList
- 可折叠/展开（标题栏点击）
- 支持关联日历日期（`dueDate`）
- 可拖拽停靠：底部 / 左侧 / 右侧（桌面端）
- 停靠位置持久化到 localStorage
- 移动端自动固定底部

### 📊 Stats 页面
- 统计卡片：今日番茄数 / 连续天数 / 本周总计 / 最佳日
- 月历热力图：专注时长颜色深浅 + 待办日期标记
- 点击日期 → DayDetail 面板（当日待办 + Session 记录）
- 在 DayDetail 中可添加/编辑待办，自动关联日期
- 今日 Session Log + CSV 导出

### 🎨 主题切换
- Dark（深蓝黑）/ Warm（暖棕）/ Light（米白）三主题
- 点击 Header 🌙/🔥/☀️ 循环切换
- 持久化到 localStorage

### 🧪 测试辅助
- Settings 底部提供 Work 1s / Break 1s 快速测试按钮
- Reset 按钮恢复默认时长

### 🏷️ 浏览器标题栏
- `🍅 MM:SS — Focus` / `☕ MM:SS — Break` / `⏸ MM:SS — Paused` / `🍅 Nook`

---

## 更新日志

### 2026-06-28 — v0.2 功能迭代
- [x] **TodoList** — 可折叠面板 + 标题栏折叠动画
- [x] **TodoList 拖拽停靠** — 拖动把手 ⠿ 到底部/左侧/右侧，桌面端自由切换
- [x] **Settings 折叠** — 与 TodoList 风格统一的可折叠标题栏
- [x] **Stats 统计页** — 统计卡片 + 周趋势柱状图 + SessionLog + CSV 导出
- [x] **月历热力图** — `CalendarHeatmap` 组件，专注时长颜色深浅
- [x] **日历 + Todo 联动** — Todo 加 `dueDate` 字段，DayDetail 合并待办与记录
- [x] **桌面通知** — `notifications.ts` + Settings 开关
- [x] **Auto-start next focus** — 休息结束自动开始下一轮，Settings 开关
- [x] **主题切换** — Dark / Warm / Light 三主题，Header 切换按钮
- [x] **测试辅助按钮** — Work 1s / Break 1s / Reset
- [x] 修复 `_startTicking` 竞态导致 auto-start 失效的 bug

### 2026-06-28 — 项目更名 Nook
- [x] 项目名称从 Pomodoro 改为 **Nook**
- [x] localStorage keys 迁移至 `nook_*`
- [x] 导出 CSV 文件名改为 `nook_*.csv`
- [x] 文档和注释全部更新

### 2026-06-28 — 初始版本
- [x] 项目初始化：Vite + React 19 + TypeScript 6
- [x] `NookTimer` 纯 TS 状态机
- [x] Timer 显示 + 控制按钮（开始/暂停/跳过/重置）
- [x] Settings 面板（work/break/sessionsBeforeLongBreak 滑块）
- [x] SessionLog 今日记录面板
- [x] localStorage 持久化（config + daily sessions）
- [x] 提示音系统（HTMLAudio + Web Audio beep + noop fallback）
- [x] 动态 document.title
- [x] Git 初始化，推送到 GitHub private repo
