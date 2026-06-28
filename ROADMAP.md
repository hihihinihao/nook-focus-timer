# Nook — Roadmap & Ideas

## 当前状态：v0.2（已完成）

### Timer Engine
- 工作 / 短休息 / 长休息 三阶段自动流转
- 倒计时 & 正计时，每阶段独立切换
- Pause / Resume / Skip / Reset / Complete
- Auto-start next focus（休息结束自动下一轮）
- 运行时锁定设置

### UI & UX
- 圆形进度环 + 时间显示 + session dots
- Timer / Stats 双 Tab 页面
- 可折叠 Settings 面板（通知开关 / Auto-start 开关 / 测试辅助）
- 可折叠 TodoList（支持拖拽停靠：底部/左侧/右侧）
- 月历热力图（CalendarHeatmap）
- 日历 + Todo 联动（dueDate 字段，DayDetail 合并面板）
- 统计卡片 + 周趋势柱状图 + Session Log + CSV 导出
- Dark / Warm / Light 三主题切换

### System
- localStorage 持久化（config / sessions / todos / theme / dock）
- 桌面通知（smart trigger：正计时不自动切换时不弹窗）
- 浏览器标题栏动态更新
- 移动端响应式基础支持

---

## Phase 1 迭代计划

版本号延续 0.2 → 0.3 → 0.4 → ...，直到稳定后升级 v1.0。

### 0.3 — 🎨 Design System + ⌨️ 键盘快捷键

**Design System**
建立统一 UI 基组件，消除各模块独立写样式的现状。

```
src/components/ui/
├── Button.tsx        # variant: primary | secondary | ghost | icon
├── Card.tsx          # 统一卡片容器
├── Toggle.tsx        # 开关组件
├── Badge.tsx         # 计数标签
├── Slider.tsx        # 范围滑块
└── ui.module.css     # 统一 token
```

**键盘快捷键**

| 按键 | 行为 | 条件 |
|------|------|------|
| `Space` | Start / Pause | 焦点不在 input |
| `Escape` | Reset | 非 idle |
| `Enter` | Skip | running |
| `1/2/3` | 切换主题 | 任意 |

---

### 0.4 — ✨ 动画 & 完成反馈

- 进度环 `stroke-dashoffset` smooth transition
- Session 完成 pulse 动画
- 环中心 ✔ 完成提示（fade 500ms）

---

### 0.5 — 📱 移动端响应式

- 系统性调整 320-428px 断点
- 面板 `max-width: 100vw - 32px`
- 日历格子最小 36x36px 触摸区
- 按钮最小 44px 高度

---

### 0.6 — 🛡️ 交互护盾 + 🔔 声音方案

**交互护盾**
- Reset 确认弹窗
- Settings 锁定提示 tooltip
- Tab 焦点环补全

**声音方案**

| 音效 | 描述 |
|------|------|
| Beep | 默认，800Hz 正弦波 |
| Soft Bell | 柔和铃声 |
| Wood | 木鱼声 |
| Glass | 玻璃敲击 |
| Chime | 风铃 |

---

## Phase 2（0.x 稳定后）

### 体验增强
- 每日目标（N 个 Pomodoro 进度）
- Timer 页今日待办速览
- 白噪音 / 专注音效（雨声、咖啡馆）
- 休息建议推送（站起来走走、喝水...）

### 数据
- 周/月趋势折线图
- 导入 CSV
- JSON 备份/恢复

### 技术
- PWA 离线安装
- URL routing（/timer /stats）
- 单元测试（Timer Engine + 核心组件）

---

## 版本策略

| 阶段 | 版本号 | 含义 |
|------|--------|------|
| 开发迭代 | **0.2 → 0.3 → 0.4 → ...** | 功能递增，每个版本 1-2 个主题 |
| 稳定候选 | **v1.0-rc** | 功能冻结，只修 bug |
| 正式发布 | **v1.0** | 体验完整、代码稳定、可公开发布 |

---

## 不做（明确排除）

- ❌ 用户系统 / 登录
- ❌ 云同步 / 后端
- ❌ AI / GPT
- ❌ 多人房间
- ❌ 排行榜 / 成就系统
- ❌ 日历同步（Google/Apple）
- ❌ 邮件提醒
- ❌ OCR
- ❌ 日程管理

---

## 设计原则

1. **Pure TS core** — 核心逻辑零框架依赖，可移植到任意 JS 运行时
2. **Local first** — 数据在用户设备上，不依赖服务器
3. **完成度 > 功能数量** — 一个做到极致的 Timer 比一个什么都有但粗糙的工具强
4. **移动端可用** — 不是 afterthought，是基础体验
